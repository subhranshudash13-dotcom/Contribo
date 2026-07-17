import { apiError, apiOk, parsePagination, publicCacheHeaders, sanitizeSearchQuery } from '@/lib/api';
import { listProjects } from '@/lib/repositories/projects';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, page, skip } = parsePagination(searchParams, { limit: 100, maxLimit: 200 });

    const sortBy = searchParams.get('sortBy') || searchParams.get('sort');
    const allowedSort = new Set(['stars', 'title', 'newest', 'year', null, '']);
    if (sortBy && !allowedSort.has(sortBy) && sortBy !== 'newest') {
      // still allow; listProjects falls back to default for unknown
    }

    const { projects, total } = await listProjects({
      programId: searchParams.get('programId'),
      programSlug: searchParams.get('programSlug') || searchParams.get('program'),
      orgSlug: searchParams.get('orgSlug') || searchParams.get('org'),
      difficulty: searchParams.get('difficulty'),
      tech: searchParams.get('tech') || searchParams.get('technology'),
      year: searchParams.get('year'),
      search: sanitizeSearchQuery(searchParams.get('q') || searchParams.get('search')),
      sortBy: sortBy === 'newest' ? null : sortBy,
      limit,
      skip,
    });

    return apiOk(
      {
        projects,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 0,
      },
      200,
      publicCacheHeaders(45, 180)
    );
  } catch (error) {
    console.error('GET /api/projects failed:', error);
    return apiError('Failed to fetch projects', 500);
  }
}
