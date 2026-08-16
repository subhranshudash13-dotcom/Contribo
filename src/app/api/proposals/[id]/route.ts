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
  ALLOWED_SECTION_IDS,
  deleteProposal,
  getProposalById,
  updateProposal,
} from '@/lib/repositories/proposals';
import { safeLogError } from '@/lib/security';

type RouteContext = { params: Promise<{ id: string }> };

function sanitizeSections(
  raw: unknown
): Record<string, string> | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!ALLOWED_SECTION_IDS.has(key)) continue;
    if (typeof value !== 'string') continue;
    out[key] = value.slice(0, 50_000);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** GET /api/proposals/[id] — owner-scoped draft fetch. */
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

    return apiOk({ proposal }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('GET /api/proposals/[id] failed:', error);
    return apiError('Failed to fetch proposal', 500);
  }
}

/** PATCH /api/proposals/[id] — owner-scoped partial update (autosave). */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const { id } = await params;
    if (!id?.trim()) {
      return apiError('Proposal id is required', 400);
    }

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    const sections = sanitizeSections(body.sections);
    const progress =
      typeof body.progress === 'number' && Number.isFinite(body.progress)
        ? body.progress
        : undefined;
    const projectTitle =
      typeof body.projectTitle === 'string' ? body.projectTitle.trim() : undefined;

    if (!sections && progress === undefined && !projectTitle) {
      return apiError('No valid fields to update', 400);
    }

    const updated = await updateProposal(id.trim(), authResult.userId, {
      sections,
      progress,
      projectTitle: projectTitle || undefined,
    });

    if (!updated) {
      return apiError('Proposal not found', 404);
    }

    return apiOk({ proposal: updated }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('PATCH /api/proposals/[id] failed:', error);
    return apiError('Failed to update proposal', 500);
  }
}

/** DELETE /api/proposals/[id] — owner-scoped delete. */
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const { id } = await params;
    if (!id?.trim()) {
      return apiError('Proposal id is required', 400);
    }

    const removed = await deleteProposal(id.trim(), authResult.userId);
    if (!removed) {
      return apiError('Proposal not found', 404);
    }

    return apiOk({ success: true }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('DELETE /api/proposals/[id] failed:', error);
    return apiError('Failed to delete proposal', 500);
  }
}
