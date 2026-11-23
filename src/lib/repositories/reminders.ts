/**
 * reminders.ts
 *
 * Repository for Account-Scoped Deadline Reminders & Durable Outbox.
 * Supports MongoDB with in-memory fallback for local development and CI testing.
 */

import { getDb } from '../db';
import {
  ReminderSubscription,
  ReminderOutboxJob,
  ReminderDeliveryAuditRecord,
  ReminderOffset,
} from '../reminders/types';
import {
  generateOutboxJobsForSubscription,
  reconcileSubscriptionJobs,
  leaseDueJobs,
  executeOutboxJob,
} from '../reminders/scheduler';

// In-memory fallback stores
const memorySubscriptions = new Map<string, ReminderSubscription>();
const memoryOutbox = new Map<string, ReminderOutboxJob>();
const memoryAudit = new Map<string, ReminderDeliveryAuditRecord[]>();

export function resetRemindersMemoryStore(): void {
  memorySubscriptions.clear();
  memoryOutbox.clear();
  memoryAudit.clear();
}

/**
 * Creates or updates a reminder subscription and enqueues initial outbox jobs.
 */
export async function createReminderSubscription(params: {
  userId: string;
  programSlug: string;
  milestoneId: string;
  milestoneLabel: string;
  deadline: string;
  offsets: ReminderOffset[];
  notificationChannel?: 'in_app' | 'email';
  now?: Date;
}): Promise<{ subscription: ReminderSubscription; scheduledJobsCount: number }> {
  const now = params.now || new Date();
  const id = `sub_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

  const subscription: ReminderSubscription = {
    id,
    userId: params.userId,
    programSlug: params.programSlug,
    milestoneId: params.milestoneId,
    milestoneLabel: params.milestoneLabel,
    deadline: params.deadline,
    offsets: params.offsets,
    notificationChannel: params.notificationChannel || 'in_app',
    status: 'active',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const initialJobs = generateOutboxJobsForSubscription(subscription, now);

  try {
    const db = await getDb();
    if (db) {
      await db.collection('reminder_subscriptions').insertOne(subscription);
      if (initialJobs.length > 0) {
        await db.collection('reminder_outbox').insertMany(initialJobs);
      }
      return { subscription, scheduledJobsCount: initialJobs.length };
    }
  } catch {
    // MongoDB unavailable, proceed to in-memory fallback
  }

  // Memory fallback
  memorySubscriptions.set(id, subscription);
  for (const job of initialJobs) {
    memoryOutbox.set(job.id, job);
  }

  return { subscription, scheduledJobsCount: initialJobs.length };
}

/**
 * Retrieves all subscriptions owned by a specific user.
 */
export async function getUserSubscriptions(
  userId: string
): Promise<ReminderSubscription[]> {
  try {
    const db = await getDb();
    if (db) {
      const subs = await db
        .collection('reminder_subscriptions')
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
      return subs as unknown as ReminderSubscription[];
    }
  } catch {
    // MongoDB unavailable
  }

  return Array.from(memorySubscriptions.values())
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Cancels a subscription and supersedes all its pending outbox jobs.
 * Enforces ownership: only the creator can cancel.
 */
export async function cancelReminderSubscription(
  userId: string,
  subscriptionId: string,
  now = new Date()
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (db) {
      const sub = await db
        .collection('reminder_subscriptions')
        .findOne({ id: subscriptionId, userId });
      if (!sub) {
        return { success: false, error: 'Subscription not found or unauthorized' };
      }

      await db
        .collection('reminder_subscriptions')
        .updateOne(
          { id: subscriptionId, userId },
          { $set: { status: 'cancelled', updatedAt: now.toISOString() } }
        );

      await db
        .collection('reminder_outbox')
        .updateMany(
          {
            subscriptionId,
            status: { $in: ['SCHEDULED', 'LEASED'] },
          },
          {
            $set: {
              status: 'CANCELLED',
              updatedAt: now.toISOString(),
            },
          }
        );

      return { success: true };
    }
  } catch {
    // MongoDB unavailable
  }

  const sub = memorySubscriptions.get(subscriptionId);
  if (!sub || sub.userId !== userId) {
    return { success: false, error: 'Subscription not found or unauthorized' };
  }

  sub.status = 'cancelled';
  sub.updatedAt = now.toISOString();

  for (const job of memoryOutbox.values()) {
    if (
      job.subscriptionId === subscriptionId &&
      (job.status === 'SCHEDULED' || job.status === 'LEASED')
    ) {
      job.status = 'CANCELLED';
      job.updatedAt = now.toISOString();
    }
  }

  return { success: true };
}

/**
 * Supersedes existing jobs when a deadline changes for a milestone.
 */
export async function updateMilestoneDeadline(params: {
  userId: string;
  programSlug: string;
  milestoneId: string;
  newDeadline: string;
  now?: Date;
}): Promise<{ reconciledCount: number }> {
  const now = params.now || new Date();
  const subs = await getUserSubscriptions(params.userId);
  const targetSub = subs.find(
    (s) =>
      s.programSlug === params.programSlug &&
      s.milestoneId === params.milestoneId &&
      s.status === 'active'
  );

  if (!targetSub) {
    return { reconciledCount: 0 };
  }

  targetSub.deadline = params.newDeadline;
  targetSub.updatedAt = now.toISOString();

  const allJobs = Array.from(memoryOutbox.values()).filter(
    (j) => j.subscriptionId === targetSub.id
  );

  const { supersededJobIds, newJobs } = reconcileSubscriptionJobs(
    allJobs,
    targetSub,
    now
  );

  for (const supId of supersededJobIds) {
    const job = memoryOutbox.get(supId);
    if (job) {
      job.status = 'SUPERSEDED';
      job.updatedAt = now.toISOString();
    }
  }

  for (const nj of newJobs) {
    memoryOutbox.set(nj.id, nj);
  }

  return { reconciledCount: newJobs.length };
}

/**
 * Retrieves delivery audit records for a user, scrubbed of any secret tokens or credentials.
 */
export async function getUserDeliveryAudit(
  userId: string
): Promise<ReminderDeliveryAuditRecord[]> {
  try {
    const db = await getDb();
    if (db) {
      const records = await db
        .collection('reminder_delivery_audit')
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();
      return records as unknown as ReminderDeliveryAuditRecord[];
    }
  } catch {
    // MongoDB unavailable
  }

  const userRecords = memoryAudit.get(userId) || [];
  return [...userRecords].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Processes due outbox jobs using a worker lease.
 */
export async function processOutboxQueue(params: {
  workerId: string;
  leaseDurationMs?: number;
  limit?: number;
  now?: Date;
  deliverFn?: (job: ReminderOutboxJob) => Promise<boolean>;
}): Promise<{
  processed: number;
  successes: number;
  failures: number;
}> {
  const now = params.now || new Date();
  const deliverFn = params.deliverFn || (async () => true);

  const jobsList = Array.from(memoryOutbox.values());
  const { leased } = leaseDueJobs(
    jobsList,
    params.workerId,
    params.leaseDurationMs || 30_000,
    now,
    params.limit || 20
  );

  let successes = 0;
  let failures = 0;

  for (const job of leased) {
    const { job: completedJob, auditRecord } = await executeOutboxJob(
      job,
      deliverFn,
      now
    );

    memoryOutbox.set(completedJob.id, completedJob);

    const userAudits = memoryAudit.get(job.userId) || [];
    userAudits.push(auditRecord);
    memoryAudit.set(job.userId, userAudits);

    if (completedJob.status === 'SENT') {
      successes += 1;
    } else {
      failures += 1;
    }
  }

  return {
    processed: leased.length,
    successes,
    failures,
  };
}

/**
 * Directly inspect all in-memory jobs (useful for test assertions).
 */
export function getInMemoryOutboxJobs(): ReminderOutboxJob[] {
  return Array.from(memoryOutbox.values());
}
