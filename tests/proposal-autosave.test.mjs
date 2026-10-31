import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);

// The repository test runner is plain Node. Transpile the real browser module
// so these tests exercise shipped source instead of a duplicated copy, with a
// fake localStorage standing in for the browser boundary.
const compiled = ts.transpileModule(
  fs.readFileSync(
    new URL('../src/lib/client/proposal-autosave.ts', import.meta.url),
    'utf8'
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;

const moduleShim = { exports: {} };
vm.runInThisContext(
  `(function(require, module, exports) {\n${compiled}\n})`
)(require, moduleShim, moduleShim.exports);
const autosave = moduleShim.exports;

const {
  AUTOSAVE_KEY_PREFIX,
  autosaveKeyFor,
  clearLocalSnapshot,
  createAutoSaveScheduler,
  formatLocalSaveClock,
  hasNewerLocalWork,
  parseSnapshot,
  readLocalSnapshot,
  sanitizeSections,
  sectionsDiffer,
  sectionsSignature,
  writeLocalSnapshot,
} = autosave;

function createStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

/** Install a fake `window` for the duration of one test. */
function withWindow(storage, run) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  if (storage === null) {
    delete globalThis.window;
  } else {
    globalThis.window = { localStorage: storage };
  }
  try {
    return run();
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else delete globalThis.window;
  }
}

const iso = (offsetMs) => new Date(Date.now() + offsetMs).toISOString();

// ---------------------------------------------------------------------------
// Key scoping
// ---------------------------------------------------------------------------

test('autosave keys are scoped per draft id', () => {
  assert.equal(autosaveKeyFor('draft-1'), `${AUTOSAVE_KEY_PREFIX}draft-1`);
  assert.equal(autosaveKeyFor(' draft-1 '), `${AUTOSAVE_KEY_PREFIX}draft-1`);
  for (const bad of ['', '   ', null, undefined, 'a b', 'a/b', 'x'.repeat(201)]) {
    assert.equal(autosaveKeyFor(bad), null, `${String(bad)} must not build a key`);
  }
});

test('two drafts in the same browser never read each other buffer', () => {
  const storage = createStorage();
  return withWindow(storage, () => {
    writeLocalSnapshot('draft-a', { summary: 'Text for A' });
    writeLocalSnapshot('draft-b', { summary: 'Text for B' });

    assert.deepEqual(readLocalSnapshot('draft-a').sections, { summary: 'Text for A' });
    assert.deepEqual(readLocalSnapshot('draft-b').sections, { summary: 'Text for B' });

    // A value written under one key is ignored by the other id, even if the
    // stored payload still names the reader.
    storage.map.set(`${AUTOSAVE_KEY_PREFIX}draft-c`, JSON.stringify({
      draftId: 'draft-a',
      savedAt: iso(0),
      sections: { summary: 'Wrong slot' },
    }));
    assert.equal(readLocalSnapshot('draft-c'), null);
  });
});

// ---------------------------------------------------------------------------
// Snapshot shape
// ---------------------------------------------------------------------------

test('only string sections survive sanitization', () => {
  const clean = sanitizeSections({
    summary: 'keep me',
    timeline: 42,
    deliverables: null,
    '': 'dropped, empty key',
    __proto__: 'dropped, unsafe',
    constructor: 'dropped, unsafe',
    architecture: 'x'.repeat(60_001),
  });
  assert.deepEqual(Object.keys(clean), ['summary', 'architecture']);
  assert.equal(clean.architecture.length, 60_000);
  assert.deepEqual(sanitizeSections(undefined), {});
  assert.deepEqual(sanitizeSections(['a']), {});
});

test('a corrupted or foreign buffer is never offered for recovery', () => {
  const good = JSON.stringify({
    draftId: 'draft-a',
    savedAt: iso(0),
    sections: { summary: 'Text' },
  });
  assert.ok(parseSnapshot(good));
  for (const raw of [
    null,
    '',
    'not json',
    '[1,2,3]',
    'null',
    '"a string"',
    JSON.stringify({ savedAt: iso(0), sections: { summary: 'no draftId' } }),
    JSON.stringify({ draftId: '', savedAt: iso(0), sections: { summary: 'empty id' } }),
    JSON.stringify({ draftId: 'draft-a', savedAt: 'Just now', sections: { summary: 'bad time' } }),
    JSON.stringify({ draftId: 'draft-a', sections: { summary: 'no savedAt' } }),
    JSON.stringify({ draftId: 'draft-a', savedAt: iso(0), sections: { summary: '   ' } }),
    JSON.stringify({ draftId: 'draft-a', savedAt: iso(0) }),
    JSON.stringify({ draftId: 'draft-a', savedAt: iso(0), sections: 'Text' }),
  ]) {
    assert.equal(parseSnapshot(raw), null, `${raw} must be rejected`);
  }
});

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

test('clearing every section removes the buffer instead of leaving a phantom', () => {
  const storage = createStorage();
  return withWindow(storage, () => {
    writeLocalSnapshot('draft-a', { summary: 'Real work' });
    assert.equal(storage.map.size, 1);

    assert.equal(writeLocalSnapshot('draft-a', { summary: '   ', timeline: '' }), null);
    assert.equal(storage.map.size, 0, 'emptied draft must not keep a recovery copy');
    assert.equal(readLocalSnapshot('draft-a'), null);
  });
});

test('clearLocalSnapshot drops only the named draft', () => {
  const storage = createStorage();
  return withWindow(storage, () => {
    writeLocalSnapshot('draft-a', { summary: 'A' });
    writeLocalSnapshot('draft-b', { summary: 'B' });
    clearLocalSnapshot('draft-a');
    assert.equal(readLocalSnapshot('draft-a'), null);
    assert.ok(readLocalSnapshot('draft-b'));
    clearLocalSnapshot('never-stored');
  });
});

test('storage that throws is treated as absent, never as an error', () => {
  const exploding = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceeded');
    },
    removeItem: () => {
      throw new Error('SecurityError');
    },
  };
  return withWindow(exploding, () => {
    assert.equal(readLocalSnapshot('draft-a'), null);
    assert.equal(writeLocalSnapshot('draft-a', { summary: 'x' }), null);
    assert.equal(clearLocalSnapshot('draft-a'), undefined);
  });
});

test('no window means no local writes', () => {
  assert.equal(readLocalSnapshot('draft-a'), null);
  assert.equal(writeLocalSnapshot('draft-a', { summary: 'x' }), null);
});

// ---------------------------------------------------------------------------
// Recovery decision
// ---------------------------------------------------------------------------

test('identical text is never worth a banner', () => {
  const local = { draftId: 'draft-a', savedAt: iso(60_000), sections: { summary: 'Same ' } };
  assert.equal(
    hasNewerLocalWork(local, { summary: 'Same' }, iso(0)),
    false,
    'comparison is trimmed, whitespace-only edits are not new work'
  );
  assert.equal(hasNewerLocalWork(local, { summary: 'Same' }, 'Just now'), false);
});

test('recovery needs differing text and a local copy that is actually newer', () => {
  const local = { draftId: 'draft-a', savedAt: iso(0), sections: { summary: 'Longer local' } };
  assert.equal(hasNewerLocalWork(local, { summary: 'Cloud' }, iso(-1000)), true);
  assert.equal(hasNewerLocalWork(local, { summary: 'Cloud' }, iso(1000)), false);
  assert.equal(hasNewerLocalWork(local, { summary: 'Cloud' }, new Date(-1000)), true);
  // A seed draft stores prose for updatedAt; the user decides rather than the
  // code silently discarding work it cannot date.
  assert.equal(hasNewerLocalWork(local, { summary: 'Cloud' }, 'Just now'), true);
  assert.equal(hasNewerLocalWork(local, { summary: 'Cloud' }, null), true);
  assert.equal(hasNewerLocalWork(null, { summary: 'Cloud' }, iso(0)), false);
  assert.equal(
    hasNewerLocalWork({ draftId: 'draft-a', savedAt: 'bogus', sections: { summary: 'x' } }, {}, iso(0)),
    false,
    'an undatable buffer cannot beat a real cloud timestamp'
  );
});

test('sectionsDiffer covers keys only present on one side', () => {
  assert.equal(sectionsDiffer({ a: 'x' }, { a: 'x', b: 'y' }), true);
  assert.equal(sectionsDiffer({ a: 'x', b: '' }, { a: 'x' }), false);
  assert.equal(sectionsDiffer(undefined, undefined), false);
});

test('the local save clock is zero padded for the pill', () => {
  const morning = new Date(2026, 0, 15, 7, 4).toISOString();
  assert.equal(formatLocalSaveClock(morning), '07:04');
  assert.equal(formatLocalSaveClock('Just now'), '');
  assert.equal(formatLocalSaveClock(null), '');
});

// ---------------------------------------------------------------------------
// Signature
// ---------------------------------------------------------------------------

test('the signature ignores key order but not content', () => {
  const first = sectionsSignature('draft-a', { summary: 'One', timeline: 'Two' });
  const reordered = sectionsSignature('draft-a', { timeline: 'Two', summary: 'One' });
  assert.equal(first, reordered, 'key order must not look like an edit');
  assert.notEqual(first, sectionsSignature('draft-a', { summary: 'One', timeline: 'Two ' }));
  assert.notEqual(first, sectionsSignature('draft-b', { summary: 'One', timeline: 'Two' }));
  // A re-render carrying the same text through a new object is not a change.
  assert.equal(sectionsSignature('draft-a', { summary: 'One' }), sectionsSignature('draft-a', { summary: 'One' }));
});

// ---------------------------------------------------------------------------
// Scheduler: debounce, ordering, flush
// ---------------------------------------------------------------------------

function fakeTimers() {
  const queue = [];
  let nextId = 1;
  return {
    queue,
    setTimer: (callback, ms) => {
      const handle = { id: nextId++, callback, ms, cleared: false };
      queue.push(handle);
      return handle;
    },
    clearTimer: (handle) => {
      handle.cleared = true;
      const index = queue.indexOf(handle);
      if (index >= 0) queue.splice(index, 1);
    },
    /** Fire the oldest armed timer, as the event loop would. */
    runAll() {
      const pending = [...queue];
      queue.length = 0;
      pending.forEach((handle) => {
        if (!handle.cleared) handle.callback();
      });
    },
    armed: () => queue.filter((h) => !h.cleared).length,
  };
}

test('a keystroke buffers text and writes only after one quiet period', () => {
  const storage = createStorage();
  const timers = fakeTimers();
  const written = [];
  return withWindow(storage, () => {
    const scheduler = createAutoSaveScheduler({
      delayMs: 2500,
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
      onWritten: (snapshot) => written.push(snapshot),
    });

    scheduler.schedule('draft-a', { summary: 'Mid sentence' });
    assert.equal(storage.map.size, 0, 'nothing is written on the keystroke itself');
    assert.equal(scheduler.isPending(), true);
    assert.equal(timers.armed(), 1);

    scheduler.schedule('draft-a', { summary: 'Mid sentence, continued' });
    assert.equal(timers.armed(), 1, 'the previous debounce is replaced, not stacked');

    timers.runAll();
    assert.equal(written.length, 1);
    assert.deepEqual(readLocalSnapshot('draft-a').sections, {
      summary: 'Mid sentence, continued',
    });
    assert.equal(scheduler.isPending(), false);
    assert.equal(written[0].draftId, 'draft-a');
  });
});

test('switching drafts mid-debounce saves the previous draft to its own slot', () => {
  const storage = createStorage();
  const timers = fakeTimers();
  return withWindow(storage, () => {
    const scheduler = createAutoSaveScheduler({
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
    });

    scheduler.schedule('draft-a', { summary: 'A text never sent to the cloud' });
    scheduler.schedule('draft-b', { summary: 'B text' });
    timers.runAll();

    assert.deepEqual(readLocalSnapshot('draft-a').sections, {
      summary: 'A text never sent to the cloud',
    });
    assert.deepEqual(readLocalSnapshot('draft-b').sections, { summary: 'B text' });
  });
});

test('flush writes immediately and cancel drops the buffer', () => {
  const storage = createStorage();
  const timers = fakeTimers();
  const written = [];
  return withWindow(storage, () => {
    const scheduler = createAutoSaveScheduler({
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
      onWritten: (snapshot) => written.push(snapshot),
    });

    scheduler.schedule('draft-a', { summary: 'Typed before closing the tab' });
    assert.equal(scheduler.flush().draftId, 'draft-a');
    assert.equal(timers.armed(), 0, 'flush disarms the pending timer');
    assert.equal(scheduler.flush(), null, 'a second flush has nothing to write');
    assert.deepEqual(readLocalSnapshot('draft-a').sections, {
      summary: 'Typed before closing the tab',
    });
    assert.equal(written.length, 1);

    scheduler.schedule('draft-a', { summary: 'Second buffer' });
    scheduler.cancel();
    assert.equal(scheduler.isPending(), false);
    assert.equal(timers.armed(), 0);
    timers.runAll();
    assert.deepEqual(readLocalSnapshot('draft-a').sections, {
      summary: 'Typed before closing the tab',
    });
  });
});

test('teardown flush persists text without touching component state', () => {
  const storage = createStorage();
  const timers = fakeTimers();
  const written = [];
  return withWindow(storage, () => {
    const scheduler = createAutoSaveScheduler({
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
      onWritten: (snapshot) => written.push(snapshot),
    });

    scheduler.schedule('draft-a', { summary: 'Unmount text' });
    assert.equal(scheduler.flush({ notify: false }).draftId, 'draft-a');
    assert.deepEqual(readLocalSnapshot('draft-a').sections, { summary: 'Unmount text' });
    assert.equal(written.length, 0, 'notify: false must not call back into a unmounting hook');
  });
});

test('an id that cannot build a key is never buffered', () => {
  const storage = createStorage();
  const timers = fakeTimers();
  const scheduled = [];
  return withWindow(storage, () => {
    const scheduler = createAutoSaveScheduler({
      setTimer: timers.setTimer,
      clearTimer: timers.clearTimer,
      onScheduled: () => scheduled.push('armed'),
    });
    scheduler.schedule('   ', { summary: 'orphan' });
    scheduler.schedule('bad/id', { summary: 'orphan' });
    assert.equal(scheduler.isPending(), false);
    assert.equal(timers.armed(), 0);
    assert.equal(scheduled.length, 0);
    assert.equal(storage.map.size, 0);
  });
});

test('a quota failure leaves the scheduler empty and the cloud save intact', () => {
  const timers = fakeTimers();
  const written = [];
  return withWindow(
    {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {},
    },
    () => {
      const scheduler = createAutoSaveScheduler({
        setTimer: timers.setTimer,
        clearTimer: timers.clearTimer,
        onWritten: (snapshot) => written.push(snapshot),
      });
      scheduler.schedule('draft-a', { summary: 'Large paste' });
      timers.runAll();
      assert.equal(scheduler.isPending(), false);
      assert.equal(written.length, 0, 'no snapshot means no false "Auto-saved" label');
      assert.equal(scheduler.flush(), null);
    }
  );
});
