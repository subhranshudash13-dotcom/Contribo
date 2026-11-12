import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/programs', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/organizations', changeFrequency: 'daily', priority: 0.9 },
  { path: '/projects', changeFrequency: 'daily', priority: 0.9 },
  { path: '/resources', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/roadmaps', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/matcher', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/guidelines', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/accessibility', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookie-policy', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
