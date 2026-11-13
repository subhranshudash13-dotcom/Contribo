/**
 * programsTimeline.ts
 *
 * Single, typed source of truth for the homepage "program timelines this year"
 * chart. Every row is keyed by a real program slug (matching
 * scripts/seed-programs.js and the /programs/<slug> routes), so a made-up or
 * removed program surfaces as a build-time error instead of silently shipping
 * a stale or decorative row.
 *
 * Spans are derived from each program's recorded cycle (see the `timeline`
 * events in scripts/seed-programs.js) and are versioned with an explicit
 * year, so a stale timeline is impossible to introduce by accident.
 */

export const CURRENT_TIMELINE_YEAR = 2026;

/** Canonical program slugs that have a seed record and a /programs/<slug> page. */
export const KNOWN_PROGRAM_SLUGS = [
  'esoc',
  'gsoc',
  'lfx',
  'mlh-fellowship',
  'outreachy',
  'gssoc',
  'summer-of-bitcoin',
  'hacktoberfest',
  'nsoc',
] as const;

export type ProgramSlug = (typeof KNOWN_PROGRAM_SLUGS)[number];

export interface TimelineSpan {
  /** 1-based month index (1 = January ... 12 = December), inclusive. */
  start: number;
  /** 1-based month index (1 = January ... 12 = December), inclusive. */
  end: number;
  label: string;
}

export interface TimelineProgram {
  slug: ProgramSlug;
  name: string;
  /** Tailwind classes applied to the row's span chips. */
  color: string;
  /** Explicit year this timeline version applies to. */
  year: number;
  spans: TimelineSpan[];
}

export const PROGRAMS_TIMELINE: TimelineProgram[] = [
  {
    slug: 'esoc',
    name: 'European Summer of Code',
    color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 dark:bg-indigo-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 2, end: 4, label: 'Applications' },
      { start: 5, end: 8, label: 'Coding Phase' },
    ],
  },
  {
    slug: 'gsoc',
    name: 'Google Summer of Code',
    color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 3, end: 4, label: 'Applications & Selection' },
      { start: 6, end: 8, label: 'Coding Phase' },
    ],
  },
  {
    slug: 'lfx',
    name: 'LFX Mentorship',
    color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 dark:bg-cyan-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 3, end: 5, label: 'Spring Term' },
      { start: 6, end: 8, label: 'Summer Term' },
      { start: 9, end: 11, label: 'Fall Term' },
    ],
  },
  {
    slug: 'mlh-fellowship',
    name: 'MLH Fellowship',
    color: 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300 dark:bg-sky-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 1, end: 4, label: 'Spring Batch' },
      { start: 6, end: 8, label: 'Summer Batch' },
      { start: 9, end: 12, label: 'Fall Batch' },
    ],
  },
  {
    slug: 'outreachy',
    name: 'Outreachy',
    color: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 dark:bg-purple-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 1, end: 3, label: 'Winter Cohort' },
      { start: 5, end: 8, label: 'Summer Cohort' },
    ],
  },
  {
    slug: 'gssoc',
    name: 'GirlScript Summer of Code',
    color: 'bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300 dark:bg-pink-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 5, end: 8, label: 'Coding Phase' },
    ],
  },
  {
    slug: 'summer-of-bitcoin',
    name: 'Summer of Bitcoin',
    color: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 dark:bg-amber-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 1, end: 2, label: 'Applications' },
      { start: 5, end: 8, label: 'Coding Phase' },
    ],
  },
  {
    slug: 'hacktoberfest',
    name: 'Hacktoberfest',
    color: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300 dark:bg-orange-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 10, end: 10, label: 'Active Event' },
    ],
  },
  {
    slug: 'nsoc',
    name: 'Nexus Spring of Code (NSoC)',
    color: 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300 dark:bg-violet-500/15',
    year: CURRENT_TIMELINE_YEAR,
    spans: [
      { start: 3, end: 4, label: 'Contribution Sprint' },
    ],
  },
] as const;

/** Look up a timeline program by slug. Returns undefined for unknown slugs. */
export function getTimelineProgram(slug: string): TimelineProgram | undefined {
  return PROGRAMS_TIMELINE.find((p) => p.slug === slug);
}

const KNOWN_SLUG_SET = new Set(KNOWN_PROGRAM_SLUGS);

/**
 * Build-time validation: every timeline row must reference a real program slug
 * and every span must fall within a single calendar year. Throws when the data
 * is invalid so a bad slug fails the build instead of shipping silently.
 */
function validateTimelineData(): void {
  const seen = new Set<ProgramSlug>();
  for (const program of PROGRAMS_TIMELINE) {
    if (!KNOWN_SLUG_SET.has(program.slug)) {
      throw new Error(
        `[programsTimeline] unknown program slug "${program.slug}" — must be one of ${KNOWN_PROGRAM_SLUGS.join(
          ', ',
        )}`,
      );
    }
    if (seen.has(program.slug)) {
      throw new Error(`[programsTimeline] duplicate program slug "${program.slug}"`);
    }
    seen.add(program.slug);

    for (const span of program.spans) {
      if (span.start < 1 || span.start > 12 || span.end < 1 || span.end > 12) {
        throw new Error(
          `[programsTimeline] ${program.slug}: span months must be within 1-12, got ${span.start}-${span.end}`,
        );
      }
      if (span.start > span.end) {
        throw new Error(
          `[programsTimeline] ${program.slug}: span start ${span.start} is after end ${span.end}`,
        );
      }
    }
  }
}

validateTimelineData();
