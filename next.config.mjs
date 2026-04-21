/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Allow dev access from LAN
  allowedDevOrigins: ['10.6.51.192'],

  // Cho phép load ảnh từ API backend
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '51.79.146.227',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'capylumine.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // Transpile antd cho SSR compatibility
  transpilePackages: ['antd', '@ant-design', 'rc-util', 'rc-pagination', 'rc-picker'],

  // Disable React strict mode in dev to avoid double renders
  reactStrictMode: true,

  // Redirect old CRA paths if needed
  async redirects()
  {
    return [];
  },

  // SEO & Security headers
  async headers()
  {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;
