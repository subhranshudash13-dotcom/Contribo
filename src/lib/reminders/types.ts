/**
 * types.ts
 *
 * Strongly-typed domain models for Account-Scoped Deadline Reminders
 * and the Durable Scheduling Outbox (Issue #186).
 */

export type ReminderOffset = '7d' | '2d' | '24h' | '2h' | '1h';

export const REMINDER_OFFSET_MS: Record<ReminderOffset, number> = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '2d': 2 * 24 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '1h': 60 * 60 * 1000,
};

export type ReminderJobStatus =
  | 'SCHEDULED'
  | 'LEASED'
  | 'SENT'
  | 'FAILED'
  | 'CANCELLED'
  | 'SUPERSEDED';

export type ReminderSubscriptionStatus = 'active' | 'cancelled' | 'completed';

export interface ReminderSubscription {
  id: string;
  userId: string;
  programSlug: string;
  milestoneId: string;
  milestoneLabel: string;
  deadline: string; // ISO 8601 UTC
  offsets: ReminderOffset[];
  notificationChannel: 'in_app' | 'email';
  status: ReminderSubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderOutboxJob {
  id: string;
  idempotencyKey: string;
  subscriptionId: string;
  userId: string;
  programSlug: string;
  milestoneId: string;
  milestoneLabel: string;
  offset: ReminderOffset;
  deadline: string;
  scheduledFor: string; // ISO 8601 UTC (deadline - offset)
  status: ReminderJobStatus;
  attempts: number;
  maxAttempts: number;
  leasedUntil: string | null;
  leaseId: string | null;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderDeliveryAuditRecord {
  id: string;
  jobId: string;
  userId: string;
  programSlug: string;
  milestoneId: string;
  offset: ReminderOffset;
  status: 'SENT' | 'FAILED' | 'CANCELLED';
  timestamp: string;
  errorSummary: string | null;
}
