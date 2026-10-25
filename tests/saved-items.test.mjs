import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { MongoServerError, ObjectId } from 'mongodb';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439012';
const targetId = '507f1f77bcf86cd799439013';
const otherTargetId = '507f1f77bcf86cd799439014';
const payload = { type: 'project', targetId, title: 'Fixture project' };

// Match the existing source-loading test convention: execute real TypeScript,
// replacing only external boundaries. Never import the real database or auth.
function sourceLoader(mocks) {
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
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (!id.startsWith('@/') && !id.startsWith('.')) return require(id);
      const base = id.startsWith('@/')
        ? path.join(root, 'src', id.slice(2))
        : path.resolve(path.dirname(resolved), id);
      const target = [base, `${base}.ts`, `${base}.mjs`]
        .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
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

// BSON equality is type-sensitive: a string is not the same indexed value as
// an ObjectId. Legacy matches must come from the production $in predicates.
function bsonEqual(left, right) {
  if (left instanceof ObjectId && right instanceof ObjectId) return left.equals(right);
  return left === right;
}

function matches(doc, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (value && typeof value === 'object' && '$in' in value) {
      return value.$in.some((candidate) => bsonEqual(doc[key], candidate));
    }
    return bsonEqual(doc[key], value);
  });
}

function duplicateKey() {
  return new MongoServerError({
    message: 'E11000 duplicate key error: saved_items userId_1_type_1_targetId_1',
    code: 11000,
    keyPattern: { userId: 1, type: 1, targetId: 1 },
  });
}

function fixture({ initialReaders = 0, documents = [], onInsert } = {}) {
  const state = { userId, finds: [], inserts: 0, logs: [] };
  let release;
  const barrier = new Promise((resolve) => { release = resolve; });
  const collection = {
    async findOne(filter) {
      state.finds.push(filter);
      const snapshot = documents.find((doc) => matches(doc, filter)) || null;
      // Capture both reads BEFORE releasing either caller to insert. Recovery
      // reads bypass the barrier and observe the winning persisted document.
      if (state.finds.length <= initialReaders) {
        if (state.finds.length === initialReaders) release();
        await barrier;
      }
      return snapshot;
    },
    async insertOne(doc) {
      state.inserts++;
      if (onInsert) await onInsert(doc, documents);
      const conflict = documents.some((existing) =>
        ['userId', 'type', 'targetId'].every((key) => bsonEqual(existing[key], doc[key])));
      if (conflict) throw duplicateKey();
      const insertedId = new ObjectId((900 + documents.length).toString(16).padStart(24, '0'));
      documents.push({ ...doc, _id: insertedId });
      return { insertedId };
    },
  };
  const mocks = {
    '@/auth': { auth: async () => state.userId ? { user: { id: state.userId } } : null },
    '@/lib/db': {
      COLLECTIONS: { savedItems: 'saved_items' },
      getCollection: async (name) => {
        assert.equal(name, 'saved_items');
        return collection;
      },
    },
    '@/lib/repositories/programs': {},
  };
  const load = sourceLoader(mocks);
  // Keep actual origin/body guards, replacing only the logging output sink.
  mocks['@/lib/security'] = {
    ...load('src/lib/security.ts'),
    safeLogError: (...args) => state.logs.push(args),
  };
  return {
    state, documents,
    repo: load('src/lib/repositories/dashboard.ts'),
    route: load('src/app/api/user/saved/route.ts'),
  };
}

function request(body = payload, headers = {}) {
  return new Request('http://localhost:3000/api/user/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

for (const type of ['project', 'organization']) {
  test(`concurrent ${type} saves return the same persisted bookmark`, async () => {
    const f = fixture({ initialReaders: 2 });
    const results = await Promise.allSettled([
      f.repo.saveItem(userId, { ...payload, type }),
      f.repo.saveItem(userId, { ...payload, type }),
    ]);
    assert.deepEqual(results.map((result) => result.status), ['fulfilled', 'fulfilled']);
    assert.deepEqual(results[0].value, results[1].value);
    assert.equal(results[0].value._id, String(f.documents[0]._id));
    assert.equal(f.documents.length, 1);
    assert.equal(f.state.inserts, 2);
    assert.equal(f.state.finds.length, 3);
    assert.deepEqual(f.state.finds[2], f.state.finds[0]);
  });

  test(`POST concurrent ${type} saves both retain status 201 and the same item`, async () => {
    const f = fixture({ initialReaders: 2 });
    const responses = await Promise.all([
      f.route.POST(request({ ...payload, type })),
      f.route.POST(request({ ...payload, type })),
    ]);
    assert.deepEqual(responses.map((response) => response.status), [201, 201]);
    const bodies = await Promise.all(responses.map((response) => response.json()));
    assert.deepEqual(bodies[0], bodies[1]);
    assert.equal(bodies[0].item._id, String(f.documents[0]._id));
    assert.equal(f.documents.length, 1);
    for (const response of responses) {
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
    }
    assert.equal(f.state.logs.length, 0);
  });
}

test('sequential saves return existing data without overwriting metadata', async () => {
  const f = fixture();
  const first = await f.repo.saveItem(userId, payload);
  const second = await f.repo.saveItem(userId, { ...payload, title: 'Changed title' });
  assert.deepEqual(second, first);
  assert.equal(f.state.inserts, 1);
  assert.equal(f.documents.length, 1);
  assert.equal(typeof first.createdAt, 'string');
});

for (const dimension of ['user', 'target', 'type']) {
  test(`concurrent saves for a different ${dimension} remain independent`, async () => {
    const f = fixture({ initialReaders: 2 });
    const secondUser = dimension === 'user' ? otherUserId : userId;
    const secondPayload = {
      ...payload,
      ...(dimension === 'target' ? { targetId: otherTargetId } : {}),
      ...(dimension === 'type' ? { type: 'organization' } : {}),
    };
    const results = await Promise.all([
      f.repo.saveItem(userId, payload),
      f.repo.saveItem(secondUser, secondPayload),
    ]);
    assert.notEqual(results[0]._id, results[1]._id);
    assert.equal(results[1].userId, secondUser);
    assert.equal(results[1].targetId, secondPayload.targetId);
    assert.equal(results[1].type, secondPayload.type);
    assert.equal(f.documents.length, 2);
  });
}

test('unrelated insert errors propagate unchanged without recovery reads', async () => {
  const errors = [
    new MongoServerError({ message: 'Write failed', code: 91 }),
    new Error('Connection closed'),
    { code: '11000' },
    { cause: { code: 11000 } },
    null,
  ];
  for (const error of errors) {
    const f = fixture({ onInsert: () => { throw error; } });
    await assert.rejects(f.repo.saveItem(userId, payload), (actual) => actual === error);
    assert.equal(f.state.finds.length, 1);
    assert.equal(f.documents.length, 0);
  }
});

test('duplicate-key errors without a matching bookmark propagate unchanged', async () => {
  const error = duplicateKey();
  const f = fixture({ onInsert: () => { throw error; } });
  await assert.rejects(f.repo.saveItem(userId, payload), (actual) => actual === error);
  assert.equal(f.documents.length, 0);
});

for (const dimension of ['user', 'target', 'type']) {
  test(`duplicate recovery cannot return a different ${dimension}'s bookmark`, async () => {
    const error = duplicateKey();
    const decoy = {
      _id: new ObjectId(), userId: new ObjectId(userId),
      targetId: new ObjectId(targetId), type: 'project', title: 'Not this bookmark',
      ...(dimension === 'user' ? { userId: new ObjectId(otherUserId) } : {}),
      ...(dimension === 'target' ? { targetId: new ObjectId(otherTargetId) } : {}),
      ...(dimension === 'type' ? { type: 'organization' } : {}),
    };
    const f = fixture({ documents: [decoy], onInsert: () => { throw error; } });
    await assert.rejects(f.repo.saveItem(userId, payload), (actual) => actual === error);
    assert.equal(f.documents.length, 1);
  });
}

for (const stringUser of [false, true]) {
  for (const stringTarget of [false, true]) {
    test(`existing IDs match with string user=${stringUser}, string target=${stringTarget}`, async () => {
      const existing = {
        _id: new ObjectId(), userId: stringUser ? userId : new ObjectId(userId),
        targetId: stringTarget ? targetId : new ObjectId(targetId),
        type: 'project', title: 'Legacy bookmark', createdAt: new Date('2026-01-01T00:00:00Z'),
      };
      const f = fixture({ documents: [existing] });
      const result = await f.repo.saveItem(userId, payload);
      assert.equal(result._id, String(existing._id));
      assert.equal(result.userId, userId);
      assert.equal(result.targetId, targetId);
      assert.equal(result.createdAt, '2026-01-01T00:00:00.000Z');
      assert.equal(f.state.inserts, 0);
    });
  }
}

test('POST sequential idempotency keeps the existing status and item shape', async () => {
  const f = fixture();
  const first = await f.route.POST(request());
  const second = await f.route.POST(request());
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.deepEqual(await first.json(), await second.json());
  assert.equal(f.documents.length, 1);
});

test('POST requires authentication before reading or inserting bookmarks', async () => {
  const f = fixture();
  f.state.userId = null;
  const response = await f.route.POST(request());
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, 'Unauthorized');
  assert.equal(f.state.finds.length, 0);
  assert.equal(f.state.inserts, 0);
});

test('POST preserves required-field, identifier, and JSON validation', async () => {
  const invalidBodies = [
    { ...payload, type: 'unknown' }, { ...payload, targetId: '' },
    { ...payload, targetId: 'invalid-id' }, { ...payload, title: '' },
    { ...payload, title: '   ' }, { ...payload, title: 42 },
  ];
  for (const body of invalidBodies) {
    const f = fixture();
    const response = await f.route.POST(request(body));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, 'validation');
    assert.equal(f.state.inserts, 0);
  }
  const f = fixture();
  const response = await f.route.POST(new Request('http://localhost:3000/api/user/saved', {
    method: 'POST', body: '{',
  }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'Invalid JSON body');
  assert.equal(f.state.inserts, 0);
});

test('POST keeps the same-origin mutation guard', async () => {
  const f = fixture();
  const response = await f.route.POST(request(payload, { Origin: 'https://untrusted.example' }));
  assert.equal(response.status, 403);
  assert.equal(f.state.finds.length, 0);
  assert.equal(f.state.inserts, 0);
});

test('POST preserves logged HTTP 500 responses for unrelated database failures', async () => {
  const error = new Error('Database unavailable');
  const f = fixture({ onInsert: () => { throw error; } });
  const response = await f.route.POST(request());
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.equal(body.error, 'Failed to save item');
  assert.equal(body.code, 'server');
  assert.equal(f.state.logs[0][1], error);
});
