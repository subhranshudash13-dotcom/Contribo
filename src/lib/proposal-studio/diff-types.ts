export type DiffOperation = 'equal' | 'insert' | 'delete';

export interface InlineToken {
  text: string;
  type: DiffOperation;
}

export interface DiffLine {
  type: DiffOperation;
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  inlineTokens?: InlineToken[];
}

export interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface SectionDiff {
  sectionId: string;
  sectionTitle: string;
  oldContent: string;
  newContent: string;
  oldWordCount: number;
  newWordCount: number;
  wordCountDelta: number;
  addedLinesCount: number;
  deletedLinesCount: number;
  hasChanges: boolean;
  chunks: DiffChunk[];
  allLines: DiffLine[];
}

export interface ProposalDiffResult {
  oldProposalTitle: string;
  newProposalTitle: string;
  oldVersionLabel: string;
  newVersionLabel: string;
  totalOldWords: number;
  totalNewWords: number;
  totalWordDelta: number;
  oldProgress: number;
  newProgress: number;
  progressDelta: number;
  oldReadingTimeMin: number;
  newReadingTimeMin: number;
  readingTimeDeltaMin: number;
  totalAddedLines: number;
  totalDeletedLines: number;
  sections: SectionDiff[];
  changedSectionCount: number;
  timestamp: string;
}
