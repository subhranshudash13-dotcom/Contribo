import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));

// Both modules under test have no runtime imports, so a transpile is all they need.
function load(filename) {
  const mod = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, filename), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInThisContext(`(function(module, exports) {\n${compiled}\n})`)(mod, mod.exports);
  return mod.exports;
}

const {
  toUtcTimestamp,
  intersectDays,
  detectConflicts,
  recommendPacing,
  scheduleFromRecord,
} = load('src/lib/calendar/conflict-detector.ts');
const { COMPARISON_PROGRAMS } = load('src/lib/programs/comparison-data.ts');

const program = (slug, over = {}) => ({
  slug,
  name: slug.toUpperCase(),
  applicationStart: '2026-01-01',
  applicationDeadline: '2026-03-01',
  codingStart: '2026-06-01',
  codingEnd: '2026-08-31',
  weeklyHours: 10,
  requiresWrittenProposal: true,
  fullTimeEmployedAllowed: true,
  eligibilityNotes: 'note',
  ...over,
});

// Far apart in every respect, so each test only creates the collision it is about.
const later = (slug, over = {}) =>
  program(slug, {
    applicationDeadline: '2026-04-01',
    codingStart: '2026-10-01',
    codingEnd: '2026-11-30',
    ...over,
  });

const ofType = (report, type) => report.conflicts.filter((c) => c.type === type);

test('interval overlap counts both end days', () => {
  assert.equal(intersectDays('2026-06-01', '2026-06-10', '2026-06-10', '2026-06-20').days, 1);
  assert.equal(intersectDays('2026-06-01', '2026-06-30', '2026-06-10', '2026-06-12').days, 3);
  assert.equal(intersectDays('2026-12-30', '2027-01-02', '2027-01-01', '2027-02-01').days, 2);
  assert.equal(intersectDays('2026-06-01', '2026-06-09', '2026-06-10', '2026-06-20'), null);
  assert.equal(intersectDays('2026-06-10', '2026-06-01', '2026-06-01', '2026-06-20'), null);
  assert.equal(intersectDays('soon', '2026-06-01', '2026-06-01', '2026-06-20'), null);
});

test('timestamps are normalised to UTC', () => {
  const noon = Date.UTC(2026, 2, 31, 12);
  assert.equal(toUtcTimestamp('2026-03-31T12:00:00Z'), noon);
  assert.equal(toUtcTimestamp('2026-03-31T17:30:00+05:30'), noon);
  assert.equal(toUtcTimestamp('2026-03-31T08:00:00-04:00'), noon);
  assert.equal(toUtcTimestamp('2026-03-31 12:00'), noon);
  assert.equal(toUtcTimestamp('2026-03-31'), Date.UTC(2026, 2, 31));
  assert.equal(toUtcTimestamp('2026-02-30'), null);
  assert.equal(toUtcTimestamp(''), null);
});

test('deadlines up to 48 hours apart are a pinch, with severity by closeness', () => {
  const pinch = (deadline, over = {}) =>
    ofType(
      detectConflicts([program('a'), later('b', { applicationDeadline: deadline, ...over })]),
      'DEADLINE_PINCH'
    )[0];

  assert.equal(pinch('2026-03-02').severity, 'CRITICAL_CONFLICT');
  assert.equal(pinch('2026-03-03').severity, 'WARNING');
  assert.equal(pinch('2026-03-03').hoursApart, 48);
  assert.equal(pinch('2026-03-03T01:00:00Z'), undefined);
  assert.equal(pinch('2026-02-26'), undefined);
  assert.equal(pinch('2026-03-01', { requiresWrittenProposal: false }).severity, 'INFO');
});

test('deadline pinch compares instants, not calendar dates', () => {
  const report = detectConflicts([
    program('a', { applicationDeadline: '2026-03-01T23:00:00-10:00' }),
    later('b', { applicationDeadline: '2026-03-02T10:00:00+01:00' }),
  ]);
  assert.equal(ofType(report, 'DEADLINE_PINCH')[0].hoursApart, 0);
});

test('coding overlap severity follows combined weekly hours', () => {
  const severity = (hoursA, hoursB) =>
    ofType(
      detectConflicts([
        program('a', { weeklyHours: hoursA }),
        program('b', { weeklyHours: hoursB, applicationDeadline: '2026-04-01' }),
      ]),
      'CODING_OVERLAP'
    )[0].severity;

  assert.equal(severity(10, 10), 'INFO');
  assert.equal(severity(20, 20), 'WARNING');
  assert.equal(severity(30, 15), 'CRITICAL_CONFLICT');
});

test('exclusivity needs a restricted program, a heavy parallel one and shared days', () => {
  const run = (a, b) => ofType(detectConflicts([a, b]), 'EXCLUSIVITY');
  const strict = program('strict', { fullTimeEmployedAllowed: false });
  const heavy = program('heavy', { weeklyHours: 30 });

  const [found] = run(heavy, strict);
  assert.equal(found.severity, 'CRITICAL_CONFLICT');
  assert.match(found.message, /^STRICT is listed as not allowing/);
  assert.equal(run(strict, program('light', { weeklyHours: 20 })).length, 0);
  assert.equal(run(strict, later('apart', { weeklyHours: 40 })).length, 0);
  assert.equal(run(program('open'), heavy).length, 0);
});

test('empty, single and duplicated selections have no conflicts', () => {
  assert.deepEqual(detectConflicts([]).conflicts, []);
  assert.deepEqual(detectConflicts([]).recommendations, []);
  assert.deepEqual(detectConflicts([program('a')]).conflicts, []);
  assert.equal(detectConflicts([program('a')]).recommendations.length, 1);
  assert.deepEqual(detectConflicts([program('a'), program('a')]).conflicts, []);
});

test('conflicts are ordered by severity and counted', () => {
  const report = detectConflicts(['gsoc', 'lfx', 'outreachy'].map((s) => scheduleFromRecord(COMPARISON_PROGRAMS[s])));
  const rank = { CRITICAL_CONFLICT: 0, WARNING: 1, INFO: 2 };
  const ranks = report.conflicts.map((c) => rank[c.severity]);

  assert.deepEqual(ranks, [...ranks].sort());
  assert.equal(
    Object.values(report.summary).reduce((a, b) => a + b, 0),
    report.conflicts.length
  );
  assert.ok(report.conflicts.some((c) => c.type === 'CODING_OVERLAP' && c.programs.join() === 'gsoc,lfx'));
  assert.ok(report.conflicts.some((c) => c.type === 'EXCLUSIVITY' && c.programs.join() === 'gsoc,lfx'));
});

test('drafting blocks never overlap and finish before their deadline', () => {
  const plan = recommendPacing([
    program('b', { applicationDeadline: '2026-03-02' }),
    program('a', { applicationDeadline: '2026-03-01' }),
    program('c', { applicationDeadline: '2026-05-01', requiresWrittenProposal: false }),
  ]);

  assert.deepEqual(plan.map((p) => p.slug), ['a', 'b', 'c']);
  for (const [i, block] of plan.entries()) {
    assert.ok(block.finishBy < block.deadline);
    if (i > 0) assert.ok(plan[i - 1].finishBy < block.draftStart);
  }
  assert.equal(plan[2].draftingDays, 7);
  assert.match(plan[0].note, /Finish early/);
});

test('impossible calendar days are rejected in datetime values too', () => {
  assert.equal(toUtcTimestamp('2026-02-30T12:00:00Z'), null);
  assert.equal(toUtcTimestamp('2026-04-31 09:00'), null);
  assert.equal(toUtcTimestamp('2026-02-30T12:00:00+05:30'), null);
  assert.equal(toUtcTimestamp('2026-03-01T00:30:00+05:30'), Date.UTC(2026, 1, 28, 19, 0));
});
