import { type PropsWithChildren } from 'react';
import { type Metadata } from 'next';

import './globals.scss';

export const metadata: Metadata = {
	title: 'MetaMystia ResourceEx Editor',
	description: 'MetaMystia ResourceEx Editor',
};

export default function RootLayout({ children }: PropsWithChildren<{}>) {
	return (
		<html lang="en">
			<body className="bg-blend-mystia-pseudo">{children}</body>
		</html>
	);
}
