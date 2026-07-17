import { apiError, apiOk, publicCacheHeaders } from '@/lib/api';
import { getProgramBySlug } from '@/lib/repositories/programs';
import { getProgramGuide, hasProgramGuide } from '@/lib/program-guides';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return apiError('Slug is required', 400);
    }

    const program = await getProgramBySlug(slug.toLowerCase());
    if (!program) {
      return apiError('Program not found', 404);
    }

    const { searchParams } = new URL(req.url);
    const includeGuide = searchParams.get('includeGuide') === '1' || searchParams.get('guide') === '1';

    if (includeGuide) {
      return apiOk(
        {
          program,
          guide: getProgramGuide(slug.toLowerCase()),
          hasDedicatedGuide: hasProgramGuide(slug.toLowerCase()),
        },
        200,
        publicCacheHeaders(120, 600)
      );
    }

    return apiOk({ program }, 200, publicCacheHeaders(120, 600));
  } catch (error) {
    console.error('GET /api/programs/[slug] failed:', error);
    return apiError('Failed to fetch program details', 500);
  }
}
