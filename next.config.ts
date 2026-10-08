import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  throw new Error('Missing required environment variable: BACKEND_URL');
}

const imageHostname = process.env.IMAGE_HOSTNAME || 'localhost';
const imageProtocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: imageProtocol,
        hostname: imageHostname,
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
