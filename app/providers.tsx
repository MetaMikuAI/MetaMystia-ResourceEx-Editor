'use client';

import { HeroUIProvider } from '@heroui/system';
import { useRouter } from 'next/navigation';
import { type PropsWithChildren } from 'react';

import { DesignPreferencesProvider } from './design/preferences/DesignPreferencesContext';
import { useTheme } from './design/theme/runtime/useTheme';
import { AnnouncementModal } from './features/announcements/client/AnnouncementModal';
import { ResourceEditorProvider } from './features/resourceEditor/client/state/ResourceEditorProvider';

const DESIGN_PREFERENCES = { isHighAppearance: true } as const;

export default function Providers({ children }: PropsWithChildren) {
	useTheme();

	const router = useRouter();

	return (
		<DesignPreferencesProvider value={DESIGN_PREFERENCES}>
			<HeroUIProvider locale="zh-CN" navigate={router.push}>
				<ResourceEditorProvider>
					{children}
					<AnnouncementModal />
				</ResourceEditorProvider>
			</HeroUIProvider>
		</DesignPreferencesProvider>
	);
}
