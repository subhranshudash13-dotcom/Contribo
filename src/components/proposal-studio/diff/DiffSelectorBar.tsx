'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowLeftRight,
  Columns2,
  Download,
  ListFilter,
  Rows,
  Share2,
} from 'lucide-react';

export interface RevisionOption {
  id: string;
  label: string;
  timestamp?: string;
  wordCount?: number;
  progress?: number;
}

interface DiffSelectorBarProps {
  revisions: RevisionOption[];
  versionAId: string;
  versionBId: string;
  onSelectVersionA: (id: string) => void;
  onSelectVersionB: (id: string) => void;
  onSwapVersions: () => void;
  viewMode: 'split' | 'unified';
  onChangeViewMode: (mode: 'split' | 'unified') => void;
  showOnlyChanges: boolean;
  onToggleShowOnlyChanges: () => void;
  onOpenChangelogModal: () => void;
  proposalTitle?: string;
}

export function DiffSelectorBar({
  revisions,
  versionAId,
  versionBId,
  onSelectVersionA,
  onSelectVersionB,
  onSwapVersions,
  viewMode,
  onChangeViewMode,
  showOnlyChanges,
  onToggleShowOnlyChanges,
  onOpenChangelogModal,
  proposalTitle,
}: DiffSelectorBarProps) {
  return (
    <div className="sticky top-16 z-20 rounded-3xl border border-hairline bg-surface/95 backdrop-blur-md p-4 shadow-md space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/proposal-studio"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline bg-page text-xs font-mono text-secondary hover:text-primary hover:bg-surface-raised transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Studio</span>
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-heading font-bold text-primary truncate max-w-[280px] sm:max-w-md">
              {proposalTitle || 'Proposal Markdown Diff Inspector'}
            </h1>
            <p className="text-[11px] font-mono text-muted">
              Live side-by-side & unified version comparison
            </p>
          </div>
        </div>

        {/* Center: Version Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Baseline Version A */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-medium text-muted uppercase">Base:</span>
            <select
              value={versionAId}
              onChange={(e) => onSelectVersionA(e.target.value)}
              className="rounded-xl border border-hairline bg-page px-3 py-1.5 font-mono text-xs text-primary focus:border-accent focus:outline-none transition-colors cursor-pointer"
            >
              {revisions.map((rev) => (
                <option key={`a-${rev.id}`} value={rev.id}>
                  {rev.label} {rev.wordCount ? `(${rev.wordCount}w)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={onSwapVersions}
            title="Swap Baseline and Comparison"
            className="p-1.5 rounded-xl border border-hairline bg-page text-muted hover:text-primary hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Comparison Version B */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-medium text-muted uppercase">Target:</span>
            <select
              value={versionBId}
              onChange={(e) => onSelectVersionB(e.target.value)}
              className="rounded-xl border border-hairline bg-page px-3 py-1.5 font-mono text-xs text-primary focus:border-accent focus:outline-none transition-colors cursor-pointer"
            >
              {revisions.map((rev) => (
                <option key={`b-${rev.id}`} value={rev.id}>
                  {rev.label} {rev.wordCount ? `(${rev.wordCount}w)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl border border-hairline bg-page p-0.5">
            <button
              type="button"
              onClick={() => onChangeViewMode('split')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-accent text-white font-semibold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('unified')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                viewMode === 'unified'
                  ? 'bg-accent text-white font-semibold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Unified</span>
            </button>
          </div>

          {/* Filter changes only */}
          <button
            type="button"
            onClick={onToggleShowOnlyChanges}
            title={showOnlyChanges ? 'Show all lines' : 'Show only changed sections and chunks'}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
              showOnlyChanges
                ? 'border-accent bg-accent/10 text-accent font-semibold'
                : 'border-hairline bg-page text-secondary hover:text-primary'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Changes Only</span>
          </button>

          {/* Export Changelog Modal Trigger */}
          <button
            type="button"
            onClick={onOpenChangelogModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-mono font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Changelog</span>
          </button>
        </div>
      </div>
    </div>
  );
}
