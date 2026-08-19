'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  FileText,
  Info,
  MessageSquarePlus,
  Search,
  User,
} from 'lucide-react';
import { ORG_PROPOSALS_CATALOG } from '@/lib/proposal-studio/data';
import { PROGRAM_FILTERS } from '../constants';
import { ProposalPreviewModal } from '../ui/ProposalPreviewModal';
import { useProposalStudioContext } from '../context/ProposalStudioContext';

export function LibraryPanel() {
  const {
    filteredCatalog,
    librarySearch,
    selectedProgramTag,
    selectedProposalPreview,
    downloadQuota,
    setLibrarySearch,
    setSelectedProgramTag,
    setSelectedProposalPreview,
    cloneProposalToWorkspace,
    setIsFeedbackModalOpen,
  } = useProposalStudioContext();

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
        <header className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-7 sm:p-10 shadow-md">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-brass" />
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex rounded-full border border-brass/25 bg-brass/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-brass">
                Annotated Proposal Library
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
                Accepted Proposals Catalog
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                Study structure and mentor rationale from accepted applications.
                Clone structure into your draft — never copy text verbatim.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-hairline bg-page px-4 text-xs font-mono font-bold text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            >
              <MessageSquarePlus size={14} className="text-accent" />
              Suggest a proposal
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-brass/25 bg-brass/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <User size={16} className="mt-0.5 shrink-0 text-brass" />
            <div>
              <p className="text-sm font-medium text-primary">
                Guest downloads remaining:{' '}
                <span className="font-mono font-bold text-accent tabular-nums">
                  {downloadQuota}
                </span>
              </p>
              <p className="text-xs text-secondary mt-0.5">
                Complete your profile for unlimited library access.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-brass px-4 text-xs font-mono font-bold uppercase text-white hover:bg-brass-hover transition-colors"
          >
            Complete profile <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Filter by program"
            >
              {PROGRAM_FILTERS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedProgramTag(tag)}
                  className={`rounded-xl border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    selectedProgramTag === tag
                      ? 'border-accent bg-accent text-white'
                      : 'border-hairline bg-surface text-secondary hover:text-primary hover:border-accent/30'
                  }`}
                >
                  {tag === 'ALL' ? 'All' : tag}
                </button>
              ))}
            </div>
            <p className="font-mono text-[11px] text-muted">
              {filteredCatalog.length} of {ORG_PROPOSALS_CATALOG.length} orgs
            </p>
          </div>

          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <label htmlFor="library-search" className="sr-only">
              Search proposal library
            </label>
            <input
              id="library-search"
              type="search"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Search by organization or project title..."
              className="h-11 w-full rounded-2xl border border-hairline bg-surface pl-10 pr-4 text-sm font-mono text-primary placeholder:text-muted focus:outline-none focus:border-accent shadow-sm"
            />
          </div>
        </div>

        {filteredCatalog.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-hairline bg-surface p-10 text-center">
            <p className="font-heading text-lg font-bold text-primary">
              No matching organizations
            </p>
            <p className="mt-1 text-sm text-secondary">
              Try another program filter or clear your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCatalog.map((orgGroup) => (
              <article
                key={orgGroup.id}
                className="flex flex-col justify-between rounded-3xl border border-hairline bg-surface p-5 shadow-sm hover:border-accent/35 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                      {orgGroup.programTag}
                    </span>
                    <span className="rounded-lg border border-hairline bg-page px-2 py-0.5 font-mono text-[10px] font-bold text-muted">
                      {orgGroup.proposalCount}{' '}
                      {orgGroup.proposalCount === 1 ? 'proposal' : 'proposals'}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-primary leading-snug">
                    {orgGroup.orgName}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {orgGroup.techStack.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-hairline bg-page px-1.5 py-0.5 font-mono text-[10px] font-semibold text-secondary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-hairline pt-3">
                  {orgGroup.proposals.map((prop, idx) => (
                    <button
                      key={prop.id}
                      type="button"
                      onClick={() => setSelectedProposalPreview(prop)}
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-hairline bg-page px-3 py-2.5 text-left hover:bg-surface-raised transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText size={13} className="shrink-0 text-accent" />
                        <span className="truncate text-xs font-mono font-bold text-primary">
                          {idx + 1}. {prop.projectTitle}
                        </span>
                      </span>
                      <ChevronRight
                        size={13}
                        className="shrink-0 text-muted group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex items-start gap-3 rounded-2xl border border-hairline bg-page/60 p-4">
          <Info size={16} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-xs text-secondary leading-relaxed">
            <span className="font-mono font-bold uppercase text-primary">
              Educational use only —{' '}
            </span>
            Library entries are for structure and milestone benchmarking.
            Reusing text verbatim violates open-source community norms.
          </p>
        </div>

      {selectedProposalPreview && (
        <ProposalPreviewModal
          proposal={selectedProposalPreview}
          onClose={() => setSelectedProposalPreview(null)}
          onClone={cloneProposalToWorkspace}
        />
      )}
    </div>
  );
}
