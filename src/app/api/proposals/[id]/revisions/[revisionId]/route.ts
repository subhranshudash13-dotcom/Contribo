import {
  apiError,
  apiOk,
  isNextResponse,
  privateNoStoreHeaders,
  requireUserId,
} from '@/lib/api';
import { getProposalRevisionById } from '@/lib/repositories/proposals';
import { safeLogError } from '@/lib/security';

type RouteContext = { params: Promise<{ id: string; revisionId: string }> };

/**
 * GET /api/proposals/[id]/revisions/[revisionId]
 * Retrieve the full section contents of a specific revision snapshot.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const { id, revisionId } = await params;
    if (!id?.trim() || !revisionId?.trim()) {
      return apiError('Proposal id and revision id are required', 400);
    }

    const revision = await getProposalRevisionById(
      id.trim(),
      revisionId.trim(),
      authResult.userId
    );

    if (!revision) {
      return apiError('Proposal revision not found', 404);
    }

    return apiOk({ revision }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('GET /api/proposals/[id]/revisions/[revisionId] failed:', error);
    return apiError('Failed to fetch proposal revision', 500);
  }
}

