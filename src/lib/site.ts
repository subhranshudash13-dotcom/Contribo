const FALLBACK_SITE_URL = 'https://contribo-one.vercel.app';

function resolveSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      return new URL(configured);
    } catch {
      // Fall through to the production origin.
    }
  }
  return new URL(FALLBACK_SITE_URL);
}

/** Canonical origin used for metadata, sitemap, and robots files. */
export const SITE_URL = resolveSiteUrl();

/** Build an absolute URL for a public path. */
export function absoluteUrl(pathname = '/'): string {
  return new URL(pathname, SITE_URL).toString();
}
