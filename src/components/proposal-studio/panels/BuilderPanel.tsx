'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Wand2,
} from 'lucide-react';
import { BUILDER_SECTIONS, calculateSectionThreshold } from '../constants';
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
  const contextTextVal = sectionsState[section.id] || '';

  // Local state for responsive typing without triggering expensive parent re-renders on every keystroke
  const [localText, setLocalText] = useState(contextTextVal);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSectionIdRef = useRef(section.id);
  const localTextRef = useRef(localText);

  useEffect(() => {
    localTextRef.current = localText;
  }, [localText]);

  // Flush pending changes before unmounting or navigating
  const flushChanges = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      handleSectionChange(currentSectionIdRef.current, localTextRef.current);
    }
  }, [handleSectionChange]);

  // Synchronize when active section or external text changes (e.g. AI improve, snippet insertion, reset)
  useEffect(() => {
    if (currentSectionIdRef.current !== section.id) {
      flushChanges();
      currentSectionIdRef.current = section.id;
      setLocalText(contextTextVal);
    } else if (contextTextVal !== localTextRef.current) {
      setLocalText(contextTextVal);
    }
  }, [section.id, contextTextVal, flushChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        handleSectionChange(currentSectionIdRef.current, localTextRef.current);
      }
    };
  }, [handleSectionChange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalText(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      handleSectionChange(section.id, val);
    }, 250);
  };

  const handleNavigateSection = (targetId: string) => {
    flushChanges();
    setActiveSectionId(targetId);
  };

  const metrics = useMemo(() => {
    return calculateSectionThreshold(localText, section.minChars);
  }, [localText, section.minChars]);

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
                onClick={() => handleNavigateSection(s.id)}
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
          {metrics.isThresholdMet ? (
            <span className="inline-flex items-center gap-2 self-start md:self-center rounded-full border border-success/30 bg-success/10 px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase text-success shadow-xs transition-colors duration-200">
              <Check size={15} /> Section Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 self-start md:self-center rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 font-mono text-xs sm:text-sm font-bold uppercase text-warning shadow-xs transition-colors duration-200">
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
                  onClick={() => {
                    flushChanges();
                    insertMarkdownFormatting(section.id, tool.id);
                  }}
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
                const updated = localText
                  ? `${localText}\n\n${section.acceptedSnippet}`
                  : section.acceptedSnippet;
                setLocalText(updated);
                if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                handleSectionChange(section.id, updated);
              }}
              className="h-9 rounded-xl px-3 font-mono text-xs sm:text-sm font-bold text-accent border border-accent/25 bg-accent/10 hover:bg-accent/20 transition-all cursor-pointer"
            >
              + Append Reference Snippet
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Live Word & Character Counter Status Pill */}
            <div
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3 py-1.5 font-mono text-xs text-secondary shadow-xs tabular-nums"
              title="Real-time section word count, character count (with/without spaces), and reading time"
            >
              <span className="font-bold text-primary">
                {metrics.wordCount} {metrics.wordCount === 1 ? 'word' : 'words'}
              </span>
              <span className="text-muted/40 select-none">·</span>
              <span title={`${metrics.charCount} with spaces, ${metrics.charCountNoSpaces} without spaces`}>
                <span className="font-semibold text-primary">{metrics.charCount}</span> chars{' '}
                <span className="hidden sm:inline text-muted">({metrics.charCountNoSpaces} no spaces)</span>
              </span>
              <span className="text-muted/40 select-none">·</span>
              <span className="text-accent font-semibold">{metrics.readingTimeLabel}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                flushChanges();
                void handleAiImprove(section.id);
              }}
              disabled={aiLoading === section.id}
              className="inline-flex h-9 sm:h-10 items-center gap-2 rounded-xl bg-accent px-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-hover disabled:opacity-60 transition-all cursor-pointer shadow-sm"
            >
              {aiLoading === section.id ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
              <span>AI Improve Section</span>
            </button>
          </div>
        </div>

        {/* Textarea Canvas */}
        <textarea
          id={`section-${section.id}`}
          rows={16}
          value={localText}
          onChange={handleTextChange}
          onBlur={flushChanges}
          placeholder={section.placeholder}
          className="w-full min-h-[440px] resize-y bg-surface p-6 sm:p-8 text-base sm:text-lg text-primary leading-relaxed placeholder:text-muted/40 focus:outline-none"
        />

        {/* Textarea Footer Metrics with Live Word/Char Counter & Threshold Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-hairline bg-page/80 px-6 py-3.5 min-h-[52px]">
          {/* Live Word & Character Counters */}
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-muted tabular-nums flex-wrap">
            <span className="font-semibold text-primary">
              {metrics.charCount} {metrics.charCount === 1 ? 'char' : 'chars'}
            </span>
            <span className="text-muted text-xs">({metrics.charCountNoSpaces} no spaces)</span>
            <span className="text-hairline select-none">·</span>
            <span className="font-semibold text-primary">
              {metrics.wordCount} {metrics.wordCount === 1 ? 'word' : 'words'}
            </span>
            <span className="text-hairline select-none">·</span>
            <span className="text-accent font-semibold">{metrics.readingTimeLabel}</span>
          </div>

          {/* Visual Progress & Threshold Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Horizontal Mini Progress Track */}
            <div
              className="hidden md:flex items-center gap-2"
              role="progressbar"
              aria-valuenow={metrics.charCount}
              aria-valuemin={0}
              aria-valuemax={metrics.minChars}
              aria-label={`Character threshold progress for ${section.title}`}
            >
              <div className="w-24 lg:w-28 h-1.5 rounded-full bg-surface-raised border border-hairline overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    metrics.isThresholdMet ? 'bg-success' : 'bg-warning'
                  }`}
                  style={{ width: `${metrics.percentage}%` }}
                />
              </div>
              <span className="font-mono text-[11px] font-bold text-muted tabular-nums">
                {metrics.percentage}%
              </span>
            </div>

            {/* Threshold Status Chip */}
            {metrics.isThresholdMet ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-success/35 bg-success/10 px-3 py-1 font-mono text-xs font-bold text-success transition-all duration-300 shadow-xs"
                title={`Threshold met (${metrics.charCount} of ${metrics.minChars} characters)`}
              >
                <Check size={13} className="shrink-0 stroke-[2.5]" />
                <span>Threshold met ({metrics.charCount}/{metrics.minChars})</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-warning/35 bg-warning/10 px-3 py-1 font-mono text-xs font-bold text-warning transition-all duration-300 shadow-xs"
                title={`Minimum recommended length: ${metrics.minChars} characters`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse shrink-0" />
                <span className="tabular-nums">
                  {metrics.charCount} / {metrics.minChars} characters minimum
                </span>
              </span>
            )}

            {/* Autosave Indicator */}
            <span className="hidden sm:inline font-mono text-xs text-muted font-medium pl-1 border-l border-hairline">
              Autosaving changes
            </span>
          </div>
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
            <Lightbulb size={16} className="text-brass" />
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
            onClick={() => handleNavigateSection(prevSection.id)}
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
            onClick={() => handleNavigateSection(nextSection.id)}
            className="inline-flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-accent px-8 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-hover transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>Next: {nextSection.shortLabel}</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              flushChanges();
              selectTab('export');
            }}
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
