'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion() {
	const [isReducedMotion, setIsReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQueryList = globalThis.matchMedia(
			'(prefers-reduced-motion: reduce)'
		);

		setIsReducedMotion(mediaQueryList.matches);

		const handleChange = () => {
			setIsReducedMotion(mediaQueryList.matches);
		};

		mediaQueryList.addEventListener('change', handleChange);

		return () => {
			mediaQueryList.removeEventListener('change', handleChange);
		};
	}, []);

	return isReducedMotion;
}
