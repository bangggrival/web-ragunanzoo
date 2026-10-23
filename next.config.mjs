/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'ragunan_super_secret_production_key_2026_xYz987!@#'),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // SECURITY: Prevent external clickjacking attacks while allowing internal embeds
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // SECURITY: Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // SECURITY: Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // SECURITY: Restrict browser feature access
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self), payment=()'
          },
          // SECURITY: Basic Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' http: https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: http: https:",
              "media-src 'self' blob: http: https:",
              "connect-src 'self' http: https: ws: wss:",
              "frame-ancestors 'self'",
            ].join('; ')
          },
          // SECURITY: Prevent IE from executing downloads in site context
          { key: 'X-Download-Options', value: 'noopen' },
          // SECURITY: Prevent cross-site scripting via DNS prefetch
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          // CACHE CONTROL: Ensure browser always requests fresh HTML instead of stale cache
          { key: 'Cache-Control', value: 'no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
      // CACHE CONTROL: Force browser to revalidate static assets (like favicon)
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ],
      },
      {
        source: '/images/:all*(svg|jpg|png|webp|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ],
      },
    ];
  },
  async rewrites() {
    // Both containers run on network_mode: 'host', so 127.0.0.1 refers to the shared host network.
    const backendProxyUrl = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5005';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendProxyUrl}/api/:path*`, // Proxy to Backend
      },
      {
        source: '/uploads/:path*',
        destination: `${backendProxyUrl}/uploads/:path*`, // Proxy to Backend uploads
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: '10.41.20.245' },
      { protocol: 'https', hostname: '10.41.20.245' },
      { protocol: 'https', hostname: 'yaninfo.tail14acf1.ts.net' },
      { protocol: 'http', hostname: 'yaninfo.tail14acf1.ts.net' },
      { protocol: 'https', hostname: '*.ts.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ragunanzoo.jakarta.go.id' },
      { protocol: 'https', hostname: 'ragunanzoo.agathis.fun' },
      { protocol: 'https', hostname: 'graph.instagram.com' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
};

export default nextConfig;
