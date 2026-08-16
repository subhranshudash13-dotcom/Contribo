import {
  apiError,
  apiOk,
  isNextResponse,
  parseMutationBody,
  privateNoStoreHeaders,
  requireUserMutation,
} from '@/lib/api';
import {
  ALLOWED_SECTION_IDS,
  aiImproveProposalSection,
} from '@/lib/repositories/proposals';
import { MAX_AI_BODY_BYTES, safeLogError } from '@/lib/security';

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/proposals/[id]/ai-improve — owner-scoped AI section rewrite. */
export async function POST(req: Request, { params }: RouteContext) {
  try {
    const authResult = await requireUserMutation(req, { maxBytes: MAX_AI_BODY_BYTES });
    if (isNextResponse(authResult)) return authResult;

    const { id } = await params;
    if (!id?.trim()) {
      return apiError('Proposal id is required', 400);
    }

    const body = await parseMutationBody(req, { maxBytes: MAX_AI_BODY_BYTES });
    if (isNextResponse(body)) return body;

    const sectionId =
      typeof body.sectionId === 'string' ? body.sectionId.trim() : '';
    if (!sectionId || !ALLOWED_SECTION_IDS.has(sectionId)) {
      return apiError(
        `sectionId must be one of: ${[...ALLOWED_SECTION_IDS].join(', ')}`,
        400
      );
    }

    const currentContent =
      typeof body.currentContent === 'string'
        ? body.currentContent.slice(0, 20_000)
        : '';

    const result = await aiImproveProposalSection(
      id.trim(),
      authResult.userId,
      sectionId,
      currentContent
    );

    return apiOk(
      {
        sectionId,
        improvedContent: result.text,
        rationale: result.rationale,
      },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    const statusCode =
      error instanceof Error
        ? (error as Error & { statusCode?: number }).statusCode
        : undefined;
    if (statusCode === 404) {
      return apiError('Proposal not found', 404);
    }
    if (statusCode === 400) {
      return apiError(
        error instanceof Error ? error.message : 'Invalid request',
        400
      );
    }
    safeLogError('POST /api/proposals/[id]/ai-improve failed:', error);
    return apiError('Failed to boost section', 500);
  }
}
