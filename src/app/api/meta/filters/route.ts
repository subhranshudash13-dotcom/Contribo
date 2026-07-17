import { apiError, apiOk, publicCacheHeaders } from '@/lib/api';
import { getFilterFacets } from '@/lib/repositories/filters';

/**
 * GET /api/meta/filters
 * Distinct technologies, difficulties, years, topics, and org categories.
 * Query: ?program=gsoc | ?programSlug=gsoc | ?programId=...
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const facets = await getFilterFacets({
      programSlug: searchParams.get('programSlug') || searchParams.get('program'),
      programId: searchParams.get('programId'),
    });

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
