/**
 * Core pure helper functions and data structures for the Contributor Action Toolkit.
 * Kept framework-free so they can be unit-tested directly with node:test.
 */

export const COMMIT_TYPES = [
  { type: 'feat', label: 'Feature', description: 'A new feature or capability', badge: 'feat' },
  { type: 'fix', label: 'Bug Fix', description: 'A bug fix for existing behavior', badge: 'fix' },
  { type: 'docs', label: 'Documentation', description: 'Documentation-only changes', badge: 'docs' },
  { type: 'refactor', label: 'Refactor', description: 'Code change that neither fixes a bug nor adds a feature', badge: 'refactor' },
  { type: 'perf', label: 'Performance', description: 'A code change that improves performance', badge: 'perf' },
  { type: 'test', label: 'Tests', description: 'Adding missing tests or correcting existing tests', badge: 'test' },
  { type: 'chore', label: 'Chore', description: 'Changes to build process, tooling, or dependencies', badge: 'chore' },
  { type: 'style', label: 'Style', description: 'Formatting, white-space, semi-colons (no logic change)', badge: 'style' },
];

export const GIT_CHEATSHEET = [
  {
    category: 'Syncing Upstream',
    description: 'Keep your fork updated with the main project repository.',
    commands: [
      {
        cmd: 'git remote add upstream <repo-url>',
        desc: 'Add the original repository as an upstream remote',
      },
      {
        cmd: 'git fetch upstream',
        desc: 'Fetch new commits and branches from upstream without modifying your workspace',
      },
      {
        cmd: 'git checkout main && git merge upstream/main',
        desc: 'Fast-forward your local main branch to match upstream main',
      },
      {
        cmd: 'git rebase upstream/main',
        desc: 'Replay your branch commits on top of the latest upstream main branch',
      },
    ],
  },
  {
    category: 'Branching & Commits',
    description: 'Create clean branches and craft conventional commits.',
    commands: [
      {
        cmd: 'git checkout -b <branch-name>',
        desc: 'Create and switch to a dedicated feature or fix branch',
      },
      {
        cmd: 'git add .',
        desc: 'Stage all modified and newly created files',
      },
      {
        cmd: 'git commit -m "<type>(<scope>): <summary>"',
        desc: 'Commit staged changes with a standardized conventional message',
      },
      {
        cmd: 'git push -u origin <branch-name>',
        desc: 'Push local branch to your GitHub fork and set upstream tracking',
      },
    ],
  },
  {
    category: 'Clean Up & Maintenance',
    description: 'Tidy up commit histories, squash WIP commits, and manage temporary changes.',
    commands: [
      {
        cmd: 'git rebase -i HEAD~3',
        desc: 'Interactively squash, edit, or reword your last 3 commits',
      },
      {
        cmd: 'git commit --amend --no-edit',
        desc: 'Append newly staged changes into your last commit without altering message',
      },
      {
        cmd: 'git stash && git stash pop',
        desc: 'Temporarily shelf uncommitted edits and restore them when needed',
      },
      {
        cmd: 'git status && git log --oneline -n 5',
        desc: 'Inspect current work tree and view the 5 most recent commits compactly',
      },
    ],
  },
];

/**
 * Normalizes an issue number string into '#X' format.
 * @param {string|number} issue
 * @returns {string}
 */
export function normalizeIssueNumber(issue) {
  if (!issue) return '';
  const trimmed = String(issue).trim();
  if (!trimmed) return '';
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

/**
 * Formats a conventional commit headline.
 * @param {{ type?: string, scope?: string, description?: string, isBreaking?: boolean }} [options]
 * @returns {string}
 */
export function formatConventionalCommit({
  type = 'feat',
  scope = '',
  description = '',
  isBreaking = false,
} = {}) {
  const cleanType = String(type || 'feat').trim().toLowerCase();
  const cleanScope = String(scope || '').trim().toLowerCase();
  const cleanDesc = String(description || '').trim();
  const breakingMark = isBreaking ? '!' : '';
  const scopePart = cleanScope ? `(${cleanScope})` : '';

  return `${cleanType}${scopePart}${breakingMark}: ${cleanDesc || 'concise description of change'}`;
}

/**
 * Generates a complete GitHub PR description markdown string.
 * @param {Object} options
 * @returns {string}
 */
export function generatePrDescription({
  type = 'feat',
  scope = '',
  issueNumber = '',
  title = '',
  summary = '',
  testSteps = '',
  isBreaking = false,
  breakingDetails = '',
  checklist = {
    codeStyle: true,
    selfReview: true,
    commented: false,
    noWarnings: true,
    testsAdded: true,
  },
} = {}) {
  const normIssue = normalizeIssueNumber(issueNumber);
  const commitHeadline = formatConventionalCommit({
    type,
    scope,
    description: title || summary || 'feature description',
    isBreaking,
  });

  const matchingType = COMMIT_TYPES.find((t) => t.type === type);
  const typeLabel = matchingType ? `${matchingType.label} (\`${type}\`)` : `\`${type}\``;

  const sections = [];

  // Title / Conventional Header suggestion
  sections.push(`### PR Title Suggestion\n\`${commitHeadline}\`\n`);

  // Description & Closes
  sections.push('## Description');
  if (summary && summary.trim()) {
    sections.push(summary.trim());
  } else {
    sections.push('Explain the purpose of this PR and summarize the changes made.');
  }

  if (normIssue) {
    sections.push(`\nCloses ${normIssue}`);
  }

  // Type of Change
  sections.push('\n## Type of Change');
  sections.push(`- [x] ${typeLabel}`);
  if (isBreaking) {
    sections.push(`- [x] ⚠️ **BREAKING CHANGE**${breakingDetails ? `: ${breakingDetails.trim()}` : ''}`);
  } else {
    sections.push('- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)');
  }

  // Testing
  sections.push('\n## How Has This Been Tested?');
  if (testSteps && testSteps.trim()) {
    sections.push(testSteps.trim());
  } else {
    sections.push('Please describe the tests that you ran to verify your changes. Include instructions and commands.');
  }

  // Checklist
  sections.push('\n## Checklist');
  sections.push(`- [${checklist?.codeStyle ? 'x' : ' '}] My code follows the code style guidelines of this project`);
  sections.push(`- [${checklist?.selfReview ? 'x' : ' '}] I have performed a self-review of my own code`);
  sections.push(`- [${checklist?.commented ? 'x' : ' '}] I have commented my code, particularly in hard-to-understand areas`);
  sections.push(`- [${checklist?.noWarnings ? 'x' : ' '}] My changes generate no new warnings or lint errors`);
  sections.push(`- [${checklist?.testsAdded ? 'x' : ' '}] I have added tests that prove my fix is effective or that my feature works`);
  sections.push('- [x] All existing and new tests pass locally');

  return sections.join('\n');
}

/**
 * Generates a polite, high-converting Issue Claim comment markdown string.
 * @param {Object} options
 * @returns {string}
 */
export function generateIssueClaim({
  issueNumber = '',
  reproduction = '',
  proposedSolution = '',
  timeline = '',
  program = '',
  maintainerHandle = '',
} = {}) {
  const normIssue = normalizeIssueNumber(issueNumber);
  const greeting = maintainerHandle && maintainerHandle.trim()
    ? `Hi @${maintainerHandle.trim().replace(/^@/, '')}! 👋`
    : 'Hi @maintainer! 👋';

  const programText = program && program.trim() && program !== 'General'
    ? ` under **${program.trim()}**`
    : '';

  const issueRefText = normIssue ? ` on ${normIssue}` : '';

  const lines = [
    `${greeting}\n`,
    `I would like to work on this issue${issueRefText}${programText}.\n`,
    '### 🔍 Verification & Context',
    reproduction && reproduction.trim()
      ? reproduction.trim()
      : 'I investigated the problem and verified the scenario described in the issue.',
    '\n### 💡 Proposed Solution',
    proposedSolution && proposedSolution.trim()
      ? proposedSolution.trim()
      : '1. Locate the relevant components and review current behavior.\n2. Implement the proposed fix / feature cleanly.\n3. Verify with linting and unit tests.',
  ];

  if (timeline && timeline.trim()) {
    lines.push('\n### ⏱️ Timeline & Experience');
    lines.push(timeline.trim());
  }

  lines.push('\nCould you please assign this issue to me? Thank you!');

  return lines.join('\n');
}
