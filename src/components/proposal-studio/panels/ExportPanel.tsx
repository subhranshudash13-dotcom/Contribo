'use client';

import {
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileText,
  Share2,
} from 'lucide-react';
import { BUILDER_SECTIONS } from '../constants';
import { ProgressMeter } from '../ui/ProgressMeter';
import { useProposalStudioContext } from '../context/ProposalStudioContext';

export function ExportPanel() {
  const {
    activeDraft: draft,
    sectionsState,
    calculatedProgress: progress,
    scoreData,
    downloadMarkdownFile,
    copyProposalToClipboard,
  } = useProposalStudioContext();

  if (!draft) return null;

  const score = scoreData.totalScore;
  const preview = BUILDER_SECTIONS.map(
    (s) => `## ${s.title}\n\n${sectionsState[s.id] || '_(empty)_'}`
  ).join('\n\n');

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <header className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-7 sm:p-10 shadow-md">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-accent" />
          <span className="inline-flex rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent">
            Export Proposal
          </span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
            Ship Your Application
          </h2>
          <p className="mt-2 max-w-xl text-sm text-secondary leading-relaxed">
            Export a clean Markdown package for {draft.projectTitle} (
            {draft.programName}). Paste into Google Docs, PDF converters, or the
            official application portal.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-hairline bg-page p-4">
              <ProgressMeter value={progress} label="Section completion" />
            </div>
            <div className="rounded-2xl border border-hairline bg-page p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                  Readiness score
                </p>
                <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-primary">
                  {score}
                  <span className="text-sm text-muted font-mono"> / 100</span>
                </p>
              </div>
              {score >= 70 ? (
                <CheckCircle2 size={22} className="text-success" />
              ) : (
                <FileText size={22} className="text-muted" />
              )}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={downloadMarkdownFile}
            className="group flex flex-col items-start gap-3 rounded-3xl border border-hairline bg-surface p-6 text-left shadow-sm hover:border-accent/40 hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
              <Download size={18} />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Download Markdown
              </h3>
              <p className="mt-1 text-sm text-secondary leading-relaxed">
                Save <code className="font-mono text-xs">.md</code> file named
                after your project slug.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={copyProposalToClipboard}
            className="group flex flex-col items-start gap-3 rounded-3xl border border-hairline bg-surface p-6 text-left shadow-sm hover:border-accent/40 hover:bg-surface-raised transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
              <ClipboardCopy size={18} />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Copy to clipboard
              </h3>
              <p className="mt-1 text-sm text-secondary leading-relaxed">
                Full proposal as Markdown sections — ready to paste.
              </p>
            </div>
          </button>
        </section>

        <section className="rounded-3xl border border-hairline bg-surface p-5 sm:p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Share2 size={15} className="text-accent" />
              <h3 className="font-heading text-base font-bold text-primary">
                Live preview
              </h3>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
              Markdown
            </span>
          </div>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-hairline bg-page p-4 font-mono text-xs text-primary leading-relaxed">
            {`# Proposal: ${draft.projectTitle}\n**Org**: ${draft.orgName}\n**Program**: ${draft.programName}\n\n${preview}`}
          </pre>
        </section>
    </div>
  );
}
