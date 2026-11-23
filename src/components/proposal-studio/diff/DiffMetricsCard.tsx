'use client';

import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileDiff,
  FileText,
  MinusCircle,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { ProposalDiffResult } from '@/lib/proposal-studio/diff-types';

interface DiffMetricsCardProps {
  diff: ProposalDiffResult;
  selectedSectionId?: string;
  onSelectSection?: (sectionId: string) => void;
}

export function DiffMetricsCard({
  diff,
  selectedSectionId,
  onSelectSection,
}: DiffMetricsCardProps) {
  const isWordGain = diff.totalWordDelta >= 0;
  const isProgressGain = diff.progressDelta >= 0;

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-sm space-y-6">
      {/* Top Banner: Versions Comparison Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
            <FileDiff className="w-3 h-3" />
            Inspection Dashboard
          </span>
          <h2 className="mt-2 text-xl font-heading font-bold text-primary flex items-center gap-2 flex-wrap">
            <span className="text-secondary">{diff.oldVersionLabel}</span>
            <ArrowRight className="w-4 h-4 text-muted shrink-0" />
            <span>{diff.newVersionLabel}</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted">
          <span>{diff.changedSectionCount} of {diff.sections.length} sections modified</span>
        </div>
      </div>

      {/* Grid of Key Deltas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Word Delta */}
        <div className="rounded-2xl border border-hairline bg-page/50 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Word Count Delta
            </span>
            {isWordGain ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                diff.totalWordDelta > 0
                  ? 'text-emerald-500'
                  : diff.totalWordDelta < 0
                  ? 'text-rose-500'
                  : 'text-primary'
              }`}
            >
              {diff.totalWordDelta >= 0 ? `+${diff.totalWordDelta}` : diff.totalWordDelta}
            </span>
            <span className="text-xs font-mono text-muted">words</span>
          </div>
          <div className="text-[11px] font-mono text-muted">
            {diff.totalOldWords} ➔ {diff.totalNewWords}
          </div>
        </div>

        {/* Readiness Delta */}
        <div className="rounded-2xl border border-hairline bg-page/50 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Readiness Score
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                isProgressGain ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {diff.progressDelta >= 0 ? `+${diff.progressDelta}%` : `${diff.progressDelta}%`}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-primary">
              {diff.newProgress}%
            </span>
            <span className="text-xs font-mono text-muted">from {diff.oldProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-hairline/60">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, diff.newProgress))}%` }}
            />
          </div>
        </div>

        {/* Line Additions & Deletions */}
        <div className="rounded-2xl border border-hairline bg-page/50 p-4 space-y-1">
          <span className="text-xs font-medium text-muted flex items-center gap-1.5">
            <FileDiff className="w-3.5 h-3.5" />
            Line Edits
          </span>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1 text-emerald-500 font-mono font-bold text-lg">
              <PlusCircle className="w-4 h-4" />
              +{diff.totalAddedLines}
            </div>
            <div className="flex items-center gap-1 text-rose-500 font-mono font-bold text-lg">
              <MinusCircle className="w-4 h-4" />
              -{diff.totalDeletedLines}
            </div>
          </div>
          <div className="text-[11px] font-mono text-muted">Total granular changes</div>
        </div>

        {/* Reading Time */}
        <div className="rounded-2xl border border-hairline bg-page/50 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Reading Time
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-primary">
              ~{diff.newReadingTimeMin}m
            </span>
            <span className="text-xs font-mono text-muted">
              ({diff.readingTimeDeltaMin >= 0 ? `+${diff.readingTimeDeltaMin}` : diff.readingTimeDeltaMin}m)
            </span>
          </div>
          <div className="text-[11px] font-mono text-muted">
            at ~200 wpm baseline
          </div>
        </div>
      </div>

      {/* Interactive Section Filter Pills */}
      <div>
        <div className="text-xs font-mono text-muted uppercase tracking-wider mb-2.5">
          Section Breakdown:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelectSection?.('all')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer border ${
              selectedSectionId === 'all' || !selectedSectionId
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-page text-secondary border-hairline hover:bg-surface-raised hover:text-primary'
            }`}
          >
            All Sections ({diff.sections.length})
          </button>
          {diff.sections.map((section) => {
            const isSelected = selectedSectionId === section.sectionId;
            return (
              <button
                key={section.sectionId}
                type="button"
                onClick={() => onSelectSection?.(section.sectionId)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-page text-secondary border-hairline hover:bg-surface-raised hover:text-primary'
                }`}
              >
                <span>{section.sectionTitle}</span>
                {section.hasChanges ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : section.wordCountDelta > 0
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : section.wordCountDelta < 0
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-hairline text-muted'
                    }`}
                  >
                    {section.wordCountDelta >= 0
                      ? `+${section.wordCountDelta}w`
                      : `${section.wordCountDelta}w`}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'text-muted'
                    }`}
                  >
                    unchanged
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
