'use client';

import { useEffect, useState } from 'react';

import { addSafeMediaQueryEventListener } from '@/design/utils';
import { useHydrated } from '@/shared/react/useHydrated';

export function useReducedMotion() {
	const isHydrated = useHydrated();
	const [isReducedMotion, setIsReducedMotion] = useState(false);

	useEffect(() => {
		if (!isHydrated) {
			return;
		}

		const mediaQueryList = globalThis.matchMedia(
			'(prefers-reduced-motion: reduce)'
		);

		setIsReducedMotion(mediaQueryList.matches);

		return addSafeMediaQueryEventListener(mediaQueryList, () => {
			setIsReducedMotion(mediaQueryList.matches);
		});
	}, [isHydrated]);

	return isReducedMotion;
}
