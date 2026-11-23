'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileEdit,
  Minus,
  Plus,
} from 'lucide-react';
import type {
  DiffLine,
  InlineToken,
  SectionDiff,
} from '@/lib/proposal-studio/diff-types';

interface DiffViewerProps {
  sections: SectionDiff[];
  viewMode: 'split' | 'unified';
  showOnlyChanges: boolean;
  selectedSectionId?: string;
  oldVersionLabel: string;
  newVersionLabel: string;
}

function renderInlineTokens(tokens?: InlineToken[], defaultText?: string) {
  if (!tokens || tokens.length === 0) {
    return <span>{defaultText || ''}</span>;
  }

  return (
    <>
      {tokens.map((token, idx) => {
        if (token.type === 'delete') {
          return (
            <mark
              key={idx}
              className="bg-rose-500/35 text-rose-700 dark:text-rose-200 px-0.5 rounded font-semibold no-underline"
            >
              {token.text}
            </mark>
          );
        }
        if (token.type === 'insert') {
          return (
            <mark
              key={idx}
              className="bg-emerald-500/35 text-emerald-700 dark:text-emerald-200 px-0.5 rounded font-semibold no-underline"
            >
              {token.text}
            </mark>
          );
        }
        return <span key={idx}>{token.text}</span>;
      })}
    </>
  );
}

export function DiffViewer({
  sections,
  viewMode,
  showOnlyChanges,
  selectedSectionId,
  oldVersionLabel,
  newVersionLabel,
}: DiffViewerProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSections = sections.filter((s) => {
    if (selectedSectionId && selectedSectionId !== 'all') {
      return s.sectionId === selectedSectionId;
    }
    if (showOnlyChanges) {
      return s.hasChanges;
    }
    return true;
  });

  if (filteredSections.length === 0) {
    return (
      <div className="rounded-3xl border border-hairline bg-surface p-12 text-center space-y-3">
        <FileCode className="w-10 h-10 text-muted mx-auto" />
        <h3 className="font-heading text-lg font-bold text-primary">No Modifications Found</h3>
        <p className="text-sm font-mono text-muted max-w-md mx-auto">
          {showOnlyChanges
            ? 'All sections in this comparison are identical. Turn off "Changes Only" to view unchanged sections.'
            : 'No matching proposal sections found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredSections.map((section) => {
        const isCollapsed = collapsedSections[section.sectionId] ?? (!section.hasChanges && showOnlyChanges);
        const linesToRender = section.allLines;

        return (
          <div
            key={section.sectionId}
            id={`section-${section.sectionId}`}
            className="rounded-3xl border border-hairline bg-surface overflow-hidden shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Section Header */}
            <div
              onClick={() => toggleSection(section.sectionId)}
              className="flex items-center justify-between gap-4 px-6 py-4 border-b border-hairline bg-surface-raised/50 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="p-1 rounded-lg text-muted hover:text-primary transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <div>
                  <h3 className="text-base font-heading font-bold text-primary flex items-center gap-2">
                    {section.sectionTitle}
                  </h3>
                  <div className="text-xs font-mono text-muted flex items-center gap-2 mt-0.5">
                    <span>{section.oldWordCount} words ➔ {section.newWordCount} words</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {section.hasChanges ? (
                  <>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                        section.wordCountDelta > 0
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : section.wordCountDelta < 0
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-page text-muted border border-hairline'
                      }`}
                    >
                      {section.wordCountDelta >= 0
                        ? `+${section.wordCountDelta} words`
                        : `${section.wordCountDelta} words`}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      +{section.addedLinesCount}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-rose-600 dark:text-rose-400 font-bold">
                      -{section.deletedLinesCount}
                    </span>
                  </>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-xs text-muted border border-hairline bg-page">
                    identical
                  </span>
                )}
              </div>
            </div>

            {/* Section Content */}
            {!isCollapsed && (
              <div className="overflow-x-auto text-xs font-mono">
                {linesToRender.length === 0 ? (
                  <div className="p-8 text-center text-muted italic">
                    (Section is empty in both versions)
                  </div>
                ) : viewMode === 'unified' ? (
                  /* Unified View Table */
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-hairline bg-page text-muted text-[11px]">
                        <th className="w-12 px-2 py-1.5 text-right font-medium">Base</th>
                        <th className="w-12 px-2 py-1.5 text-right font-medium">New</th>
                        <th className="w-6 px-1 py-1.5 text-center font-medium">±</th>
                        <th className="px-4 py-1.5 text-left font-medium">Diff Content</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linesToRender.map((line, idx) => {
                        const isInsert = line.type === 'insert';
                        const isDelete = line.type === 'delete';

                        return (
                          <tr
                            key={idx}
                            className={`border-b border-hairline/40 transition-colors ${
                              isInsert
                                ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                                : isDelete
                                ? 'bg-rose-500/10 text-rose-800 dark:text-rose-200'
                                : 'hover:bg-surface-raised/40 text-secondary'
                            }`}
                          >
                            <td className="px-2 py-1 text-right text-muted/70 select-none border-r border-hairline/40">
                              {line.oldLineNumber || ''}
                            </td>
                            <td className="px-2 py-1 text-right text-muted/70 select-none border-r border-hairline/40">
                              {line.newLineNumber || ''}
                            </td>
                            <td className="px-1 py-1 text-center font-bold select-none border-r border-hairline/40">
                              {isInsert ? (
                                <Plus className="w-3.5 h-3.5 text-emerald-500 inline" />
                              ) : isDelete ? (
                                <Minus className="w-3.5 h-3.5 text-rose-500 inline" />
                              ) : (
                                ''
                              )}
                            </td>
                            <td className="px-4 py-1 whitespace-pre-wrap break-words leading-relaxed font-mono">
                              {renderInlineTokens(line.inlineTokens, line.text)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  /* Split View Table */
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hairline">
                    {/* Left: Version A (Baseline) */}
                    <div>
                      <div className="sticky top-0 z-10 px-4 py-2 bg-page border-b border-hairline text-[11px] font-mono font-semibold text-muted flex items-center justify-between">
                        <span>Baseline: {oldVersionLabel}</span>
                        <span>{section.oldWordCount} words</span>
                      </div>
                      <table className="w-full border-collapse">
                        <tbody>
                          {linesToRender
                            .filter((l) => l.type === 'equal' || l.type === 'delete')
                            .map((line, idx) => {
                              const isDelete = line.type === 'delete';
                              return (
                                <tr
                                  key={idx}
                                  className={`border-b border-hairline/30 ${
                                    isDelete
                                      ? 'bg-rose-500/10 text-rose-800 dark:text-rose-200'
                                      : 'text-secondary'
                                  }`}
                                >
                                  <td className="w-10 px-2 py-1 text-right text-muted/70 select-none border-r border-hairline/30 text-[11px]">
                                    {line.oldLineNumber}
                                  </td>
                                  <td className="px-3 py-1 whitespace-pre-wrap break-words leading-relaxed font-mono">
                                    {renderInlineTokens(line.inlineTokens, line.text)}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* Right: Version B (Comparison) */}
                    <div>
                      <div className="sticky top-0 z-10 px-4 py-2 bg-page border-b border-hairline text-[11px] font-mono font-semibold text-muted flex items-center justify-between">
                        <span>Comparison: {newVersionLabel}</span>
                        <span>{section.newWordCount} words</span>
                      </div>
                      <table className="w-full border-collapse">
                        <tbody>
                          {linesToRender
                            .filter((l) => l.type === 'equal' || l.type === 'insert')
                            .map((line, idx) => {
                              const isInsert = line.type === 'insert';
                              return (
                                <tr
                                  key={idx}
                                  className={`border-b border-hairline/30 ${
                                    isInsert
                                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                                      : 'text-secondary'
                                  }`}
                                >
                                  <td className="w-10 px-2 py-1 text-right text-muted/70 select-none border-r border-hairline/30 text-[11px]">
                                    {line.newLineNumber}
                                  </td>
                                  <td className="px-3 py-1 whitespace-pre-wrap break-words leading-relaxed font-mono">
                                    {renderInlineTokens(line.inlineTokens, line.text)}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
