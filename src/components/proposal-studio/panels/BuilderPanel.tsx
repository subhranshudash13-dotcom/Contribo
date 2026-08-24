'use client';

import React, { useState } from 'react';
import {
  Bold,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code,
  Copy,
  Italic,
  Lightbulb,
  List,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { BUILDER_SECTIONS } from '../constants';
import { ProgressMeter } from '../ui/ProgressMeter';
import { useProposalStudioContext } from '../context/ProposalStudioContext';

export function BuilderPanel() {
  const {
    activeSectionId,
    sectionsState,
    sectionStatus,
    calculatedProgress,
    aiLoading,
    setActiveSectionId,
    handleSectionChange,
    insertMarkdownFormatting,
    handleAiImprove,
    showToast,
    selectTab,
  } = useProposalStudioContext();

  const sectionIndex = BUILDER_SECTIONS.findIndex((s) => s.id === activeSectionId);
  const section = BUILDER_SECTIONS[sectionIndex] || BUILDER_SECTIONS[0];
  const textVal = sectionsState[section.id] || '';
  const status = sectionStatus.find((s) => s.id === section.id);
  const isFilled = !!status?.filled;

  const [showSnippet, setShowSnippet] = useState(false);

  const prevSection = sectionIndex > 0 ? BUILDER_SECTIONS[sectionIndex - 1] : null;
  const nextSection =
    sectionIndex < BUILDER_SECTIONS.length - 1
      ? BUILDER_SECTIONS[sectionIndex + 1]
      : null;

  const copyToClipboard = (text: string, msg = 'Copied to clipboard') => {
    void navigator.clipboard.writeText(text);
    showToast(msg);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      {/* 1. Section Navigator Stepper */}
      <section className="rounded-3xl border border-hairline bg-surface p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-muted">
              Structured Proposal Navigator
            </p>
            <p className="text-xs text-secondary font-mono mt-0.5">
              {sectionStatus.filter((s) => s.filled).length} of {BUILDER_SECTIONS.length} sections meet target depth criteria
            </p>
          </div>
          <div className="w-full sm:w-48">
            <ProgressMeter value={calculatedProgress} size="md" showValue={true} />
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {BUILDER_SECTIONS.map((s, idx) => {
            const filled = sectionStatus.find((st) => st.id === s.id)?.filled;
            const active = s.id === section.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSectionId(s.id)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 font-mono text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'border-accent bg-accent text-white shadow-md scale-[1.02]'
                    : filled
                      ? 'border-success/40 bg-success/10 text-success hover:bg-success/20'
                      : 'border-hairline bg-page text-secondary hover:text-primary hover:bg-surface-raised'
                }`}
              >
                <span>{filled && !active ? <Check size={14} className="inline inline-block" /> : `${idx + 1}.`}</span>
                <span>{s.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Section Title & Maintainer Tip Banner */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-5">
          <div className="space-y-1">
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-accent">
              Section {sectionIndex + 1} of {BUILDER_SECTIONS.length}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
              {section.title}
            </h1>
          </div>
          {isFilled ? (
            <span className="inline-flex items-center gap-2 self-start md:self-center rounded-full border border-success/30 bg-success/10 px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase text-success shadow-xs">
              <Check size={15} /> Section Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 self-start md:self-center rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase text-warning shadow-xs">
              Needs Detail (~{section.minChars}+ chars)
            </span>
          )}
        </div>

        {/* Maintainer Tip Inline Banner */}
        <div className="flex items-start gap-4 rounded-3xl border border-accent/25 bg-gradient-to-r from-accent/10 via-surface to-surface p-5 sm:p-7 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-0.5">
            <Lightbulb size={20} />
          </div>
          <div className="text-sm sm:text-base text-secondary leading-relaxed">
            <span className="font-bold text-primary font-mono uppercase tracking-wide">Maintainer Tip: </span>
            {section.tips}
          </div>
        </div>
      </section>

      {/* 3. Main Expansive Writing Canvas */}
      <section className="rounded-3xl border border-hairline bg-surface shadow-md overflow-hidden space-y-0">
        {/* Editor Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-page/80 px-5 py-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'bold' as const, icon: Bold, label: 'Bold' },
                { id: 'italic' as const, icon: Italic, label: 'Italic' },
                { id: 'code' as const, icon: Code, label: 'Code Block' },
                { id: 'list' as const, icon: List, label: 'List' },
              ] as const
            ).map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  title={tool.label}
                  aria-label={tool.label}
                  onClick={() => insertMarkdownFormatting(section.id, tool.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-surface text-secondary hover:bg-surface-raised hover:text-primary transition-all cursor-pointer shadow-xs"
                >
                  <Icon size={15} />
                </button>
              );
            })}

            <div className="mx-2 h-5 w-px bg-hairline" />

            <button
              type="button"
              onClick={() => {
                const updated = textVal
                  ? `${textVal}\n\n${section.acceptedSnippet}`
                  : section.acceptedSnippet;
                handleSectionChange(section.id, updated);
              }}
              className="h-9 rounded-xl px-3 font-mono text-xs sm:text-sm font-bold text-accent border border-accent/25 bg-accent/10 hover:bg-accent/20 transition-all cursor-pointer"
            >
              + Append Reference Snippet
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleAiImprove(section.id)}
            disabled={aiLoading === section.id}
            className="inline-flex h-9 sm:h-10 items-center gap-2 rounded-xl bg-accent px-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-hover disabled:opacity-60 transition-all cursor-pointer shadow-sm"
          >
            {aiLoading === section.id ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>AI Improve Section</span>
          </button>
        </div>

        {/* Textarea Canvas */}
        <textarea
          id={`section-${section.id}`}
          rows={16}
          value={textVal}
          onChange={(e) => handleSectionChange(section.id, e.target.value)}
          placeholder={section.placeholder}
          className="w-full min-h-[440px] resize-y bg-surface p-6 sm:p-8 text-base sm:text-lg text-primary leading-relaxed placeholder:text-muted/40 focus:outline-none"
        />

        {/* Textarea Footer Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-page/80 px-6 py-3.5">
          <div className="flex items-center gap-3 font-mono text-xs sm:text-sm text-muted tabular-nums">
            <span className="font-semibold text-primary">
              {status?.chars ?? textVal.length} chars
            </span>
            <span>·</span>
            <span className="font-semibold text-primary">
              {status?.words ??
                textVal.split(/\s+/).filter(Boolean).length}{' '}
              words
            </span>
            {!isFilled && (
              <span className="text-warning font-semibold">
                (target: ~{section.minChars}+ chars)
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-muted font-medium">
            Autosaving changes
          </span>
        </div>
      </section>

      {/* 4. Collapsible Inline Accepted Reference Snippet */}
      <section className="rounded-3xl border border-hairline bg-surface overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowSnippet(!showSnippet)}
          className="w-full flex items-center justify-between px-6 py-4 text-left font-mono text-xs sm:text-sm font-bold text-secondary hover:text-primary hover:bg-surface-raised transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-brass" />
            <span>Accepted Reference Snippet ({section.shortLabel})</span>
          </span>
          {showSnippet ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showSnippet && (
          <div className="border-t border-hairline bg-page p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-muted">
                Official Benchmark Example
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(section.acceptedSnippet, 'Snippet copied')}
                className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-accent hover:underline cursor-pointer"
              >
                <Copy size={13} /> Copy Snippet
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-primary leading-relaxed p-4 rounded-2xl border border-hairline bg-surface">
              {section.acceptedSnippet}
            </pre>
          </div>
        )}
      </section>

      {/* 5. Clear Primary Navigation Action Footer */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-hairline">
        {prevSection ? (
          <button
            type="button"
            onClick={() => setActiveSectionId(prevSection.id)}
            className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-hairline bg-surface px-6 font-mono text-xs sm:text-sm font-bold text-secondary hover:text-primary hover:bg-surface-raised transition-all cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span>Previous: {prevSection.shortLabel}</span>
          </button>
        ) : (
          <div />
        )}

        {nextSection ? (
          <button
            type="button"
            onClick={() => setActiveSectionId(nextSection.id)}
            className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-accent px-8 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-hover transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>Next: {nextSection.shortLabel}</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => selectTab('export')}
            className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-success px-8 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-success/90 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>All sections completed — Proceed to Export</span>
            <ChevronRight size={18} />
          </button>
        )}
      </section>
    </div>
  );
}
