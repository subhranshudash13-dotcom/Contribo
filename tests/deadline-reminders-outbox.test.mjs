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
  getDb: async () => null, // trigger memory fallback cleanly
};

const loader = sourceLoader({
  '@/lib/db': dbMock,
  '../db': dbMock,
});

const {
  calculateScheduledTime,
  isValidIsoDate,
  buildIdempotencyKey,
  generateOutboxJobsForSubscription,
  reconcileSubscriptionJobs,
  leaseDueJobs,
  executeOutboxJob,
} = loader('src/lib/reminders/scheduler.ts');

const {
  createReminderSubscription,
  getUserSubscriptions,
  cancelReminderSubscription,
  updateMilestoneDeadline,
  getUserDeliveryAudit,
  processOutboxQueue,
  resetRemindersMemoryStore,
  getInMemoryOutboxJobs,
} = loader('src/lib/repositories/reminders.ts');

test.beforeEach(() => {
  resetRemindersMemoryStore();
});

test('1. Schedule calculation & RFC-compliant ISO verification', async (t) => {
  await t.test('calculates correct trigger time for 7d, 2d, 24h, 2h offsets', () => {
    const deadline = '2026-05-01T18:00:00.000Z';
    const deadlineMs = Date.parse(deadline);

    const sched7d = calculateScheduledTime(deadline, '7d');
    assert.ok(sched7d);
    assert.equal(sched7d.getTime(), deadlineMs - 7 * 24 * 60 * 60 * 1000);

    const sched2d = calculateScheduledTime(deadline, '2d');
    assert.ok(sched2d);
    assert.equal(sched2d.getTime(), deadlineMs - 2 * 24 * 60 * 60 * 1000);

    const sched24h = calculateScheduledTime(deadline, '24h');
    assert.ok(sched24h);
    assert.equal(sched24h.getTime(), deadlineMs - 24 * 60 * 60 * 1000);

    const sched2h = calculateScheduledTime(deadline, '2h');
    assert.ok(sched2h);
    assert.equal(sched2h.getTime(), deadlineMs - 2 * 60 * 60 * 1000);
  });

  await t.test('rejects malformed, non-ISO or missing deadlines as unschedulable', () => {
    assert.equal(isValidIsoDate(''), false);
    assert.equal(isValidIsoDate(null), false);
    assert.equal(isValidIsoDate('not-a-date'), false);
    assert.equal(isValidIsoDate(undefined), false);

    assert.equal(calculateScheduledTime('invalid-date', '7d'), null);
    assert.equal(calculateScheduledTime('', '2d'), null);
  });
});

test('2. Idempotency key construction & duplicate avoidance', async (t) => {
  await t.test('generates deterministic idempotency keys for unique job identification', () => {
    const key1 = buildIdempotencyKey('user123', 'gsoc', 'gsoc:submit:0', '2d', '2026-03-31T18:00:00.000Z');
    const key2 = buildIdempotencyKey('user123', 'gsoc', 'gsoc:submit:0', '2d', '2026-03-31T18:00:00.000Z');
    const keyDifferentOffset = buildIdempotencyKey('user123', 'gsoc', 'gsoc:submit:0', '7d', '2026-03-31T18:00:00.000Z');

    assert.equal(key1, key2);
    assert.notEqual(key1, keyDifferentOffset);
    assert.ok(key1.includes('user123'));
    assert.ok(key1.includes('gsoc'));
    assert.ok(key1.includes('2d'));
  });
});

test('3. Future vs past offset filtering on generation', async (t) => {
  await t.test('only enqueues trigger offsets that are in the future relative to fake clock', () => {
    const fakeNow = new Date('2026-03-25T12:00:00.000Z');
    const deadline = '2026-03-31T18:00:00.000Z'; // ~6.25 days away

    const subscription = {
      id: 'sub_test_1',
      userId: 'usr_alpha',
      programSlug: 'gsoc',
      milestoneId: 'gsoc:proposal-final:0',
      milestoneLabel: 'Final Proposal Submission',
      deadline,
      offsets: ['7d', '2d', '24h', '2h'],
      notificationChannel: 'in_app',
      status: 'active',
      createdAt: fakeNow.toISOString(),
      updatedAt: fakeNow.toISOString(),
    };

    // 7d before deadline is 2026-03-24T18:00:00.000Z, which is in the PAST relative to fakeNow (March 25)!
    // 2d, 24h, 2h are in the FUTURE.
    const jobs = generateOutboxJobsForSubscription(subscription, fakeNow);

    assert.equal(jobs.length, 3);
    const scheduledOffsets = jobs.map((j) => j.offset);
    assert.ok(!scheduledOffsets.includes('7d'), 'Past 7d offset should not be scheduled');
    assert.ok(scheduledOffsets.includes('2d'));
    assert.ok(scheduledOffsets.includes('24h'));
    assert.ok(scheduledOffsets.includes('2h'));
  });
});

test('4. Atomic lease concurrency & worker isolation', async (t) => {
  await t.test('leases due jobs to worker 1 and prevents worker 2 from claiming concurrent lease', () => {
    const fakeNow = new Date('2026-03-30T10:00:00.000Z');
    const job = {
      id: 'job_due_1',
      idempotencyKey: 'key_due_1',
      subscriptionId: 'sub_1',
      userId: 'usr_1',
      programSlug: 'gsoc',
      milestoneId: 'm1',
      milestoneLabel: 'Proposal',
      offset: '24h',
      deadline: '2026-03-31T00:00:00.000Z',
      scheduledFor: '2026-03-30T00:00:00.000Z', // due 10 hours ago
      status: 'SCHEDULED',
      attempts: 0,
      maxAttempts: 3,
      leasedUntil: null,
      leaseId: null,
      lastError: null,
      sentAt: null,
      createdAt: fakeNow.toISOString(),
      updatedAt: fakeNow.toISOString(),
    };

    // Worker 1 claims lease
    const { leased: w1Leased, remaining } = leaseDueJobs([job], 'worker_1', 30_000, fakeNow);
    assert.equal(w1Leased.length, 1);
    assert.equal(w1Leased[0].status, 'LEASED');
    assert.equal(w1Leased[0].leaseId, 'worker_1');
    assert.equal(w1Leased[0].attempts, 1);

    // Worker 2 attempts to claim while lease is active
    const { leased: w2Leased } = leaseDueJobs(remaining, 'worker_2', 30_000, fakeNow);
    assert.equal(w2Leased.length, 0, 'Worker 2 must not claim job with active lease');

    // Fast-forward time past lease expiry (e.g. 45 seconds later)
    const laterNow = new Date(fakeNow.getTime() + 45_000);
    const { leased: w2ExpiredClaim } = leaseDueJobs(remaining, 'worker_2', 30_000, laterNow);
    assert.equal(w2ExpiredClaim.length, 1, 'Worker 2 should claim job once previous lease expired');
    assert.equal(w2ExpiredClaim[0].leaseId, 'worker_2');
    assert.equal(w2ExpiredClaim[0].attempts, 2);
  });
});

test('5. Execution lifecycle, retries, and audit logging', async (t) => {
  await t.test('successful delivery transitions job to SENT and records audit', async () => {
    const fakeNow = new Date('2026-03-30T10:00:00.000Z');
    const job = {
      id: 'job_exec_1',
      idempotencyKey: 'key_exec_1',
      subscriptionId: 'sub_1',
      userId: 'usr_owner',
      programSlug: 'gsoc',
      milestoneId: 'm1',
      milestoneLabel: 'Proposal',
      offset: '24h',
      deadline: '2026-03-31T00:00:00.000Z',
      scheduledFor: '2026-03-30T00:00:00.000Z',
      status: 'LEASED',
      attempts: 1,
      maxAttempts: 3,
      leasedUntil: null,
      leaseId: 'worker_1',
      lastError: null,
      sentAt: null,
      createdAt: fakeNow.toISOString(),
      updatedAt: fakeNow.toISOString(),
    };

    const { job: completedJob, auditRecord } = await executeOutboxJob(
      job,
      async () => true,
      fakeNow
    );

    assert.equal(completedJob.status, 'SENT');
    assert.equal(completedJob.sentAt, fakeNow.toISOString());
    assert.equal(completedJob.leaseId, null);
    assert.equal(auditRecord.status, 'SENT');
    assert.equal(auditRecord.userId, 'usr_owner');
  });

  await t.test('failed delivery retries until maxAttempts then marks FAILED', async () => {
    const fakeNow = new Date('2026-03-30T10:00:00.000Z');
    const job = {
      id: 'job_fail_1',
      idempotencyKey: 'key_fail_1',
      subscriptionId: 'sub_1',
      userId: 'usr_owner',
      programSlug: 'gsoc',
      milestoneId: 'm1',
      milestoneLabel: 'Proposal',
      offset: '24h',
      deadline: '2026-03-31T00:00:00.000Z',
      scheduledFor: '2026-03-30T00:00:00.000Z',
      status: 'LEASED',
      attempts: 2,
      maxAttempts: 3,
      leasedUntil: null,
      leaseId: 'worker_1',
      lastError: null,
      sentAt: null,
      createdAt: fakeNow.toISOString(),
      updatedAt: fakeNow.toISOString(),
    };

    // Attempt 2 failure -> should backoff to SCHEDULED
    const { job: retriedJob } = await executeOutboxJob(
      job,
      async () => { throw new Error('SMTP Timeout'); },
      fakeNow
    );
    assert.equal(retriedJob.status, 'SCHEDULED');
    assert.equal(retriedJob.lastError, 'SMTP Timeout');

    // Attempt 3 failure -> should be permanently FAILED
    retriedJob.attempts = 3;
    retriedJob.status = 'LEASED';
    const { job: deadLetterJob, auditRecord } = await executeOutboxJob(
      retriedJob,
      async () => false,
      fakeNow
    );
    assert.equal(deadLetterJob.status, 'FAILED');
    assert.equal(auditRecord.status, 'FAILED');
  });
});

test('6. Deadline change supersession & opt-out reconciliation', async (t) => {
  await t.test('supersedes outdated jobs when milestone deadline extends', () => {
    const fakeNow = new Date('2026-03-20T10:00:00.000Z');
    const oldDeadline = '2026-03-31T18:00:00.000Z';
    const newDeadline = '2026-04-15T18:00:00.000Z';

    const sub = {
      id: 'sub_reconcile',
      userId: 'usr_bob',
      programSlug: 'lfx',
      milestoneId: 'lfx:apply:0',
      milestoneLabel: 'LFX Mentorship Application',
      deadline: oldDeadline,
      offsets: ['7d', '2d'],
      notificationChannel: 'in_app',
      status: 'active',
      createdAt: fakeNow.toISOString(),
      updatedAt: fakeNow.toISOString(),
    };

    const oldJobs = generateOutboxJobsForSubscription(sub, fakeNow);
    assert.equal(oldJobs.length, 2);

    // Update deadline on subscription
    sub.deadline = newDeadline;
    const { activeJobs, supersededJobIds, newJobs } = reconcileSubscriptionJobs(
      oldJobs,
      sub,
      fakeNow
    );

    assert.equal(supersededJobIds.length, 2);
    assert.equal(newJobs.length, 2);
    assert.equal(activeJobs.length, 2);
    assert.equal(activeJobs[0].deadline, newDeadline);
  });

  await t.test('cancels pending jobs when user unsubscribes / cancels', () => {
    const fakeNow = new Date('2026-03-20T10:00:00.000Z');
    const sub = {
      id: 'sub_cancelled',
      userId: 'usr_bob',
      programSlug: 'lfx',
      milestoneId: 'lfx:apply:0',
      milestoneLabel: 'LFX Mentorship Application',
      deadline: '2026-04-10T18:00:00.000Z',
      offsets: ['7d', '2d'],
      notificationChannel: 'in_app',
      status: 'cancelled',
      createdAt: fakeNow.toISOString(),
      updatedAt: fakeNow.toISOString(),
    };

    const jobs = [
      { id: 'j1', status: 'SCHEDULED', deadline: sub.deadline },
      { id: 'j2', status: 'LEASED', deadline: sub.deadline },
      { id: 'j3', status: 'SENT', deadline: sub.deadline },
    ];

    const { supersededJobIds, activeJobs } = reconcileSubscriptionJobs(jobs, sub, fakeNow);
    assert.deepEqual(supersededJobIds.sort(), ['j1', 'j2']);
    assert.equal(activeJobs.length, 1);
    assert.equal(activeJobs[0].id, 'j3'); // SENT job remains
  });
});

test('7. End-to-end repository operations & ownership guardrails', async (t) => {
  await t.test('creates subscription, retrieves for owner only, and cancels correctly', async () => {
    const fakeNow = new Date('2026-03-01T12:00:00.000Z');

    const { subscription, scheduledJobsCount } = await createReminderSubscription({
      userId: 'alice_123',
      programSlug: 'gsoc',
      milestoneId: 'gsoc:submit:0',
      milestoneLabel: 'Submit proposal',
      deadline: '2026-03-31T18:00:00.000Z',
      offsets: ['7d', '2d', '24h'],
      now: fakeNow,
    });

    assert.equal(subscription.userId, 'alice_123');
    assert.equal(scheduledJobsCount, 3);

    // Owner checks
    const aliceSubs = await getUserSubscriptions('alice_123');
    assert.equal(aliceSubs.length, 1);

    const eveSubs = await getUserSubscriptions('eve_attacker');
    assert.equal(eveSubs.length, 0);

    // Eve cannot cancel Alice's subscription
    const unauthCancel = await cancelReminderSubscription('eve_attacker', subscription.id, fakeNow);
    assert.equal(unauthCancel.success, false);

    // Alice cancels her subscription
    const authCancel = await cancelReminderSubscription('alice_123', subscription.id, fakeNow);
    assert.equal(authCancel.success, true);

    const updatedSubs = await getUserSubscriptions('alice_123');
    assert.equal(updatedSubs[0].status, 'cancelled');

    // Verify outbox jobs were cancelled
    const jobs = getInMemoryOutboxJobs();
    assert.ok(jobs.every((j) => j.status === 'CANCELLED'));
  });

  await t.test('reconciles jobs on deadline update via repository', async () => {
    const fakeNow = new Date('2026-03-01T12:00:00.000Z');
    await createReminderSubscription({
      userId: 'carol_789',
      programSlug: 'gsoc',
      milestoneId: 'gsoc:submit:0',
      milestoneLabel: 'Submit proposal',
      deadline: '2026-03-25T18:00:00.000Z',
      offsets: ['7d', '2d'],
      now: fakeNow,
    });

    const updateRes = await updateMilestoneDeadline({
      userId: 'carol_789',
      programSlug: 'gsoc',
      milestoneId: 'gsoc:submit:0',
      newDeadline: '2026-04-10T18:00:00.000Z',
      now: fakeNow,
    });
    assert.equal(updateRes.reconciledCount, 2);
  });

  await t.test('processes due jobs through processOutboxQueue', async () => {
    const fakeNow = new Date('2026-03-29T19:00:00.000Z');

    await createReminderSubscription({
      userId: 'bob_456',
      programSlug: 'gsoc',
      milestoneId: 'gsoc:submit:0',
      milestoneLabel: 'Submit proposal',
      deadline: '2026-03-31T18:00:00.000Z',
      offsets: ['2d', '24h'],
      now: new Date('2026-03-01T00:00:00.000Z'),
    });

    // At fakeNow (March 29 19:00), the 2d offset (March 29 18:00) is due!
    const queueResult = await processOutboxQueue({
      workerId: 'test_worker',
      now: fakeNow,
    });

    assert.equal(queueResult.processed, 1);
    assert.equal(queueResult.successes, 1);
    assert.equal(queueResult.failures, 0);

    const auditHistory = await getUserDeliveryAudit('bob_456');
    assert.equal(auditHistory.length, 1);
    assert.equal(auditHistory[0].status, 'SENT');
    assert.equal(auditHistory[0].offset, '2d');
  });
});
