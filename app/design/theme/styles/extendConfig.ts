import { ratingColors } from '../colors/rating/ratingColors';
import { resourceTagColors } from '../colors/resourceTagColors';
import type { TThemeExtendConfig } from '../types';

export const getExtendConfig = () =>
	({
		backgroundImage: {
			logo: 'url("/assets/icon.png")',
			mystia: 'url("/assets/mystia.png")',
		},
		colors: { ...ratingColors, ...resourceTagColors },
		minHeight: { 'dvh-safe': 'var(--safe-h-dvh)' },
		screens: { '3xl': '1920px', '4xl': '2560px' },
	}) as const satisfies TThemeExtendConfig;
