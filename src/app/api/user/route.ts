import {
  apiError,
  apiOk,
  requireUserId,
  isNextResponse,
  parseJsonBody,
  privateNoStoreHeaders,
  normalizeStringArray,
} from '@/lib/api';
import { deleteUserAccount, getUserProfile, updateUserProfile } from '@/lib/repositories/users';

/** GET /api/user — current user profile (no password hash). */
export async function GET() {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const profile = await getUserProfile(authResult.userId);
    if (!profile) {
      // Session exists but user row missing — return session basics
      return apiOk(
        {
          user: {
            _id: authResult.userId,
            email: authResult.email ?? null,
            name: authResult.name ?? null,
          },
        },
        200,
        privateNoStoreHeaders()
      );
    }

    return apiOk({ user: profile }, 200, privateNoStoreHeaders());
  } catch (error) {
    console.error('GET /api/user failed:', error);
    return apiError('Failed to fetch user profile', 500);
  }
}

/** PATCH /api/user — update skills, interests, and profile fields. */
export async function PATCH(req: Request) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const body = await parseJsonBody(req);
    if (isNextResponse(body)) return body;

    const skills = body.skills !== undefined ? normalizeStringArray(body.skills) : undefined;
    const interests =
      body.interests !== undefined ? normalizeStringArray(body.interests) : undefined;

    if (body.skills !== undefined && skills === null) {
      return apiError('skills must be an array of strings', 400);
    }
    if (body.interests !== undefined && interests === null) {
      return apiError('interests must be an array of strings', 400);
    }

    const updated = await updateUserProfile(authResult.userId, {
      name: typeof body.name === 'string' ? body.name : undefined,
      skills: skills ?? undefined,
      interests: interests ?? undefined,
      experience: typeof body.experience === 'string' ? body.experience : undefined,
      availabilityHours:
        typeof body.availabilityHours === 'number' ? body.availabilityHours : undefined,
      location: typeof body.location === 'string' ? body.location : undefined,
      githubUsername: typeof body.githubUsername === 'string' ? body.githubUsername : undefined,
    });

    if (!updated) {
      return apiError('User not found', 404);
    }

    return apiOk({ user: updated }, 200, privateNoStoreHeaders());
  } catch (error) {
    console.error('PATCH /api/user failed:', error);
    return apiError('Failed to update user profile', 500);
  }
}

/** DELETE /api/user — purge account and personal data. */
export async function DELETE() {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const { deleted } = await deleteUserAccount(authResult.userId);
    if (!deleted) {
      return apiError('User profile not found in database', 404);
    }

    return apiOk(
      { success: true, message: 'Account data completely purged' },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    console.error('Failed to delete user account:', error);
    return apiError('Failed to process account deletion', 500);
  }
}
