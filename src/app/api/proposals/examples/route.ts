import { apiError, apiOk, publicCacheHeaders, sanitizeSearchQuery } from '@/lib/api';
import { getAcceptedExamples } from '@/lib/repositories/proposals';

/**
 * GET /api/proposals/examples
 * Optional: ?project=... to boost similarity for matching titles/orgs.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const project = sanitizeSearchQuery(url.searchParams.get('project'), 120) || undefined;

    const examples = getAcceptedExamples(project);

    return apiOk(
      { examples, total: examples.length },
      200,
      publicCacheHeaders(300, 900)
    );
  } catch (error) {
    console.error('GET /api/proposals/examples failed:', error);
    return apiError('Failed to load proposal examples', 500);
  }
}
