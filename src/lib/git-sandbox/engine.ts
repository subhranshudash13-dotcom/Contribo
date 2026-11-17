import {
  GitCommit,
  GitGraphState,
  CommandExecutionResult,
  GitConflictData,
} from './types';

let hashCounter = 1000;

export function generateCommitHash(): { hash: string; shortHash: string } {
  hashCounter += 1;
  const hex = (Date.now().toString(16) + hashCounter.toString(16)).slice(-12);
  const hash = hex.padEnd(40, 'a');
  return { hash, shortHash: hash.slice(0, 7) };
}

export function createInitialGitState(): GitGraphState {
  const c1Hash = 'c101a01000000000000000000000000000000000';
  const c2Hash = 'c102a02000000000000000000000000000000000';

  const commits: Record<string, GitCommit> = {
    [c1Hash]: {
      hash: c1Hash,
      shortHash: 'c101a01',
      message: 'chore: initial project scaffold',
      author: 'Open Source Contributor <contributor@contribo.org>',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
      parents: [],
      files: {
        'README.md': '# Open Source Project\nWelcome to our community repository!\n',
        'package.json': '{\n  "name": "community-repo",\n  "version": "1.0.0"\n}\n',
      },
    },
    [c2Hash]: {
      hash: c2Hash,
      shortHash: 'c102a02',
      message: 'feat: add core application boilerplate',
      author: 'Open Source Contributor <contributor@contribo.org>',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
      parents: [c1Hash],
      files: {
        'README.md': '# Open Source Project\nWelcome to our community repository!\n\n## Getting Started\nRun npm install.\n',
        'package.json': '{\n  "name": "community-repo",\n  "version": "1.0.0"\n}\n',
        'src/index.ts': 'export function main() {\n  console.log("Hello Open Source");\n}\n',
      },
    },
  };

  return {
    commits,
    refs: {
      HEAD: { type: 'branch', target: 'main' },
      branches: { main: c2Hash },
      remotes: {
        upstream: { main: c2Hash },
        origin: { main: c2Hash },
      },
      tags: { 'v1.0.0': c2Hash },
    },
    staging: {
      staged: {},
      unstaged: {},
      conflicts: {},
    },
  };
}

export function getCurrentCommit(state: GitGraphState): GitCommit | null {
  const head = state.refs.HEAD;
  const hash = head.type === 'branch' ? state.refs.branches[head.target] : head.target;
  return state.commits[hash] || null;
}

export function getCommitAncestry(commits: Record<string, GitCommit>, startHash: string): Set<string> {
  const ancestors = new Set<string>();
  const queue = [startHash];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (ancestors.has(cur)) continue;
    ancestors.add(cur);
    const commit = commits[cur];
    if (commit && commit.parents) {
      queue.push(...commit.parents);
    }
  }
  return ancestors;
}

export function findCommonAncestor(
  commits: Record<string, GitCommit>,
  hashA: string,
  hashB: string
): string | null {
  const ancestorsA = getCommitAncestry(commits, hashA);
  const queue = [hashB];
  const visitedB = new Set<string>();

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (ancestorsA.has(cur)) {
      return cur;
    }
    visitedB.add(cur);
    const commit = commits[cur];
    if (commit && commit.parents) {
      for (const p of commit.parents) {
        if (!visitedB.has(p)) queue.push(p);
      }
    }
  }
  return null;
}

export function resolveConflict(
  state: GitGraphState,
  file: string,
  resolvedContent: string
): GitGraphState {
  const next = JSON.parse(JSON.stringify(state)) as GitGraphState;
  delete next.staging.conflicts[file];
  delete next.staging.unstaged[file];
  next.staging.staged[file] = resolvedContent;
  return next;
}

export function executeGitCommand(
  rawCommand: string,
  state: GitGraphState
): CommandExecutionResult {
  const trimmed = rawCommand.trim();
  if (!trimmed) {
    return { success: true, output: '', graphState: state };
  }

  // Clone state to ensure immutability
  const nextState = JSON.parse(JSON.stringify(state)) as GitGraphState;

  if (trimmed === 'clear') {
    return { success: true, output: '__CLEAR__', graphState: nextState };
  }

  if (trimmed === 'help') {
    const helpText = [
      'Contribo Interactive Git Sandbox - Supported Commands:',
      '  git status                      - Show working tree and staging status',
      '  git branch [-a | -d <name>]     - List, create, or delete branches',
      '  git checkout [-b] <target>      - Switch branches or checkout commits',
      '  git switch [-c] <name>          - Switch or create branches',
      '  git add <file | .>              - Stage file modifications',
      '  git commit -m "<msg>"           - Record changes to repository',
      '  git merge <branch>              - Join two development histories',
      '  git rebase <branch>             - Reapply commits on top of another base',
      '  git rebase --continue | --abort - Resume or abort an active rebase',
      '  git reset [--soft|--hard] <ref> - Reset current HEAD to specified state',
      '  git cherry-pick <commit>        - Apply the changes introduced by a commit',
      '  git log [--oneline | --graph]   - Display commit history log',
      '  git fetch [remote]              - Download objects and refs from remote',
      '  git pull [remote] [branch]      - Fetch and integrate with another branch',
      '  git push [remote] [branch]      - Update remote refs along with objects',
    ].join('\n');
    return { success: true, output: helpText, graphState: nextState };
  }

  if (!trimmed.startsWith('git')) {
    return {
      success: false,
      output: `command not found: ${trimmed.split(' ')[0]}. Try typing 'help'.`,
      error: 'UNKNOWN_COMMAND',
      graphState: state,
    };
  }

  const parts = parseArgs(trimmed.slice(3).trim());
  const subCommand = parts[0];

  switch (subCommand) {
    case 'status':
      return handleStatus(nextState);
    case 'branch':
      return handleBranch(parts.slice(1), nextState);
    case 'checkout':
      return handleCheckout(parts.slice(1), nextState);
    case 'switch':
      return handleSwitch(parts.slice(1), nextState);
    case 'add':
      return handleAdd(parts.slice(1), nextState);
    case 'commit':
      return handleCommit(parts.slice(1), nextState);
    case 'merge':
      return handleMerge(parts.slice(1), nextState);
    case 'rebase':
      return handleRebase(parts.slice(1), nextState);
    case 'reset':
      return handleReset(parts.slice(1), nextState);
    case 'cherry-pick':
      return handleCherryPick(parts.slice(1), nextState);
    case 'log':
      return handleLog(parts.slice(1), nextState);
    case 'fetch':
      return handleFetch(parts.slice(1), nextState);
    case 'push':
      return handlePush(parts.slice(1), nextState);
    case 'pull':
      return handlePull(parts.slice(1), nextState);
    default:
      return {
        success: false,
        output: `git: '${subCommand}' is not a recognized git command. See 'help'.`,
        error: 'INVALID_GIT_COMMAND',
        graphState: state,
      };
  }
}

function parseArgs(str: string): string[] {
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const args: string[] = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    args.push(match[1] ?? match[2] ?? match[0]);
  }
  return args;
}

function handleStatus(state: GitGraphState): CommandExecutionResult {
  const head = state.refs.HEAD;
  const lines: string[] = [];

  if (head.type === 'branch') {
    lines.push(`On branch ${head.target}`);
    const upstreamCommit = state.refs.remotes.upstream?.[head.target] || state.refs.remotes.origin?.[head.target];
    const localCommit = state.refs.branches[head.target];
    if (upstreamCommit && localCommit) {
      if (upstreamCommit === localCommit) {
        lines.push(`Your branch is up to date with 'upstream/${head.target}'.`);
      } else {
        lines.push(`Your branch is out of sync with 'upstream/${head.target}'.`);
      }
    }
  } else {
    lines.push(`HEAD detached at ${head.target.slice(0, 7)}`);
  }

  if (state.rebaseState?.inProgress) {
    lines.push(`You are currently rebasing branch '${state.rebaseState.originalBranch}' onto '${state.rebaseState.ontoBranch}'.`);
    lines.push(`  (fix conflicts and then run "git rebase --continue")`);
    lines.push(`  (use "git rebase --abort" to check out the original branch)`);
  }

  const conflicts = Object.keys(state.staging.conflicts);
  if (conflicts.length > 0) {
    lines.push('\nUnmerged paths:');
    lines.push('  (use "git add <file>..." to mark resolution)');
    conflicts.forEach((f) => lines.push(`\tboth modified:   ${f}`));
  }

  const staged = Object.keys(state.staging.staged);
  if (staged.length > 0) {
    lines.push('\nChanges to be committed:');
    lines.push('  (use "git restore --staged <file>..." to unstage)');
    staged.forEach((f) => lines.push(`\tmodified:   ${f}`));
  }

  const unstaged = Object.keys(state.staging.unstaged);
  if (unstaged.length > 0) {
    lines.push('\nChanges not staged for commit:');
    lines.push('  (use "git add <file>..." to update what will be committed)');
    unstaged.forEach((f) => lines.push(`\tmodified:   ${f}`));
  }

  if (staged.length === 0 && unstaged.length === 0 && conflicts.length === 0) {
    lines.push('\nnothing to commit, working tree clean');
  }

  return { success: true, output: lines.join('\n'), graphState: state };
}

function handleBranch(args: string[], state: GitGraphState): CommandExecutionResult {
  if (args.length === 0 || (args.length === 1 && (args[0] === '-a' || args[0] === '--all'))) {
    const showAll = args.includes('-a') || args.includes('--all');
    const lines: string[] = [];
    const currentBranch = state.refs.HEAD.type === 'branch' ? state.refs.HEAD.target : null;

    Object.keys(state.refs.branches).sort().forEach((b) => {
      const prefix = b === currentBranch ? '* ' : '  ';
      lines.push(`${prefix}${b}`);
    });

    if (showAll) {
      Object.entries(state.refs.remotes).forEach(([remote, branches]) => {
        Object.keys(branches).forEach((rb) => {
          lines.push(`  remotes/${remote}/${rb}`);
        });
      });
    }

    return { success: true, output: lines.join('\n'), graphState: state };
  }

  if (args[0] === '-d' || args[0] === '-D') {
    const branchName = args[1];
    if (!branchName) {
      return { success: false, output: 'fatal: branch name required', error: 'MISSING_BRANCH', graphState: state };
    }
    if (state.refs.HEAD.type === 'branch' && state.refs.HEAD.target === branchName) {
      return {
        success: false,
        output: `error: Cannot delete branch '${branchName}' checked out at current HEAD`,
        error: 'CANNOT_DELETE_CHECKED_OUT',
        graphState: state,
      };
    }
    if (!state.refs.branches[branchName]) {
      return { success: false, output: `error: branch '${branchName}' not found.`, error: 'BRANCH_NOT_FOUND', graphState: state };
    }
    delete state.refs.branches[branchName];
    return { success: true, output: `Deleted branch ${branchName}.`, graphState: state };
  }

  const newBranch = args[0];
  if (state.refs.branches[newBranch]) {
    return { success: false, output: `fatal: a branch named '${newBranch}' already exists`, error: 'BRANCH_EXISTS', graphState: state };
  }

  const current = getCurrentCommit(state);
  if (!current) {
    return { success: false, output: 'fatal: Not a valid object name: master.', error: 'NO_COMMITS', graphState: state };
  }

  state.refs.branches[newBranch] = current.hash;
  return { success: true, output: `Created branch ${newBranch} at ${current.shortHash}`, graphState: state };
}

function handleCheckout(args: string[], state: GitGraphState): CommandExecutionResult {
  if (args.length === 0) {
    return { success: false, output: 'fatal: you must specify a branch or commit to checkout.', error: 'MISSING_TARGET', graphState: state };
  }

  if (args[0] === '-b') {
    const branchName = args[1];
    if (!branchName) {
      return { success: false, output: 'fatal: missing branch name for -b option', error: 'MISSING_BRANCH', graphState: state };
    }
    if (state.refs.branches[branchName]) {
      return { success: false, output: `fatal: a branch named '${branchName}' already exists`, error: 'BRANCH_EXISTS', graphState: state };
    }
    const current = getCurrentCommit(state);
    if (!current) {
      return { success: false, output: 'fatal: cannot create branch without commits', error: 'NO_COMMITS', graphState: state };
    }
    state.refs.branches[branchName] = current.hash;
    state.refs.HEAD = { type: 'branch', target: branchName };
    return { success: true, output: `Switched to a new branch '${branchName}'`, graphState: state };
  }

  const target = args[0];

  // Checkout existing local branch
  if (state.refs.branches[target]) {
    state.refs.HEAD = { type: 'branch', target };
    return { success: true, output: `Switched to branch '${target}'`, graphState: state };
  }

  // Checkout remote branch tracking
  for (const [remote, branches] of Object.entries(state.refs.remotes)) {
    if (target.startsWith(`${remote}/`)) {
      const shortName = target.slice(remote.length + 1);
      if (branches[shortName]) {
        state.refs.branches[shortName] = branches[shortName];
        state.refs.HEAD = { type: 'branch', target: shortName };
        return {
          success: true,
          output: `Branch '${shortName}' set up to track remote branch '${target}' from '${remote}'.\nSwitched to a new branch '${shortName}'`,
          graphState: state,
        };
      }
    }
  }

  // Checkout commit hash (Detached HEAD)
  const commit = Object.values(state.commits).find(
    (c) => c.hash === target || c.shortHash === target || c.hash.startsWith(target)
  );

  if (commit) {
    state.refs.HEAD = { type: 'detached', target: commit.hash };
    return {
      success: true,
      output: `Note: switching to '${target}'.\nYou are in 'detached HEAD' state. You can look around, make experimental\nchanges and commit them at ${commit.shortHash}.`,
      graphState: state,
    };
  }

  return { success: false, output: `error: pathspec '${target}' did not match any file(s) known to git`, error: 'TARGET_NOT_FOUND', graphState: state };
}

function handleSwitch(args: string[], state: GitGraphState): CommandExecutionResult {
  if (args.length === 0) {
    return { success: false, output: 'fatal: missing branch name to switch to', error: 'MISSING_TARGET', graphState: state };
  }
  if (args[0] === '-c' || args[0] === '--create') {
    return handleCheckout(['-b', args[1]], state);
  }
  return handleCheckout([args[0]], state);
}

function handleAdd(args: string[], state: GitGraphState): CommandExecutionResult {
  if (args.length === 0) {
    return { success: false, output: 'Nothing specified, nothing added.', graphState: state };
  }

  const target = args[0];

  if (target === '.' || target === '-A') {
    Object.entries(state.staging.unstaged).forEach(([f, content]) => {
      state.staging.staged[f] = content;
    });
    state.staging.unstaged = {};

    // Clear conflicts that were staged
    Object.keys(state.staging.conflicts).forEach((f) => {
      if (state.staging.staged[f]) {
        delete state.staging.conflicts[f];
      }
    });

    return { success: true, output: '', graphState: state };
  }

  if (state.staging.unstaged[target]) {
    state.staging.staged[target] = state.staging.unstaged[target];
    delete state.staging.unstaged[target];
  }

  if (state.staging.conflicts[target]) {
    delete state.staging.conflicts[target];
  }

  return { success: true, output: '', graphState: state };
}

function handleCommit(args: string[], state: GitGraphState): CommandExecutionResult {
  if (Object.keys(state.staging.conflicts).length > 0) {
    return {
      success: false,
      output: 'error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use "git add <file>"\nhint: to mark resolution, or use "git commit -m" after resolving.',
      error: 'UNMERGED_FILES',
      graphState: state,
    };
  }

  const mIndex = args.indexOf('-m');
  const message = mIndex !== -1 && args[mIndex + 1] ? args[mIndex + 1] : 'chore: auto checkpoint commit';

  const current = getCurrentCommit(state);
  const currentFiles = current ? { ...current.files } : {};
  const staged = state.staging.staged;

  if (Object.keys(staged).length === 0) {
    return {
      success: false,
      output: 'On branch ' + (state.refs.HEAD.type === 'branch' ? state.refs.HEAD.target : 'detached') + '\nnothing to commit, working tree clean',
      error: 'NO_CHANGES_STAGED',
      graphState: state,
    };
  }

  const newFiles = { ...currentFiles, ...staged };
  const { hash, shortHash } = generateCommitHash();

  const newCommit: GitCommit = {
    hash,
    shortHash,
    message,
    author: 'Open Source Contributor <contributor@contribo.org>',
    timestamp: Date.now(),
    parents: current ? [current.hash] : [],
    files: newFiles,
  };

  state.commits[hash] = newCommit;
  state.staging.staged = {};

  if (state.refs.HEAD.type === 'branch') {
    state.refs.branches[state.refs.HEAD.target] = hash;
  } else {
    state.refs.HEAD.target = hash;
  }

  const branchLabel = state.refs.HEAD.type === 'branch' ? state.refs.HEAD.target : '(detached HEAD)';
  return {
    success: true,
    output: `[${branchLabel} ${shortHash}] ${message}\n ${Object.keys(staged).length} file(s) changed`,
    graphState: state,
  };
}

function handleMerge(args: string[], state: GitGraphState): CommandExecutionResult {
  if (args.length === 0) {
    return { success: false, output: 'fatal: No remote repository or branch specified to merge.', error: 'MISSING_BRANCH', graphState: state };
  }

  const targetBranch = args[0];
  const targetHash = state.refs.branches[targetBranch] || state.refs.remotes.upstream?.[targetBranch] || state.refs.remotes.origin?.[targetBranch];

  if (!targetHash) {
    return { success: false, output: `merge: ${targetBranch} - not something we can merge`, error: 'BRANCH_NOT_FOUND', graphState: state };
  }

  const current = getCurrentCommit(state);
  if (!current) {
    return { success: false, output: 'fatal: current HEAD is invalid', error: 'INVALID_HEAD', graphState: state };
  }

  if (current.hash === targetHash) {
    return { success: true, output: 'Already up to date.', graphState: state };
  }

  const commonAncestor = findCommonAncestor(state.commits, current.hash, targetHash);

  // Fast-Forward Merge: Current HEAD is the common ancestor
  if (commonAncestor === current.hash) {
    if (state.refs.HEAD.type === 'branch') {
      state.refs.branches[state.refs.HEAD.target] = targetHash;
    } else {
      state.refs.HEAD.target = targetHash;
    }
    const targetCommit = state.commits[targetHash];
    return {
      success: true,
      output: `Updating ${current.shortHash}..${targetCommit.shortHash}\nFast-forward\n Merged branch '${targetBranch}' cleanly.`,
      graphState: state,
    };
  }

  // Target is already an ancestor of Current: Already up to date
  if (commonAncestor === targetHash) {
    return { success: true, output: 'Already up to date.', graphState: state };
  }

  // 3-Way Merge: Check for file conflicts
  const targetCommit = state.commits[targetHash];
  const baseCommit = commonAncestor ? state.commits[commonAncestor] : null;

  const conflictFiles: Record<string, GitConflictData> = {};
  const mergedFiles: Record<string, string> = { ...current.files };

  const allFiles = new Set([...Object.keys(current.files), ...Object.keys(targetCommit.files)]);

  allFiles.forEach((file) => {
    const curContent = current.files[file] ?? '';
    const incomingContent = targetCommit.files[file] ?? '';
    const baseContent = baseCommit?.files[file] ?? '';

    if (curContent === incomingContent) {
      mergedFiles[file] = curContent;
    } else if (curContent === baseContent) {
      // Incoming modified, take incoming
      mergedFiles[file] = incomingContent;
    } else if (incomingContent === baseContent) {
      // Current modified, keep current
      mergedFiles[file] = curContent;
    } else {
      // Conflict detected!
      const rawWithMarkers = `<<<<<<< HEAD\n${curContent}\n=======\n${incomingContent}\n>>>>>>> ${targetBranch}`;
      conflictFiles[file] = {
        file,
        base: baseContent,
        current: curContent,
        incoming: incomingContent,
        rawWithMarkers,
      };
      state.staging.unstaged[file] = rawWithMarkers;
    }
  });

  if (Object.keys(conflictFiles).length > 0) {
    state.staging.conflicts = conflictFiles;
    return {
      success: false,
      output: `Auto-merging ${Object.keys(conflictFiles).join(', ')}\nCONFLICT (content): Merge conflict in ${Object.keys(conflictFiles).join(', ')}\nAutomatic merge failed; fix conflicts and then commit the result.`,
      error: 'MERGE_CONFLICT',
      conflictDetected: true,
      graphState: state,
    };
  }

  // Non-conflicting 3-way merge commit
  const { hash, shortHash } = generateCommitHash();
  const mergeMessage = `Merge branch '${targetBranch}' into ${state.refs.HEAD.type === 'branch' ? state.refs.HEAD.target : 'HEAD'}`;

  const mergeCommit: GitCommit = {
    hash,
    shortHash,
    message: mergeMessage,
    author: 'Open Source Contributor <contributor@contribo.org>',
    timestamp: Date.now(),
    parents: [current.hash, targetHash],
    files: mergedFiles,
    isMerge: true,
  };

  state.commits[hash] = mergeCommit;

  if (state.refs.HEAD.type === 'branch') {
    state.refs.branches[state.refs.HEAD.target] = hash;
  } else {
    state.refs.HEAD.target = hash;
  }

  return {
    success: true,
    output: `Merge made by the 'ort' strategy.\n ${Object.keys(mergedFiles).length} files merged into ${shortHash}.`,
    graphState: state,
  };
}

function handleRebase(args: string[], state: GitGraphState): CommandExecutionResult {
  if (args.includes('--abort')) {
    if (!state.rebaseState?.inProgress) {
      return { success: false, output: 'fatal: No rebase in progress?', error: 'NO_REBASE_IN_PROGRESS', graphState: state };
    }
    state.refs.HEAD = { type: 'branch', target: state.rebaseState.originalBranch };
    state.rebaseState = undefined;
    state.staging.conflicts = {};
    state.staging.unstaged = {};
    return { success: true, output: 'Rebase aborted. Checked out original branch.', graphState: state };
  }

  if (args.includes('--continue')) {
    if (!state.rebaseState?.inProgress) {
      return { success: false, output: 'fatal: No rebase in progress?', error: 'NO_REBASE_IN_PROGRESS', graphState: state };
    }
    if (Object.keys(state.staging.conflicts).length > 0) {
      return {
        success: false,
        output: 'error: you must resolve conflicts before continuing the rebase\nhint: use "git add <file>" to mark resolution.',
        error: 'CONFLICTS_REMAIN',
        graphState: state,
      };
    }

    // Apply remaining commits
    const { originalBranch, remainingCommits } = state.rebaseState;
    let headHash = state.refs.branches[originalBranch] || state.refs.HEAD.target;

    for (const c of remainingCommits) {
      const { hash, shortHash } = generateCommitHash();
      const replayed: GitCommit = {
        hash,
        shortHash,
        message: c.message,
        author: c.author,
        timestamp: Date.now(),
        parents: [headHash],
        files: { ...state.commits[headHash].files, ...c.files, ...state.staging.staged },
      };
      state.commits[hash] = replayed;
      headHash = hash;
    }

    state.staging.staged = {};
    state.refs.branches[originalBranch] = headHash;
    state.refs.HEAD = { type: 'branch', target: originalBranch };
    state.rebaseState = undefined;

    return {
      success: true,
      output: `Applying resolved commits onto ${headHash.slice(0, 7)}...\nSuccessfully rebased and updated refs/heads/${originalBranch}.`,
      graphState: state,
    };
  }

  if (args.length === 0) {
    return { success: false, output: 'fatal: you must specify a branch to rebase onto', error: 'MISSING_BRANCH', graphState: state };
  }

  const targetBranch = args[0];
  const targetHash = state.refs.branches[targetBranch] || state.refs.remotes.upstream?.[targetBranch] || state.refs.remotes.origin?.[targetBranch];

  if (!targetHash) {
    return { success: false, output: `fatal: invalid upstream '${targetBranch}'`, error: 'BRANCH_NOT_FOUND', graphState: state };
  }

  const current = getCurrentCommit(state);
  if (!current) {
    return { success: false, output: 'fatal: current HEAD is invalid', error: 'INVALID_HEAD', graphState: state };
  }

  const commonAncestor = findCommonAncestor(state.commits, current.hash, targetHash);
  if (commonAncestor === targetHash) {
    return { success: true, output: `Current branch is up to date with '${targetBranch}'.`, graphState: state };
  }

  // Gather commits on current branch not in target
  const commitsToReplay: GitCommit[] = [];
  let curr: GitCommit | null = current;
  while (curr && curr.hash !== commonAncestor && curr.parents.length > 0) {
    commitsToReplay.unshift(curr);
    curr = state.commits[curr.parents[0]] || null;
  }

  const currentBranchName = state.refs.HEAD.type === 'branch' ? state.refs.HEAD.target : 'HEAD';

  // Check for conflicts on the first commit
  const targetCommit = state.commits[targetHash];
  const firstCommit = commitsToReplay[0];

  if (firstCommit) {
    const conflictFiles: Record<string, GitConflictData> = {};
    for (const [file, content] of Object.entries(firstCommit.files)) {
      if (targetCommit.files[file] && targetCommit.files[file] !== content) {
        const rawWithMarkers = `<<<<<<< HEAD\n${targetCommit.files[file]}\n=======\n${content}\n>>>>>>> ${firstCommit.shortHash}`;
        conflictFiles[file] = {
          file,
          base: state.commits[commonAncestor || '']?.files[file] ?? '',
          current: targetCommit.files[file],
          incoming: content,
          rawWithMarkers,
        };
        state.staging.unstaged[file] = rawWithMarkers;
      }
    }

    if (Object.keys(conflictFiles).length > 0) {
      state.staging.conflicts = conflictFiles;
      state.rebaseState = {
        inProgress: true,
        ontoBranch: targetBranch,
        originalBranch: currentBranchName,
        remainingCommits: commitsToReplay.slice(1),
        currentCommitIndex: 0,
      };
      state.refs.HEAD = { type: 'detached', target: targetHash };

      return {
        success: false,
        output: `First, rewinding head to replay your work on top of it...\nApplying: ${firstCommit.message}\nUsing index info to reconstruct a base tree...\nFalling back to patching base and 3-way merge...\nAuto-merging ${Object.keys(conflictFiles).join(', ')}\nCONFLICT (content): Merge conflict in ${Object.keys(conflictFiles).join(', ')}\nerror: Failed to merge in the changes.\nPatch failed at 0001 ${firstCommit.message}\nWhen you have resolved this problem, run "git rebase --continue".`,
        error: 'REBASE_CONFLICT',
        conflictDetected: true,
        graphState: state,
      };
    }
  }

  // Clean rebase replay
  let newBaseHash = targetHash;
  for (const c of commitsToReplay) {
    const { hash, shortHash } = generateCommitHash();
    const replayed: GitCommit = {
      hash,
      shortHash,
      message: c.message,
      author: c.author,
      timestamp: Date.now(),
      parents: [newBaseHash],
      files: { ...state.commits[newBaseHash].files, ...c.files },
    };
    state.commits[hash] = replayed;
    newBaseHash = hash;
  }

  if (state.refs.HEAD.type === 'branch') {
    state.refs.branches[state.refs.HEAD.target] = newBaseHash;
  } else {
    state.refs.HEAD.target = newBaseHash;
  }

  return {
    success: true,
    output: `First, rewinding head to replay your work on top of it...\nApplying: ${commitsToReplay.map((c) => c.message).join(', ')}\nSuccessfully rebased and updated refs/heads/${currentBranchName}.`,
    graphState: state,
  };
}

function handleReset(args: string[], state: GitGraphState): CommandExecutionResult {
  const mode = args.includes('--hard') ? 'hard' : args.includes('--soft') ? 'soft' : 'mixed';
  const targetArg = args.find((a) => !a.startsWith('--')) || 'HEAD';

  let targetHash: string | null = null;

  if (targetArg.startsWith('HEAD~')) {
    const count = parseInt(targetArg.slice(5), 10) || 1;
    let curr = getCurrentCommit(state);
    for (let i = 0; i < count; i++) {
      if (curr && curr.parents.length > 0) {
        curr = state.commits[curr.parents[0]] || null;
      }
    }
    targetHash = curr ? curr.hash : null;
  } else if (state.refs.branches[targetArg]) {
    targetHash = state.refs.branches[targetArg];
  } else {
    const c = Object.values(state.commits).find((x) => x.hash.startsWith(targetArg) || x.shortHash === targetArg);
    targetHash = c ? c.hash : null;
  }

  if (!targetHash) {
    return { success: false, output: `fatal: ambiguous argument '${targetArg}': unknown revision or path not in the working tree.`, error: 'UNKNOWN_REVISION', graphState: state };
  }

  const prevCommit = getCurrentCommit(state);

  if (state.refs.HEAD.type === 'branch') {
    state.refs.branches[state.refs.HEAD.target] = targetHash;
  } else {
    state.refs.HEAD.target = targetHash;
  }

  const targetCommit = state.commits[targetHash];

  if (mode === 'hard') {
    state.staging.staged = {};
    state.staging.unstaged = {};
    state.staging.conflicts = {};
  } else if (mode === 'soft') {
    if (prevCommit && targetCommit) {
      for (const [f, content] of Object.entries(prevCommit.files)) {
        if (targetCommit.files[f] !== content) {
          state.staging.staged[f] = content;
        }
      }
    }
  } else if (mode === 'mixed') {
    state.staging.staged = {};
    if (prevCommit && targetCommit) {
      for (const [f, content] of Object.entries(prevCommit.files)) {
        if (targetCommit.files[f] !== content) {
          state.staging.unstaged[f] = content;
        }
      }
    }
  }

  return { success: true, output: `HEAD is now at ${targetHash.slice(0, 7)}`, graphState: state };
}

function handleCherryPick(args: string[], state: GitGraphState): CommandExecutionResult {
  if (args.length === 0) {
    return { success: false, output: 'fatal: no commit specified to cherry-pick', error: 'MISSING_COMMIT', graphState: state };
  }

  const targetArg = args[0];
  const sourceCommit = Object.values(state.commits).find(
    (c) => c.hash.startsWith(targetArg) || c.shortHash === targetArg
  );

  if (!sourceCommit) {
    return { success: false, output: `fatal: bad revision '${targetArg}'`, error: 'COMMIT_NOT_FOUND', graphState: state };
  }

  const current = getCurrentCommit(state);
  if (!current) {
    return { success: false, output: 'fatal: current HEAD is invalid', error: 'INVALID_HEAD', graphState: state };
  }

  const { hash, shortHash } = generateCommitHash();
  const pickedCommit: GitCommit = {
    hash,
    shortHash,
    message: sourceCommit.message,
    author: sourceCommit.author,
    timestamp: Date.now(),
    parents: [current.hash],
    files: { ...current.files, ...sourceCommit.files },
  };

  state.commits[hash] = pickedCommit;

  if (state.refs.HEAD.type === 'branch') {
    state.refs.branches[state.refs.HEAD.target] = hash;
  } else {
    state.refs.HEAD.target = hash;
  }

  return {
    success: true,
    output: `[${state.refs.HEAD.type === 'branch' ? state.refs.HEAD.target : 'detached'} ${shortHash}] ${pickedCommit.message}\n 1 file(s) changed`,
    graphState: state,
  };
}

function handleLog(args: string[], state: GitGraphState): CommandExecutionResult {
  const current = getCurrentCommit(state);
  if (!current) {
    return { success: true, output: 'fatal: your current branch does not have any commits yet', graphState: state };
  }

  const lines: string[] = [];
  const visited = new Set<string>();
  const queue = [current.hash];

  while (queue.length > 0) {
    const hash = queue.shift()!;
    if (visited.has(hash)) continue;
    visited.add(hash);

    const c = state.commits[hash];
    if (!c) continue;

    // Build branch/tag decoration
    const decs: string[] = [];
    if (state.refs.HEAD.type === 'detached' && state.refs.HEAD.target === c.hash) {
      decs.push('HEAD');
    }
    Object.entries(state.refs.branches).forEach(([b, h]) => {
      if (h === c.hash) {
        if (state.refs.HEAD.type === 'branch' && state.refs.HEAD.target === b) {
          decs.push(`HEAD -> ${b}`);
        } else {
          decs.push(b);
        }
      }
    });
    Object.entries(state.refs.remotes).forEach(([remote, branches]) => {
      Object.entries(branches).forEach(([b, h]) => {
        if (h === c.hash) decs.push(`${remote}/${b}`);
      });
    });

    const decStr = decs.length > 0 ? ` (${decs.join(', ')})` : '';

    if (args.includes('--oneline')) {
      lines.push(`* ${c.shortHash}${decStr} ${c.message}`);
    } else {
      lines.push(`commit ${c.hash}${decStr}`);
      lines.push(`Author: ${c.author}`);
      lines.push(`Date:   ${new Date(c.timestamp).toUTCString()}`);
      lines.push(`\n    ${c.message}\n`);
    }

    if (c.parents) {
      queue.push(...c.parents);
    }
  }

  return { success: true, output: lines.join('\n'), graphState: state };
}

function handleFetch(args: string[], state: GitGraphState): CommandExecutionResult {
  const remote = args[0] || 'upstream';
  if (!state.refs.remotes[remote]) {
    return { success: false, output: `fatal: '${remote}' does not appear to be a git repository`, error: 'REMOTE_NOT_FOUND', graphState: state };
  }

  // Simulate remote having a newer commit on main
  const currentRemoteMain = state.refs.remotes[remote].main;
  const currentLocalMain = state.refs.branches.main;

  if (currentRemoteMain && currentLocalMain && currentRemoteMain === currentLocalMain) {
    const { hash, shortHash } = generateCommitHash();
    state.commits[hash] = {
      hash,
      shortHash,
      message: 'feat(upstream): update contributing guidelines & dependencies',
      author: 'Upstream Maintainer <maintainer@opensource.org>',
      timestamp: Date.now() - 1000 * 60 * 30,
      parents: [currentRemoteMain],
      files: {
        'CONTRIBUTING.md': '# Contributing\nPlease follow our PR standards.\n',
        'README.md': '# Open Source Project\nOfficial upstream updates.\n',
      },
    };
    state.refs.remotes[remote].main = hash;
    return {
      success: true,
      output: `From https://github.com/${remote}/community-repo\n * [new branch]      main       -> ${remote}/main\n   ${currentRemoteMain.slice(0, 7)}..${shortHash}  main       -> ${remote}/main`,
      graphState: state,
    };
  }

  return { success: true, output: `From https://github.com/${remote}/community-repo\n = [up to date]      main       -> ${remote}/main`, graphState: state };
}

function handlePush(args: string[], state: GitGraphState): CommandExecutionResult {
  const remote = args[0] || 'origin';
  const branch = args[1] || (state.refs.HEAD.type === 'branch' ? state.refs.HEAD.target : 'main');

  if (!state.refs.branches[branch]) {
    return { success: false, output: `error: src refspec ${branch} does not match any`, error: 'BRANCH_NOT_FOUND', graphState: state };
  }

  if (!state.refs.remotes[remote]) {
    state.refs.remotes[remote] = {};
  }

  state.refs.remotes[remote][branch] = state.refs.branches[branch];
  return {
    success: true,
    output: `To https://github.com/${remote}/community-repo.git\n * [new branch]      ${branch} -> ${branch}`,
    graphState: state,
  };
}

function handlePull(args: string[], state: GitGraphState): CommandExecutionResult {
  const fetchRes = handleFetch(args, state);
  if (!fetchRes.success) return fetchRes;
  const mergeRes = handleMerge([`${args[0] || 'upstream'}/main`], fetchRes.graphState);
  return {
    ...mergeRes,
    output: `${fetchRes.output}\n${mergeRes.output}`,
  };
}
