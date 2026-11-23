/**
 * scheduler.ts
 *
 * Core scheduling engine for deadline reminders and outbox reconciliation.
 * Pure logic with fake-clock support, concurrency lease management, and idempotency guarantees.
 */

import {
  ReminderOffset,
  REMINDER_OFFSET_MS,
  ReminderSubscription,
  ReminderOutboxJob,
  ReminderDeliveryAuditRecord,
} from './types';

/**
 * Validates whether a date string is a valid ISO 8601 UTC date-time or date.
 * Explicitly rejects undefined, empty, or unparseable formats.
 */
export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

/**
 * Calculates scheduled trigger time relative to a deadline and offset.
 * Returns null if deadline is invalid, unparseable, or missing (unschedulable).
 */
export function calculateScheduledTime(
  deadlineIso: string,
  offset: ReminderOffset
): Date | null {
  if (!isValidIsoDate(deadlineIso)) {
    return null;
  }
  const offsetMs = REMINDER_OFFSET_MS[offset];
  if (typeof offsetMs !== 'number') {
    return null;
  }
  const deadlineMs = Date.parse(deadlineIso);
  return new Date(deadlineMs - offsetMs);
}

/**
 * Builds a deterministic, collision-resistant idempotency key for an outbox job.
 * Format: user:program:milestone:offset:deadlineTimestamp
 */
export function buildIdempotencyKey(
  userId: string,
  programSlug: string,
  milestoneId: string,
  offset: ReminderOffset,
  deadlineIso: string
): string {
  const deadlineMs = Date.parse(deadlineIso);
  const cleanUser = (userId || 'anon').trim().toLowerCase();
  const cleanProgram = (programSlug || 'prog').trim().toLowerCase();
  const cleanMilestone = (milestoneId || 'milestone').trim().toLowerCase();
  return `${cleanUser}:${cleanProgram}:${cleanMilestone}:${offset}:${deadlineMs}`;
}

/**
 * Generates initial or updated outbox jobs for a reminder subscription.
 * Only schedules offsets that are still in the future relative to `now`.
 */
export function generateOutboxJobsForSubscription(
  subscription: ReminderSubscription,
  now = new Date()
): ReminderOutboxJob[] {
  if (subscription.status !== 'active') {
    return [];
  }

  const jobs: ReminderOutboxJob[] = [];
  const nowMs = now.getTime();

  for (const offset of subscription.offsets) {
    const scheduledDate = calculateScheduledTime(subscription.deadline, offset);
    if (!scheduledDate) continue;

    // Only schedule if the trigger time is in the future
    if (scheduledDate.getTime() <= nowMs) {
      continue;
    }

    const idempotencyKey = buildIdempotencyKey(
      subscription.userId,
      subscription.programSlug,
      subscription.milestoneId,
      offset,
      subscription.deadline
    );

    jobs.push({
      id: `job_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
      idempotencyKey,
      subscriptionId: subscription.id,
      userId: subscription.userId,
      programSlug: subscription.programSlug,
      milestoneId: subscription.milestoneId,
      milestoneLabel: subscription.milestoneLabel,
      offset,
      deadline: subscription.deadline,
      scheduledFor: scheduledDate.toISOString(),
      status: 'SCHEDULED',
      attempts: 0,
      maxAttempts: 3,
      leasedUntil: null,
      leaseId: null,
      lastError: null,
      sentAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  return jobs;
}

/**
 * Reconciles active jobs when a deadline changes or subscription is cancelled/completed.
 * Obsolete jobs are superseded or cancelled.
 */
export function reconcileSubscriptionJobs(
  existingJobs: ReminderOutboxJob[],
  subscription: ReminderSubscription,
  now = new Date()
): {
  activeJobs: ReminderOutboxJob[];
  supersededJobIds: string[];
  newJobs: ReminderOutboxJob[];
} {
  const supersededJobIds: string[] = [];

  // If subscription is no longer active, cancel/supersede all pending jobs
  if (subscription.status !== 'active') {
    for (const job of existingJobs) {
      if (job.status === 'SCHEDULED' || job.status === 'LEASED') {
        supersededJobIds.push(job.id);
      }
    }
    return {
      activeJobs: existingJobs.filter((j) => !supersededJobIds.includes(j.id)),
      supersededJobIds,
      newJobs: [],
    };
  }

  // Check if deadline has changed
  for (const job of existingJobs) {
    if (
      (job.status === 'SCHEDULED' || job.status === 'LEASED') &&
      job.deadline !== subscription.deadline
    ) {
      supersededJobIds.push(job.id);
    }
  }

  const activeExisting = existingJobs.filter(
    (j) => !supersededJobIds.includes(j.id)
  );
  const existingOffsets = new Set(
    activeExisting
      .filter((j) => j.status === 'SCHEDULED' || j.status === 'SENT')
      .map((j) => j.offset)
  );

  const newCandidates = generateOutboxJobsForSubscription(subscription, now);
  const newJobs = newCandidates.filter((j) => !existingOffsets.has(j.offset));

  return {
    activeJobs: [...activeExisting, ...newJobs],
    supersededJobIds,
    newJobs,
  };
}

/**
 * Atomically leases due jobs for a worker instance.
 * Ensures no other worker can claim the same job while the lease is valid.
 */
export function leaseDueJobs(
  jobs: ReminderOutboxJob[],
  workerId: string,
  leaseDurationMs = 30_000,
  now = new Date(),
  limit = 20
): { leased: ReminderOutboxJob[]; remaining: ReminderOutboxJob[] } {
  const nowMs = now.getTime();
  const leased: ReminderOutboxJob[] = [];
  const updatedAll = jobs.map((job) => ({ ...job }));

  for (const job of updatedAll) {
    if (leased.length >= limit) break;

    const isDue = Date.parse(job.scheduledFor) <= nowMs;
    const isAvailable =
      job.status === 'SCHEDULED' ||
      (job.status === 'LEASED' &&
        job.leasedUntil &&
        Date.parse(job.leasedUntil) < nowMs);

    const hasAttemptsLeft = job.attempts < job.maxAttempts;

    if (isDue && isAvailable && hasAttemptsLeft) {
      job.status = 'LEASED';
      job.leaseId = workerId;
      job.leasedUntil = new Date(nowMs + leaseDurationMs).toISOString();
      job.attempts += 1;
      job.updatedAt = now.toISOString();
      leased.push(job);
    }
  }

  return { leased, remaining: updatedAll };
}

/**
 * Processes a leased job and produces an audit record without leaking secrets.
 */
export async function executeOutboxJob(
  job: ReminderOutboxJob,
  deliverFn: (job: ReminderOutboxJob) => Promise<boolean>,
  now = new Date()
): Promise<{
  job: ReminderOutboxJob;
  auditRecord: ReminderDeliveryAuditRecord;
}> {
  let success = false;
  let errorSummary: string | null = null;

  try {
    success = await deliverFn(job);
    if (!success) {
      errorSummary = 'Delivery handler returned failure';
    }
  } catch (err: unknown) {
    success = false;
    errorSummary = err instanceof Error ? err.message : 'Unknown delivery error';
  }

  const updatedJob: ReminderOutboxJob = {
    ...job,
    updatedAt: now.toISOString(),
  };

  if (success) {
    updatedJob.status = 'SENT';
    updatedJob.sentAt = now.toISOString();
    updatedJob.leasedUntil = null;
    updatedJob.leaseId = null;
    updatedJob.lastError = null;
  } else {
    updatedJob.lastError = errorSummary;
    if (updatedJob.attempts >= updatedJob.maxAttempts) {
      updatedJob.status = 'FAILED';
      updatedJob.leasedUntil = null;
      updatedJob.leaseId = null;
    } else {
      // Return to SCHEDULED for exponential retry backoff
      updatedJob.status = 'SCHEDULED';
      const backoffMs = Math.pow(2, updatedJob.attempts) * 1000;
      updatedJob.scheduledFor = new Date(now.getTime() + backoffMs).toISOString();
      updatedJob.leasedUntil = null;
      updatedJob.leaseId = null;
    }
  }

  const auditRecord: ReminderDeliveryAuditRecord = {
    id: `audit_${Math.random().toString(36).slice(2, 10)}`,
    jobId: job.id,
    userId: job.userId,
    programSlug: job.programSlug,
    milestoneId: job.milestoneId,
    offset: job.offset,
    status: success ? 'SENT' : updatedJob.status === 'FAILED' ? 'FAILED' : 'FAILED',
    timestamp: now.toISOString(),
    errorSummary: errorSummary ? errorSummary.slice(0, 100) : null,
  };

  return { job: updatedJob, auditRecord };
}
