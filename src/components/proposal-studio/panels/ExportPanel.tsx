'use client';

import React, { useState, useMemo } from 'react';
import {
  ClipboardCopy,
  Code,
  Download,
  Eye,
  FileCode,
  FileDown,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { BUILDER_SECTIONS } from '../constants';
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
  const [pdfFailed, setPdfFailed] = useState(false);
  const [viewMode, setViewMode] = useState<'sheet' | 'raw'>('sheet');

  if (!draft) return null;

  const score = scoreData.totalScore;

  const totalStats = useMemo(() => {
    let totalChars = 0;
    let totalCharsNoSpaces = 0;
    let totalWords = 0;
    BUILDER_SECTIONS.forEach((sec) => {
      const text = sectionsState[sec.id] || '';
      totalChars += text.length;
      totalCharsNoSpaces += text.replace(/\s/g, '').length;
      const trimmed = text.trim();
      if (trimmed) totalWords += trimmed.split(/\s+/).filter(Boolean).length;
    });
    const readingTime = Math.max(1, Math.ceil(totalWords / 200));
    return {
      totalChars,
      totalCharsNoSpaces,
      totalWords,
      readingTimeMinutes: readingTime,
      readingTimeLabel:
        totalWords === 0
          ? '0 min read'
          : totalWords < 100
            ? '< 1 min read'
            : `~${readingTime} min read`,
    };
  }, [sectionsState]);

  const handlePdfExport = async () => {
    try {
      setIsPdfGenerating(true);
      setPdfFailed(false);
      const success = await downloadPdfFile();
      if (!success) {
        setPdfFailed(true);
      }
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handlePrint = () => {
    // Ensure document view is active so clean proposal sheet prints
    if (viewMode !== 'sheet') {
      setViewMode('sheet');
      setTimeout(() => window.print(), 100);
    } else {
      window.print();
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
      {/* Fallback Notice Banner when Python Engine Fails */}
      {pdfFailed && (
        <div
          role="alert"
          className="print:hidden rounded-3xl border-2 border-warning/50 bg-warning/10 p-5 sm:p-6 text-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-base sm:text-lg flex items-center gap-2 text-warning">
              <span>⚠️</span> Python PDF Engine Unavailable
            </h4>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              The backend Python generator encountered an issue or is running in an offline/serverless environment.
              You can instantly use <strong>Print to PDF (Ctrl+P)</strong> or <strong>Download Markdown (.md)</strong> as a 100% reliable client-side export.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-accent-hover transition-all cursor-pointer shadow-xs"
            >
              <Printer size={14} />
              <span>Print to PDF</span>
            </button>
            <button
              type="button"
              onClick={downloadMarkdownFile}
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-4 py-2 font-mono text-xs font-bold text-primary hover:bg-surface-raised transition-all cursor-pointer shadow-xs"
            >
              <FileCode size={14} />
              <span>Download .md</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Header Banner */}
      <header className="print:hidden relative overflow-hidden rounded-3xl border border-hairline bg-surface p-7 sm:p-10 shadow-md">
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
              Generate publication-grade PDF documents powered by the <strong>Python ReportLab engine</strong>, use browser-native <strong>Print to PDF</strong>, or export structured Markdown and JSON packages ready for submission to GSoC, LFX, or Outreachy.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="rounded-2xl border border-hairline bg-page px-4 py-2.5 text-center">
              <p className="font-mono text-[10px] font-bold uppercase text-muted">Words</p>
              <p className="font-mono text-lg font-bold text-primary">{totalStats.totalWords}</p>
            </div>
            <div className="rounded-2xl border border-hairline bg-page px-4 py-2.5 text-center">
              <p className="font-mono text-[10px] font-bold uppercase text-muted">Reading Time</p>
              <p className="font-mono text-lg font-bold text-accent">{totalStats.readingTimeLabel}</p>
            </div>
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
      <section className="print:hidden grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* PDF Option (Featured / Python Engine) */}
        <div className="md:col-span-4 rounded-3xl border-2 border-accent/40 bg-gradient-to-r from-accent/10 via-surface to-surface p-6 sm:p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
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
                Python 3.13 ReportLab Engine
              </span>
              <span>·</span>
              <span>Letter Size / 300 DPI</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl border-2 border-accent/40 bg-surface px-6 font-mono text-sm font-bold uppercase tracking-wide text-primary hover:bg-surface-raised transition-all shadow-sm cursor-pointer"
              title="Native browser print (Ctrl+P / Cmd+P) formatted cleanly for PDF"
            >
              <Printer size={16} className="text-accent" />
              <span>Print to PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePdfExport}
              disabled={isPdfGenerating}
              className="inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl bg-accent px-8 font-mono text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60 transition-all shadow-md cursor-pointer"
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
        </div>

        {/* Print to PDF (Client Side) */}
        <button
          type="button"
          onClick={handlePrint}
          className="group flex flex-col items-start justify-between rounded-3xl border border-hairline bg-surface p-6 text-left shadow-sm hover:border-accent/40 hover:bg-surface-raised transition-all cursor-pointer"
        >
          <div className="space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
              <Printer size={18} />
            </span>
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Print to PDF (Ctrl+P)
              </h3>
              <p className="mt-1 text-xs text-secondary leading-relaxed">
                Native browser print with stripped headers, footers, clean page breaks, and high contrast.
              </p>
            </div>
          </div>
          <span className="mt-4 font-mono text-xs font-bold text-accent group-hover:underline">
            Print Document &rarr;
          </span>
        </button>

        {/* Markdown Download with YAML Frontmatter */}
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
                Packages proposal into a clean .md with standard YAML frontmatter (Title, Org, Date).
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
      <section className="proposal-print-container rounded-3xl border border-hairline bg-surface shadow-md overflow-hidden">
        {/* Preview Toolbar */}
        <div className="print:hidden flex items-center justify-between border-b border-hairline bg-page/80 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-accent" />
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
              Live Proposal Sheet Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3 py-1 font-mono text-xs font-bold text-secondary hover:text-primary transition-all cursor-pointer"
              title="Print to PDF"
            >
              <Printer size={13} className="text-accent" />
              <span>Print</span>
            </button>

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
        </div>

        {/* Preview Body */}
        {viewMode === 'sheet' ? (
          <div className="p-6 sm:p-12 space-y-8 bg-white dark:bg-[#1E1714] text-neutral-900 dark:text-neutral-100 min-h-[500px]">
            {/* Contribo Watermark Header for Print */}
            <div className="print-watermark-header items-center justify-between border-b-2 border-neutral-300 pb-3 mb-6 font-mono text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-black">Contribo Proposal Studio</span>
                <span>·</span>
                <span>Official Candidate Submission Draft</span>
              </div>
              <div className="text-right">
                <span>{draft.programName}</span> · <span>Target: {draft.orgName}</span>
              </div>
            </div>

            {/* Sheet Cover Block */}
            <div className="proposal-print-section border-b-2 border-hairline pb-6 space-y-3">
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
              {/* Proposal Length Metrics Pill */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-page px-2.5 py-1 font-mono text-xs text-secondary">
                  <strong>{totalStats.totalWords}</strong> words · <strong>{totalStats.totalChars}</strong> chars ({totalStats.totalCharsNoSpaces} no spaces)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent">
                  {totalStats.readingTimeLabel}
                </span>
              </div>
            </div>

            {/* Section Blocks */}
            <div className="space-y-8">
              {BUILDER_SECTIONS.map((sec, idx) => {
                const content = sectionsState[sec.id] || '';
                return (
                  <div key={sec.id} className="proposal-print-section space-y-2 border-b border-hairline/60 pb-6">
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

            {/* Contribo Watermark Footer for Print */}
            <div className="print-watermark-footer items-center justify-between border-t border-neutral-300 pt-4 mt-8 font-mono text-[11px] text-neutral-500">
              <span>Drafted & Verified with Contribo Proposal Studio (https://contribo.dev)</span>
              <span>Exported on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
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
