import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio.prannoy-mulmi.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // The portfolio is now a single scrolling story; the old standalone
  // pages redirect here (see next.config.ts), so only "/" is canonical.
  const routes = [''];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
