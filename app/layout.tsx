import { type PropsWithChildren } from 'react';
import { type Metadata } from 'next';
import { DataProvider } from '@/components/DataContext';

import './globals.scss';

export const metadata: Metadata = {
	title: 'MetaMystia ResourceEx Editor',
	description: 'MetaMystia ResourceEx Editor',
};

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="zh-CN">
			<body className="bg-blend-mystia-pseudo">
				<DataProvider>{children}</DataProvider>
			</body>
		</html>
	);
}
