'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		router.replace('/info');
	}, [router]);

	return (
		<noscript>
			<a href="/info">前往基础信息编辑器</a>
		</noscript>
	);
}
