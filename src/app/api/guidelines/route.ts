import { apiError, apiOk, publicCacheHeaders } from '@/lib/api';
import { listGuidelines } from '@/lib/repositories/guidelines';

/**
 * GET /api/guidelines
 * Editorial program guides (how it works, who it's for, tips).
 * Query: ?program=gsoc | ?slug=gsoc
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const programSlug =
      searchParams.get('program') ||
      searchParams.get('slug') ||
      searchParams.get('programSlug');

    const result = await listGuidelines(programSlug);

    if (result.notFound) {
      return apiError('Guidelines not found for this program', 404);
    }

    // Single-program convenience shape
    if (programSlug && result.guidelines.length === 1) {
      return apiOk(
        { guideline: result.guidelines[0], guidelines: result.guidelines },
        200,
        publicCacheHeaders(300, 900)
      );
    }

    return apiOk(
      { guidelines: result.guidelines, total: result.guidelines.length },
      200,
      publicCacheHeaders(300, 900)
    );
  } catch (error) {
    console.error('GET /api/guidelines failed:', error);
    return apiError('Failed to fetch guidelines', 500);
  }
}
