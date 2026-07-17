import { apiError, apiOk, publicCacheHeaders } from '@/lib/api';
import { listPrograms } from '@/lib/repositories/programs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tierParam = searchParams.get('tier');
    const tier = tierParam != null ? parseInt(tierParam, 10) : undefined;

    const programs = await listPrograms({
      tier: tier !== undefined && !Number.isNaN(tier) ? tier : undefined,
    });

    return apiOk({ programs, total: programs.length }, 200, publicCacheHeaders(120, 600));
  } catch (error) {
    console.error('GET /api/programs failed:', error);
    return apiError('Failed to fetch programs', 500);
  }
}
