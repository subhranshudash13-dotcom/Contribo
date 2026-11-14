import {
  apiError,
  apiOk,
  requireUserId,
  requireUserMutation,
  isNextResponse,
  parseMutationBody,
  privateNoStoreHeaders,
} from '@/lib/api';
import {
  getUserPassportSettings,
  updateUserPassportSettings,
} from '@/lib/repositories/passport';
import { safeLogError } from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/passport-settings
 * Retrieve passport visibility and configuration for the current authenticated user.
 */
export async function GET() {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const data = await getUserPassportSettings(authResult.userId);
    if (!data) {
      return apiError('User not found', 404);
    }

    return apiOk(data, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('GET /api/user/passport-settings failed:', error);
    return apiError('Failed to load passport settings', 500);
  }
}

/**
 * PATCH /api/user/passport-settings
 * Update visibility, display preferences, and custom bio.
 */
export async function PATCH(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    const {
      visibility,
      showProposalsCount,
      showTargetOrgs,
      showSkills,
      customBio,
      githubUsername,
    } = body as Record<string, unknown>;

    if (
      visibility !== undefined &&
      visibility !== 'public' &&
      visibility !== 'unlisted' &&
      visibility !== 'private'
    ) {
      return apiError(
        'visibility must be "public", "unlisted", or "private"',
        400
      );
    }

    if (
      showProposalsCount !== undefined &&
      typeof showProposalsCount !== 'boolean'
    ) {
      return apiError('showProposalsCount must be a boolean', 400);
    }

    if (showTargetOrgs !== undefined && typeof showTargetOrgs !== 'boolean') {
      return apiError('showTargetOrgs must be a boolean', 400);
    }

    if (showSkills !== undefined && typeof showSkills !== 'boolean') {
      return apiError('showSkills must be a boolean', 400);
    }

    if (customBio !== undefined && typeof customBio !== 'string') {
      return apiError('customBio must be a string', 400);
    }

    if (githubUsername !== undefined && typeof githubUsername !== 'string') {
      return apiError('githubUsername must be a string', 400);
    }

    const updated = await updateUserPassportSettings(authResult.userId, {
      visibility: visibility as 'public' | 'unlisted' | 'private' | undefined,
      showProposalsCount: showProposalsCount as boolean | undefined,
      showTargetOrgs: showTargetOrgs as boolean | undefined,
      showSkills: showSkills as boolean | undefined,
      customBio: customBio as string | undefined,
      githubUsername: githubUsername as string | undefined,
    });

    if (!updated) {
      return apiError('Failed to update passport settings', 404);
    }

    return apiOk({ settings: updated }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('PATCH /api/user/passport-settings failed:', error);
    return apiError('Failed to update passport settings', 500);
  }
}
