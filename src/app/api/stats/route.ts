import { apiError, apiOk, publicCacheHeaders } from '@/lib/api';
import { getPlatformStats } from '@/lib/repositories/stats';

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return apiOk(stats, 200, publicCacheHeaders(60, 300));
  } catch (error) {
    console.error('Stats API Error:', error);
    return apiError('Failed to fetch stats', 500);
  }
}

export const dynamic = 'force-dynamic';
