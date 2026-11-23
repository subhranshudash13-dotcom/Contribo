import type { ProposalDiffResult, SectionDiff } from './diff-types';

/**
 * Summarizes the nature of change in a section.
 */
function summarizeSectionChange(section: SectionDiff): string {
  const { oldWordCount, newWordCount, wordCountDelta, addedLinesCount, deletedLinesCount } = section;

  if (oldWordCount === 0 && newWordCount > 0) {
    return `Authored new section from scratch (+${newWordCount} words)`;
  }
  if (oldWordCount > 0 && newWordCount === 0) {
    return `Removed section content (-${oldWordCount} words)`;
  }
  if (wordCountDelta > 50) {
    return `Substantially expanded section content (+${wordCountDelta} words, +${addedLinesCount} lines)`;
  }
  if (wordCountDelta > 0) {
    return `Added revisions and clarifications (+${wordCountDelta} words, +${addedLinesCount} lines)`;
  }
  if (wordCountDelta < -50) {
    return `Significantly condensed and trimmed section (-${Math.abs(wordCountDelta)} words, -${deletedLinesCount} lines)`;
  }
  if (wordCountDelta < 0) {
    return `Refined and tightened phrasing (-${Math.abs(wordCountDelta)} words)`;
  }
  return `Edited phrasing and structure (+${addedLinesCount}/-${deletedLinesCount} lines)`;
}

/**
 * Generates an automated structured Markdown changelog from comparison results.
 */
export function generateProposalChangelog(diff: ProposalDiffResult): string {
  const {
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
  } = diff;

  const lines: string[] = [];

  lines.push(`### Proposal Revision Changelog: ${oldVersionLabel} ➔ ${newVersionLabel}`);
  lines.push('');
  lines.push('#### Executive Summary of Changes');
  lines.push(`- **Overall Readiness**: ${oldProgress}% ➔ ${newProgress}% (${progressDelta >= 0 ? '+' : ''}${progressDelta}%)`);
  lines.push(`- **Net Word Count**: ${totalWordDelta >= 0 ? '+' : ''}${totalWordDelta} words (${totalOldWords} ➔ ${totalNewWords} words)`);
  lines.push(`- **Line Modifications**: +${totalAddedLines} additions, -${totalDeletedLines} deletions`);
  lines.push(`- **Estimated Reading Time**: ~${oldReadingTimeMin} min ➔ ~${newReadingTimeMin} min (${readingTimeDeltaMin >= 0 ? '+' : ''}${readingTimeDeltaMin} min)`);
  lines.push(`- **Modified Sections**: ${changedSectionCount} of ${sections.length} sections updated`);
  lines.push('');

  lines.push('#### Section Breakdown');
  const changedSections = sections.filter((s) => s.hasChanges);

  if (changedSections.length === 0) {
    lines.push('- *No textual changes detected between the selected revisions.*');
  } else {
    for (const section of changedSections) {
      const summary = summarizeSectionChange(section);
      lines.push(`- **${section.sectionTitle}**: ${summary}`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push(`*Generated automatically by Contribo Proposal Studio Diff Inspector on ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}.*`);

  return lines.join('\n');
}
