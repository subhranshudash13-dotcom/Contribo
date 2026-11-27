'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  detectConflicts,
  scheduleFromRecord,
  toUtcTimestamp,
  type ConflictSeverity,
  type ConflictType,
  type ProgramSchedule,
} from '@/lib/calendar/conflict-detector';
import { COMPARISON_PROGRAMS } from '@/lib/programs/comparison-data';

const DEFAULT_SLUGS = ['gsoc', 'lfx', 'outreachy'];

const SEVERITY_STYLE: Record<ConflictSeverity, { label: string; badge: string }> = {
  CRITICAL_CONFLICT: { label: 'Critical', badge: 'border-error text-error' },
  WARNING: { label: 'Warning', badge: 'border-warning text-warning' },
  INFO: { label: 'Info', badge: 'border-hairline text-secondary' },
};

const TYPE_LABEL: Record<ConflictType, string> = {
  DEADLINE_PINCH: 'Deadline pinch',
  CODING_OVERLAP: 'Coding window overlap',
  EXCLUSIVITY: 'Exclusivity risk',
};

function Timeline({ programs }: { programs: ProgramSchedule[] }) {
  const times = programs
    .flatMap((p) => [p.applicationStart, p.applicationDeadline, p.codingStart, p.codingEnd])
    .map(toUtcTimestamp)
    .filter((t): t is number => t !== null);
  if (times.length === 0) return null;

  const first = Math.min(...times);
  const last = Math.max(...times);
  const span = Math.max(1, last - first);

  const bar = (from: string, to: string) => {
    const start = toUtcTimestamp(from) ?? first;
    const end = toUtcTimestamp(to) ?? start;
    return {
      left: `${((start - first) / span) * 100}%`,
      width: `${Math.max(1, ((end - start) / span) * 100)}%`,
    };
  };

  return (
    <div className="space-y-4 rounded-xl border border-hairline bg-surface p-4">
      <div className="flex justify-between font-mono text-xs text-secondary">
        <span>{new Date(first).toISOString().slice(0, 10)}</span>
        <span>{new Date(last).toISOString().slice(0, 10)}</span>
      </div>
      {programs.map((p) => (
        <div key={p.slug} className="space-y-1">
          <p className="text-sm font-semibold text-primary">{p.name}</p>
          <div
            role="img"
            aria-label={`${p.name}: applications ${p.applicationStart} to ${p.applicationDeadline}, coding ${p.codingStart} to ${p.codingEnd}`}
            className="relative h-8 rounded-sm bg-surface-raised"
          >
            <span
              className="absolute top-1 h-2.5 rounded-sm bg-brass"
              style={bar(p.applicationStart, p.applicationDeadline)}
            />
            <span
              className="absolute bottom-1 h-2.5 rounded-sm bg-accent"
              style={bar(p.codingStart, p.codingEnd)}
            />
          </div>
        </div>
      ))}
      <div className="flex gap-4 text-xs text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-brass" /> Applications
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-accent" /> Coding period
        </span>
      </div>
    </div>
  );
}

export function ConflictsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<string[]>(() => {
    const raw = searchParams.get('programs');
    if (raw === null) return DEFAULT_SLUGS;
    return [...new Set(raw.split(',').map((s) => s.trim().toLowerCase()))].filter((s) =>
      Object.hasOwn(COMPARISON_PROGRAMS, s)
    );
  });

  const toggle = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug];
    setSelected(next);
    router.replace(`${pathname}?programs=${next.join(',')}`, { scroll: false });
  };

  const report = detectConflicts(selected.map((s) => scheduleFromRecord(COMPARISON_PROGRAMS[s])));

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-primary">Calendar conflict detector</h1>
        <p className="text-sm text-secondary">
          Pick the programs you plan to apply to. Dates come from the Contribo comparison catalog and
          are shown in UTC, so check each official site before relying on them.
        </p>
      </header>

      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-sm font-semibold text-primary">Programs</legend>
        {Object.values(COMPARISON_PROGRAMS).map((p) => {
          const active = selected.includes(p.slug);
          return (
            <button
              key={p.slug}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(p.slug)}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active
                  ? 'border-accent bg-surface-raised font-semibold text-primary'
                  : 'border-hairline bg-surface text-secondary'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </fieldset>

      {report.programs.length === 0 ? (
        <p className="text-sm text-secondary">Select a program to see its timeline.</p>
      ) : (
        <>
          <Timeline programs={report.programs} />

          <section aria-live="polite" className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">Collisions ({report.conflicts.length})</h2>
            {report.conflicts.length === 0 && (
              <p className="text-sm text-secondary">
                {report.programs.length < 2
                  ? 'Select at least two programs to compare.'
                  : 'No collisions found for this selection.'}
              </p>
            )}
            {report.conflicts.map((conflict) => (
              <article key={conflict.id} className="space-y-2 rounded-xl border border-hairline bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-sm border px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[conflict.severity].badge}`}
                  >
                    {SEVERITY_STYLE[conflict.severity].label}
                  </span>
                  <h3 className="text-sm font-semibold text-primary">{TYPE_LABEL[conflict.type]}</h3>
                  <span className="font-mono text-xs text-secondary">
                    {conflict.startDate} to {conflict.endDate}
                  </span>
                </div>
                <p className="text-sm text-secondary">{conflict.message}</p>
              </article>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">Suggested drafting schedule</h2>
            <ol className="space-y-2">
              {report.recommendations.map((item) => (
                <li key={item.slug} className="rounded-xl border border-hairline bg-surface p-4 text-sm">
                  <p className="font-semibold text-primary">{item.name}</p>
                  <p className="text-secondary">
                    Draft {item.draftStart} to {item.finishBy} ({item.draftingDays} days), deadline{' '}
                    {item.deadline}. {item.note}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}
