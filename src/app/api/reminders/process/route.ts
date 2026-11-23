import { apiError, apiOk, privateNoStoreHeaders } from '@/lib/api';
import { processOutboxQueue } from '@/lib/repositories/reminders';
import { safeLogError } from '@/lib/security';

/**
 * POST /api/reminders/process
 * Worker / Cron trigger to lease due outbox jobs and dispatch notifications.
 * Can be called by internal scheduler or external crons with x-cron-secret.
 */
export async function POST(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('x-cron-secret');

    // If secret configured, verify it
    if (cronSecret && authHeader !== cronSecret) {
      return apiError('Unauthorized cron invocation', 401);
    }

    const workerId = `worker_${Math.random().toString(36).slice(2, 8)}`;
    const result = await processOutboxQueue({
      workerId,
      leaseDurationMs: 45_000,
      limit: 25,
      now: new Date(),
    });

    return apiOk(
      {
        success: true,
        workerId,
        ...result,
      },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('POST /api/reminders/process failed:', error);
    return apiError('Failed to process reminder outbox', 500);
  }
}
