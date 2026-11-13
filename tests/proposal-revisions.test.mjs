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
const proposalsRepo = load('src/lib/repositories/proposals.ts');

const {
  computeSectionsMetrics,
  createProposalRevision,
  listProposalRevisions,
  getProposalRevisionById,
  restoreProposalRevision,
  maybeRecordAutosaveRevision,
  createProposal,
  updateProposal,
  MAX_REVISIONS_PER_PROPOSAL,
} = proposalsRepo;

test('1. computeSectionsMetrics character and word calculations', async (t) => {
  await t.test('calculates accurate word and character counts across sections', () => {
    const sections = {
      summary: 'This is a technical proposal summary.',
      architecture: 'Clean architecture with modular TypeScript interfaces and tests.',
    };

    const metrics = computeSectionsMetrics(sections);
    assert.equal(metrics.wordCount, 6 + 8);
    assert.equal(metrics.characterCount, sections.summary.length + sections.architecture.length);
  });

  await t.test('handles empty or blank sections safely without throwing', () => {
    const metrics = computeSectionsMetrics({});
    assert.equal(metrics.wordCount, 0);
    assert.equal(metrics.characterCount, 0);
  });
});

test('2. Proposal Revision Creation & Bounded Storage', async (t) => {
  const userId = `user-rev-${Date.now()}`;
  const proposal = await createProposal({
    projectTitle: 'Revision Time-Machine Proposal',
    orgName: 'Contribo Community',
    userId,
  });

  await t.test('creates manual snapshot with label and metadata', async () => {
    const rev = await createProposalRevision({
      proposalId: proposal.id,
      userId,
      source: 'manual_snapshot',
      label: 'Initial Architecture Outline',
      sections: {
        summary: 'Draft for community review.',
        architecture: 'Microservices architecture with REST APIs.',
      },
    });

    assert.ok(rev.id.startsWith('rev-'));
    assert.equal(rev.proposalId, proposal.id);
    assert.equal(rev.userId, userId);
    assert.equal(rev.source, 'manual_snapshot');
    assert.equal(rev.label, 'Initial Architecture Outline');
    assert.ok(rev.wordCount > 0);
    assert.ok(rev.characterCount > 0);
    assert.equal(rev.sections.summary, 'Draft for community review.');
  });

  await t.test('bounds total revisions per proposal to MAX_REVISIONS_PER_PROPOSAL (20)', async () => {
    for (let i = 1; i <= 25; i++) {
      await createProposalRevision({
        proposalId: proposal.id,
        userId,
        source: 'autosave_checkpoint',
        label: `Autosave Checkpoint #${i}`,
        sections: {
          summary: `Summary iteration version ${i}`,
        },
      });
    }

    const list = await listProposalRevisions(proposal.id, userId, 50);
    assert.ok(
      list.length <= MAX_REVISIONS_PER_PROPOSAL,
      `Revision count (${list.length}) must not exceed MAX_REVISIONS_PER_PROPOSAL (${MAX_REVISIONS_PER_PROPOSAL})`
    );
  });
});

test('3. Owner-Scoped Authorization Guardrails', async (t) => {
  const ownerId = `owner-${Date.now()}`;
  const attackerId = `attacker-${Date.now()}`;

  const proposal = await createProposal({
    projectTitle: 'Secure Proposal',
    orgName: 'Security Guild',
    userId: ownerId,
  });

  const rev = await createProposalRevision({
    proposalId: proposal.id,
    userId: ownerId,
    source: 'manual_snapshot',
    label: 'Secret Spec',
    sections: {
      summary: 'Confidential project plan.',
    },
  });

  await t.test('attacker cannot list owner revisions', async () => {
    const list = await listProposalRevisions(proposal.id, attackerId);
    assert.equal(list.length, 0);
  });

  await t.test('attacker cannot view full revision details', async () => {
    const detail = await getProposalRevisionById(proposal.id, rev.id, attackerId);
    assert.equal(detail, null);
  });

  await t.test('attacker cannot trigger rollback of owner proposal', async () => {
    const rollback = await restoreProposalRevision(proposal.id, rev.id, attackerId);
    assert.equal(rollback, null);
  });
});

test('4. Atomic Non-Destructive Rollback Engine', async (t) => {
  const userId = `rollback-user-${Date.now()}`;
  const proposal = await createProposal({
    projectTitle: 'Rollback Test Project',
    orgName: 'Contribo Ops',
    userId,
  });

  // State 1: Stable v1
  const v1 = await createProposalRevision({
    proposalId: proposal.id,
    userId,
    source: 'manual_snapshot',
    label: 'Stable V1',
    sections: {
      summary: 'Stable Version 1 content.',
      architecture: 'Monolith with clear boundaries.',
    },
  });

  // State 2: Edit proposal in active workspace
  await updateProposal(proposal.id, userId, {
    sections: {
      summary: 'Accidental override or corrupted text in editor.',
      architecture: 'Broken state.',
    },
  });

  // Execute Rollback to V1
  const rollbackResult = await restoreProposalRevision(proposal.id, v1.id, userId);

  assert.ok(rollbackResult, 'Rollback result must be non-null');
  assert.equal(
    rollbackResult.proposal.sections.summary,
    'Stable Version 1 content.',
    'Active proposal must be restored to V1 summary'
  );
  assert.equal(
    rollbackResult.proposal.sections.architecture,
    'Monolith with clear boundaries.',
    'Active proposal must be restored to V1 architecture'
  );

  // Verify non-destructive pre-rollback safety backup was recorded
  assert.ok(rollbackResult.backupRevision, 'Safety backup revision must be created');
  assert.equal(rollbackResult.backupRevision.source, 'pre_rollback_backup');
  assert.equal(
    rollbackResult.backupRevision.sections.summary,
    'Accidental override or corrupted text in editor.',
    'Pre-rollback backup must preserve the overwritten draft state'
  );
});

test('5. Autosave Snapshot Throttling', async (t) => {
  const userId = `throttle-user-${Date.now()}`;
  const proposal = await createProposal({
    projectTitle: 'Throttle Test',
    orgName: 'Contribo Lab',
    userId,
  });

  // Verify initial revision exists from proposal creation
  const existing = await listProposalRevisions(proposal.id, userId, 10);
  assert.equal(existing.length, 1, 'Proposal creation should record initial revision');

  // Small change (< 150 chars diff) immediately after should be throttled
  const minor = await maybeRecordAutosaveRevision(proposal.id, userId, {
    summary: 'Initial brief draft. With minor typo fix.',
  });
  assert.equal(minor, null, 'Minor edit under 150 characters diff must be throttled');

  // Substantial change (>= 150 chars diff) should create a new revision
  const substantialText = 'Extensive architectural proposal details and system design. '.repeat(10);
  const substantial = await maybeRecordAutosaveRevision(proposal.id, userId, {
    summary: substantialText,
  });
  assert.ok(substantial, 'Substantial edit >= 150 characters diff must create a new checkpoint');
  assert.equal(substantial.source, 'autosave_checkpoint');
});

test('6. REST API Endpoints Route Verification', async (t) => {
  const userId = `api-user-${Date.now()}`;
  const proposal = await createProposal({
    projectTitle: 'API Route Test Proposal',
    orgName: 'Contribo Platform',
    userId,
  });

  // Mock authenticated user session
  const mockApi = {
    requireUserId: async () => ({ userId }),
    requireUserMutation: async () => ({ userId }),
    apiOk: (data, status = 200, headers = {}) => ({ status, data, headers }),
    apiError: (message, status = 400) => ({ status, error: message }),
    isNextResponse: () => false,
    parseMutationBody: async (req) => req.json(),
    privateNoStoreHeaders: () => ({ 'Cache-Control': 'no-store' }),
  };

  const apiLoader = sourceLoader({
    '@/lib/api': mockApi,
    '@/lib/repositories/proposals': proposalsRepo,
    '@/lib/security': { safeLogError: () => {} },
  });

  const revisionsRoute = apiLoader('src/app/api/proposals/[id]/revisions/route.ts');
  const singleRevisionRoute = apiLoader('src/app/api/proposals/[id]/revisions/[revisionId]/route.ts');
  const restoreRoute = apiLoader('src/app/api/proposals/[id]/revisions/[revisionId]/restore/route.ts');

  await t.test('POST /api/proposals/[id]/revisions creates checkpoint', async () => {
    const req = {
      json: async () => ({
        label: 'Milestone 1 Spec',
        sections: { summary: 'API created snapshot.' },
      }),
    };
    const res = await revisionsRoute.POST(req, { params: Promise.resolve({ id: proposal.id }) });
    assert.equal(res.status, 201);
    assert.equal(res.data.revision.label, 'Milestone 1 Spec');
    assert.equal(res.data.revision.sections.summary, 'API created snapshot.');
  });

  await t.test('GET /api/proposals/[id]/revisions lists revisions', async () => {
    const res = await revisionsRoute.GET({}, { params: Promise.resolve({ id: proposal.id }) });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.revisions));
    assert.ok(res.data.revisions.length >= 2);
  });

  await t.test('GET /api/proposals/[id]/revisions/[revisionId] fetches detailed snapshot', async () => {
    const listRes = await revisionsRoute.GET({}, { params: Promise.resolve({ id: proposal.id }) });
    const targetRev = listRes.data.revisions[0];

    const detailRes = await singleRevisionRoute.GET({}, {
      params: Promise.resolve({ id: proposal.id, revisionId: targetRev.id }),
    });
    assert.equal(detailRes.status, 200);
    assert.equal(detailRes.data.revision.id, targetRev.id);
    assert.ok(detailRes.data.revision.sections);
  });

  await t.test('POST /api/proposals/[id]/revisions/[revisionId]/restore rolls back draft', async () => {
    const listRes = await revisionsRoute.GET({}, { params: Promise.resolve({ id: proposal.id }) });
    const targetRev = listRes.data.revisions[0];

    const restoreRes = await restoreRoute.POST({}, {
      params: Promise.resolve({ id: proposal.id, revisionId: targetRev.id }),
    });
    assert.equal(restoreRes.status, 200);
    assert.equal(restoreRes.data.message, 'Proposal draft restored successfully');
    assert.ok(restoreRes.data.proposal);
    assert.ok(restoreRes.data.backupRevision);
  });
});
