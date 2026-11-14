import {
  apiError,
  apiOk,
  isNextResponse,
  privateNoStoreHeaders,
  requireUserMutation,
} from '@/lib/api';
import { restoreProposalRevision } from '@/lib/repositories/proposals';
import { safeLogError } from '@/lib/security';

type RouteContext = { params: Promise<{ id: string; revisionId: string }> };

/**
 * POST /api/proposals/[id]/revisions/[revisionId]/restore
 * Atomically restores the proposal draft to the specified historical snapshot,
 * creating a safety pre-rollback snapshot of the current state before applying changes.
 */
export async function POST(req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const { id, revisionId } = await params;
    if (!id?.trim() || !revisionId?.trim()) {
      return apiError('Proposal id and revision id are required', 400);
    }

    const result = await restoreProposalRevision(
      id.trim(),
      revisionId.trim(),
      authResult.userId
    );

    if (!result) {
      return apiError('Proposal or revision not found', 404);
    }

    return apiOk(
      {
        message: 'Proposal draft restored successfully',
        proposal: result.proposal,
        restoredFromRevision: result.restoredFromRevision,
        backupRevision: result.backupRevision,
      },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('POST /api/proposals/[id]/revisions/[revisionId]/restore failed:', error);
    return apiError('Failed to restore proposal revision', 500);
  }
}

