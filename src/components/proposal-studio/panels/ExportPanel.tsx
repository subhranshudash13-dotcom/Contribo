'use client';

import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ClipboardCopy,
  Code,
  Download,
  Eye,
  FileCode,
  FileDown,
  FileText,
  Layers,
  Printer,
  RefreshCw,
  Share2,
  Sparkles,
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
    downloadPdfFile,
    copyProposalToClipboard,
    showToast,
  } = useProposalStudioContext();

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'sheet' | 'raw'>('sheet');

  if (!draft) return null;

  const score = scoreData.totalScore;

  const handlePdfExport = async () => {
    try {
      setIsPdfGenerating(true);
      await downloadPdfFile();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleJsonDownload = () => {
    const data = {
      projectTitle: draft.projectTitle,
      orgName: draft.orgName,
      programName: draft.programName,
      year: new Date().getFullYear(),
      exportedAt: new Date().toISOString(),
      sections: sectionsState,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal_${draft.projectSlug || 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON backup downloaded');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      {/* 1. Header Banner */}
      <header className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-7 sm:p-10 shadow-md">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-accent" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-accent">
              <Printer size={13} />
              Export & Publication Center
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
              Export Proposal
            </h1>
            <p className="text-sm sm:text-base text-secondary leading-relaxed">
              Generate publication-grade PDF documents powered by the <strong>Python ReportLab engine</strong>, or export structured Markdown and JSON packages ready for submission to GSoC, LFX, or Outreachy.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-hairline bg-page px-4 py-2.5 text-center">
              <p className="font-mono text-[10px] font-bold uppercase text-muted">Completion</p>
              <p className="font-mono text-lg font-bold text-accent">{progress}%</p>
            </div>
            <div className="rounded-2xl border border-hairline bg-page px-4 py-2.5 text-center">
              <p className="font-mono text-[10px] font-bold uppercase text-muted">Readiness</p>
              <p className="font-mono text-lg font-bold text-success">{score}/100</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Primary Export Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* PDF Option (Featured / Python Engine) */}
        <div className="md:col-span-3 rounded-3xl border-2 border-accent/40 bg-gradient-to-r from-accent/10 via-surface to-surface p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
                <FileDown size={18} />
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                Download Official PDF Document
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Formatted with two-pass header/footer pagination, metadata grid chips, milestone breakdown tables, and structured typography rendered via Python ReportLab.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-muted">
              <span className="inline-flex items-center gap-1 text-accent font-semibold">
                <Sparkles size={12} /> Python 3.13 ReportLab Engine
              </span>
              <span>·</span>
              <span>Letter Size / 300 DPI</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePdfExport}
            disabled={isPdfGenerating}
            className="inline-flex h-13 shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-accent px-8 font-mono text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60 transition-all shadow-md cursor-pointer"
          >
            {isPdfGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Markdown Download */}
        <button
          type="button"
          onClick={downloadMarkdownFile}
          className="group flex flex-col items-start justify-between rounded-3xl border border-hairline bg-surface p-6 text-left shadow-sm hover:border-accent/40 hover:bg-surface-raised transition-all cursor-pointer"
        >
          <div className="space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
              <FileCode size={18} />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Download Markdown (.md)
              </h3>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Standard GitHub-flavored Markdown file for pasting into issues, PRs, or docs.
              </p>
            </div>
          </div>
          <span className="mt-4 font-mono text-xs font-bold text-accent group-hover:underline">
            Download .md &rarr;
          </span>
        </button>

        {/* Copy to Clipboard */}
        <button
          type="button"
          onClick={copyProposalToClipboard}
          className="group flex flex-col items-start justify-between rounded-3xl border border-hairline bg-surface p-6 text-left shadow-sm hover:border-accent/40 hover:bg-surface-raised transition-all cursor-pointer"
        >
          <div className="space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
              <ClipboardCopy size={18} />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Copy Markdown
              </h3>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Instant one-click copy of the entire proposal formatted with section headers.
              </p>
            </div>
          </div>
          <span className="mt-4 font-mono text-xs font-bold text-accent group-hover:underline">
            Copy to Clipboard &rarr;
          </span>
        </button>

        {/* JSON Backup */}
        <button
          type="button"
          onClick={handleJsonDownload}
          className="group flex flex-col items-start justify-between rounded-3xl border border-hairline bg-surface p-6 text-left shadow-sm hover:border-accent/40 hover:bg-surface-raised transition-all cursor-pointer"
        >
          <div className="space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
              <Code size={18} />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Export JSON Backup
              </h3>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Raw structured JSON payload for archiving or re-importing into Contribo.
              </p>
            </div>
          </div>
          <span className="mt-4 font-mono text-xs font-bold text-accent group-hover:underline">
            Download JSON &rarr;
          </span>
        </button>
      </section>

      {/* 3. Live Formatted Document Preview Canvas */}
      <section className="rounded-3xl border border-hairline bg-surface shadow-md overflow-hidden">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between border-b border-hairline bg-page/80 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-accent" />
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
              Live Proposal Sheet Preview
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-hairline bg-surface p-1">
            <button
              type="button"
              onClick={() => setViewMode('sheet')}
              className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'sheet'
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Document View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Raw Markdown
            </button>
          </div>
        </div>

        {/* Preview Body */}
        {viewMode === 'sheet' ? (
          <div className="p-6 sm:p-12 space-y-8 bg-white dark:bg-[#1E1714] text-neutral-900 dark:text-neutral-100 min-h-[500px]">
            {/* Sheet Cover Block */}
            <div className="border-b-2 border-hairline pb-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase text-muted">
                <span className="font-bold text-accent">{draft.programName}</span>
                <span>·</span>
                <span>Target Org: <strong>{draft.orgName}</strong></span>
                <span>·</span>
                <span>Year: {new Date().getFullYear()}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
                {draft.projectTitle}
              </h1>
            </div>

            {/* Section Blocks */}
            <div className="space-y-8">
              {BUILDER_SECTIONS.map((sec, idx) => {
                const content = sectionsState[sec.id] || '';
                return (
                  <div key={sec.id} className="space-y-2 border-b border-hairline/60 pb-6">
                    <h3 className="font-heading text-base sm:text-lg font-bold text-primary flex items-center gap-2">
                      <span className="font-mono text-xs text-accent font-bold">
                        {idx + 1}.
                      </span>
                      <span>{sec.title}</span>
                    </h3>
                    {content ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-secondary font-sans pl-4 border-l-2 border-accent/30">
                        {content}
                      </div>
                    ) : (
                      <p className="text-xs italic text-muted pl-4">
                        (Section not yet filled in Builder)
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <pre className="p-6 sm:p-8 font-mono text-xs sm:text-sm text-primary whitespace-pre-wrap leading-relaxed overflow-x-auto bg-page min-h-[400px]">
            {`# Proposal: ${draft.projectTitle} (${draft.programName})\n` +
              `**Organization**: ${draft.orgName}\n` +
              `**Deadline**: ${draft.deadline}\n\n` +
              BUILDER_SECTIONS.map(
                (s) => `## ${s.title}\n\n${sectionsState[s.id] || '_(empty)_'}\n`
              ).join('\n---\n\n')}
          </pre>
        )}
      </section>
    </div>
  );
}
