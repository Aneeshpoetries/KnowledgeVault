import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
};

// Keep development chunks separate from production and validation builds.
export default (phase) => ({
  ...nextConfig,
  distDir: process.env.NEXT_BUILD_DIR ||
    (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next'),
});
