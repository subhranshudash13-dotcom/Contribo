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
  createReminderSubscription,
  getUserSubscriptions,
  getUserDeliveryAudit,
} from '@/lib/repositories/reminders';
import { ReminderOffset, REMINDER_OFFSET_MS } from '@/lib/reminders/types';
import { isValidIsoDate } from '@/lib/reminders/scheduler';
import { safeLogError } from '@/lib/security';

function isValidOffset(value: unknown): value is ReminderOffset {
  return typeof value === 'string' && value in REMINDER_OFFSET_MS;
}

/**
 * GET /api/user/reminders
 * Returns user's active/archived reminder subscriptions and scrubbed delivery audit history.
 */
export async function GET() {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const subscriptions = await getUserSubscriptions(authResult.userId);
    const history = await getUserDeliveryAudit(authResult.userId);

    return apiOk(
      { subscriptions, history, total: subscriptions.length },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('GET /api/user/reminders failed:', error);
    return apiError('Failed to fetch deadline reminders', 500);
  }
}

/**
 * POST /api/user/reminders
 * Subscribes user to deadline alerts for a tracked application milestone.
 */
export async function POST(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    const { programSlug, milestoneId, milestoneLabel, deadline, offsets } = body as Record<string, unknown>;

    if (typeof programSlug !== 'string' || !programSlug.trim()) {
      return apiError('programSlug is required', 400);
    }
    if (typeof milestoneId !== 'string' || !milestoneId.trim()) {
      return apiError('milestoneId is required', 400);
    }
    if (typeof milestoneLabel !== 'string' || !milestoneLabel.trim()) {
      return apiError('milestoneLabel is required', 400);
    }
    if (!isValidIsoDate(deadline)) {
      return apiError('deadline must be a valid ISO 8601 date string', 400);
    }

    if (!Array.isArray(offsets) || offsets.length === 0) {
      return apiError('offsets must be a non-empty array', 400);
    }

    const validOffsets = offsets.filter(isValidOffset);
    if (validOffsets.length === 0) {
      return apiError('At least one valid offset is required (7d, 2d, 24h, 2h, 1h)', 400);
    }

    const { subscription, scheduledJobsCount } = await createReminderSubscription({
      userId: authResult.userId,
      programSlug: programSlug.trim(),
      milestoneId: milestoneId.trim(),
      milestoneLabel: milestoneLabel.trim(),
      deadline: deadline.trim(),
      offsets: validOffsets,
    });

    return apiOk(
      {
        success: true,
        subscription,
        scheduledJobsCount,
      },
      201,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('POST /api/user/reminders failed:', error);
    return apiError('Failed to create reminder subscription', 500);
  }
}
