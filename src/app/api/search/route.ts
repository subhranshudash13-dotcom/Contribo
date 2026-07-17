import { apiError, apiOk, publicCacheHeaders, sanitizeSearchQuery } from '@/lib/api';
import { globalSearch } from '@/lib/repositories/search';

/**
 * GET /api/search?q=...
 * Optional: &type=all|program|organization|project &limit=15
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = sanitizeSearchQuery(searchParams.get('q') || searchParams.get('query'));
    const type = searchParams.get('type') || 'all';
    const limitRaw = searchParams.get('limit');
    const limit = limitRaw ? parseInt(limitRaw, 10) : undefined;

    if (query.length > 0 && query.length < 2) {
      return apiError('Query must be at least 2 characters', 400);
    }

    const allowed = new Set(['all', 'program', 'organization', 'org', 'project']);
    if (!allowed.has(type.toLowerCase())) {
      return apiError('type must be one of: all, program, organization, project', 400);
    }

    const results = await globalSearch(query, {
      type,
      limit: Number.isFinite(limit) ? limit : undefined,
    });

    return apiOk(results, 200, publicCacheHeaders(30, 120));
  } catch (error) {
    console.error('Global Search Error:', error);
    return apiError('Failed to perform search', 500);
  }
}
