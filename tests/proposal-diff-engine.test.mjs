import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

function sourceLoader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    const resolved = path.resolve(root, filename);
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const mod = { exports: {} };
    cache.set(resolved, mod);
    const compiled = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (!id.startsWith('@/') && !id.startsWith('.')) return require(id);
      const base = id.startsWith('@/')
        ? path.join(root, 'src', id.slice(2))
        : path.resolve(path.dirname(resolved), id);
      const target = ['.ts', '.tsx'].map((ext) => base + ext).find(fs.existsSync);
      assert.ok(target, `Cannot resolve production module ${id}`);
      return load(target);
    };
    vm.runInThisContext(`(function(require, module, exports) {\n${compiled}\n})`, {
      filename: resolved,
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}

const load = sourceLoader();
const diffEngine = load('src/lib/proposal-studio/diff-engine.ts');
const changelogGen = load('src/lib/proposal-studio/changelog.ts');

test('Proposal Diff Engine & Myers Diff Algorithm', async (t) => {
  await t.test('1. Core Myers Diff with array tokens', () => {
    // Identical sequences
    const identical = diffEngine.myersDiff(['a', 'b', 'c'], ['a', 'b', 'c']);
    assert.equal(identical.length, 3);
    assert.ok(identical.every((item) => item.type === 'equal'));

    // Completely disjoint
    const disjoint = diffEngine.myersDiff(['a', 'b'], ['c', 'd']);
    assert.equal(disjoint.length, 4);
    assert.equal(disjoint.filter((d) => d.type === 'delete').length, 2);
    assert.equal(disjoint.filter((d) => d.type === 'insert').length, 2);

    // Empty arrays
    assert.deepEqual(diffEngine.myersDiff([], []), []);
    const insertOnly = diffEngine.myersDiff([], ['x', 'y']);
    assert.equal(insertOnly.length, 2);
    assert.ok(insertOnly.every((i) => i.type === 'insert'));
  });

  await t.test('2. Word tokenization and inline diffs', () => {
    const text = 'Hello world, GSoC 2026!';
    const tokens = diffEngine.tokenizeWords(text);
    assert.ok(tokens.length >= 4);
    assert.ok(tokens.includes('Hello'));
    assert.ok(tokens.includes('world'));

    const { oldTokens, newTokens } = diffEngine.computeInlineDiff(
      'Use Redis for caching',
      'Use Dragonfly for distributed caching'
    );

    // Old tokens should have delete for 'Redis'
    const deleted = oldTokens.filter((t) => t.type === 'delete').map((t) => t.text);
    assert.ok(deleted.includes('Redis'));

    // New tokens should have insert for 'Dragonfly' and 'distributed'
    const inserted = newTokens.filter((t) => t.type === 'insert').map((t) => t.text);
    assert.ok(inserted.includes('Dragonfly'));
    assert.ok(inserted.includes('distributed'));
  });

  await t.test('3. Line splitting and diff generation', () => {
    const oldText = 'Line 1\nLine 2\nLine 3';
    const newText = 'Line 1\nLine 2 (revised)\nLine 3\nLine 4';

    const diffLines = diffEngine.computeLineDiff(oldText, newText);
    assert.ok(diffLines.length >= 4);

    const types = diffLines.map((l) => l.type);
    assert.ok(types.includes('equal'));
    assert.ok(types.includes('delete'));
    assert.ok(types.includes('insert'));

    // Verify CRLF is handled without trailing \r
    const crlfText = 'A\r\nB\r\nC';
    const lines = diffEngine.splitLines(crlfText);
    assert.deepEqual(lines, ['A', 'B', 'C']);
  });

  await t.test('4. Diff chunking with surrounding context', () => {
    const lines = [
      { type: 'equal', text: 'Ctx 1', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'equal', text: 'Ctx 2', oldLineNumber: 2, newLineNumber: 2 },
      { type: 'equal', text: 'Ctx 3', oldLineNumber: 3, newLineNumber: 3 },
      { type: 'delete', text: 'Old Line', oldLineNumber: 4 },
      { type: 'insert', text: 'New Line', newLineNumber: 4 },
      { type: 'equal', text: 'Ctx 5', oldLineNumber: 5, newLineNumber: 5 },
      { type: 'equal', text: 'Ctx 6', oldLineNumber: 6, newLineNumber: 6 },
    ];

    const chunks = diffEngine.groupIntoChunks(lines, 2);
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].oldStart, 2);
    assert.ok(chunks[0].lines.length >= 3);

    // If no changes exist, chunks should be empty
    const noChangeLines = [
      { type: 'equal', text: 'Unchanged 1', oldLineNumber: 1, newLineNumber: 1 },
      { type: 'equal', text: 'Unchanged 2', oldLineNumber: 2, newLineNumber: 2 },
    ];
    assert.deepEqual(diffEngine.groupIntoChunks(noChangeLines, 2), []);
  });

  await t.test('5. Word counting and reading time metrics', () => {
    assert.equal(diffEngine.countWords(''), 0);
    assert.equal(diffEngine.countWords(null), 0);
    assert.equal(diffEngine.countWords('   '), 0);
    assert.equal(diffEngine.countWords('### Proposal Title: Real-time Ingestion'), 4);
    assert.equal(diffEngine.countWords('One two three four five'), 5);

    assert.equal(diffEngine.estimateReadingTime(0), 0);
    assert.equal(diffEngine.estimateReadingTime(200), 1.0);
    assert.equal(diffEngine.estimateReadingTime(500), 2.5);
  });

  await t.test('6. Section-by-section comparison and delta computation', () => {
    const oldSections = {
      summary: 'Basic proposal overview of the project.',
      architecture: 'Single monolithic server instance.',
    };
    const newSections = {
      summary: 'Comprehensive and detailed architectural proposal overview of the distributed streaming project.',
      architecture: 'Distributed microservice architecture with Redis cluster and event pub/sub messaging.',
      timeline: 'Week 1-12 full milestone breakdown.',
    };

    const sectionDiffs = diffEngine.compareProposalSections(oldSections, newSections);
    assert.ok(sectionDiffs.length >= 3);

    const summaryDiff = sectionDiffs.find((s) => s.sectionId === 'summary');
    assert.ok(summaryDiff);
    assert.ok(summaryDiff.hasChanges);
    assert.ok(summaryDiff.wordCountDelta > 0);

    const timelineDiff = sectionDiffs.find((s) => s.sectionId === 'timeline');
    assert.ok(timelineDiff);
    assert.equal(timelineDiff.oldWordCount, 0);
    assert.ok(timelineDiff.newWordCount > 0);
  });

  await t.test('7. Comprehensive proposal comparison', () => {
    const oldSections = {
      summary: 'Simple summary string with enough text to fulfill baseline testing minimums.',
      architecture: 'Single server without fallback.',
    };
    const newSections = {
      summary: 'Enhanced summary string with enough text to fulfill baseline testing minimums.',
      architecture: 'Fault-tolerant distributed cluster with Redis Streams and circuit breakers.',
      problemStatement: 'Applicants need real-time diff previews to collaborate effectively with mentors.',
      deliverables: 'Deliverable 1, Deliverable 2, Deliverable 3, Deliverable 4 with complete specs.',
      timeline: '12 week schedule with milestone checkpoints and community bonding buffer.',
    };

    const result = diffEngine.compareProposals({
      oldVersionLabel: 'Draft v1',
      newVersionLabel: 'Draft v2',
      oldSections,
      newSections,
    });

    assert.equal(result.oldVersionLabel, 'Draft v1');
    assert.equal(result.newVersionLabel, 'Draft v2');
    assert.ok(result.totalWordDelta > 0);
    assert.ok(result.progressDelta > 0);
    assert.ok(result.changedSectionCount >= 3);
    assert.ok(result.totalAddedLines > 0);
  });

  await t.test('8. Automated Markdown changelog generation', () => {
    const diffResult = {
      oldVersionLabel: 'v1.0 (Initial Draft)',
      newVersionLabel: 'v2.0 (Mentor Refinements)',
      totalOldWords: 150,
      totalNewWords: 350,
      totalWordDelta: 200,
      oldProgress: 25,
      newProgress: 75,
      progressDelta: 50,
      oldReadingTimeMin: 0.8,
      newReadingTimeMin: 1.8,
      readingTimeDeltaMin: 1.0,
      totalAddedLines: 24,
      totalDeletedLines: 4,
      changedSectionCount: 2,
      sections: [
        {
          sectionId: 'architecture',
          sectionTitle: 'Technical Architecture',
          oldWordCount: 50,
          newWordCount: 150,
          wordCountDelta: 100,
          addedLinesCount: 12,
          deletedLinesCount: 2,
          hasChanges: true,
          chunks: [],
          allLines: [],
          oldContent: '',
          newContent: '',
        },
        {
          sectionId: 'timeline',
          sectionTitle: 'Project Timeline',
          oldWordCount: 0,
          newWordCount: 100,
          wordCountDelta: 100,
          addedLinesCount: 10,
          deletedLinesCount: 0,
          hasChanges: true,
          chunks: [],
          allLines: [],
          oldContent: '',
          newContent: '',
        },
      ],
      oldProposalTitle: 'Proposal',
      newProposalTitle: 'Proposal',
      timestamp: new Date().toISOString(),
    };

    const changelog = changelogGen.generateProposalChangelog(diffResult);
    assert.ok(changelog.includes('### Proposal Revision Changelog: v1.0 (Initial Draft) ➔ v2.0 (Mentor Refinements)'));
    assert.ok(changelog.includes('Overall Readiness'));
    assert.ok(changelog.includes('+200 words'));
    assert.ok(changelog.includes('Technical Architecture'));
    assert.ok(changelog.includes('Project Timeline'));
  });
});
