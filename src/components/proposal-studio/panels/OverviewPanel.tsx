'use client';

import {
  ArrowRight,
  Building2,
  Clock,
  Code2,
  Target,
  UserCheck,
} from 'lucide-react';
import { BUILDER_SECTIONS, STUDIO_NAV, type StudioTab } from '../constants';
import { ProgressMeter } from '../ui/ProgressMeter';
import { ScoreRing } from '../ui/ScoreRing';
import { useProposalStudioContext } from '../context/ProposalStudioContext';

const JUMP_TABS: StudioTab[] = ['examples', 'guide', 'review', 'export'];

export function OverviewPanel() {
  const {
    activeDraft: draft,
    calculatedProgress: progress,
    scoreData,
    sectionStatus,
    selectTab,
  } = useProposalStudioContext();

  if (!draft) return null;

  const score = scoreData.totalScore;
  const filled = sectionStatus.filter((s) => s.filled).length;
  const nextIncomplete = BUILDER_SECTIONS.find(
    (s) => !sectionStatus.find((st) => st.id === s.id)?.filled
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <section className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-7 sm:p-10 shadow-md">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-accent" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-4">
              <span className="inline-flex rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent">
                Active Proposal Draft
              </span>
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
                  {draft.projectTitle}
                </h2>
                <p className="mt-1.5 text-base sm:text-lg text-secondary font-medium">
                  {draft.orgName}
                  <span className="text-muted"> · </span>
                  {draft.programName}
                </p>
              </div>
              <p className="max-w-2xl text-base text-secondary leading-relaxed">
                {nextIncomplete
                  ? `Next incomplete section: ${nextIncomplete.title}. Finish structured sections, then run a readiness review before export.`
                  : 'All sections meet the baseline length. Run a readiness review, then export.'}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => selectTab('builder')}
                  className="inline-flex h-12 items-center gap-2.5 rounded-2xl bg-accent px-6 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-hover transition-all shadow-md cursor-pointer"
                >
                  Continue writing <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => selectTab('review')}
                  className="inline-flex h-12 items-center gap-2.5 rounded-2xl border border-hairline bg-base px-6 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary hover:bg-surface-raised transition-all cursor-pointer"
                >
                  Open review
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 rounded-2xl border border-hairline bg-base px-5 py-4">
              <ScoreRing score={score} size={108} stroke={7} />
              <div className="space-y-3 min-w-[140px]">
                <ProgressMeter value={progress} label="Sections filled" />
                <p className="text-xs font-mono text-muted">
                  <span className="font-bold text-primary tabular-nums">
                    {filled}/{BUILDER_SECTIONS.length}
                  </span>{' '}
                  complete
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: UserCheck,
              label: 'Mentor',
              value: draft.mentorName,
              sub: draft.mentorRole,
            },
            {
              icon: Clock,
              label: 'Deadline',
              value: draft.deadline,
              sub: `${draft.daysLeft} days left`,
            },
            {
              icon: Target,
              label: 'Difficulty',
              value: draft.difficulty,
              sub: draft.programName,
            },
            {
              icon: Building2,
              label: 'Organization',
              value: draft.orgName,
              sub: draft.programName,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-hairline bg-surface p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-2 text-muted">
                  <Icon size={14} className="text-accent" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                <p className="font-heading text-sm font-bold text-primary leading-snug truncate">
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] font-mono text-muted truncate">
                  {item.sub}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-3xl border border-hairline bg-surface p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-heading text-lg font-bold text-primary">
                Section checklist
              </h3>
              <span className="font-mono text-[11px] text-muted">
                {filled} of {BUILDER_SECTIONS.length}
              </span>
            </div>
            <ul className="space-y-2">
              {BUILDER_SECTIONS.map((section, idx) => {
                const filledSection = sectionStatus.find(
                  (s) => s.id === section.id
                )?.filled;
                return (
                  <li
                    key={section.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-base px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface font-mono text-[11px] font-bold text-muted">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate text-sm font-medium text-primary">
                        {section.title}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
                        filledSection
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-surface-raised text-muted border border-hairline'
                      }`}
                    >
                      {filledSection ? 'Ready' : 'Todo'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-hairline bg-surface p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Code2 size={15} className="text-accent" />
                <h3 className="font-heading text-base font-bold text-primary">
                  Tech stack
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {draft.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-hairline bg-base px-2 py-1 font-mono text-[11px] font-semibold text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-hairline bg-surface p-5 shadow-sm space-y-2">
              <h3 className="font-heading text-base font-bold text-primary mb-3">
                Jump to
              </h3>
              {STUDIO_NAV.filter((n) => JUMP_TABS.includes(n.id)).map((nav) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => selectTab(nav.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-hairline bg-base px-3 py-2.5 text-left hover:border-accent/30 hover:bg-surface-raised transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon size={14} className="text-accent shrink-0" />
                      <span className="truncate text-sm font-medium text-primary">
                        {nav.label}
                      </span>
                    </span>
                    <ArrowRight size={13} className="text-muted shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
    </div>
  );
}
