import {
  apiError,
  apiOk,
  requireUserId,
  isNextResponse,
  privateNoStoreHeaders,
} from '@/lib/api';
import { getUserSkillProgress } from '@/lib/repositories/skill-tree';
import { safeLogError } from '@/lib/security';

export async function GET(req: Request) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || 'gsoc';

    const progress = await getUserSkillProgress(authResult.userId, slug);

    return apiOk({ progress }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('GET /api/user/skill-tree failed:', error);
    return apiError('Failed to fetch user skill progression', 500);
  }
}
