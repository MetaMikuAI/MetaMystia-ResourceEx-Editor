'use client';

import { HeroUIProvider } from '@heroui/system';
import { useRouter } from 'next/navigation';
import { type PropsWithChildren } from 'react';

import { AnnouncementModal } from '@/components/common/AnnouncementModal';
import { DataProvider } from '@/components/context/DataContext';

import { DesignPreferencesProvider } from '@/design/preferences/DesignPreferencesContext';
import { useTheme } from '@/design/theme/runtime/useTheme';

const DESIGN_PREFERENCES = { isHighAppearance: true } as const;

export default function Providers({ children }: PropsWithChildren) {
	useTheme();

	const router = useRouter();

	return (
		<DesignPreferencesProvider value={DESIGN_PREFERENCES}>
			<HeroUIProvider locale="zh-CN" navigate={router.push}>
				<DataProvider>
					{children}
					<AnnouncementModal />
				</DataProvider>
			</HeroUIProvider>
		</DesignPreferencesProvider>
	);
}
