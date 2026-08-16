'use client';

import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  FolderGit2,
  ListChecks,
  Target,
} from 'lucide-react';
import { DYNAMIC_PROJECT_GUIDE } from '@/lib/proposal-studio/data';
import { useProposalStudioContext } from '../context/ProposalStudioContext';

export function GuidePanel() {
  const { activeDraft: draft } = useProposalStudioContext();
  const guide = DYNAMIC_PROJECT_GUIDE;

  if (!draft) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <header className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-7 sm:p-10 shadow-md">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-merge" />
          <span className="inline-flex rounded-full border border-merge/25 bg-merge/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-merge">
            Project Guide & Repository Specification
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
            {guide.projectTitle}
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Tailored context for{' '}
            <span className="font-medium text-primary">{draft.projectTitle}</span>
            {' · '}
            {guide.orgName}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-secondary leading-relaxed">
            {guide.architectureOverview}
          </p>
        </header>

        <section className="rounded-3xl border border-hairline bg-surface p-5 sm:p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FolderGit2 size={16} className="text-accent" />
            <h3 className="font-heading text-lg font-bold text-primary">
              Repository structure
            </h3>
          </div>
          <ul className="space-y-2">
            {guide.repoStructure.map((item) => (
              <li
                key={item.path}
                className="flex flex-col gap-1 rounded-xl border border-hairline bg-base px-4 py-3 sm:flex-row sm:items-start sm:gap-4"
              >
                <code className="shrink-0 font-mono text-xs font-bold text-accent">
                  {item.path}
                </code>
                <span className="text-sm text-secondary leading-relaxed">
                  {item.description}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Target size={15} className="text-accent" />
              <h3 className="font-heading text-base font-bold text-primary">
                Mentor expectations
              </h3>
            </div>
            <ul className="space-y-2">
              {guide.mentorExpectations.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-secondary leading-relaxed"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks size={15} className="text-accent" />
              <h3 className="font-heading text-base font-bold text-primary">
                Proposal expectations
              </h3>
            </div>
            <ul className="space-y-2">
              {guide.proposalExpectations.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-secondary leading-relaxed"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-3xl border border-error/20 bg-error/5 p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={15} className="text-error" />
            <h3 className="font-heading text-base font-bold text-primary">
              Common mistakes
            </h3>
          </div>
          <ul className="space-y-2">
            {guide.commonMistakes.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm text-secondary leading-relaxed"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-hairline bg-surface p-5 sm:p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen size={15} className="text-accent" />
            <h3 className="font-heading text-base font-bold text-primary">
              Suggested reading
            </h3>
          </div>
          <ul className="space-y-2">
            {guide.suggestedReading.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-base px-4 py-3 hover:border-accent/30 hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">
                      {item.title}
                    </p>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted mt-0.5">
                      {item.type}
                    </p>
                  </div>
                  <ExternalLink size={14} className="shrink-0 text-accent" />
                </a>
              </li>
            ))}
          </ul>
        </section>
    </div>
  );
}
