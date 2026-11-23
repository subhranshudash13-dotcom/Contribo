import {
  apiError,
  apiOk,
  requireUserMutation,
  isNextResponse,
  privateNoStoreHeaders,
} from '@/lib/api';
import { cancelReminderSubscription } from '@/lib/repositories/reminders';
import { safeLogError } from '@/lib/security';

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const { id } = await props.params;
    if (!id || typeof id !== 'string') {
      return apiError('Missing subscription id', 400);
    }

    const result = await cancelReminderSubscription(authResult.userId, id);
    if (!result.success) {
      return apiError(result.error || 'Failed to cancel subscription', 404);
    }

    return apiOk(
      { success: true, message: 'Subscription cancelled and pending jobs cancelled' },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('DELETE /api/user/reminders/[id] failed:', error);
    return apiError('Failed to cancel reminder subscription', 500);
  }
}
