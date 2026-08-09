import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio.prannoy-mulmi.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/career', '/skills', '/projects', '/playbook', '/education'];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
