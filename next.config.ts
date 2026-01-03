import { type NextConfig } from 'next';
import { env } from 'node:process';

const skipLint = env.NODE_ENV === 'production' && Boolean(env['SKIP_LINT']);

const nextConfig: NextConfig = {
	output: 'export',

	eslint: { ignoreDuringBuilds: skipLint },
	typescript: { ignoreBuildErrors: skipLint },

	experimental: { webpackMemoryOptimizations: skipLint },
};

export default nextConfig;
