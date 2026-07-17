import { apiError, apiOk, publicCacheHeaders } from '@/lib/api';
import { getOrganizationBySlug } from '@/lib/repositories/organizations';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return apiError('Slug is required', 400);
    }

    const { searchParams } = new URL(req.url);
    const programSlug = searchParams.get('program') || searchParams.get('programSlug');
    const includeCount = searchParams.get('includeCount') !== '0';

    const organization = await getOrganizationBySlug(slug, programSlug, {
      includeProjectCount: includeCount,
    });
    if (!organization) {
      return apiError('Organization not found', 404);
    }

    return apiOk({ organization }, 200, publicCacheHeaders(60, 300));
  } catch (error) {
    console.error('GET /api/organizations/[slug] failed:', error);
    return apiError('Failed to fetch organization', 500);
  }
}
