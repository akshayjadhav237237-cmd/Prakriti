/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.mixkit.co' },
      { protocol: 'https', hostname: 'cdn.coverr.co' },
      { protocol: 'https', hostname: 'videos.pexels.com' },
      { protocol: 'https', hostname: 'd8j0ntlcm91z4.cloudfront.net' },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com; img-src 'self' blob: data: https://images.unsplash.com https://*.unsplash.com; font-src 'self' data: https://fonts.gstatic.com https://api.fontshare.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com; media-src 'self' https://videos.pexels.com https://mixkit.com https://assets.mixkit.co https://cdn.mixkit.co https://cdn.coverr.co https://d8j0ntlcm91z4.cloudfront.net blob: data:;",
          },
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self)',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Link',
            value: '<https://api.fontshare.com>; rel=preconnect, <https://images.unsplash.com>; rel=preconnect, <https://videos.pexels.com>; rel=preconnect, <https://api.fontshare.com>; rel=dns-prefetch',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
