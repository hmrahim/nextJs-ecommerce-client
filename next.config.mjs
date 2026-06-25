/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      '@tanstack/react-query',
      'react-hot-toast',
      'swiper',
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

async redirects() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'moom24.com' }],
      destination: 'https://www.moom24.com/:path*',
      permanent: true,
    },
  ];
},
};

export default nextConfig;
