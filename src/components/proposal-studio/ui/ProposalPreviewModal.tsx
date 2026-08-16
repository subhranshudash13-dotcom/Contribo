'use client';

import { ExternalLink, Plus, Sparkles, X } from 'lucide-react';
import type { AcceptedProposal } from '@/lib/proposal-studio/data';

interface ProposalPreviewModalProps {
  proposal: AcceptedProposal;
  onClose: () => void;
  onClone: (proposal: AcceptedProposal) => void;
}

export function ProposalPreviewModal({
  proposal,
  onClose,
  onClone,
}: ProposalPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proposal-preview-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl border border-hairline bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-hairline bg-surface/95 backdrop-blur-md px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                {proposal.programName}
              </span>
              <span className="font-mono text-xs text-muted">{proposal.year}</span>
            </div>
            <h3
              id="proposal-preview-title"
              className="font-heading text-2xl font-bold text-primary leading-tight"
            >
              {proposal.projectTitle}
            </h3>
            <p className="mt-1 text-xs font-mono text-muted">{proposal.orgName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-hairline bg-base p-2 text-muted hover:text-primary hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close preview"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm text-secondary leading-relaxed">{proposal.summary}</p>

          <div className="rounded-2xl border border-hairline bg-base p-4 space-y-3">
            <h4 className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-accent">
              <Sparkles size={13} /> Why mentors accepted this
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {proposal.rationale.map((r, i) => (
                <div
                  key={`${r.sectionName}-${i}`}
                  className="rounded-xl border border-hairline bg-surface p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-primary">
                      {r.sectionName}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-brass">
                      {r.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
              Structure reference
            </h4>
            <pre className="whitespace-pre-wrap rounded-2xl border border-hairline bg-base p-4 font-mono text-xs text-primary leading-relaxed">
              {proposal.contentSnippet}
            </pre>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-surface/95 backdrop-blur-md px-6 py-4">
          {proposal.sourceUrl ? (
            <a
              href={proposal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Original source <ExternalLink size={12} />
            </a>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-hairline bg-surface text-xs font-mono font-bold text-secondary hover:text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onClone(proposal)}
              className="inline-flex h-10 items-center gap-2 px-4 rounded-xl bg-accent text-white text-xs font-mono font-bold uppercase tracking-wide hover:bg-accent-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <Plus size={14} /> Clone structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
