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
      const target = ['.ts', '.tsx', '.mjs', '.js'].map((ext) => base + ext).find(fs.existsSync);
      assert.ok(target, `Cannot resolve module ${id}`);
      return load(target);
    };
    vm.runInThisContext(`(function(require, module, exports) {\n${compiled}\n})`, {
      filename: resolved,
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}

const dbMock = {
  getDb: async () => null, // in-memory fallback
};

const loader = sourceLoader({
  '@/lib/db': dbMock,
  '../db': dbMock,
});

const {
  validateSkillTreeGraph,
  topologicalSort,
  canUnlockNode,
  evaluateNodeStatuses,
  calculateSkillProgress,
} = loader('src/lib/skill-tree/engine.ts');

const {
  GSOC_SKILL_TREE,
  LFX_SKILL_TREE,
  OUTREACHY_SKILL_TREE,
  getOrGenerateSkillTree,
} = loader('src/lib/skill-tree/default-trees.ts');

const {
  getProgramSkillTree,
  getUserSkillProgress,
  updateUserNodeProgress,
  resetSkillTreeMemoryStore,
} = loader('src/lib/repositories/skill-tree.ts');

test.beforeEach(() => {
  resetSkillTreeMemoryStore();
});

test('1. DAG validation and Kahn algorithm cycle detection', async (t) => {
  await t.test('accepts valid acyclic graphs', () => {
    const validGraph = {
      programSlug: 'test',
      programName: 'Test Program',
      description: 'Test',
      badgeName: 'Test Badge',
      totalXp: 300,
      nodes: [
        { id: 'node_a', title: 'A', prerequisites: [], xp: 100 },
        { id: 'node_b', title: 'B', prerequisites: ['node_a'], xp: 100 },
        { id: 'node_c', title: 'C', prerequisites: ['node_b'], xp: 100 },
      ],
      edges: [],
    };

    const res = validateSkillTreeGraph(validGraph);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
  });

  await t.test('catches direct cycles (A -> B -> A)', () => {
    const cyclicGraph = {
      programSlug: 'test',
      programName: 'Test Program',
      description: 'Test',
      badgeName: 'Test Badge',
      totalXp: 200,
      nodes: [
        { id: 'node_a', title: 'A', prerequisites: ['node_b'], xp: 100 },
        { id: 'node_b', title: 'B', prerequisites: ['node_a'], xp: 100 },
      ],
      edges: [],
    };

    const res = validateSkillTreeGraph(cyclicGraph);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('Circular dependency')));
  });

  await t.test('catches self-referencing loops (A -> A)', () => {
    const selfLoopGraph = {
      programSlug: 'test',
      nodes: [
        { id: 'node_a', title: 'A', prerequisites: ['node_a'], xp: 100 },
      ],
      edges: [],
    };

    const res = validateSkillTreeGraph(selfLoopGraph);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('cannot depend on itself')));
  });

  await t.test('catches non-existent prerequisite IDs', () => {
    const brokenGraph = {
      programSlug: 'test',
      nodes: [
        { id: 'node_a', title: 'A', prerequisites: ['ghost_node'], xp: 100 },
      ],
      edges: [],
    };

    const res = validateSkillTreeGraph(brokenGraph);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.includes('specifies non-existent prerequisite')));
  });
});

test('2. Topological sort ordering', async (t) => {
  await t.test('orders nodes so prerequisites strictly precede dependents', () => {
    const graph = {
      programSlug: 'test',
      nodes: [
        { id: 'c', prerequisites: ['b'], xp: 100 },
        { id: 'a', prerequisites: [], xp: 100 },
        { id: 'b', prerequisites: ['a'], xp: 100 },
      ],
      edges: [],
    };

    const order = topologicalSort(graph);
    assert.deepEqual(order, ['a', 'b', 'c']);
  });

  await t.test('throws when topological sort encounters a cycle', () => {
    const cyclic = {
      programSlug: 'test',
      nodes: [
        { id: 'a', prerequisites: ['b'], xp: 100 },
        { id: 'b', prerequisites: ['a'], xp: 100 },
      ],
      edges: [],
    };

    assert.throws(() => topologicalSort(cyclic), /contains a cycle/);
  });
});

test('3. Prerequisite gating and node state evaluation', async (t) => {
  const sampleGraph = {
    programSlug: 'test',
    nodes: [
      { id: 'git', title: 'Git', prerequisites: [], xp: 100, tier: 'FOUNDATION' },
      { id: 'tests', title: 'Tests', prerequisites: ['git'], xp: 100, tier: 'TOOLCHAIN' },
      { id: 'pr', title: 'PR', prerequisites: ['tests'], xp: 100, tier: 'DOMAIN' },
    ],
    edges: [],
  };

  await t.test('evaluates root nodes as AVAILABLE and children as LOCKED initially', () => {
    const statuses = evaluateNodeStatuses(sampleGraph, new Set());
    assert.equal(statuses['git'], 'AVAILABLE');
    assert.equal(statuses['tests'], 'LOCKED');
    assert.equal(statuses['pr'], 'LOCKED');
    assert.equal(canUnlockNode(sampleGraph.nodes[0], new Set()), true);
    assert.equal(canUnlockNode(sampleGraph.nodes[1], new Set()), false);
  });

  await t.test('unlocks child node to AVAILABLE once parent is MASTERED', () => {
    const statuses = evaluateNodeStatuses(sampleGraph, new Set(['git']));
    assert.equal(statuses['git'], 'MASTERED');
    assert.equal(statuses['tests'], 'AVAILABLE');
    assert.equal(statuses['pr'], 'LOCKED');
  });

  await t.test('evaluates all as MASTERED when completed set contains all nodes', () => {
    const statuses = evaluateNodeStatuses(sampleGraph, new Set(['git', 'tests', 'pr']));
    assert.equal(statuses['git'], 'MASTERED');
    assert.equal(statuses['tests'], 'MASTERED');
    assert.equal(statuses['pr'], 'MASTERED');
  });
});

test('4. Progress metrics, XP accumulation, and badge unlock', async (t) => {
  const sampleGraph = {
    programSlug: 'test',
    totalXp: 400,
    nodes: [
      { id: 'n1', xp: 100, tier: 'FOUNDATION', prerequisites: [] },
      { id: 'n2', xp: 100, tier: 'TOOLCHAIN', prerequisites: ['n1'] },
      { id: 'n3', xp: 100, tier: 'DOMAIN', prerequisites: ['n2'] },
      { id: 'n4', xp: 100, tier: 'CAPSTONE', prerequisites: ['n3'] },
    ],
    edges: [],
  };

  await t.test('computes 0% and 0 XP for empty progress', () => {
    const metrics = calculateSkillProgress(sampleGraph, {});
    assert.equal(metrics.earnedXp, 0);
    assert.equal(metrics.totalXp, 400);
    assert.equal(metrics.completionPercentage, 0);
    assert.equal(metrics.badgeUnlocked, false);
  });

  await t.test('computes 50% for 2 completed nodes and keeps badge locked', () => {
    const metrics = calculateSkillProgress(sampleGraph, {
      n1: { status: 'MASTERED' },
      n2: { status: 'MASTERED' },
    });
    assert.equal(metrics.earnedXp, 200);
    assert.equal(metrics.completionPercentage, 50);
    assert.equal(metrics.badgeUnlocked, false);
  });

  await t.test('unlocks badge when completion reaches >= 75%', () => {
    const metrics = calculateSkillProgress(sampleGraph, {
      n1: { status: 'MASTERED' },
      n2: { status: 'MASTERED' },
      n3: { status: 'MASTERED' },
    });
    assert.equal(metrics.earnedXp, 300);
    assert.equal(metrics.completionPercentage, 75);
    assert.equal(metrics.badgeUnlocked, true);
  });
});

test('5. Curated program skill trees validity', async (t) => {
  await t.test('validates GSoC, LFX, and Outreachy default trees as 100% acyclic DAGs', () => {
    for (const tree of [GSOC_SKILL_TREE, LFX_SKILL_TREE, OUTREACHY_SKILL_TREE]) {
      const res = validateSkillTreeGraph(tree);
      assert.equal(res.valid, true, `Tree for ${tree.programSlug} should be valid`);
      assert.equal(res.errors.length, 0);
      assert.ok(tree.nodes.length >= 4);
      assert.ok(tree.totalXp > 0);
    }
  });

  await t.test('dynamic generator synthesizes valid 4-tier DAG for arbitrary slug', () => {
    const dyn = getOrGenerateSkillTree('season-of-kde', 'Season of KDE');
    assert.equal(dyn.programSlug, 'season-of-kde');
    const res = validateSkillTreeGraph(dyn);
    assert.equal(res.valid, true);
  });
});

test('6. Repository persistence & prerequisite tampering guardrails', async (t) => {
  await t.test('initializes progress and rejects mastering a locked node', async () => {
    const tree = await getProgramSkillTree('gsoc');
    assert.ok(tree.nodes.length > 0);

    const progress = await getUserSkillProgress('usr_alice', 'gsoc');
    assert.equal(progress.userId, 'usr_alice');
    assert.equal(progress.programSlug, 'gsoc');
    assert.equal(progress.earnedXp, 0);

    // Attempt to master a DOMAIN node directly without mastering FOUNDATION or TOOLCHAIN
    const tamperRes = await updateUserNodeProgress({
      userId: 'usr_alice',
      programSlug: 'gsoc',
      nodeId: 'gsoc:first-pull-request',
      status: 'MASTERED',
      evidenceUrl: 'https://github.com/org/repo/pull/1',
    });

    assert.equal(tamperRes.success, false);
    assert.ok(tamperRes.error?.includes('Prerequisite skills are not yet mastered'));
  });

  await t.test('allows mastering unlocked nodes sequentially and advances state', async () => {
    // 1. Master root node gsoc:git-conventions
    const step1 = await updateUserNodeProgress({
      userId: 'usr_bob',
      programSlug: 'gsoc',
      nodeId: 'gsoc:git-conventions',
      status: 'MASTERED',
    });
    assert.equal(step1.success, true);
    assert.ok(step1.progress?.completedNodeIds.includes('gsoc:git-conventions'));
    assert.ok(step1.progress?.availableNodeIds.includes('gsoc:local-environment'));

    // 2. Local environment requires git-conventions (now mastered), so it should succeed
    const step2 = await updateUserNodeProgress({
      userId: 'usr_bob',
      programSlug: 'gsoc',
      nodeId: 'gsoc:local-environment',
      status: 'MASTERED',
    });
    assert.equal(step2.success, true);
    assert.ok(step2.progress?.completedNodeIds.includes('gsoc:local-environment'));
  });

  await t.test('enforces valid URL evidence when verification requires pr_link', async () => {
    // Fulfill prerequisites first
    await updateUserNodeProgress({ userId: 'usr_carol', programSlug: 'gsoc', nodeId: 'gsoc:git-conventions', status: 'MASTERED' });
    await updateUserNodeProgress({ userId: 'usr_carol', programSlug: 'gsoc', nodeId: 'gsoc:community-etiquette', status: 'MASTERED' });
    await updateUserNodeProgress({ userId: 'usr_carol', programSlug: 'gsoc', nodeId: 'gsoc:local-environment', status: 'MASTERED' });
    await updateUserNodeProgress({ userId: 'usr_carol', programSlug: 'gsoc', nodeId: 'gsoc:issue-triage', status: 'MASTERED' });

    // Missing evidenceUrl for pr_link node
    const missingEvidence = await updateUserNodeProgress({
      userId: 'usr_carol',
      programSlug: 'gsoc',
      nodeId: 'gsoc:first-pull-request',
      status: 'MASTERED',
      evidenceUrl: '',
    });
    assert.equal(missingEvidence.success, false);
    assert.ok(missingEvidence.error?.includes('A valid http(s) pull request or commit URL is required'));

    // Valid evidenceUrl succeeds
    const validEvidence = await updateUserNodeProgress({
      userId: 'usr_carol',
      programSlug: 'gsoc',
      nodeId: 'gsoc:first-pull-request',
      status: 'MASTERED',
      evidenceUrl: 'https://github.com/subhranshudash13-dotcom/Contribo/pull/180',
    });
    assert.equal(validEvidence.success, true);
    assert.ok(validEvidence.progress?.completedNodeIds.includes('gsoc:first-pull-request'));
  });
});
