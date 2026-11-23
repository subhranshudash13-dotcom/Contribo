import {
  apiError,
  apiOk,
  requireUserMutation,
  isNextResponse,
  parseMutationBody,
  privateNoStoreHeaders,
} from '@/lib/api';
import { updateUserNodeProgress } from '@/lib/repositories/skill-tree';
import { NodeStatus } from '@/lib/skill-tree/types';
import { safeLogError } from '@/lib/security';

const VALID_STATUSES: NodeStatus[] = ['LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'MASTERED'];

export async function POST(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    const { programSlug, nodeId, status, evidenceUrl } = body as Record<string, unknown>;

    if (typeof programSlug !== 'string' || !programSlug.trim()) {
      return apiError('programSlug is required', 400);
    }
    if (typeof nodeId !== 'string' || !nodeId.trim()) {
      return apiError('nodeId is required', 400);
    }
    if (typeof status !== 'string' || !VALID_STATUSES.includes(status as NodeStatus)) {
      return apiError('status must be one of LOCKED, AVAILABLE, IN_PROGRESS, MASTERED', 400);
    }

    const result = await updateUserNodeProgress({
      userId: authResult.userId,
      programSlug: programSlug.trim(),
      nodeId: nodeId.trim(),
      status: status as NodeStatus,
      evidenceUrl: typeof evidenceUrl === 'string' ? evidenceUrl.trim() : null,
    });

    if (!result.success) {
      return apiError(result.error || 'Failed to update node progress', 400);
    }

    return apiOk(
      {
        success: true,
        progress: result.progress,
        newlyUnlockedBadge: result.newlyUnlockedBadge,
      },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('POST /api/user/skill-tree/progress failed:', error);
    return apiError('Failed to mutate skill progress', 500);
  }
}
