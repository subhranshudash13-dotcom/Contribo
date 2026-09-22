import { apiError, apiOk, publicCacheHeaders, sanitizeSearchQuery } from '@/lib/api';
import { suggestOrganizations } from '@/lib/repositories/organizations';

export async function GET(req: Request) {
  try {
    const query = sanitizeSearchQuery(new URL(req.url).searchParams.get('q'));
    const suggestions = await suggestOrganizations(query);
    return apiOk({ suggestions }, 200, publicCacheHeaders(60, 300));
  } catch (error) {
    console.error('GET /api/organizations/suggest failed:', error);
    return apiError('Failed to fetch organization suggestions', 500);
  }
}
