'use client';

import React, { useState, useMemo } from 'react';
import {
  BookmarkCheck,
  FileText,
  Filter,
  FolderArchive,
  MessageSquarePlus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { type AcceptedProposal, type OrgProposalGroup } from '@/lib/proposal-studio/data';
import { PROGRAM_FILTERS } from '../constants';
import { ProposalPreviewModal } from '../ui/ProposalPreviewModal';
import { useProposalStudioContext } from '../context/ProposalStudioContext';

interface FlatProposalItem extends AcceptedProposal {
  orgSlug: string;
  techStack?: string[];
}

export function ArchivePanel() {
  const {
    filteredCatalog,
    librarySearch,
    selectedProgramTag,
    selectedProposalPreview,
    setLibrarySearch,
    setSelectedProgramTag,
    setSelectedProposalPreview,
    cloneProposalToWorkspace,
    setIsFeedbackModalOpen,
  } = useProposalStudioContext();

  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('ALL');

  // Flatten all proposals from groups while attaching group metadata
  const allProposals = useMemo<FlatProposalItem[]>(() => {
    const list: FlatProposalItem[] = [];
    filteredCatalog.forEach((group: OrgProposalGroup) => {
      group.proposals.forEach((p: AcceptedProposal) => {
        list.push({
          ...p,
          orgSlug: group.orgSlug,
          techStack: group.techStack,
        });
      });
    });
    return list;
  }, [filteredCatalog]);

  // Unique orgs list for filtering
  const availableOrgs = useMemo(() => {
    const set = new Set<string>();
    allProposals.forEach((p) => {
      if (p.orgName) set.add(p.orgName);
    });
    return ['ALL', ...Array.from(set)];
  }, [allProposals]);

  const displayedProposals = useMemo(() => {
    return allProposals.filter((p) => {
      if (selectedOrgFilter === 'ALL') return true;
      return p.orgName.toLowerCase() === selectedOrgFilter.toLowerCase();
    });
  }, [allProposals, selectedOrgFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      {/* 1. Header Banner */}
      <header className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-7 sm:p-10 shadow-md">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-accent" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent">
              <FolderArchive size={13} />
              Contributor Archive
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
              Accepted Proposals Archive
            </h1>
            <p className="text-sm sm:text-base text-secondary leading-relaxed">
              Explore real accepted proposals from previous years across Google Summer of Code (GSoC), LFX Mentorship, and Outreachy. Reference their problem formulation, timeline structures, and acceptance rationale.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-hairline bg-page px-4 text-xs font-mono font-bold text-primary hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <MessageSquarePlus size={14} className="text-accent" />
            <span>Suggest a Proposal</span>
          </button>
        </div>
      </header>

      {/* 2. Educational Best Practice Notice */}
      <div className="flex items-start gap-3.5 rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:p-5">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-accent" />
        <div className="space-y-1 text-xs sm:text-sm text-secondary">
          <p className="font-bold text-primary">
            How to use the archive effectively:
          </p>
          <p>
            Mentors evaluate proposals on original technical depth and repository-specific architecture. Use these accepted examples to understand tone, milestone breakdown, and test plans — never copy text verbatim.
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Program Badges */}
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter by program"
          >
            <span className="font-mono text-xs font-bold uppercase text-muted mr-1 flex items-center gap-1">
              <Filter size={12} /> Program:
            </span>
            {PROGRAM_FILTERS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedProgramTag(tag)}
                className={`rounded-xl border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  selectedProgramTag === tag
                    ? 'border-accent bg-accent text-white shadow-xs'
                    : 'border-hairline bg-surface text-secondary hover:text-primary hover:border-accent/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Search by org, tech, or topic..."
              className="h-10 w-full rounded-xl border border-hairline bg-surface pl-9 pr-3 text-xs sm:text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Organization Filter Bar */}
        {availableOrgs.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="font-mono text-xs font-bold uppercase text-muted mr-1">
              Organization:
            </span>
            {availableOrgs.map((org) => (
              <button
                key={org}
                type="button"
                onClick={() => setSelectedOrgFilter(org)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedOrgFilter === org
                    ? 'border-primary bg-primary text-page'
                    : 'border-hairline bg-page text-muted hover:text-primary'
                }`}
              >
                {org}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Proposal Cards Grid */}
      {displayedProposals.length === 0 ? (
        <div className="rounded-3xl border border-hairline bg-surface p-12 text-center space-y-3">
          <FolderArchive size={36} className="mx-auto text-muted/50" />
          <p className="font-mono text-sm font-bold text-primary">No accepted proposals match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setLibrarySearch('');
              setSelectedProgramTag('ALL');
              setSelectedOrgFilter('ALL');
            }}
            className="font-mono text-xs font-bold text-accent hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedProposals.map((proposal) => (
            <article
              key={proposal.id}
              className="flex flex-col justify-between rounded-3xl border border-hairline bg-surface p-6 shadow-sm hover:shadow-md hover:border-accent/35 transition-all group"
            >
              <div className="space-y-4">
                {/* Card Header Chips */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-accent/25 bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-accent">
                    {proposal.programTag || proposal.programName || 'GSoC'} · {proposal.year || '2025'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 font-mono text-[10px] font-bold text-success uppercase">
                    <BookmarkCheck size={11} /> Accepted
                  </span>
                </div>

                {/* Organization and Title */}
                <div>
                  <p className="font-mono text-xs font-bold text-secondary uppercase tracking-wider">
                    {proposal.orgName}
                  </p>
                  <h2 className="font-heading text-lg font-bold text-primary mt-1 group-hover:text-accent transition-colors line-clamp-2">
                    {proposal.projectTitle}
                  </h2>
                </div>

                {/* Summary Abstract */}
                <p className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-3">
                  {proposal.summary}
                </p>

                {/* Tech Stack Pills */}
                {proposal.techStack && proposal.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proposal.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-hairline bg-page px-2 py-0.5 font-mono text-[10px] font-medium text-muted"
                      >
                        {tech}
                      </span>
                    ))}
                    {proposal.techStack.length > 4 && (
                      <span className="font-mono text-[10px] text-muted self-center">
                        +{proposal.techStack.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-5 mt-5 border-t border-hairline flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProposalPreview(proposal)}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:text-accent transition-colors cursor-pointer"
                >
                  <FileText size={14} className="text-accent" />
                  <span>Inspect Full Proposal</span>
                </button>

                <button
                  type="button"
                  onClick={() => cloneProposalToWorkspace(proposal)}
                  className="rounded-xl border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all cursor-pointer"
                  title="Clone section outline and structure into your active draft"
                >
                  Clone Structure
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 5. Full Proposal Modal Preview */}
      {selectedProposalPreview && (
        <ProposalPreviewModal
          proposal={selectedProposalPreview}
          onClose={() => setSelectedProposalPreview(null)}
          onClone={(prop) => {
            cloneProposalToWorkspace(prop);
            setSelectedProposalPreview(null);
          }}
        />
      )}
    </div>
  );
}
