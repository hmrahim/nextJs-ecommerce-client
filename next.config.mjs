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

  // ✅ এটা nextConfig এর ভেতরে আছে
async redirects() {
  return [
    // ✅ sitemap আর robots আগে allow করো
    {
      source: '/sitemap.xml',
      has: [{ type: 'host', value: 'moom24.com' }],
      destination: 'https://www.moom24.com/sitemap.xml',
      permanent: false, // false রাখো — Google follow করবে
    },
    {
      source: '/robots.txt',
      has: [{ type: 'host', value: 'moom24.com' }],
      destination: 'https://www.moom24.com/robots.txt',
      permanent: false,
    },
    // ✅ বাকি সব redirect
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