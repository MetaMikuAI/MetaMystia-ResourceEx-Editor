import { type Config } from 'tailwindcss';

const config: Config = {
	content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
	darkMode: 'selector',
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: { DEFAULT: '#5c9fba', foreground: '#ffffff' },
				success: { DEFAULT: '#85b26c', foreground: '#ffffff' },
				danger: { DEFAULT: '#ec9aa1', foreground: '#ffffff' },
				purple: {
					DEFAULT: '#be8c3c', // Using brown-700 for purple-like action in original
					foreground: '#ffffff',
				},
			},
			backgroundImage: { mystia: 'url("/assets/mystia.png")' },
		},
	},
	plugins: [],
};

export default config;
