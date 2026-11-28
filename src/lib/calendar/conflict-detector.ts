/**
 * conflict-detector.ts
 *
 * Finds collisions between the application deadlines and coding windows of several
 * open-source programs. Pure functions: no database, network or clock access.
 * All dates are compared in UTC.
 */
import type { ProgramComparisonRecord } from '../programs/comparison-data';

export type ConflictSeverity = 'INFO' | 'WARNING' | 'CRITICAL_CONFLICT';
export type ConflictType = 'DEADLINE_PINCH' | 'CODING_OVERLAP' | 'EXCLUSIVITY';

export interface ProgramSchedule {
  slug: string;
  name: string;
  applicationStart: string;
  applicationDeadline: string;
  codingStart: string;
  codingEnd: string;
  weeklyHours: number;
  requiresWrittenProposal: boolean;
  fullTimeEmployedAllowed: boolean;
  eligibilityNotes: string;
}

export interface ProgramConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  programs: [string, string];
  startDate: string;
  endDate: string;
  /** Hours between the two deadlines. Only set for DEADLINE_PINCH. */
  hoursApart?: number;
  /** Shared days, counting both ends. Only set for window collisions. */
  overlapDays?: number;
  combinedWeeklyHours?: number;
  message: string;
}

export interface PacingRecommendation {
  slug: string;
  name: string;
  draftStart: string;
  finishBy: string;
  deadline: string;
  draftingDays: number;
  note: string;
}

export interface ConflictReport {
  programs: ProgramSchedule[];
  conflicts: ProgramConflict[];
  summary: Record<ConflictSeverity, number>;
  recommendations: PacingRecommendation[];
}

export const DEADLINE_PINCH_HOURS = 48;
/** Above this combined weekly load an overlap is treated as critical. */
export const FULL_TIME_WEEKLY_HOURS = 40;
/** A program that bars full-time work is flagged against a parallel commitment above this. */
export const PART_TIME_WEEKLY_HOURS = 20;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const PROPOSAL_DRAFT_DAYS = 21;
const SHORT_APPLICATION_DRAFT_DAYS = 7;
const SUBMIT_BUFFER_DAYS = 2;

const SEVERITY_ORDER: Record<ConflictSeverity, number> = {
  CRITICAL_CONFLICT: 0,
  WARNING: 1,
  INFO: 2,
};

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}(?=[T ])/;
const ZONELESS_DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

/**
 * Normalises a milestone date to a UTC timestamp. Date-only values are midnight UTC,
 * date-times without a zone are read as UTC, and offsets are honoured.
 * Returns null for anything that is not a real date.
 */
export function toUtcTimestamp(value: string): number | null {
  const text = value.trim();
  const dateOnly = DATE_ONLY.exec(text);
  if (dateOnly) {
    const [, year, month, day] = dateOnly.map(Number);
    const time = Date.UTC(year, month - 1, day);
    // Date.UTC rolls 2026-02-30 over into March, so check the round trip.
    return new Date(time).toISOString().startsWith(text) ? time : null;
  }
  // Date.parse rolls impossible days over too, so check the day part by itself.
  const day = DATE_PREFIX.exec(text);
  if (day && toUtcTimestamp(day[0]) === null) return null;
  const time = Date.parse(ZONELESS_DATE_TIME.test(text) ? `${text.replace(' ', 'T')}Z` : text);
  return Number.isNaN(time) ? null : time;
}

function isoDay(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

function startOfUtcDay(time: number): number {
  return Math.floor(time / DAY_MS) * DAY_MS;
}

export interface DayInterval {
  start: number;
  end: number;
  days: number;
}

/** Shared calendar days of two inclusive date ranges, or null if they never meet. */
export function intersectDays(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): DayInterval | null {
  const times = [startA, endA, startB, endB].map(toUtcTimestamp);
  if (times.some((t) => t === null)) return null;
  const [a1, a2, b1, b2] = (times as number[]).map(startOfUtcDay);
  if (a2 < a1 || b2 < b1) return null;
  const start = Math.max(a1, b1);
  const end = Math.min(a2, b2);
  if (start > end) return null;
  return { start, end, days: (end - start) / DAY_MS + 1 };
}

export function scheduleFromRecord(record: ProgramComparisonRecord): ProgramSchedule {
  return {
    slug: record.slug,
    name: record.name,
    applicationStart: record.application.applicationStartDate,
    applicationDeadline: record.application.applicationEndDate,
    codingStart: record.commitment.codingStartDate,
    codingEnd: record.commitment.codingEndDate,
    weeklyHours: record.commitment.weeklyHours,
    requiresWrittenProposal: record.application.requiresWrittenProposal,
    fullTimeEmployedAllowed: record.eligibility.fullTimeEmployedAllowed,
    eligibilityNotes: record.eligibility.notes,
  };
}

function deadlinePinch(a: ProgramSchedule, b: ProgramSchedule): ProgramConflict | null {
  const timeA = toUtcTimestamp(a.applicationDeadline);
  const timeB = toUtcTimestamp(b.applicationDeadline);
  if (timeA === null || timeB === null) return null;

  const hoursApart = Math.abs(timeA - timeB) / HOUR_MS;
  if (hoursApart > DEADLINE_PINCH_HOURS) return null;

  const bothProposals = a.requiresWrittenProposal && b.requiresWrittenProposal;
  let severity: ConflictSeverity = 'INFO';
  if (bothProposals) severity = hoursApart <= 24 ? 'CRITICAL_CONFLICT' : 'WARNING';

  const gap = Math.round(hoursApart * 10) / 10;
  return {
    id: `deadline-${a.slug}-${b.slug}`,
    type: 'DEADLINE_PINCH',
    severity,
    programs: [a.slug, b.slug],
    startDate: isoDay(Math.min(timeA, timeB)),
    endDate: isoDay(Math.max(timeA, timeB)),
    hoursApart: gap,
    message: `${a.name} and ${b.name} applications close ${gap} hours apart${
      bothProposals ? ', and both need a written proposal' : ''
    }.`,
  };
}

function codingOverlap(a: ProgramSchedule, b: ProgramSchedule): ProgramConflict | null {
  const shared = intersectDays(a.codingStart, a.codingEnd, b.codingStart, b.codingEnd);
  if (!shared) return null;

  const hours = a.weeklyHours + b.weeklyHours;
  let severity: ConflictSeverity = 'INFO';
  if (hours > FULL_TIME_WEEKLY_HOURS) severity = 'CRITICAL_CONFLICT';
  else if (hours > PART_TIME_WEEKLY_HOURS) severity = 'WARNING';

  return {
    id: `coding-${a.slug}-${b.slug}`,
    type: 'CODING_OVERLAP',
    severity,
    programs: [a.slug, b.slug],
    startDate: isoDay(shared.start),
    endDate: isoDay(shared.end),
    overlapDays: shared.days,
    combinedWeeklyHours: hours,
    message: `${a.name} and ${b.name} run together for ${shared.days} days at about ${hours} hours a week combined.`,
  };
}

function exclusivity(a: ProgramSchedule, b: ProgramSchedule): ProgramConflict | null {
  const shared = intersectDays(a.codingStart, a.codingEnd, b.codingStart, b.codingEnd);
  if (!shared) return null;

  const breaches = (restricted: ProgramSchedule, other: ProgramSchedule) =>
    !restricted.fullTimeEmployedAllowed && other.weeklyHours > PART_TIME_WEEKLY_HOURS;

  let pair: [ProgramSchedule, ProgramSchedule];
  if (breaches(a, b)) pair = [a, b];
  else if (breaches(b, a)) pair = [b, a];
  else return null;

  const [restricted, other] = pair;
  return {
    id: `exclusivity-${a.slug}-${b.slug}`,
    type: 'EXCLUSIVITY',
    severity: 'CRITICAL_CONFLICT',
    programs: [a.slug, b.slug],
    startDate: isoDay(shared.start),
    endDate: isoDay(shared.end),
    overlapDays: shared.days,
    combinedWeeklyHours: a.weeklyHours + b.weeklyHours,
    message: `${restricted.name} is listed as not allowing full-time commitments, and ${other.name} asks for about ${other.weeklyHours} hours a week during the same period. Catalog note: "${restricted.eligibilityNotes}" Confirm against the official rules before accepting both.`,
  };
}

/**
 * Plans drafting blocks backwards from the last deadline so that no two blocks overlap.
 * Results are returned in the order the work should be done.
 */
export function recommendPacing(programs: ProgramSchedule[]): PacingRecommendation[] {
  const dated = programs
    .map((program) => ({ program, deadline: toUtcTimestamp(program.applicationDeadline) }))
    .filter((entry): entry is { program: ProgramSchedule; deadline: number } => entry.deadline !== null)
    .sort((x, y) => y.deadline - x.deadline);

  let latestFree = Number.POSITIVE_INFINITY;
  const blocks = dated.map(({ program, deadline }) => {
    const draftingDays = program.requiresWrittenProposal
      ? PROPOSAL_DRAFT_DAYS
      : SHORT_APPLICATION_DRAFT_DAYS;
    const target = startOfUtcDay(deadline) - SUBMIT_BUFFER_DAYS * DAY_MS;
    const finishBy = Math.min(target, latestFree);
    const draftStart = finishBy - (draftingDays - 1) * DAY_MS;
    latestFree = draftStart - DAY_MS;

    return {
      slug: program.slug,
      name: program.name,
      draftStart: isoDay(draftStart),
      finishBy: isoDay(finishBy),
      deadline: isoDay(deadline),
      draftingDays,
      note:
        finishBy < target
          ? `Finish early: the days closer to this deadline are taken by a later application.`
          : `Leaves ${SUBMIT_BUFFER_DAYS} days of buffer before the deadline.`,
    };
  });

  return blocks.reverse();
}

export function detectConflicts(input: ProgramSchedule[]): ConflictReport {
  const programs = [...new Map(input.map((p) => [p.slug, p])).values()];
  const conflicts: ProgramConflict[] = [];

  for (let i = 0; i < programs.length; i++) {
    for (let j = i + 1; j < programs.length; j++) {
      for (const check of [deadlinePinch, codingOverlap, exclusivity]) {
        const found = check(programs[i], programs[j]);
        if (found) conflicts.push(found);
      }
    }
  }

  conflicts.sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.startDate.localeCompare(b.startDate)
  );

  const summary: Record<ConflictSeverity, number> = { CRITICAL_CONFLICT: 0, WARNING: 0, INFO: 0 };
  for (const conflict of conflicts) summary[conflict.severity] += 1;

  return { programs, conflicts, summary, recommendations: recommendPacing(programs) };
}
