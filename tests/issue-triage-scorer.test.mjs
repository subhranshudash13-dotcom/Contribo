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
const scorer = load('src/lib/issues/triage-scorer.ts');
const {
  TRIAGE_SIGNAL_WEIGHTS,
  scoreIssueForTriage,
  triageIssues,
  buildProposalSeedFromIssue,
} = scorer;

const starterIssue = {
  id: 'iss-1',
  title: 'Fix aria-label on search input',
  description:
    'Steps to reproduce: open /search and inspect input. Expected: aria-label is set. Actual: missing attribute. Acceptance criteria: add unit test.',
  repo: 'contribo/web',
  orgSlug: 'contribo',
  orgName: 'Contribo',
  program: 'NSoC',
  issueUrl: 'https://github.com/contribo/web/issues/1',
  number: 1,
  labels: ['good first issue', 'a11y'],
  languages: ['TypeScript', 'React'],
  difficulty: 'easy',
  scope: 'quick-fix',
  estimatedHours: 4,
  commentsCount: 2,
  createdAt: '2026-11-20T00:00:00Z',
  hasMentorAssigned: true,
  mentorGuideText: 'Check src/components/SearchInput.tsx and add a test.',
};

const blockedStaleIssue = {
  id: 'iss-2',
  title: 'Refactor distributed consensus engine',
  description: 'Broken.',
  repo: 'contribo/core',
  orgSlug: 'contribo',
  orgName: 'Contribo',
  program: 'GSoC',
  issueUrl: 'https://github.com/contribo/core/issues/2',
  number: 2,
  labels: ['in-progress', 'core'],
  languages: ['Rust'],
  difficulty: 'hard',
  scope: 'deep-dive',
  estimatedHours: 120,
  commentsCount: 22,
  createdAt: '2025-01-01T00:00:00Z',
  hasMentorAssigned: false,
};

test('TRIAGE_SIGNAL_WEIGHTS sum to 1.0', () => {
  const sum = Object.values(TRIAGE_SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-9);
});

test('scoreIssueForTriage classifies well-specified issue as Starter Friendly with bounded effort', () => {
  const res = scoreIssueForTriage(starterIssue, ['TypeScript', 'React'], {
    daysSinceUpdate: 3,
    filesTouchedCount: 2,
  });

  assert.equal(res.tier, 'Starter Friendly');
  assert.equal(res.isBlocked, false);
  assert.ok(res.readinessScore >= 80 && res.readinessScore <= 100);
  assert.deepEqual(res.matchedSkills, ['typescript', 'react']);
  assert.ok(res.estimatedHoursToFirstPr >= 1 && res.estimatedHoursToFirstPr <= 80);
});

test('scoreIssueForTriage flags stale, linked-PR, missing-repro, and overcrowded issues as blocked', () => {
  const res = scoreIssueForTriage(blockedStaleIssue, ['TypeScript'], {
    hasReproSteps: false,
    hasLinkedPr: true,
    daysSinceUpdate: 150,
  });

  assert.equal(res.isBlocked, true);
  assert.ok(res.blockReasons.includes('existing-linked-pr'));
  assert.ok(res.blockReasons.includes('missing-repro-steps'));
  assert.ok(res.blockReasons.includes('stale-thread'));
  assert.ok(res.blockReasons.includes('overcrowded-comments'));
  assert.equal(res.tier, 'Deep Core');
  assert.equal(res.estimatedHoursToFirstPr, 80); // clamped upper bound
});

test('triageIssues sorts by readinessScore descending and filters blocked/tier', () => {
  const all = triageIssues([blockedStaleIssue, starterIssue], {
    skills: ['TypeScript'],
    includeBlocked: true,
  });
  assert.equal(all.length, 2);
  assert.equal(all[0].issue.id, 'iss-1');

  const unblockedOnly = triageIssues([blockedStaleIssue, starterIssue], {
    skills: ['TypeScript'],
    includeBlocked: false,
  });
  assert.equal(unblockedOnly.length, 1);
  assert.equal(unblockedOnly[0].issue.id, 'iss-1');
});

test('buildProposalSeedFromIssue generates pre-populated Proposal Studio seed', () => {
  const scored = scoreIssueForTriage(starterIssue, ['TypeScript']);
  const seed = buildProposalSeedFromIssue(scored);
  assert.ok(seed.projectTitle.includes(starterIssue.title));
  assert.equal(seed.sourceIssueUrl, starterIssue.issueUrl);
  assert.ok(seed.sections.summary.includes('contribo/web#1'));
});

test('GET /api/issues/triage filters by skills, tier, and includeBlocked', async () => {
  const apiLoader = sourceLoader({
    'next/server': {
      NextResponse: {
        json(data, init = {}) {
          return new Response(JSON.stringify(data), {
            status: init.status ?? 200,
            headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
          });
        },
      },
    },
    '@/lib/issues/repository': {
      CURATED_ISSUES: [starterIssue, blockedStaleIssue],
    },
    '@/lib/issues/triage-scorer': scorer,
  });

  const route = apiLoader('src/app/api/issues/triage/route.ts');

  const resAll = await route.GET(
    new Request('http://localhost/api/issues/triage?skills=typescript,react')
  );
  assert.equal(resAll.status, 200);
  const bodyAll = await resAll.json();
  assert.equal(bodyAll.summary.total, 2);
  assert.equal(bodyAll.items[0].issue.id, 'iss-1');

  const resFiltered = await route.GET(
    new Request('http://localhost/api/issues/triage?skills=typescript&includeBlocked=false&tier=Starter+Friendly')
  );
  assert.equal(resFiltered.status, 200);
  const bodyFiltered = await resFiltered.json();
  assert.equal(bodyFiltered.items.length, 1);
  assert.equal(bodyFiltered.items[0].tier, 'Starter Friendly');
});
