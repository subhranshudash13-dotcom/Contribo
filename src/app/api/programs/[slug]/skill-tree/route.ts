import { apiError, apiOk } from '@/lib/api';
import { getProgramSkillTree } from '@/lib/repositories/skill-tree';
import { safeLogError } from '@/lib/security';

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    if (!slug || typeof slug !== 'string') {
      return apiError('Missing program slug', 400);
    }

    const skillTree = await getProgramSkillTree(slug);
    if (!skillTree) {
      return apiError(`Skill tree not found for program "${slug}"`, 404);
    }

    return apiOk(
      { skillTree },
      200,
      {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      }
    );
  } catch (error) {
    safeLogError('GET /api/programs/[slug]/skill-tree failed:', error);
    return apiError('Failed to fetch program skill tree', 500);
  }
}
