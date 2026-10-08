import { apiError, apiOk, publicCacheHeaders } from '@/lib/api';
import { getCachedFilterFacets } from '@/lib/data-cache';

/**
 * GET /api/meta/filters
 * Distinct technologies, difficulties, years, topics, and org categories.
 * Query: ?program=gsoc | ?programSlug=gsoc | ?programId=...
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const programSlug = searchParams.get('programSlug') || searchParams.get('program') || undefined;
    const facets = await getCachedFilterFacets(programSlug);

    return apiOk(
      {
        ...facets,
        meta: {
          generatedAt: new Date().toISOString(),
        },
      },
      200,
      publicCacheHeaders(120, 600)
    );
  } catch (error) {
    console.error('GET /api/meta/filters failed:', error);
    return apiError('Failed to load filter facets', 500);
  }
}
