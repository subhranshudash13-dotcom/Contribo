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
      const target = ['.ts', '.tsx', '/index.ts', '/index.tsx']
        .map((ext) => base + ext)
        .find(fs.existsSync);
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
const {
  createInitialGitState,
  executeGitCommand,
  findCommonAncestor,
  resolveConflict,
} = load('src/lib/git-sandbox/engine.ts');

const { GIT_CHALLENGES } = load('src/lib/git-sandbox/challenges.ts');

test('1. Git State Initialization & Basic Commands', async (t) => {
  await t.test('creates initial state with 2 commits and main branch', () => {
    const state = createInitialGitState();
    assert.equal(state.refs.HEAD.type, 'branch');
    assert.equal(state.refs.HEAD.target, 'main');
    assert.equal(Object.keys(state.commits).length, 2);
    assert.ok(state.refs.branches.main);
    assert.ok(state.refs.remotes.upstream?.main);
  });

  await t.test('git status reports clean working tree initially', () => {
    const state = createInitialGitState();
    const res = executeGitCommand('git status', state);
    assert.equal(res.success, true);
    assert.match(res.output, /On branch main/);
    assert.match(res.output, /working tree clean/);
  });

  await t.test('git branch lists local and remote branches', () => {
    const state = createInitialGitState();
    const res = executeGitCommand('git branch -a', state);
    assert.equal(res.success, true);
    assert.match(res.output, /\* main/);
    assert.match(res.output, /remotes\/upstream\/main/);
  });
});

test('2. Branch Management & Switching', async (t) => {
  await t.test('creates new branch with git branch <name>', () => {
    const state = createInitialGitState();
    const res = executeGitCommand('git branch feature/login', state);
    assert.equal(res.success, true);
    assert.ok(res.graphState.refs.branches['feature/login']);
    // HEAD should still be on main
    assert.equal(res.graphState.refs.HEAD.target, 'main');
  });

  await t.test('git checkout -b creates and switches branch', () => {
    const state = createInitialGitState();
    const res = executeGitCommand('git checkout -b feature/auth', state);
    assert.equal(res.success, true);
    assert.equal(res.graphState.refs.HEAD.target, 'feature/auth');
    assert.ok(res.graphState.refs.branches['feature/auth']);
  });

  await t.test('git checkout handles detached HEAD on commit hash', () => {
    const state = createInitialGitState();
    const firstCommitHash = Object.values(state.commits).find(
      (c) => c.parents.length === 0
    ).hash;

    const res = executeGitCommand(`git checkout ${firstCommitHash.slice(0, 7)}`, state);
    assert.equal(res.success, true);
    assert.equal(res.graphState.refs.HEAD.type, 'detached');
    assert.equal(res.graphState.refs.HEAD.target, firstCommitHash);
  });

  await t.test('git branch -d safely deletes branch', () => {
    let state = createInitialGitState();
    state = executeGitCommand('git branch temp-branch', state).graphState;
    assert.ok(state.refs.branches['temp-branch']);

    const res = executeGitCommand('git branch -d temp-branch', state);
    assert.equal(res.success, true);
    assert.equal(res.graphState.refs.branches['temp-branch'], undefined);
  });
});

test('3. Staging & Commits', async (t) => {
  await t.test('stages unstaged files with git add', () => {
    const state = createInitialGitState();
    state.staging.unstaged['src/utils.ts'] = 'export const add = (a, b) => a + b;\n';

    const res = executeGitCommand('git add src/utils.ts', state);
    assert.equal(res.success, true);
    assert.ok(res.graphState.staging.staged['src/utils.ts']);
    assert.equal(res.graphState.staging.unstaged['src/utils.ts'], undefined);
  });

  await t.test('git commit records staged changes into repository', () => {
    let state = createInitialGitState();
    state.staging.staged['src/new-feature.ts'] = 'export const ready = true;\n';

    const initialCommitCount = Object.keys(state.commits).length;
    const res = executeGitCommand('git commit -m "feat: add new feature flag"', state);

    assert.equal(res.success, true);
    assert.equal(Object.keys(res.graphState.commits).length, initialCommitCount + 1);
    assert.equal(Object.keys(res.graphState.staging.staged).length, 0);

    const headHash = res.graphState.refs.branches.main;
    const headCommit = res.graphState.commits[headHash];
    assert.equal(headCommit.message, 'feat: add new feature flag');
    assert.equal(headCommit.files['src/new-feature.ts'], 'export const ready = true;\n');
  });

  await t.test('git commit fails if nothing is staged', () => {
    const state = createInitialGitState();
    const res = executeGitCommand('git commit -m "empty"', state);
    assert.equal(res.success, false);
    assert.equal(res.error, 'NO_CHANGES_STAGED');
  });
});

test('4. Merging & Common Ancestry', async (t) => {
  await t.test('finds common ancestor correctly between branches', () => {
    let state = createInitialGitState();
    const rootHash = state.refs.branches.main;

    // Branch A
    state = executeGitCommand('git checkout -b branch-a', state).graphState;
    state.staging.staged['file-a.txt'] = 'Content A';
    state = executeGitCommand('git commit -m "commit a"', state).graphState;
    const hashA = state.refs.branches['branch-a'];

    // Branch B
    state = executeGitCommand('git checkout main', state).graphState;
    state = executeGitCommand('git checkout -b branch-b', state).graphState;
    state.staging.staged['file-b.txt'] = 'Content B';
    state = executeGitCommand('git commit -m "commit b"', state).graphState;
    const hashB = state.refs.branches['branch-b'];

    const ancestor = findCommonAncestor(state.commits, hashA, hashB);
    assert.equal(ancestor, rootHash);
  });

  await t.test('performs fast-forward merge cleanly', () => {
    let state = createInitialGitState();
    state = executeGitCommand('git checkout -b feature/fast', state).graphState;
    state.staging.staged['fast.txt'] = 'Fast forward';
    state = executeGitCommand('git commit -m "feat: fast forwardable"', state).graphState;
    const featureHash = state.refs.branches['feature/fast'];

    // Switch back to main and merge
    state = executeGitCommand('git checkout main', state).graphState;
    const res = executeGitCommand('git merge feature/fast', state);

    assert.equal(res.success, true);
    assert.match(res.output, /Fast-forward/);
    assert.equal(res.graphState.refs.branches.main, featureHash);
  });

  await t.test('creates 3-way merge commit when histories diverge without conflict', () => {
    let state = createInitialGitState();
    state = executeGitCommand('git checkout -b feature/one', state).graphState;
    state.staging.staged['file1.txt'] = 'file 1';
    state = executeGitCommand('git commit -m "feat: add file 1"', state).graphState;

    state = executeGitCommand('git checkout main', state).graphState;
    state.staging.staged['file2.txt'] = 'file 2';
    state = executeGitCommand('git commit -m "feat: add file 2 on main"', state).graphState;

    const res = executeGitCommand('git merge feature/one', state);
    assert.equal(res.success, true);
    assert.match(res.output, /Merge made by the 'ort' strategy/);

    const headHash = res.graphState.refs.branches.main;
    const mergeCommit = res.graphState.commits[headHash];
    assert.equal(mergeCommit.isMerge, true);
    assert.equal(mergeCommit.parents.length, 2);
    assert.ok(mergeCommit.files['file1.txt']);
    assert.ok(mergeCommit.files['file2.txt']);
  });
});

test('5. Merge Conflicts & Conflict Resolution', async (t) => {
  await t.test('detects content merge conflict and marks conflict markers', () => {
    let state = createInitialGitState();
    // Feature branch edits README.md
    state = executeGitCommand('git checkout -b feature/conflict', state).graphState;
    state.staging.staged['README.md'] = 'Feature branch change\n';
    state = executeGitCommand('git commit -m "feat: change readme"', state).graphState;

    // Main branch edits same README.md
    state = executeGitCommand('git checkout main', state).graphState;
    state.staging.staged['README.md'] = 'Main branch competing change\n';
    state = executeGitCommand('git commit -m "docs: conflicting change on main"', state).graphState;

    // Merge should detect conflict
    const res = executeGitCommand('git merge feature/conflict', state);
    assert.equal(res.success, false);
    assert.equal(res.error, 'MERGE_CONFLICT');
    assert.ok(res.graphState.staging.conflicts['README.md']);
    assert.match(res.graphState.staging.conflicts['README.md'].rawWithMarkers, /<<<<<<< HEAD/);
  });

  await t.test('resolveConflict clears conflict and stages resolved content', () => {
    let state = createInitialGitState();
    state = executeGitCommand('git checkout -b feature/c', state).graphState;
    state.staging.staged['README.md'] = 'Feature change';
    state = executeGitCommand('git commit -m "c1"', state).graphState;

    state = executeGitCommand('git checkout main', state).graphState;
    state.staging.staged['README.md'] = 'Main change';
    state = executeGitCommand('git commit -m "c2"', state).graphState;

    state = executeGitCommand('git merge feature/c', state).graphState;
    assert.ok(state.staging.conflicts['README.md']);

    // Resolve conflict
    const resolvedState = resolveConflict(state, 'README.md', 'Combined clean resolution');
    assert.equal(resolvedState.staging.conflicts['README.md'], undefined);
    assert.equal(resolvedState.staging.staged['README.md'], 'Combined clean resolution');

    // Finish merge commit
    const commitRes = executeGitCommand('git commit -m "merge: resolved"', resolvedState);
    assert.equal(commitRes.success, true);
    assert.equal(commitRes.graphState.commits[commitRes.graphState.refs.branches.main].files['README.md'], 'Combined clean resolution');
  });
});

test('6. Rebasing & Reset Operations', async (t) => {
  await t.test('rebase replays commits linearly on top of target branch', () => {
    let state = createInitialGitState();
    state = executeGitCommand('git checkout -b feature/rebase-me', state).graphState;
    state.staging.staged['rebase-file.txt'] = 'Rebase content';
    state = executeGitCommand('git commit -m "feat: to be rebased"', state).graphState;

    state = executeGitCommand('git checkout main', state).graphState;
    state.staging.staged['upstream-advancement.txt'] = 'Upstream work';
    state = executeGitCommand('git commit -m "feat: main advance"', state).graphState;
    const mainHash = state.refs.branches.main;

    state = executeGitCommand('git checkout feature/rebase-me', state).graphState;
    const res = executeGitCommand('git rebase main', state);

    assert.equal(res.success, true);
    const rebasedHeadHash = res.graphState.refs.branches['feature/rebase-me'];
    const rebasedCommit = res.graphState.commits[rebasedHeadHash];
    assert.equal(rebasedCommit.parents[0], mainHash);
  });

  await t.test('git reset --soft rewinds commit but preserves staged changes', () => {
    let state = createInitialGitState();
    state.staging.staged['test-reset.txt'] = 'Reset file';
    state = executeGitCommand('git commit -m "feat: commit to undo"', state).graphState;

    const res = executeGitCommand('git reset --soft HEAD~1', state);
    assert.equal(res.success, true);
    // Staged files should still be present
    assert.equal(res.graphState.staging.staged['test-reset.txt'], 'Reset file');
  });
});

test('7. Challenge Curriculum Validation', async (t) => {
  await t.test('all 4 challenge definitions have valid initialStates and objectives', () => {
    assert.equal(GIT_CHALLENGES.length, 4);

    GIT_CHALLENGES.forEach((ch) => {
      const state = ch.initialState();
      assert.ok(state.commits);
      assert.ok(state.refs.HEAD);
      assert.ok(ch.objectives.length >= 3);
      // Initially, not all objectives should be satisfied
      const allDoneInitially = ch.objectives.every((o) => o.check(state));
      assert.equal(allDoneInitially, false, `Challenge ${ch.id} should not start as already completed`);
    });
  });

  await t.test('executing solution steps for Challenge 1 satisfies all objectives', () => {
    const ch = GIT_CHALLENGES[0];
    let state = ch.initialState();

    state = executeGitCommand('git checkout -b feature/auth', state).graphState;
    state = executeGitCommand('git add src/auth.ts', state).graphState;
    state = executeGitCommand('git commit -m "feat(auth): add login implementation"', state).graphState;

    const allDone = ch.objectives.every((o) => o.check(state));
    assert.equal(allDone, true, 'All Challenge 1 objectives must pass after solution steps');
  });
});
