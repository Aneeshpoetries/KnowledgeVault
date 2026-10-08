/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional isolated output keeps validation builds from disrupting a running dev server.
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  reactStrictMode: true,
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
