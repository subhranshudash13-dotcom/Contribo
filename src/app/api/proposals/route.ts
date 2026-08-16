import {
  apiError,
  apiOk,
  isNextResponse,
  normalizeStringArray,
  parseMutationBody,
  privateNoStoreHeaders,
  requireUserId,
  requireUserMutation,
} from '@/lib/api';
import { createProposal, listUserProposals } from '@/lib/repositories/proposals';
import { safeLogError } from '@/lib/security';

/** GET /api/proposals — list drafts for the authenticated user only. */
export async function GET() {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const proposals = await listUserProposals(authResult.userId);
    return apiOk(
      { proposals, total: proposals.length },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('GET /api/proposals failed:', error);
    return apiError('Failed to fetch proposals', 500);
  }
}

/** POST /api/proposals — create a new draft owned by the authenticated user. */
export async function POST(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    const projectTitle =
      typeof body.projectTitle === 'string' ? body.projectTitle.trim() : '';
    const orgName = typeof body.orgName === 'string' ? body.orgName.trim() : '';

    if (!projectTitle) {
      return apiError('projectTitle is required', 400);
    }
    if (!orgName) {
      return apiError('orgName is required', 400);
    }

    const techStack =
      normalizeStringArray(body.techStack, { maxItems: 20, maxItemLen: 48 }) ||
      undefined;

    const newProposal = await createProposal({
      projectTitle: projectTitle.slice(0, 300),
      orgName: orgName.slice(0, 200),
      programName:
        typeof body.programName === 'string'
          ? body.programName.trim().slice(0, 200)
          : undefined,
      mentorName:
        typeof body.mentorName === 'string'
          ? body.mentorName.trim().slice(0, 120)
          : undefined,
      techStack,
      userId: authResult.userId,
    });

    return apiOk({ proposal: newProposal }, 201, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('POST /api/proposals failed:', error);
    const status =
      error instanceof Error &&
      (error as Error & { statusCode?: number }).statusCode === 401
        ? 401
        : 500;
    return apiError(
      status === 401 ? 'Unauthorized' : 'Failed to create proposal',
      status
    );
  }
}
