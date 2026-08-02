'use client';

import { memo, useCallback, useEffect, useState } from 'react';

import Button from '@/design/ui/components/button';

import {
	ANNOUNCEMENT_SECTIONS,
	ANNOUNCEMENT_SUMMARY,
	ANNOUNCEMENT_TITLE,
	ANNOUNCEMENT_VERSION,
} from '@/features/announcements/data/announcement';
import { CoordinatedModal } from '@/features/overlays/client';
import { useResourceWorkspaces } from '@/features/resourceEditor/client/workspaces/useResourceWorkspaces';

import { safeStorage } from '@/infrastructure/browser/storage/safeStorage';

import { useHydrated } from '@/shared/react/useHydrated';

const STORAGE_KEY = 'mm-rex-announcement-seen';
const OPEN_EVENT = 'mm-rex-open-announcement';
const ANNOUNCEMENT_SEEN_VALUE = `${ANNOUNCEMENT_VERSION}:confirmed`;

export function openAnnouncementModal() {
	window.dispatchEvent(new Event(OPEN_EVENT));
}

export const AnnouncementModal = memo(function AnnouncementModal() {
	const isHydrated = useHydrated();
	const { lifecycleStatus } = useResourceWorkspaces();
	const [isRequested, setIsRequested] = useState(false);
	const isWorkspaceStateStable =
		lifecycleStatus !== 'hydrating' &&
		lifecycleStatus !== 'importing' &&
		lifecycleStatus !== 'opening' &&
		lifecycleStatus !== 'recovering';

	useEffect(() => {
		if (!isHydrated) return;
		if (safeStorage.getItem(STORAGE_KEY) !== ANNOUNCEMENT_SEEN_VALUE) {
			setIsRequested(true);
		}
	}, [isHydrated]);

	useEffect(() => {
		if (!isHydrated) return;
		const handleOpen = () => setIsRequested(true);
		window.addEventListener(OPEN_EVENT, handleOpen);
		return () => window.removeEventListener(OPEN_EVENT, handleOpen);
	}, [isHydrated]);

	const handleClose = useCallback(() => {
		safeStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_SEEN_VALUE);
		setIsRequested(false);
	}, []);

	if (!isHydrated) return null;

	return (
		<CoordinatedModal
			coordination={{ id: 'announcement' }}
			isOpen={isRequested && isWorkspaceStateStable}
			onClose={handleClose}
			size="2xl"
		>
			<div className="flex flex-col gap-4">
				<div className="border-b border-divider pb-3">
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<h2 className="text-xl font-bold">
							{ANNOUNCEMENT_TITLE}
						</h2>
						<p className="text-xs text-foreground-500">
							版本{ANNOUNCEMENT_VERSION}
						</p>
					</div>
					<p className="mt-2 text-sm leading-6 text-foreground-600">
						{ANNOUNCEMENT_SUMMARY}
					</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					{ANNOUNCEMENT_SECTIONS.map((section) => (
						<section
							key={section.title}
							className="break-all rounded-large border border-divider bg-content1/40 p-4 text-justify sm:last:col-span-2"
						>
							<h3 className="text-sm font-semibold text-foreground">
								{section.title}
							</h3>
							<ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm leading-6 text-foreground-600 marker:text-primary">
								{section.items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</section>
					))}
				</div>
				<div className="flex justify-end pt-2">
					<Button color="primary" onPress={handleClose}>
						我已了解
					</Button>
				</div>
			</div>
		</CoordinatedModal>
	);
});
