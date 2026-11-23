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
const liveEngine = load('src/lib/proposal-live/engine.ts');
const liveRepo = load('src/lib/repositories/proposal-live.ts');

test('Proposal Live Collaborative Editing & Presence Radar Suite', async (t) => {
  t.beforeEach(() => {
    liveRepo._resetMemoryCollabState();
  });

  await t.test('1. Deterministic Presence Colors & Participant Update', () => {
    const color1 = liveEngine.getParticipantColor('user_123');
    const color2 = liveEngine.getParticipantColor('user_123');
    const color3 = liveEngine.getParticipantColor('mentor_abc');

    assert.equal(color1, color2, 'Same user ID produces identical color');
    assert.match(color1, /^#[0-9a-f]{6}$/i, 'Color must be valid hex');
    assert.match(color3, /^#[0-9a-f]{6}$/i, 'Color must be valid hex');

    const baseList = [];
    const now = 1700000000000;
    const updated = liveEngine.updatePresenceList(
      baseList,
      {
        userId: 'user_alice',
        name: 'Alice',
        role: 'contributor',
        status: 'typing',
        activeSection: 'architecture',
      },
      now,
      15000
    );

    assert.equal(updated.length, 1);
    assert.equal(updated[0].userId, 'user_alice');
    assert.equal(updated[0].status, 'typing');
    assert.equal(updated[0].activeSection, 'architecture');
  });

  await t.test('2. Heartbeat Stale Pruning', () => {
    const now = 1700000000000;
    const list = [
      {
        userId: 'user_stale',
        name: 'Stale User',
        role: 'contributor',
        status: 'idle',
        activeSection: 'summary',
        lastHeartbeat: new Date(now - 20000).toISOString(), // 20s ago (exceeds 15s)
        color: '#3b82f6',
      },
      {
        userId: 'user_active',
        name: 'Active User',
        role: 'mentor',
        status: 'viewing',
        activeSection: 'timeline',
        lastHeartbeat: new Date(now - 5000).toISOString(), // 5s ago
        color: '#10b981',
      },
    ];

    const pruned = liveEngine.updatePresenceList(
      list,
      {
        userId: 'user_new',
        name: 'New User',
        role: 'contributor',
        status: 'viewing',
        activeSection: 'deliverables',
      },
      now,
      15000
    );

    assert.equal(pruned.length, 2, 'Stale user must be pruned');
    assert.ok(pruned.some((p) => p.userId === 'user_active'));
    assert.ok(pruned.some((p) => p.userId === 'user_new'));
    assert.ok(!pruned.some((p) => p.userId === 'user_stale'));
  });

  await t.test('3. Section Lock Acquisition & Collision Rejection', () => {
    const locks = {};
    const now = 1700000000000;

    // First user acquires lock
    const res1 = liveEngine.acquireSectionLock(
      locks,
      {
        proposalId: 'prop_test_1',
        sectionId: 'architecture',
        userId: 'user_bob',
        userName: 'Bob',
      },
      now,
      30000
    );

    assert.equal(res1.ok, true);
    locks['architecture'] = res1.lock;

    // Second user tries to acquire the same active lock -> rejected
    const res2 = liveEngine.acquireSectionLock(
      locks,
      {
        proposalId: 'prop_test_1',
        sectionId: 'architecture',
        userId: 'user_charlie',
        userName: 'Charlie',
      },
      now + 5000,
      30000
    );

    assert.equal(res2.ok, false);
    assert.match(res2.error, /locked by Bob/);

    // Same user renews lock -> allowed
    const res3 = liveEngine.acquireSectionLock(
      locks,
      {
        proposalId: 'prop_test_1',
        sectionId: 'architecture',
        userId: 'user_bob',
        userName: 'Bob',
      },
      now + 10000,
      30000
    );

    assert.equal(res3.ok, true);
  });

  await t.test('4. Section Lock Expiration & Explicit Release', () => {
    const locks = {};
    const now = 1700000000000;

    const res = liveEngine.acquireSectionLock(
      locks,
      {
        proposalId: 'prop_test_1',
        sectionId: 'summary',
        userId: 'user_dave',
        userName: 'Dave',
      },
      now,
      10000 // expires in 10s
    );
    locks['summary'] = res.lock;

    // Non-owner cannot release before expiry
    const nonOwnerRelease = liveEngine.releaseSectionLock(locks, 'summary', 'user_other', now + 2000);
    assert.equal(nonOwnerRelease.ok, false);

    // Owner can release
    const ownerRelease = liveEngine.releaseSectionLock(locks, 'summary', 'user_dave', now + 3000);
    assert.equal(ownerRelease.ok, true);
    assert.equal(locks['summary'], undefined);

    // New lock after expiry
    locks['summary'] = res.lock;
    const isLockedPastExpiry = liveEngine.isSectionLocked(locks['summary'], now + 15000);
    assert.equal(isLockedPastExpiry, false, 'Lock must be recognized as expired');
  });

  await t.test('5. Section Content Patch & Revision History', () => {
    const sections = { architecture: 'Initial architecture text' };
    const revisions = [];
    const now = 1700000000000;

    const { revision, delta } = liveEngine.applySectionPatch(
      sections,
      revisions,
      {
        proposalId: 'prop_test_1',
        sectionId: 'architecture',
        content: 'Initial architecture text with distributed worker nodes.',
        authorId: 'user_eve',
        authorName: 'Eve',
      },
      now
    );

    assert.equal(sections.architecture, 'Initial architecture text with distributed worker nodes.');
    assert.equal(revisions.length, 1);
    assert.equal(revision.sectionId, 'architecture');
    assert.equal(revision.authorName, 'Eve');
    assert.ok(delta > 0);
    assert.match(revision.summary, /\+\d+ chars/);
  });

  await t.test('6. Rollback to Prior Revision', () => {
    const sections = { architecture: 'Initial' };
    const revisions = [];
    const now = 1700000000000;

    const rev1 = liveEngine.applySectionPatch(
      sections,
      revisions,
      {
        proposalId: 'prop_test_1',
        sectionId: 'architecture',
        content: 'First revision content',
        authorId: 'user_1',
        authorName: 'User 1',
      },
      now
    ).revision;

    liveEngine.applySectionPatch(
      sections,
      revisions,
      {
        proposalId: 'prop_test_1',
        sectionId: 'architecture',
        content: 'Second broken revision content',
        authorId: 'user_2',
        authorName: 'User 2',
      },
      now + 5000
    );

    assert.equal(sections.architecture, 'Second broken revision content');

    // Rollback to first revision
    const rollbackRes = liveEngine.rollbackSectionRevision(
      sections,
      revisions,
      rev1.revisionId,
      'user_admin',
      'Admin',
      now + 10000
    );

    assert.equal(rollbackRes.ok, true);
    assert.equal(sections.architecture, 'First revision content');
    assert.equal(revisions.length, 3);
  });

  await t.test('7. Reviewer Feedback Pings & Resolution', () => {
    const pings = [];
    const now = 1700000000000;

    const ping = liveEngine.addFeedbackPing(
      pings,
      {
        proposalId: 'prop_test_1',
        sectionId: 'timeline',
        authorId: 'mentor_marcus',
        authorName: 'Marcus Vance',
        authorRole: 'mentor',
        selectedText: 'Weeks 3-5',
        message: 'Consider allocating 1 additional week for load testing.',
      },
      now
    );

    assert.equal(pings.length, 1);
    assert.equal(ping.status, 'open');
    assert.equal(ping.authorRole, 'mentor');

    const updateRes = liveEngine.updateFeedbackPingStatus(pings, ping.id, 'resolved');
    assert.equal(updateRes.ok, true);
    assert.equal(pings[0].status, 'resolved');

    const notFound = liveEngine.updateFeedbackPingStatus(pings, 'ping_nonexistent', 'resolved');
    assert.equal(notFound.ok, false);
  });

  await t.test('8. Repository End-to-End Orchestration', async () => {
    const proposalId = 'test_repo_prop_99';
    const state = await liveRepo.getLiveState(proposalId);

    assert.equal(state.proposalId, proposalId);
    assert.ok(state.sections.summary);

    // Record heartbeat
    const participants = await liveRepo.recordHeartbeat({
      proposalId,
      userId: 'test_student',
      name: 'Test Student',
      status: 'typing',
      activeSection: 'timeline',
    });
    assert.ok(participants.some((p) => p.userId === 'test_student'));

    // Request lock
    const lockRes = await liveRepo.requestSectionLock({
      proposalId,
      sectionId: 'timeline',
      userId: 'test_student',
      userName: 'Test Student',
    });
    assert.equal(lockRes.ok, true);

    // Patch content
    const patchRes = await liveRepo.updateSectionContent({
      proposalId,
      sectionId: 'timeline',
      content: 'Milestone 1, 2, 3 scheduled.',
      authorId: 'test_student',
      authorName: 'Test Student',
    });
    assert.equal(patchRes.revision.sectionId, 'timeline');

    // Create and resolve ping
    const ping = await liveRepo.createPing({
      proposalId,
      sectionId: 'timeline',
      authorId: 'mentor_alex',
      authorName: 'Alex',
      authorRole: 'mentor',
      message: 'Looks good.',
    });
    assert.equal(ping.message, 'Looks good.');

    const statusRes = await liveRepo.updatePingStatus({
      proposalId,
      pingId: ping.id,
      status: 'resolved',
    });
    assert.equal(statusRes.ok, true);
  });
});
