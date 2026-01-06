import { type Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
	],
	darkMode: 'media',
	theme: {
		extend: {
			backgroundImage: { mystia: 'url("/assets/mystia.png")' },
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: { DEFAULT: '#5c9fba', foreground: '#ffffff' },
				secondary: { DEFAULT: '#b67596', foreground: '#ffffff' },
				success: { DEFAULT: '#85b26c', foreground: '#ffffff' },
				danger: { DEFAULT: '#ec9aa1', foreground: '#ffffff' },
			},
		},
	},
	plugins: [],
};

export default config;
