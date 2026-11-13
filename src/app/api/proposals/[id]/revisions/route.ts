import {
  apiError,
  apiOk,
  isNextResponse,
  parseMutationBody,
  privateNoStoreHeaders,
  requireUserId,
  requireUserMutation,
} from '@/lib/api';
import {
  createProposalRevision,
  getProposalById,
  listProposalRevisions,
} from '@/lib/repositories/proposals';
import { safeLogError } from '@/lib/security';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/proposals/[id]/revisions
 * List revision metadata history for a specific proposal owned by the authenticated user.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const { id } = await params;
    if (!id?.trim()) {
      return apiError('Proposal id is required', 400);
    }

    const proposal = await getProposalById(id.trim(), authResult.userId);
    if (!proposal) {
      return apiError('Proposal not found', 404);
    }

    const revisions = await listProposalRevisions(id.trim(), authResult.userId, 50);
    return apiOk({ revisions }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('GET /api/proposals/[id]/revisions failed:', error);
    return apiError('Failed to fetch proposal revisions', 500);
  }
}

/**
 * POST /api/proposals/[id]/revisions
 * Create a manual revision snapshot / checkpoint for the proposal.
 */
export async function POST(req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const { id } = await params;
    if (!id?.trim()) {
      return apiError('Proposal id is required', 400);
    }

    const proposal = await getProposalById(id.trim(), authResult.userId);
    if (!proposal) {
      return apiError('Proposal not found', 404);
    }

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    const label =
      typeof body.label === 'string' && body.label.trim()
        ? body.label.trim().slice(0, 100)
        : 'Manual Checkpoint';

    const sections =
      body.sections && typeof body.sections === 'object' && !Array.isArray(body.sections)
        ? (body.sections as Record<string, string>)
        : proposal.sections;

    const revision = await createProposalRevision({
      proposalId: id.trim(),
      userId: authResult.userId,
      source: 'manual_snapshot',
      label,
      sections,
      progress: proposal.progress,
    });

    return apiOk({ revision }, 201, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('POST /api/proposals/[id]/revisions failed:', error);
    return apiError('Failed to create proposal revision', 500);
  }
}

