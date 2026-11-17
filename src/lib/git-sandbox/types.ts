export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  timestamp: number;
  parents: string[];
  files: Record<string, string>;
  isMerge?: boolean;
}

export interface GitBranch {
  name: string;
  target: string; // Commit hash
  isRemote?: boolean;
}

export interface GitRefState {
  HEAD: {
    type: 'branch' | 'detached';
    target: string; // Branch name if type === 'branch', commit hash if 'detached'
  };
  branches: Record<string, string>; // branchName -> commitHash
  remotes: Record<string, Record<string, string>>; // remoteName -> { branchName: commitHash }
  tags: Record<string, string>; // tagName -> commitHash
}

export interface GitConflictData {
  file: string;
  base: string;
  current: string;
  incoming: string;
  rawWithMarkers: string;
}

export interface GitStagingArea {
  staged: Record<string, string>; // file -> content
  unstaged: Record<string, string>; // file -> content
  conflicts: Record<string, GitConflictData>; // file -> conflict data
}

export interface GitRebaseState {
  inProgress: boolean;
  ontoBranch: string;
  originalBranch: string;
  remainingCommits: GitCommit[];
  currentCommitIndex: number;
}

export interface GitGraphState {
  commits: Record<string, GitCommit>;
  refs: GitRefState;
  staging: GitStagingArea;
  rebaseState?: GitRebaseState;
}

export interface ChallengeObjective {
  id: string;
  description: string;
  check: (state: GitGraphState) => boolean;
}

export interface GitChallenge {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  description: string;
  initialState: () => GitGraphState;
  objectives: ChallengeObjective[];
  hints: string[];
  solutionSteps: string[];
}

export interface CommandExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  graphState: GitGraphState;
  conflictDetected?: boolean;
}
