'use client';

import { HeroUIProvider } from '@heroui/system';
import { useRouter } from 'next/navigation';
import { type PropsWithChildren } from 'react';

import { AnnouncementModal } from '@/components/common/AnnouncementModal';
import { DataProvider } from '@/components/context/DataContext';

export default function Providers({ children }: PropsWithChildren) {
	const router = useRouter();

	return (
		<HeroUIProvider locale="zh-CN" navigate={router.push}>
			<DataProvider>
				{children}
				<AnnouncementModal />
			</DataProvider>
		</HeroUIProvider>
	);
}
