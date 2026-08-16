import { apiError, apiOk, publicCacheHeaders, sanitizeSearchQuery } from '@/lib/api';
import { getProjectGuide } from '@/lib/repositories/proposals';

/**
 * GET /api/proposals/guide
 * Optional: ?project=... &org=... to personalize the dynamic guide shell.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const project =
      sanitizeSearchQuery(url.searchParams.get('project'), 200) || undefined;
    const org = sanitizeSearchQuery(url.searchParams.get('org'), 200) || undefined;

    const guide = getProjectGuide(project, org);

    return apiOk({ guide }, 200, publicCacheHeaders(300, 900));
  } catch (error) {
    console.error('GET /api/proposals/guide failed:', error);
    return apiError('Failed to load proposal guide', 500);
  }
}
