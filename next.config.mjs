const isProd = process.env.NODE_ENV === 'production';

// Dev/staging-only image hosts — never shipped in a production build.
const devImageRemotePatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '5000',
    pathname: '/**',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '5001',
    pathname: '/**',
  },
  {
    protocol: 'http',
    hostname: '51.79.146.227',
    port: '5001',
    pathname: '/**',
  },
];

// Real, always-allowed image hosts.
const prodImageRemotePatterns = [
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
];

// Hosts the app is allowed to open XHR/fetch/WebSocket connections to (CSP connect-src).
// Kept in sync with the image remote patterns above + the SignalR hub origin.
const devConnectSrc = [
  'http://localhost:5000',
  'http://localhost:5001',
  'ws://localhost:5000',
  'ws://localhost:5001',
  'http://51.79.146.227:5001',
  'ws://51.79.146.227:5001',
];
const prodConnectSrc = [
  'https://capylumine.com',
  'wss://capylumine.com',
];

const cspDirectives = [
  "default-src 'self'",
  // Next.js needs 'unsafe-inline' for its bootstrap scripts (no nonce support in a static header config)
  // and the JSON-LD <script> blocks rendered in app/layout.jsx / (main)/layout.jsx / product & news layouts.
  // 'unsafe-eval' is only needed by webpack's dev-mode HMR/source maps, so it's dropped in production.
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"} https://accounts.google.com https://connect.facebook.net`,
  // antd + inline style props used throughout the app require 'unsafe-inline'.
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https:${isProd ? '' : ' http:'}`,
  `connect-src 'self' ${prodConnectSrc.join(' ')}${isProd ? '' : ` ${devConnectSrc.join(' ')}`}`,
  // Google Identity Services and Facebook Login render their UI in iframes.
  "frame-src https://accounts.google.com https://www.facebook.com https://staticxx.facebook.com",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Allow dev access from LAN
  allowedDevOrigins: ['10.6.51.192'],

  // Cho phép load ảnh từ API backend (dev/staging hosts excluded from production builds)
  images: {
    qualities: [50, 60, 65, 70, 75, 80, 85, 90],
    remotePatterns: isProd
      ? prodImageRemotePatterns
      : [...devImageRemotePatterns, ...prodImageRemotePatterns],
  },

  // Transpile antd cho SSR compatibility
  transpilePackages: ['antd', '@ant-design', 'rc-util', 'rc-pagination', 'rc-picker'],

  // Disable React strict mode in dev to avoid double renders
  reactStrictMode: true,

  // Proxy backend static asset paths (images uploaded via admin)
  async rewrites()
  {
    const apiEndpoint = process.env.INTERNAL_API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5000';
    return [
      { source: '/api/:path*', destination: `${apiEndpoint}/api/:path*` },
      { source: '/chatHub', destination: `${apiEndpoint}/chatHub` },
      { source: '/NewsImages/:path*', destination: `${apiEndpoint}/NewsImages/:path*` },
      { source: '/ImageImport/:path*', destination: `${apiEndpoint}/ImageImport/:path*` },
      { source: '/VideoImport/:path*', destination: `${apiEndpoint}/VideoImport/:path*` },
      { source: '/BannerImages/:path*', destination: `${apiEndpoint}/BannerImages/:path*` },
      { source: '/CategoryImages/:path*', destination: `${apiEndpoint}/CategoryImages/:path*` },
    ];
  },

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
          { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/ImageImport/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/NewsImages/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/BannerImages/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/CategoryImages/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/css/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
