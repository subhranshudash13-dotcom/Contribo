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
const syncLib = load('src/lib/github/activity-sync.ts');

const {
  isTargetOrganization,
  evaluateAutoVerifiedMilestones,
  calculateActivityStats,
  checkSyncCooldown,
  recordSyncExecution,
  parseGitHubActivityPayload,
  getDemoActivity,
  VERIFIED_ECOSYSTEM_ORGS,
} = syncLib;

test('1. Organization Matching Engine', async (t) => {
  await t.test('identifies verified ecosystem organizations from repository full name', () => {
    const apacheMatch = isTargetOrganization('apache/airflow');
    assert.equal(apacheMatch.isTarget, true);
    assert.equal(apacheMatch.matchedName, 'Apache Software Foundation');

    const cncfMatch = isTargetOrganization('cncf/curator');
    assert.equal(cncfMatch.isTarget, true);
    assert.equal(cncfMatch.matchedName, 'Cloud Native Computing Foundation (CNCF)');

    const k8sMatch = isTargetOrganization('kubernetes/client-go');
    assert.equal(k8sMatch.isTarget, true);
    assert.equal(k8sMatch.matchedName, 'Kubernetes');
  });

  await t.test('matches customized target organizations saved by user', () => {
    const userTargetOrgs = [
      { name: 'Custom Foundation', slug: 'custom-org' },
      { name: 'Open Web Project', slug: 'open-web' },
    ];

    const match = isTargetOrganization('custom-org/core-api', userTargetOrgs);
    assert.equal(match.isTarget, true);
    assert.equal(match.matchedName, 'Custom Foundation');
  });

  await t.test('rejects unverified personal or unrelated repositories', () => {
    const personal = isTargetOrganization('randomuser123/my-hobby-repo');
    assert.equal(personal.isTarget, false);
    assert.equal(personal.matchedName, undefined);
  });

  await t.test('handles empty or malformed repository names gracefully', () => {
    assert.equal(isTargetOrganization('').isTarget, false);
    assert.equal(isTargetOrganization(null).isTarget, false);
  });
});

test('2. GitHub Activity Payload Parsing', async (t) => {
  await t.test('normalizes REST search API items into uniform contribution records', () => {
    const rawPayload = {
      items: [
        {
          id: 101,
          title: 'fix(core): resolve webhook connection drop',
          html_url: 'https://github.com/apache/airflow/pull/101',
          repository: 'apache/airflow',
          state: 'closed',
          merged: true,
          additions: 120,
          deletions: 15,
          created_at: '2026-02-10T12:00:00Z',
          merged_at: '2026-02-11T15:30:00Z',
        },
        {
          id: 102,
          title: 'feat: add metrics endpoint',
          html_url: 'https://github.com/my-org/project/pull/102',
          repository: 'my-org/project',
          state: 'open',
          additions: 45,
          deletions: 2,
          created_at: '2026-02-12T09:00:00Z',
        },
      ],
    };

    const items = parseGitHubActivityPayload(rawPayload);
    assert.equal(items.length, 2);

    assert.equal(items[0].id, '101');
    assert.equal(items[0].state, 'MERGED');
    assert.equal(items[0].isTargetOrg, true);
    assert.equal(items[0].repository, 'apache/airflow');
    assert.equal(items[0].additions, 120);

    assert.equal(items[1].id, '102');
    assert.equal(items[1].state, 'OPEN');
    assert.equal(items[1].isTargetOrg, false);
  });

  await t.test('handles empty, non-array, or invalid payloads without throwing', () => {
    assert.deepEqual(parseGitHubActivityPayload(null), []);
    assert.deepEqual(parseGitHubActivityPayload({}), []);
    assert.deepEqual(parseGitHubActivityPayload('invalid string'), []);
  });
});

test('3. Auto-Verification of Application Milestones', async (t) => {
  await t.test('awards "First PR Opened" milestone when items exist', () => {
    const items = [
      {
        id: '1',
        type: 'pull_request',
        title: 'docs: update readme',
        url: 'https://github.com/test/test/pull/1',
        repository: 'test/test',
        orgHandle: 'test',
        state: 'OPEN',
        additions: 10,
        deletions: 0,
        createdAt: '2026-01-01',
        isTargetOrg: false,
      },
    ];

    const result = evaluateAutoVerifiedMilestones(items);
    assert.ok(result.milestones.includes('First PR Opened'));
    assert.equal(result.scoreBonus >= 10, true);
  });

  await t.test('awards "First PR Merged" and "Target Organization Contribution" when target org PR is merged', () => {
    const items = [
      {
        id: '2',
        type: 'pull_request',
        title: 'feat: add caching',
        url: 'https://github.com/apache/airflow/pull/2',
        repository: 'apache/airflow',
        orgHandle: 'apache',
        state: 'MERGED',
        additions: 150,
        deletions: 20,
        createdAt: '2026-01-01',
        isTargetOrg: true,
      },
    ];

    const result = evaluateAutoVerifiedMilestones(items);
    assert.ok(result.milestones.includes('First PR Opened'));
    assert.ok(result.milestones.includes('First PR Merged'));
    assert.ok(result.milestones.includes('Target Organization Contribution'));
    assert.equal(result.scoreBonus >= 45, true);
  });

  await t.test('awards "Ecosystem Contributor" for 3 or more merged PRs', () => {
    const items = [1, 2, 3].map((i) => ({
      id: String(i),
      type: 'pull_request',
      title: `fix: issue ${i}`,
      url: `https://github.com/org/repo/pull/${i}`,
      repository: 'org/repo',
      orgHandle: 'org',
      state: 'MERGED',
      additions: 50,
      deletions: 10,
      createdAt: '2026-01-01',
      isTargetOrg: false,
    }));

    const result = evaluateAutoVerifiedMilestones(items);
    assert.ok(result.milestones.includes('Ecosystem Contributor (3+ Merged PRs)'));
  });
});

test('4. Rate Limit Cooldown Protection Engine', async (t) => {
  await t.test('user initially has no cooldown', () => {
    const status = checkSyncCooldown('testuser-never-synced');
    assert.equal(status.onCooldown, false);
    assert.equal(status.remainingSeconds, 0);
  });

  await t.test('recording a sync sets active cooldown for specified window', () => {
    const username = 'cooldown-test-user';
    recordSyncExecution(username);

    const status = checkSyncCooldown(username, 60000); // 60s cooldown window
    assert.equal(status.onCooldown, true);
    assert.ok(status.remainingSeconds > 0 && status.remainingSeconds <= 60);
  });

  await t.test('normalizes username casing and symbols in cooldown tracking', () => {
    recordSyncExecution('@CoolUser');
    const check1 = checkSyncCooldown('cooluser');
    const check2 = checkSyncCooldown('@CoolUser');

    assert.equal(check1.onCooldown, true);
    assert.equal(check2.onCooldown, true);
  });
});

test('5. Summary Metrics Calculations', async (t) => {
  await t.test('computes exact aggregate sums for lines changed and PR status counts', () => {
    const items = [
      {
        id: '1',
        type: 'pull_request',
        title: 'PR 1',
        url: '',
        repository: 'apache/airflow',
        orgHandle: 'apache',
        state: 'MERGED',
        additions: 100,
        deletions: 20,
        createdAt: '2026-01-01',
        isTargetOrg: true,
      },
      {
        id: '2',
        type: 'pull_request',
        title: 'PR 2',
        url: '',
        repository: 'random/repo',
        orgHandle: 'random',
        state: 'OPEN',
        additions: 50,
        deletions: 10,
        createdAt: '2026-01-02',
        isTargetOrg: false,
      },
    ];

    const stats = calculateActivityStats(items, false);
    assert.equal(stats.totalCount, 2);
    assert.equal(stats.mergedCount, 1);
    assert.equal(stats.openCount, 1);
    assert.equal(stats.targetOrgCount, 1);
    assert.equal(stats.totalLinesChanged, 180);
    assert.equal(stats.cached, false);
  });
});
