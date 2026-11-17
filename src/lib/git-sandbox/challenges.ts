import { GitChallenge, GitGraphState } from './types';
import { createInitialGitState, generateCommitHash } from './engine';

export const GIT_CHALLENGES: GitChallenge[] = [
  {
    id: 'ch-1',
    slug: 'conventional-committer',
    title: 'The Conventional Committer',
    difficulty: 'Beginner',
    estimatedMinutes: 5,
    description:
      'Learn the standard open-source workflow: create a feature branch, stage modifications, and author structured Conventional Commits (e.g. feat:, fix:, docs:).',
    initialState: () => {
      const base = createInitialGitState();
      base.staging.unstaged['src/auth.ts'] =
        'export function login(username: string) {\n  return { user: username, token: "jwt-token" };\n}\n';
      return base;
    },
    objectives: [
      {
        id: 'obj-1-1',
        description: 'Create and checkout a new branch named "feature/auth"',
        check: (state: GitGraphState) =>
          state.refs.HEAD.type === 'branch' && state.refs.HEAD.target === 'feature/auth',
      },
      {
        id: 'obj-1-2',
        description: 'Stage the unstaged "src/auth.ts" file using "git add"',
        check: (state: GitGraphState) =>
          Boolean(
            state.staging.staged['src/auth.ts'] ||
            state.commits[state.refs.branches['feature/auth'] || '']?.files['src/auth.ts']
          ),
      },
      {
        id: 'obj-1-3',
        description: 'Author a commit with a Conventional Commit message starting with "feat:"',
        check: (state: GitGraphState) => {
          const headHash =
            state.refs.HEAD.type === 'branch'
              ? state.refs.branches[state.refs.HEAD.target]
              : state.refs.HEAD.target;
          const commit = state.commits[headHash];
          return Boolean(commit && /^feat(\(.*\))?:/i.test(commit.message.trim()));
        },
      },
    ],
    hints: [
      'Use "git checkout -b feature/auth" to create and switch branches in one step.',
      'Use "git add src/auth.ts" or "git add ." to stage your work.',
      'Use "git commit -m "feat(auth): implement user authentication token"" to author a conventional commit.',
    ],
    solutionSteps: [
      'git checkout -b feature/auth',
      'git add src/auth.ts',
      'git commit -m "feat(auth): add basic jwt login implementation"',
    ],
  },
  {
    id: 'ch-2',
    slug: 'keeping-in-sync',
    title: 'Keeping in Sync: Fetch & Rebase',
    difficulty: 'Intermediate',
    estimatedMinutes: 8,
    description:
      'Upstream repositories move fast. When upstream/main advances while your pull request is in review, rebase your feature branch cleanly on top of upstream/main.',
    initialState: () => {
      const base = createInitialGitState();
      const currentMain = base.refs.branches.main;

      // 1. Advance upstream/main with 1 new commit
      const { hash: uHash, shortHash: uShort } = generateCommitHash();
      base.commits[uHash] = {
        hash: uHash,
        shortHash: uShort,
        message: 'docs(contributing): update code of conduct & PR guide',
        author: 'Upstream Maintainer <maintainer@opensource.org>',
        timestamp: Date.now() - 1000 * 60 * 60,
        parents: [currentMain],
        files: {
          ...base.commits[currentMain].files,
          'CODE_OF_CONDUCT.md': '# Contributor Covenant Code of Conduct\n',
        },
      };
      base.refs.remotes.upstream.main = uHash;

      // 2. Local feature branch branched from old main
      const { hash: fHash, shortHash: fShort } = generateCommitHash();
      base.commits[fHash] = {
        hash: fHash,
        shortHash: fShort,
        message: 'feat(ui): add navbar search bar shortcut',
        author: 'Contributor <contributor@contribo.org>',
        timestamp: Date.now() - 1000 * 60 * 30,
        parents: [currentMain],
        files: {
          ...base.commits[currentMain].files,
          'src/components/SearchBar.tsx': 'export const SearchBar = () => <input placeholder="Search..." />;',
        },
      };

      base.refs.branches['feature/search'] = fHash;
      base.refs.HEAD = { type: 'branch', target: 'feature/search' };

      return base;
    },
    objectives: [
      {
        id: 'obj-2-1',
        description: 'Fetch new commits from upstream using "git fetch upstream"',
        check: (state: GitGraphState) => {
          const upstreamMain = state.refs.remotes.upstream?.main;
          return Boolean(upstreamMain && state.commits[upstreamMain]);
        },
      },
      {
        id: 'obj-2-2',
        description: 'Rebase your feature branch on top of upstream/main using "git rebase upstream/main"',
        check: (state: GitGraphState) => {
          const headHash = state.refs.branches['feature/search'];
          const upstreamMain = state.refs.remotes.upstream?.main;
          if (!headHash || !upstreamMain) return false;
          const headCommit = state.commits[headHash];
          return Boolean(headCommit && headCommit.parents.includes(upstreamMain));
        },
      },
      {
        id: 'obj-2-3',
        description: 'Verify your working tree is clean and HEAD points to feature/search',
        check: (state: GitGraphState) =>
          state.refs.HEAD.type === 'branch' &&
          state.refs.HEAD.target === 'feature/search' &&
          Object.keys(state.staging.conflicts).length === 0,
      },
    ],
    hints: [
      'Run "git fetch upstream" to pull down recent commits from the upstream remote.',
      'While on "feature/search", run "git rebase upstream/main".',
      'Check "git status" and "git log --oneline" to verify that your commit sits on top of upstream/main.',
    ],
    solutionSteps: [
      'git fetch upstream',
      'git rebase upstream/main',
      'git status',
    ],
  },
  {
    id: 'ch-3',
    slug: 'squash-and-clean',
    title: 'Atomic Commits & History Cleanup',
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    description:
      'Maintainers often ask contributors to squash messy "WIP", "fix typo", or "oops" commits before merging. Reset your branch to main and create a single clean atomic commit.',
    initialState: () => {
      const base = createInitialGitState();
      const mainHash = base.refs.branches.main;

      // Create 3 messy WIP commits
      const { hash: c1, shortHash: s1 } = generateCommitHash();
      base.commits[c1] = {
        hash: c1,
        shortHash: s1,
        message: 'wip: start working on export button',
        author: 'Contributor <contributor@contribo.org>',
        timestamp: Date.now() - 1000 * 60 * 50,
        parents: [mainHash],
        files: { ...base.commits[mainHash].files, 'src/export.ts': 'export const x = 1;' },
      };

      const { hash: c2, shortHash: s2 } = generateCommitHash();
      base.commits[c2] = {
        hash: c2,
        shortHash: s2,
        message: 'fix: fix syntax error in export',
        author: 'Contributor <contributor@contribo.org>',
        timestamp: Date.now() - 1000 * 60 * 40,
        parents: [c1],
        files: { ...base.commits[mainHash].files, 'src/export.ts': 'export const exportData = () => {};' },
      };

      const { hash: c3, shortHash: s3 } = generateCommitHash();
      base.commits[c3] = {
        hash: c3,
        shortHash: s3,
        message: 'oops typo again',
        author: 'Contributor <contributor@contribo.org>',
        timestamp: Date.now() - 1000 * 60 * 30,
        parents: [c2],
        files: {
          ...base.commits[mainHash].files,
          'src/export.ts': 'export function exportCsv(data: unknown[]) { return JSON.stringify(data); }\n',
        },
      };

      base.refs.branches['feature/csv-export'] = c3;
      base.refs.HEAD = { type: 'branch', target: 'feature/csv-export' };
      return base;
    },
    objectives: [
      {
        id: 'obj-3-1',
        description: 'Soft reset 3 commits back to main using "git reset --soft HEAD~3" or "git reset --soft main"',
        check: (state: GitGraphState) => {
          const currentHash =
            state.refs.HEAD.type === 'branch'
              ? state.refs.branches[state.refs.HEAD.target]
              : state.refs.HEAD.target;
          return currentHash === state.refs.branches.main;
        },
      },
      {
        id: 'obj-3-2',
        description: 'Stage all modified files with "git add ."',
        check: (state: GitGraphState) =>
          Boolean(
            state.staging.staged['src/export.ts'] ||
            state.commits[state.refs.branches['feature/csv-export'] || '']?.files['src/export.ts']
          ),
      },
      {
        id: 'obj-3-3',
        description: 'Create 1 atomic commit with message "feat(export): add CSV export utility"',
        check: (state: GitGraphState) => {
          const headHash =
            state.refs.HEAD.type === 'branch'
              ? state.refs.branches[state.refs.HEAD.target]
              : state.refs.HEAD.target;
          const commit = state.commits[headHash];
          return Boolean(commit && commit.message.toLowerCase().includes('feat(export)'));
        },
      },
    ],
    hints: [
      'Use "git reset --soft main" to rewind commit history while keeping all your code staged in the working index.',
      'Check "git status" to see your aggregated file changes.',
      'Commit everything with a single clean message: "git commit -m "feat(export): add CSV export utility"".',
    ],
    solutionSteps: [
      'git reset --soft main',
      'git add .',
      'git commit -m "feat(export): add CSV export utility"',
    ],
  },
  {
    id: 'ch-4',
    slug: 'conflict-crucible',
    title: 'The 3-Way Conflict Crucible',
    difficulty: 'Advanced',
    estimatedMinutes: 12,
    description:
      'Both you and another maintainer modified the same lines in "README.md". Encounter the merge conflict, inspect the conflict markers, resolve them cleanly, and complete the merge.',
    initialState: () => {
      const base = createInitialGitState();
      const rootHash = base.refs.branches.main;

      // Main branch advances modifying README.md
      const { hash: mHash, shortHash: mShort } = generateCommitHash();
      base.commits[mHash] = {
        hash: mHash,
        shortHash: mShort,
        message: 'docs: update repository quickstart and prerequisites',
        author: 'Maintainer <lead@contribo.org>',
        timestamp: Date.now() - 1000 * 60 * 60,
        parents: [rootHash],
        files: {
          ...base.commits[rootHash].files,
          'README.md':
            '# Open Source Project\nOfficial Contribo Community Repository.\n\n## Quickstart\nRun `npm install && npm run dev`\nPrerequisites: Node.js 20+ required.\n',
        },
      };
      base.refs.branches.main = mHash;

      // Feature branch modifies same lines in README.md
      const { hash: fHash, shortHash: fShort } = generateCommitHash();
      base.commits[fHash] = {
        hash: fHash,
        shortHash: fShort,
        message: 'docs(readme): add installation guide for pnpm & yarn',
        author: 'Contributor <contributor@contribo.org>',
        timestamp: Date.now() - 1000 * 60 * 30,
        parents: [rootHash],
        files: {
          ...base.commits[rootHash].files,
          'README.md':
            '# Open Source Project\nOfficial Contribo Community Repository.\n\n## Quickstart\nRun `pnpm install && pnpm dev`\nAlternative package managers supported.\n',
        },
      };

      base.refs.branches['feature/pnpm-support'] = fHash;
      base.refs.HEAD = { type: 'branch', target: 'feature/pnpm-support' };
      return base;
    },
    objectives: [
      {
        id: 'obj-4-1',
        description: 'Attempt to merge main into your branch with "git merge main" to trigger the conflict',
        check: (state: GitGraphState) => {
          const headHash = state.refs.branches['feature/pnpm-support'];
          const headCommit = headHash ? state.commits[headHash] : null;
          return Boolean(
            state.staging.conflicts['README.md'] ||
            state.staging.unstaged['README.md']?.includes('<<<<<<<') ||
            (headCommit && headCommit.parents.length > 1)
          );
        },
      },
      {
        id: 'obj-4-2',
        description: 'Resolve the conflict in the conflict editor and mark resolution with "git add README.md"',
        check: (state: GitGraphState) => {
          const headHash = state.refs.branches['feature/pnpm-support'];
          const headCommit = headHash ? state.commits[headHash] : null;
          const isMerged = headCommit && headCommit.parents.length > 1;
          return (
            !state.staging.conflicts['README.md'] &&
            (Boolean(state.staging.staged['README.md'] && !state.staging.staged['README.md'].includes('<<<<<<<')) || isMerged)
          );
        },
      },
      {
        id: 'obj-4-3',
        description: 'Complete the merge with "git commit -m "merge: resolve README conflict""',
        check: (state: GitGraphState) => {
          const headHash =
            state.refs.HEAD.type === 'branch'
              ? state.refs.branches[state.refs.HEAD.target]
              : state.refs.HEAD.target;
          const commit = state.commits[headHash];
          return Boolean(commit && (commit.isMerge || commit.parents.length > 1));
        },
      },
    ],
    hints: [
      'Run "git merge main". Git will report a CONFLICT (content) in README.md.',
      'Open the in-browser Conflict Editor or use "git add README.md" once markers are resolved.',
      'Finally, run "git commit -m "merge: resolve conflicts with main"" to record the merge commit.',
    ],
    solutionSteps: [
      'git merge main',
      '# Resolve conflict markers in Conflict Editor and click "Mark Resolved"',
      'git add README.md',
      'git commit -m "merge: resolve README conflict"',
    ],
  },
];
