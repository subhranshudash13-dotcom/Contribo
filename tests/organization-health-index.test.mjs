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
const healthIndex = load('src/lib/organizations/health-index.ts');
const insightsData = load('src/lib/organizations/insights-data.ts');

test('Organization Health Index & Responsiveness Scoring Suite', async (t) => {
  await t.test('1. Issue Triage Velocity Scoring (25%)', () => {
    assert.equal(healthIndex.calculateIssueTriageScore(6), 25);
    assert.equal(healthIndex.calculateIssueTriageScore(20), 23);
    assert.equal(healthIndex.calculateIssueTriageScore(40), 20);
    assert.equal(healthIndex.calculateIssueTriageScore(60), 16);
    assert.equal(healthIndex.calculateIssueTriageScore(100), 12);
    assert.equal(healthIndex.calculateIssueTriageScore(150), 8);
    assert.equal(healthIndex.calculateIssueTriageScore(500), 2);
    assert.equal(healthIndex.calculateIssueTriageScore(0), 25);
  });

  await t.test('2. PR Time-To-First-Review (TTFR) Scoring (30%)', () => {
    assert.equal(healthIndex.calculatePrReviewScore(4), 30);
    assert.equal(healthIndex.calculatePrReviewScore(16), 27);
    assert.equal(healthIndex.calculatePrReviewScore(28), 22);
    assert.equal(healthIndex.calculatePrReviewScore(60), 16);
    assert.equal(healthIndex.calculatePrReviewScore(100), 10);
    assert.equal(healthIndex.calculatePrReviewScore(200), 5);
    assert.equal(healthIndex.calculatePrReviewScore(600), 2);
    assert.equal(healthIndex.calculatePrReviewScore(0), 30);
  });

  await t.test('3. Merge Rate & Throughput Scoring (20%)', () => {
    assert.equal(healthIndex.calculateMergeRateScore(100), 20);
    assert.equal(healthIndex.calculateMergeRateScore(80), 16);
    assert.equal(healthIndex.calculateMergeRateScore(50), 10);
    assert.equal(healthIndex.calculateMergeRateScore(0), 0);
    // Clamping checks
    assert.equal(healthIndex.calculateMergeRateScore(150), 20);
    assert.equal(healthIndex.calculateMergeRateScore(-20), 0);
  });

  await t.test('4. Mentor Distribution & Bus Factor (15%)', () => {
    const high = healthIndex.calculateMentorDistributionScore(10);
    assert.equal(high.score, 15);
    assert.equal(high.busFactor, 'Low');

    const moderate = healthIndex.calculateMentorDistributionScore(3);
    assert.equal(moderate.score, 9);
    assert.equal(moderate.busFactor, 'Moderate');

    const solo = healthIndex.calculateMentorDistributionScore(1);
    assert.equal(solo.score, 3);
    assert.equal(solo.busFactor, 'High');

    const none = healthIndex.calculateMentorDistributionScore(0);
    assert.equal(none.score, 0);
    assert.equal(none.busFactor, 'High');
  });

  await t.test('5. Historical Slot Retention Scoring (10%)', () => {
    assert.equal(healthIndex.calculateRetentionScore(5), 10);
    assert.equal(healthIndex.calculateRetentionScore(4), 10);
    assert.equal(healthIndex.calculateRetentionScore(3), 8);
    assert.equal(healthIndex.calculateRetentionScore(2), 6);
    assert.equal(healthIndex.calculateRetentionScore(1), 4);
    assert.equal(healthIndex.calculateRetentionScore(0), 0);
  });

  await t.test('6. Health Tier Mapping', () => {
    assert.equal(healthIndex.resolveHealthTier(95), 'Highly Responsive');
    assert.equal(healthIndex.resolveHealthTier(90), 'Highly Responsive');
    assert.equal(healthIndex.resolveHealthTier(85), 'Active & Engaged');
    assert.equal(healthIndex.resolveHealthTier(75), 'Active & Engaged');
    assert.equal(healthIndex.resolveHealthTier(60), 'Moderate Activity');
    assert.equal(healthIndex.resolveHealthTier(45), 'Slower Triage');
  });

  await t.test('7. Comprehensive Health Index Computation & Boundary Clamping', () => {
    // Ultra-active tier
    const topOrg = healthIndex.computeOrganizationHealth({
      medianIssueTriageHours: 8,
      medianTtfrHours: 6,
      mergeRatePercent: 95,
      activeMaintainers90d: 12,
      yearsParticipatedCount: 5,
    });
    assert.ok(topOrg.overallScore >= 90);
    assert.equal(topOrg.tier, 'Highly Responsive');
    assert.equal(topOrg.busFactorRisk, 'Low');
    assert.ok(topOrg.overallScore <= 100);

    // Dormant / slow tier
    const slowOrg = healthIndex.computeOrganizationHealth({
      medianIssueTriageHours: 400,
      medianTtfrHours: 500,
      mergeRatePercent: 15,
      activeMaintainers90d: 1,
      yearsParticipatedCount: 1,
    });
    assert.ok(slowOrg.overallScore < 50);
    assert.equal(slowOrg.tier, 'Slower Triage');
    assert.equal(slowOrg.busFactorRisk, 'High');
    assert.ok(slowOrg.overallScore >= 0);
  });

  await t.test('8. Full Organization Insights Generation', () => {
    const insights = insightsData.generateOrganizationInsights({
      name: 'Async GraphQL Foundation',
      slug: 'async-graphql',
      category: 'Developer Tools',
      websiteUrl: 'https://async-graphql.github.io',
      years: [2023, 2024, 2025, 2026],
      yearlyStats: {
        '2024': { slotsCount: 6, projectsCount: 6 },
        '2025': { slotsCount: 8, projectsCount: 8 },
      },
    });

    assert.equal(insights.slug, 'async-graphql');
    assert.equal(insights.name, 'Async GraphQL Foundation');
    assert.ok(insights.health.overallScore >= 0 && insights.health.overallScore <= 100);
    assert.equal(insights.historicalSlots.length, 5); // 2022 to 2026
    assert.equal(insights.reviewLatencyHistogram.length, 5);
    assert.ok(insights.communicationChannels.length >= 2);
    assert.ok(insights.bestTimeToSubmit.recommendedWindow.length > 0);
  });
});
