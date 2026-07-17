import {
  apiError,
  apiOk,
  isNextResponse,
  parseJsonBody,
  privateNoStoreHeaders,
  requireUserId,
  normalizeStringArray,
} from '@/lib/api';
import { getUserItemStatus } from '@/lib/repositories/dashboard';

/**
 * POST /api/user/status
 * Batch check which project/org ids the current user has saved or tracked.
 *
 * Body: { projectIds?: string[], organizationIds?: string[] }
 */
export async function POST(req: Request) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const body = await parseJsonBody(req);
    if (isNextResponse(body)) return body;

    const projectIds =
      normalizeStringArray(body.projectIds, { maxItems: 100, maxItemLen: 32 }) || [];
    const organizationIds =
      normalizeStringArray(body.organizationIds, { maxItems: 100, maxItemLen: 32 }) || [];

    if (projectIds.length === 0 && organizationIds.length === 0) {
      return apiError('Provide projectIds and/or organizationIds arrays', 400);
    }

    const status = await getUserItemStatus(authResult.userId, {
      projectIds,
      organizationIds,
    });

    return apiOk(
      {
        ...status,
        // Convenience maps for O(1) client lookups
        savedProjects: Object.fromEntries(status.savedProjectIds.map((id) => [id, true])),
        savedOrganizations: Object.fromEntries(
          status.savedOrganizationIds.map((id) => [id, true])
        ),
        trackedProjects: Object.fromEntries(status.trackedProjectIds.map((id) => [id, true])),
      },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    console.error('POST /api/user/status failed:', error);
    return apiError('Failed to resolve item status', 500);
  }
}
