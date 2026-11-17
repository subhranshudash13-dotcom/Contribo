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
const comparisonData = load('src/lib/programs/comparison-data.ts');
const comparison = load('src/lib/programs/comparison.ts');

const {
  SUPPORTED_COUNTRIES,
  COMPARISON_PROGRAMS,
  getCountry,
  getProgramRecord,
  getAllProgramRecords,
} = comparisonData;

const {
  calculateRegionalStipend,
  detectTimelineConflicts,
  buildComparisonMatrix,
  formatCurrencyAmount,
} = comparison;

test('Multi-Program Comparison Engine', async (t) => {
  await t.test('Dataset Integrity & Helpers', () => {
    assert.ok(SUPPORTED_COUNTRIES.length >= 10, 'Expected at least 10 countries');
    for (const country of SUPPORTED_COUNTRIES) {
      assert.ok(country.code.length === 2, `Country code should be 2 letters: ${country.code}`);
      assert.ok(country.pppMultiplier > 0 && country.pppMultiplier <= 1.5, `Invalid PPP for ${country.code}`);
      assert.ok(country.exchangeRateToUsd > 0, `Invalid exchange rate for ${country.code}`);
      assert.ok(country.currency.length === 3, `Invalid currency code for ${country.code}`);
      assert.ok(country.currencySymbol.length > 0, `Missing symbol for ${country.code}`);
    }

    const india = getCountry('in');
    assert.equal(india.code, 'IN');
    assert.equal(india.currency, 'INR');

    const fallback = getCountry('ZZ');
    assert.equal(fallback.code, 'US');

    const programs = getAllProgramRecords();
    assert.ok(programs.length >= 6, 'Expected at least 6 core programs');

    for (const p of programs) {
      assert.ok(p.slug.length > 0, 'Program must have slug');
      assert.ok(p.name.length > 0, 'Program must have name');
      assert.ok(p.organizer.length > 0, 'Program must have organizer');
      assert.match(p.accentColor, /^#[0-9A-Fa-f]{6}$/, 'Accent color must be hex');
      assert.match(p.commitment.codingStartDate, /^\d{4}-\d{2}-\d{2}$/, 'Valid codingStartDate');
      assert.match(p.commitment.codingEndDate, /^\d{4}-\d{2}-\d{2}$/, 'Valid codingEndDate');
      assert.ok(p.commitment.weeklyHours > 0, 'Weekly hours must be positive');
      assert.ok(p.commitment.durationWeeks > 0, 'Duration weeks must be positive');
    }

    const gsoc = getProgramRecord('gsoc');
    assert.ok(gsoc);
    assert.equal(gsoc.name, 'Google Summer of Code');

    const lfx = getProgramRecord('LFX');
    assert.ok(lfx);
    assert.equal(lfx.organizer, 'Linux Foundation');

    assert.equal(getProgramRecord('non-existent'), undefined);
  });

  await t.test('Regional Stipend & Purchasing Power Parity (PPP) Calculations', () => {
    const gsoc = COMPARISON_PROGRAMS.gsoc;
    const us = getCountry('US');
    const estimateUs = calculateRegionalStipend(gsoc, us);

    assert.equal(estimateUs.isUnpaid, false);
    assert.equal(estimateUs.minUsd, 3000);
    assert.equal(estimateUs.maxUsd, 6000);
    assert.equal(estimateUs.minLocal, 3000);
    assert.equal(estimateUs.maxLocal, 6000);
    assert.equal(estimateUs.currency, 'USD');
    assert.ok(estimateUs.hourlyRateEstimateUsd > 0);

    const india = getCountry('IN');
    const estimateIn = calculateRegionalStipend(gsoc, india);

    assert.equal(estimateIn.minUsd, 1500); // 3000 * 0.5
    assert.equal(estimateIn.maxUsd, 3000); // 6000 * 0.5
    assert.equal(estimateIn.minLocal, 1500 * 86.5);
    assert.equal(estimateIn.maxLocal, 3000 * 86.5);
    assert.equal(estimateIn.currency, 'INR');
    assert.equal(estimateIn.currencySymbol, '₹');
    assert.ok(estimateIn.formattedRangeLocal.includes('₹'));

    const outreachy = COMPARISON_PROGRAMS.outreachy;
    const estimateOutreachy = calculateRegionalStipend(outreachy, india);
    assert.equal(estimateOutreachy.minUsd, 7000);
    assert.equal(estimateOutreachy.maxUsd, 7000);
    assert.equal(estimateOutreachy.minLocal, 7000 * 86.5);
    assert.equal(estimateOutreachy.maxLocal, 7000 * 86.5);

    const nsoc = COMPARISON_PROGRAMS.nsoc;
    const estimateNsoc = calculateRegionalStipend(nsoc, us);
    assert.equal(estimateNsoc.isUnpaid, true);
    assert.equal(estimateNsoc.minUsd, 0);
    assert.equal(estimateNsoc.maxUsd, 0);
    assert.equal(estimateNsoc.minLocal, 0);
    assert.equal(estimateNsoc.maxLocal, 0);
    assert.equal(estimateNsoc.formattedRangeLocal, 'Unpaid / Swag & Prizes');

    assert.equal(formatCurrencyAmount(0, '$', 'USD'), 'Free / Unpaid');
    assert.equal(formatCurrencyAmount(5000, '$', 'USD'), '$5,000');
    assert.equal(formatCurrencyAmount(5000, '€', 'EUR'), '€5,000');
    assert.equal(formatCurrencyAmount(250000, '₹', 'INR'), '₹250,000');
  });

  await t.test('Timeline Conflict & Workload Collision Engine', () => {
    const gsoc = COMPARISON_PROGRAMS.gsoc;
    const lfx = COMPARISON_PROGRAMS.lfx;

    const conflicts = detectTimelineConflicts([gsoc, lfx]);
    assert.ok(conflicts.length >= 1, 'Expected at least one conflict between GSoC and LFX');

    const codingConflict = conflicts.find((c) => c.type === 'coding_overlap');
    assert.ok(codingConflict, 'Should identify coding window overlap');
    assert.equal(codingConflict.slugA, 'gsoc');
    assert.equal(codingConflict.slugB, 'lfx');
    assert.ok(codingConflict.overlapDays > 80, 'Overlap should exceed 80 days');
    assert.equal(codingConflict.combinedWeeklyHours, 70); // 30 + 40
    assert.equal(codingConflict.severity, 'critical', 'Workload > 40 hrs should trigger critical severity');

    const outreachy = COMPARISON_PROGRAMS.outreachy;
    const nsoc = COMPARISON_PROGRAMS.nsoc;
    const cleanConflicts = detectTimelineConflicts([outreachy, nsoc]);
    const cleanCoding = cleanConflicts.find((c) => c.type === 'coding_overlap');
    assert.equal(cleanCoding, undefined, 'Outreachy and NSoC should not have coding clashes');
  });

  await t.test('Comparison Matrix Result Builder', () => {
    const matrix = buildComparisonMatrix(['gsoc', 'lfx', 'outreachy'], 'IN');

    assert.equal(matrix.programs.length, 3);
    assert.equal(matrix.country.code, 'IN');
    assert.ok(matrix.stipends.gsoc);
    assert.ok(matrix.stipends.lfx);
    assert.ok(matrix.stipends.outreachy);
    assert.equal(matrix.totalCumulativeWeeklyHours, 100); // 30 + 40 + 30
    assert.ok(matrix.conflicts.length > 0);
    assert.ok(matrix.availableSlugs.length >= 6);

    const emptyMatrix = buildComparisonMatrix([], 'US');
    assert.ok(emptyMatrix.programs.length >= 2);

    const invalidMatrix = buildComparisonMatrix(['fake-slug', 'invalid-xyz'], 'DE');
    assert.ok(invalidMatrix.programs.length >= 2);
    assert.equal(invalidMatrix.country.code, 'DE');

    const dedupMatrix = buildComparisonMatrix(
      ['gsoc', 'gsoc', 'lfx', 'outreachy', 'nsoc', 'summer-of-bitcoin'],
      'US'
    );
    assert.equal(dedupMatrix.programs.length, 4);
    assert.equal(dedupMatrix.programs[0].slug, 'gsoc');
    assert.equal(dedupMatrix.programs[1].slug, 'lfx');
    assert.equal(dedupMatrix.programs[2].slug, 'outreachy');
    assert.equal(dedupMatrix.programs[3].slug, 'nsoc');
  });
});
