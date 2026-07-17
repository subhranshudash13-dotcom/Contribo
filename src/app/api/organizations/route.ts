import { apiError, apiOk, parsePagination, publicCacheHeaders, sanitizeSearchQuery } from '@/lib/api';
import { listOrganizations } from '@/lib/repositories/organizations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, page, skip } = parsePagination(searchParams, { limit: 100, maxLimit: 200 });

    const { organizations, total } = await listOrganizations({
      programId: searchParams.get('programId'),
      programSlug: searchParams.get('programSlug') || searchParams.get('program'),
      search: sanitizeSearchQuery(searchParams.get('q') || searchParams.get('search')),
      tag: searchParams.get('tag') || searchParams.get('technology'),
      years: searchParams.get('years')
        ? searchParams
            .get('years')!
            .split(',')
            .map(Number)
            .filter((n) => Number.isFinite(n))
        : null,
      yearMode:
        searchParams.get('yearMode') === 'and'
          ? 'and'
          : searchParams.get('yearMode') === 'or'
            ? 'or'
            : null,
      limit,
      skip,
    });

    return apiOk(
      {
        organizations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 0,
      },
      200,
      publicCacheHeaders(60, 300)
    );
  } catch (error) {
    console.error('GET /api/organizations failed:', error);
    return apiError('Failed to fetch organizations', 500);
  }
}
