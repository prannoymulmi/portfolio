import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Image optimization for Next.js Image component
  images: {
    // Enable AVIF format for better compression (30% smaller than WebP)
    formats: ['image/webp', 'image/avif'],

    // Image cache time in seconds
    // ISR (Incremental Static Regeneration) for images
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Compress images and remove metadata
  compress: true,

  // Production source maps (can disable for smaller build)
  productionBrowserSourceMaps: false,

  // Use Turbopack bundler (default in Next.js 16)
  turbopack: {},
};

export default nextConfig;
