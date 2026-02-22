import { type NextConfig } from 'next';
import { env } from 'node:process';

const skipLint = env.NODE_ENV === 'production' && Boolean(env['SKIP_LINT']);

const nextConfig: NextConfig = {
	output: 'export',

	eslint: { ignoreDuringBuilds: skipLint },
	typescript: { ignoreBuildErrors: skipLint },

	experimental: { webpackMemoryOptimizations: skipLint },

	webpack(config) {
		config.module.rules.push({ test: /\.pem$/, type: 'asset/source' });
		return config;
	},
};

export default nextConfig;
