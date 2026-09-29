/** @type {import('next').NextConfig} */
const nextConfig = {
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
