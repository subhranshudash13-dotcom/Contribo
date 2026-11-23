import {
  calculateProposalProgress,
  PROPOSAL_SECTION_IDS,
  ProposalSectionId,
} from './sections';
import type {
  DiffChunk,
  DiffLine,
  DiffOperation,
  InlineToken,
  ProposalDiffResult,
  SectionDiff,
} from './diff-types';

export const SECTION_TITLES: Record<string, string> = {
  summary: 'Executive Summary',
  problemStatement: 'Problem Statement',
  architecture: 'Technical Architecture',
  deliverables: 'Deliverables & Milestones',
  timeline: 'Project Timeline',
  testing: 'Testing & QA Strategy',
  risks: 'Risk Mitigation',
  aboutMe: 'Contributor Background',
};

/**
 * Counts words in a string, filtering out pure whitespace and markdown markup tokens.
 */
export function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  const cleaned = text
    .replace(/[#*`_~>[\]()]/g, ' ')
    .trim();
  if (!cleaned) return 0;
  const matches = cleaned.match(/\S+/g);
  return matches ? matches.length : 0;
}

/**
 * Calculates reading time in minutes based on 200 words per minute.
 */
export function estimateReadingTime(words: number): number {
  if (words <= 0) return 0;
  return Number((words / 200).toFixed(1));
}

/**
 * Core Myers Diff Algorithm implementation.
 * Computes the Shortest Edit Script (SES) between sequences of strings A and B.
 */
export function myersDiff<T>(
  a: T[],
  b: T[],
  equals: (x: T, y: T) => boolean = (x, y) => x === y
): Array<{ type: DiffOperation; value: T }> {
  const n = a.length;
  const m = b.length;
  const max = n + m;

  if (n === 0 && m === 0) {
    return [];
  }
  if (n === 0) {
    return b.map((val) => ({ type: 'insert', value: val }));
  }
  if (m === 0) {
    return a.map((val) => ({ type: 'delete', value: val }));
  }

  const v: Record<number, number> = { 1: 0 };
  const trace: Array<Record<number, number>> = [];

  for (let d = 0; d <= max; d++) {
    const vCopy: Record<number, number> = {};
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && (v[k - 1] ?? -1) < (v[k + 1] ?? -1))) {
        x = v[k + 1] ?? 0;
      } else {
        x = (v[k - 1] ?? 0) + 1;
      }
      let y = x - k;

      while (x < n && y < m && equals(a[x], b[y])) {
        x++;
        y++;
      }

      vCopy[k] = x;

      if (x >= n && y >= m) {
        trace.push(vCopy);
        return backtrackMyers(trace, a, b, d, equals);
      }
    }
    trace.push(vCopy);
    Object.assign(v, vCopy);
  }

  // Fallback: simple delete all then insert all
  const fallback: Array<{ type: DiffOperation; value: T }> = [];
  for (const item of a) fallback.push({ type: 'delete', value: item });
  for (const item of b) fallback.push({ type: 'insert', value: item });
  return fallback;
}

function backtrackMyers<T>(
  trace: Array<Record<number, number>>,
  a: T[],
  b: T[],
  dMax: number,
  equals: (x: T, y: T) => boolean
): Array<{ type: DiffOperation; value: T }> {
  const result: Array<{ type: DiffOperation; value: T }> = [];
  let x = a.length;
  let y = b.length;

  for (let d = dMax; d > 0; d--) {
    const v = trace[d];
    const prevV = trace[d - 1];
    const k = x - y;

    let prevK: number;
    if (k === -d || (k !== d && (prevV[k - 1] ?? -1) < (prevV[k + 1] ?? -1))) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = prevV[prevK] ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      result.unshift({ type: 'equal', value: a[x - 1] });
      x--;
      y--;
    }

    if (d > 0) {
      if (x === prevX) {
        result.unshift({ type: 'insert', value: b[prevY] });
        y--;
      } else {
        result.unshift({ type: 'delete', value: a[prevX] });
        x--;
      }
    }
  }

  while (x > 0 && y > 0) {
    result.unshift({ type: 'equal', value: a[x - 1] });
    x--;
    y--;
  }

  return result;
}

/**
 * Tokenizes text into word, whitespace, and punctuation tokens for inline diffing.
 */
export function tokenizeWords(text: string): string[] {
  if (!text) return [];
  const tokens = text.match(/\s+|[a-zA-Z0-9_\u00C0-\u024F]+|[^\s\w]/g);
  return tokens ? tokens : [text];
}

/**
 * Computes word-level inline diff tokens between two modified lines.
 */
export function computeInlineDiff(
  oldLine: string,
  newLine: string
): { oldTokens: InlineToken[]; newTokens: InlineToken[] } {
  const oldWords = tokenizeWords(oldLine);
  const newWords = tokenizeWords(newLine);

  const diff = myersDiff(oldWords, newWords);

  const oldTokens: InlineToken[] = [];
  const newTokens: InlineToken[] = [];

  for (const item of diff) {
    if (item.type === 'equal') {
      oldTokens.push({ text: item.value, type: 'equal' });
      newTokens.push({ text: item.value, type: 'equal' });
    } else if (item.type === 'delete') {
      oldTokens.push({ text: item.value, type: 'delete' });
    } else if (item.type === 'insert') {
      newTokens.push({ text: item.value, type: 'insert' });
    }
  }

  return { oldTokens, newTokens };
}

/**
 * Splits text into lines, handling CRLF and LF cleanly.
 */
export function splitLines(text: string | null | undefined): string[] {
  if (text === null || text === undefined || text === '') return [];
  return text.split(/\r?\n/);
}

/**
 * Computes full line-level diff with inline token annotations.
 */
export function computeLineDiff(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = splitLines(oldContent);
  const newLines = splitLines(newContent);

  const rawDiff = myersDiff(oldLines, newLines);

  const lines: DiffLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  let i = 0;
  while (i < rawDiff.length) {
    const item = rawDiff[i];

    // Check if we have a paired delete and insert (replacement)
    if (
      item.type === 'delete' &&
      i + 1 < rawDiff.length &&
      rawDiff[i + 1].type === 'insert'
    ) {
      const delItem = item;
      const insItem = rawDiff[i + 1];
      const { oldTokens, newTokens } = computeInlineDiff(delItem.value, insItem.value);

      lines.push({
        type: 'delete',
        text: delItem.value,
        oldLineNumber: oldLineNum++,
        inlineTokens: oldTokens,
      });

      lines.push({
        type: 'insert',
        text: insItem.value,
        newLineNumber: newLineNum++,
        inlineTokens: newTokens,
      });

      i += 2;
      continue;
    }

    if (item.type === 'equal') {
      lines.push({
        type: 'equal',
        text: item.value,
        oldLineNumber: oldLineNum++,
        newLineNumber: newLineNum++,
        inlineTokens: [{ text: item.value, type: 'equal' }],
      });
    } else if (item.type === 'delete') {
      lines.push({
        type: 'delete',
        text: item.value,
        oldLineNumber: oldLineNum++,
        inlineTokens: [{ text: item.value, type: 'delete' }],
      });
    } else if (item.type === 'insert') {
      lines.push({
        type: 'insert',
        text: item.value,
        newLineNumber: newLineNum++,
        inlineTokens: [{ text: item.value, type: 'insert' }],
      });
    }
    i++;
  }

  return lines;
}

/**
 * Groups lines into standard Git-like diff chunks with surrounding context lines.
 */
export function groupIntoChunks(lines: DiffLine[], contextSize = 3): DiffChunk[] {
  if (lines.length === 0) return [];

  const changeIndices: number[] = [];
  lines.forEach((l, idx) => {
    if (l.type !== 'equal') changeIndices.push(idx);
  });

  if (changeIndices.length === 0) {
    return [];
  }

  const ranges: Array<{ start: number; end: number }> = [];
  let currentRange = {
    start: Math.max(0, changeIndices[0] - contextSize),
    end: Math.min(lines.length - 1, changeIndices[0] + contextSize),
  };

  for (let i = 1; i < changeIndices.length; i++) {
    const idx = changeIndices[i];
    const itemStart = Math.max(0, idx - contextSize);
    const itemEnd = Math.min(lines.length - 1, idx + contextSize);

    if (itemStart <= currentRange.end + 1) {
      currentRange.end = Math.max(currentRange.end, itemEnd);
    } else {
      ranges.push({ ...currentRange });
      currentRange = { start: itemStart, end: itemEnd };
    }
  }
  ranges.push(currentRange);

  return ranges.map((r) => {
    const chunkLines = lines.slice(r.start, r.end + 1);
    const firstOld = chunkLines.find((l) => l.oldLineNumber !== undefined)?.oldLineNumber || 1;
    const firstNew = chunkLines.find((l) => l.newLineNumber !== undefined)?.newLineNumber || 1;
    const oldLinesCount = chunkLines.filter((l) => l.type === 'equal' || l.type === 'delete').length;
    const newLinesCount = chunkLines.filter((l) => l.type === 'equal' || l.type === 'insert').length;

    return {
      oldStart: firstOld,
      oldLines: oldLinesCount,
      newStart: firstNew,
      newLines: newLinesCount,
      lines: chunkLines,
    };
  });
}

/**
 * Computes section-by-section diff between two proposal versions.
 */
export function compareProposalSections(
  oldSections: Record<string, string> = {},
  newSections: Record<string, string> = {},
  contextSize = 3
): SectionDiff[] {
  const sectionKeys = Array.from(
    new Set([...PROPOSAL_SECTION_IDS, ...Object.keys(oldSections), ...Object.keys(newSections)])
  );

  const results: SectionDiff[] = [];

  for (const key of sectionKeys) {
    const oldContent = oldSections[key] || '';
    const newContent = newSections[key] || '';

    const oldWords = countWords(oldContent);
    const newWords = countWords(newContent);
    const wordCountDelta = newWords - oldWords;

    const allLines = computeLineDiff(oldContent, newContent);
    const hasChanges = allLines.some((l) => l.type !== 'equal');

    const addedLinesCount = allLines.filter((l) => l.type === 'insert').length;
    const deletedLinesCount = allLines.filter((l) => l.type === 'delete').length;
    const chunks = groupIntoChunks(allLines, contextSize);

    results.push({
      sectionId: key,
      sectionTitle: SECTION_TITLES[key] || key.charAt(0).toUpperCase() + key.slice(1),
      oldContent,
      newContent,
      oldWordCount: oldWords,
      newWordCount: newWords,
      wordCountDelta,
      addedLinesCount,
      deletedLinesCount,
      hasChanges,
      chunks,
      allLines,
    });
  }

  return results;
}

/**
 * Comprehensive proposal comparison engine.
 */
export function compareProposals(params: {
  oldProposalTitle?: string;
  newProposalTitle?: string;
  oldVersionLabel?: string;
  newVersionLabel?: string;
  oldSections: Record<string, string>;
  newSections: Record<string, string>;
  contextSize?: number;
}): ProposalDiffResult {
  const {
    oldProposalTitle = 'Baseline Proposal',
    newProposalTitle = 'Comparison Proposal',
    oldVersionLabel = 'Version A',
    newVersionLabel = 'Version B',
    oldSections,
    newSections,
    contextSize = 3,
  } = params;

  const sections = compareProposalSections(oldSections, newSections, contextSize);

  const totalOldWords = sections.reduce((sum, s) => sum + s.oldWordCount, 0);
  const totalNewWords = sections.reduce((sum, s) => sum + s.newWordCount, 0);
  const totalWordDelta = totalNewWords - totalOldWords;

  const oldProgress = calculateProposalProgress(oldSections);
  const newProgress = calculateProposalProgress(newSections);
  const progressDelta = newProgress - oldProgress;

  const oldReadingTimeMin = estimateReadingTime(totalOldWords);
  const newReadingTimeMin = estimateReadingTime(totalNewWords);
  const readingTimeDeltaMin = Number((newReadingTimeMin - oldReadingTimeMin).toFixed(1));

  const totalAddedLines = sections.reduce((sum, s) => sum + s.addedLinesCount, 0);
  const totalDeletedLines = sections.reduce((sum, s) => sum + s.deletedLinesCount, 0);
  const changedSectionCount = sections.filter((s) => s.hasChanges).length;

  return {
    oldProposalTitle,
    newProposalTitle,
    oldVersionLabel,
    newVersionLabel,
    totalOldWords,
    totalNewWords,
    totalWordDelta,
    oldProgress,
    newProgress,
    progressDelta,
    oldReadingTimeMin,
    newReadingTimeMin,
    readingTimeDeltaMin,
    totalAddedLines,
    totalDeletedLines,
    sections,
    changedSectionCount,
    timestamp: new Date().toISOString(),
  };
}
