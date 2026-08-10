import type { NextConfig } from 'next';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  // Image optimization for Next.js Image component
  images: {
    // Enable AVIF format for better compression (30% smaller than WebP)
    formats: ['image/webp', 'image/avif'],

    // Image cache time in seconds
    // ISR (Incremental Static Regeneration) for images
    minimumCacheTTL: ONE_YEAR_SECONDS,

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Compress images and remove metadata
  compress: true,

  // Production source maps (can disable for smaller build)
  productionBrowserSourceMaps: false,

  // Use Turbopack bundler (default in Next.js 16)
  turbopack: {},

  // The portfolio used to be separate pages; now it's one scrolling story.
  // Redirect each old page URL to the matching section anchor on "/" so
  // existing bookmarks, shared links, and search results keep working.
  async redirects() {
    return [
      { source: '/skills', destination: '/#skills', permanent: true },
      { source: '/career', destination: '/#career', permanent: true },
      { source: '/education', destination: '/#education', permanent: true },
      { source: '/projects', destination: '/#projects', permanent: true },
      { source: '/playbook', destination: '/#playbook', permanent: true },
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
    ];
  },

  // Long-lived cache for immutable public assets; JSON content is
  // versioned by deploy, so a shorter cache lets edits go live quickly.
  async headers() {
    return [
      {
        source: '/data/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, must-revalidate',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
