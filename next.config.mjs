/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Turbopack compatibility */
  turbopack: {},

  /* Mobile compatibility optimizations */
  experimental: {
    optimizeCss: true,
  },
  
  /* Image optimization for mobile */
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  /* PWA configuration */
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ];
  },
  
  /* Headers for mobile optimization */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/styles/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  /* Webpack configuration for mobile */
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        mobile: {
          test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
          name: 'mobile-vendor',
          chunks: 'all',
          priority: 20,
        },
      };
    }
    return config;
  },
};

export default nextConfig;
