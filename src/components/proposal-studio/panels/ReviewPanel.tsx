'use client';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { BUILDER_SECTIONS } from '../constants';
import { ScoreRing } from '../ui/ScoreRing';
import { useProposalStudioContext } from '../context/ProposalStudioContext';

const BREAKDOWN_META = [
  { key: 'technicalDepth' as const, label: 'Technical depth', weight: '25%' },
  { key: 'timeline' as const, label: 'Timeline realism', weight: '25%' },
  { key: 'projectUnderstanding' as const, label: 'Project understanding', weight: '20%' },
  { key: 'grammar' as const, label: 'Clarity & polish', weight: '15%' },
  { key: 'risks' as const, label: 'Deliverables & risk', weight: '15%' },
];

export function ReviewPanel() {
  const {
    scoreData,
    calculatedProgress: progress,
    sectionStatus,
    aiLoading,
    handleAutoImproveAll,
    setActiveSectionId,
    selectTab,
  } = useProposalStudioContext();

  const incomplete = BUILDER_SECTIONS.filter(
    (s) => !sectionStatus.find((st) => st.id === s.id)?.filled
  );

  const tone =
    scoreData.totalScore >= 80
      ? 'Strong readiness — polish and export.'
      : scoreData.totalScore >= 55
        ? 'Solid draft — close the gaps below before submitting.'
        : 'Early draft — fill weak sections and add concrete detail.';

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <section className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-7 sm:p-10 shadow-md">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-success" />
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left space-y-3 max-w-xl">
              <span className="inline-flex rounded-full border border-success/25 bg-success/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-success">
                Readiness Audit
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
                Proposal Review & Audit
              </h2>
              <p className="text-sm text-secondary leading-relaxed">{tone}</p>
              <p className="font-mono text-[11px] text-muted">
                Section progress{' '}
                <span className="font-bold text-accent tabular-nums">
                  {progress}%
                </span>
              </p>
            </div>
            <ScoreRing score={scoreData.totalScore} size={140} stroke={9} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => void handleAutoImproveAll()}
              disabled={aiLoading === 'all'}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-mono font-bold uppercase tracking-wide text-white hover:bg-accent-hover disabled:opacity-60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {aiLoading === 'all' ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
              Auto-improve weak spots
            </button>
            <button
              type="button"
              onClick={() => selectTab('export')}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-hairline bg-base px-5 text-xs font-mono font-bold uppercase tracking-wide text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            >
              Go to export <ArrowRight size={14} />
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-hairline bg-surface p-5 sm:p-6 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-primary mb-4">
            Score breakdown
          </h3>
          <ul className="space-y-4">
            {BREAKDOWN_META.map((item) => {
              const value = scoreData.breakdown[item.key];
              return (
                <li key={item.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-primary">
                      {item.label}
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums text-secondary">
                      {value}
                      <span className="text-muted font-normal"> / 100 · {item.weight}</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-hairline bg-base">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle size={15} className="text-warning" />
              <h3 className="font-heading text-base font-bold text-primary">
                Missing signals
              </h3>
            </div>
            {scoreData.missingItems.length === 0 ? (
              <p className="flex items-start gap-2 text-sm text-secondary">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                No critical gaps detected from length heuristics.
              </p>
            ) : (
              <ul className="space-y-2">
                {scoreData.missingItems.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-warning/20 bg-warning/5 px-3 py-2.5 text-sm text-secondary"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={15} className="text-accent" />
              <h3 className="font-heading text-base font-bold text-primary">
                Incomplete sections
              </h3>
            </div>
            {incomplete.length === 0 ? (
              <p className="flex items-start gap-2 text-sm text-secondary">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                All sections meet baseline length.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {incomplete.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSectionId(s.id);
                        selectTab('builder');
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-hairline bg-base px-3 py-2.5 text-left hover:border-accent/30 hover:bg-surface-raised transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-medium text-primary">
                        {s.title}
                      </span>
                      <ArrowRight size={13} className="text-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
    </div>
  );
}
