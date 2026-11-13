/**
 * Timestamp helpers.
 *
 * Draft documents arrive in two shapes: a real `Date` when read straight from
 * MongoDB, and an ISO string once they have travelled through a route handler's
 * JSON response. Legacy rows may still hold prose such as `'Just now'`, which
 * is why parsing is strict — silently coercing prose to a date is what made the
 * "recently edited" ordering meaningless in the first place.
 */

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Sentinel that keeps unresolvable rows at the bottom of a newest-first list. */
const NO_TIMESTAMP = Number.MIN_SAFE_INTEGER;

/** ISO-8601 only: `2026-04-13`, `2026-04-13T09:30`, or a full timestamp with offset. */
const ISO_LIKE =
  /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/** Parse a stored timestamp, or return `null` when it is not a real point in time. */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || !ISO_LIKE.test(trimmed)) return null;
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

function absoluteDate(date: Date, now: Date): string {
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/**
 * Label a modification time as a phrase that ages:
 * `just now` → `12 minutes ago` → `3 hours ago` → `yesterday` → `4 days ago` → `13 Apr`.
 *
 * Returns `null` for values that are not real timestamps (legacy prose rows) so
 * callers can hide the label instead of showing something misleading.
 */
export function formatRelativeTime(
  value: unknown,
  now: Date = new Date()
): string | null {
  const date = toDate(value);
  if (!date) return null;

  // Clock skew or a scheduled edit: treat anything in the future as "just now".
  const elapsed = Math.max(0, now.getTime() - date.getTime());

  if (elapsed < MINUTE_MS) return 'just now';
  if (elapsed < HOUR_MS) return `${plural(Math.floor(elapsed / MINUTE_MS), 'minute')} ago`;
  if (elapsed < DAY_MS) return `${plural(Math.floor(elapsed / HOUR_MS), 'hour')} ago`;

  const days = Math.floor(elapsed / DAY_MS);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${plural(days, 'day')} ago`;

  return absoluteDate(date, now);
}

/**
 * Comparator for drafts, newest first.
 *
 * Rows without a resolvable timestamp keep whatever value the caller falls back
 * on (`createdAt`, or an ObjectId's embedded clock via `updatedAtOf`); anything
 * unresolvable sorts last so a stale row can never outrank a real edit.
 */
function byNewestFirst<T>(
  updatedAtOf: (item: T) => Date | null
): (a: T, b: T) => number {
  const time = (item: T) => updatedAtOf(item)?.getTime() ?? NO_TIMESTAMP;
  return (a, b) => time(b) - time(a);
}

/** Newest-first copy of `items`, leaving the input untouched. */
export function sortNewestFirst<T>(
  items: readonly T[],
  updatedAtOf: (item: T) => Date | null
): T[] {
  return [...items].sort(byNewestFirst(updatedAtOf));
}

/**
 * Ordering key for a draft on the client side: the modification time, or the
 * creation time for rows that never had one. `null` means "no idea" and sorts last.
 */
export function updatedAtOrCreated(draft: {
  updatedAt?: unknown;
  createdAt?: unknown;
}): Date | null {
  return toDate(draft.updatedAt) ?? toDate(draft.createdAt);
}
