'use client';

import { memo, useCallback, useEffect, useState } from 'react';

import Button from '@/design/ui/components/button';
import Modal from '@/design/ui/components/modal';

import {
	ANNOUNCEMENT_SECTIONS,
	ANNOUNCEMENT_TITLE,
	ANNOUNCEMENT_VERSION,
} from '@/features/announcements/data/announcement';

import { safeStorage } from '@/infrastructure/browser/storage/safeStorage';

import { useHydrated } from '@/shared/react/useHydrated';

const STORAGE_KEY = 'mm-rex-announcement-seen';
const OPEN_EVENT = 'mm-rex-open-announcement';

export function openAnnouncementModal() {
	window.dispatchEvent(new Event(OPEN_EVENT));
}

export const AnnouncementModal = memo(function AnnouncementModal() {
	const isHydrated = useHydrated();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!isHydrated) return;
		if (safeStorage.getItem(STORAGE_KEY) !== ANNOUNCEMENT_VERSION) {
			setIsOpen(true);
		}
	}, [isHydrated]);

	useEffect(() => {
		if (!isHydrated) return;
		const handleOpen = () => setIsOpen(true);
		window.addEventListener(OPEN_EVENT, handleOpen);
		return () => window.removeEventListener(OPEN_EVENT, handleOpen);
	}, [isHydrated]);

	const handleClose = useCallback(() => {
		safeStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_VERSION);
		setIsOpen(false);
	}, []);

	if (!isHydrated) return null;

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="2xl">
			<div className="flex flex-col gap-5">
				<div className="flex items-center gap-3 border-b border-divider pb-3">
					<span className="text-2xl">📢</span>
					<div>
						<h2 className="text-xl font-bold">
							{ANNOUNCEMENT_TITLE}
						</h2>
						<p className="text-xs text-foreground/60">
							版本 {ANNOUNCEMENT_VERSION}
						</p>
					</div>
				</div>
				{ANNOUNCEMENT_SECTIONS.map((section) => (
					<section
						key={section.title}
						className="flex flex-col gap-2"
					>
						<h3 className="text-base font-semibold text-primary">
							{section.title}
						</h3>
						<ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-foreground/85">
							{section.items.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</section>
				))}
				<div className="flex justify-end pt-2">
					<Button color="primary" onPress={handleClose}>
						我已了解
					</Button>
				</div>
			</div>
		</Modal>
	);
});
