import type { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/proposal-studio', '/matcher'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL.origin,
  };
}
