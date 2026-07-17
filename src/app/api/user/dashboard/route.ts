import {
  apiError,
  apiOk,
  requireUserId,
  isNextResponse,
  privateNoStoreHeaders,
} from '@/lib/api';
import { getDashboardSummary } from '@/lib/repositories/dashboard';

/** GET /api/user/dashboard — summary for the contributor workspace. */
export async function GET() {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const summary = await getDashboardSummary(authResult.userId);
    return apiOk(
      {
        savedCount: summary.savedCount,
        applicationCount: summary.applicationCount,
        activeDeadlineCount: summary.activeDeadlineCount,
        applications: summary.applications,
        savedItems: summary.savedItems,
      },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    console.error('GET /api/user/dashboard failed:', error);
    return apiError('Failed to load dashboard', 500);
  }
}
