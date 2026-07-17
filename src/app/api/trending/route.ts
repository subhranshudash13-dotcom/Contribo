import { apiError, apiOk, parsePagination, publicCacheHeaders } from '@/lib/api';
import { getTrendingProjects } from '@/lib/repositories/trending';

/**
 * GET /api/trending
 * High-signal projects ranked by stars / recency.
 * Query: ?domain=all|web|ai|systems &program=gsoc &limit=18
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit } = parsePagination(searchParams, { limit: 18, maxLimit: 48 });
    const domain = searchParams.get('domain') || 'all';
    const allowed = new Set(['all', 'web', 'ai', 'systems']);
    if (!allowed.has(domain.toLowerCase())) {
      return apiError('domain must be one of: all, web, ai, systems', 400);
    }

    const result = await getTrendingProjects({
      domain,
      programSlug: searchParams.get('program') || searchParams.get('programSlug'),
      limit,
      yearMin: searchParams.get('yearMin')
        ? parseInt(searchParams.get('yearMin')!, 10)
        : undefined,
    });

    return apiOk(
      {
        projects: result.projects,
        total: result.total,
        domain: result.domain,
      },
      200,
      publicCacheHeaders(90, 300)
    );
  } catch (error) {
    console.error('GET /api/trending failed:', error);
    return apiError('Failed to fetch trending projects', 500);
  }
}
