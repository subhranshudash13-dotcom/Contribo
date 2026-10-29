import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMIT_TYPES,
  GIT_CHEATSHEET,
  normalizeIssueNumber,
  formatConventionalCommit,
  generatePrDescription,
  generateIssueClaim,
} from '../src/lib/contributor-toolkit.mjs';

test('normalizeIssueNumber formats numeric and string issue numbers', () => {
  assert.equal(normalizeIssueNumber(99), '#99');
  assert.equal(normalizeIssueNumber('99'), '#99');
  assert.equal(normalizeIssueNumber('#99'), '#99');
  assert.equal(normalizeIssueNumber('   #101  '), '#101');
  assert.equal(normalizeIssueNumber(''), '');
  assert.equal(normalizeIssueNumber(null), '');
});

test('formatConventionalCommit formats messages with scope and breaking markers', () => {
  assert.equal(
    formatConventionalCommit({ type: 'feat', scope: 'resources', description: 'add action toolkit' }),
    'feat(resources): add action toolkit'
  );
  assert.equal(
    formatConventionalCommit({ type: 'fix', scope: '', description: 'fix modal overlay scroll' }),
    'fix: fix modal overlay scroll'
  );
  assert.equal(
    formatConventionalCommit({ type: 'feat', scope: 'api', description: 'drop v1 schema', isBreaking: true }),
    'feat(api)!: drop v1 schema'
  );
  assert.equal(
    formatConventionalCommit(),
    'feat: concise description of change'
  );
});

test('generatePrDescription produces full markdown with closes clause and checklist', () => {
  const pr = generatePrDescription({
    type: 'feat',
    scope: 'resources',
    issueNumber: '99',
    title: 'Build Contributor Action Toolkit',
    summary: 'Adds PR generator, issue claim crafter, and git cheatsheet.',
    testSteps: 'Ran npm test and npm run lint.',
    isBreaking: false,
    checklist: {
      codeStyle: true,
      selfReview: true,
      commented: true,
      noWarnings: true,
      testsAdded: true,
    },
  });

  assert.ok(pr.includes('feat(resources): Build Contributor Action Toolkit'));
  assert.ok(pr.includes('## Description'));
  assert.ok(pr.includes('Adds PR generator, issue claim crafter, and git cheatsheet.'));
  assert.ok(pr.includes('Closes #99'));
  assert.ok(pr.includes('## Type of Change'));
  assert.ok(pr.includes('- [x] Feature (`feat`)'));
  assert.ok(pr.includes('## How Has This Been Tested?'));
  assert.ok(pr.includes('Ran npm test and npm run lint.'));
  assert.ok(pr.includes('## Checklist'));
  assert.ok(pr.includes('- [x] My code follows the code style guidelines of this project'));
  assert.ok(pr.includes('- [x] I have commented my code, particularly in hard-to-understand areas'));
});

test('generatePrDescription handles breaking changes properly', () => {
  const breakingPr = generatePrDescription({
    type: 'fix',
    issueNumber: 102,
    summary: 'Refactor auth token interface',
    isBreaking: true,
    breakingDetails: 'Changes the response signature for /api/auth',
  });

  assert.ok(breakingPr.includes('⚠️ **BREAKING CHANGE**: Changes the response signature for /api/auth'));
  assert.ok(breakingPr.includes('Closes #102'));
});

test('generateIssueClaim crafts a polite and structured comment', () => {
  const claim = generateIssueClaim({
    issueNumber: '99',
    reproduction: 'Verified on Windows 11 with Node 20.',
    proposedSolution: '1. Create ContributorToolkit component.\n2. Add clipboard copy handler.\n3. Integrate into ResourcesClient.',
    timeline: 'Ready to submit PR within 2 days.',
    program: 'NSoC 2026',
    maintainerHandle: 'subhranshudash13-dotcom',
  });

  assert.ok(claim.includes('Hi @subhranshudash13-dotcom! 👋'));
  assert.ok(claim.includes('I would like to work on this issue on #99 under **NSoC 2026**.'));
  assert.ok(claim.includes('### 🔍 Verification & Context'));
  assert.ok(claim.includes('Verified on Windows 11 with Node 20.'));
  assert.ok(claim.includes('### 💡 Proposed Solution'));
  assert.ok(claim.includes('1. Create ContributorToolkit component.'));
  assert.ok(claim.includes('### ⏱️ Timeline & Experience'));
  assert.ok(claim.includes('Ready to submit PR within 2 days.'));
  assert.ok(claim.includes('Could you please assign this issue to me? Thank you!'));
});

test('generateIssueClaim falls back to clean defaults when inputs are minimal', () => {
  const minimalClaim = generateIssueClaim();
  assert.ok(minimalClaim.includes('Hi @maintainer! 👋'));
  assert.ok(minimalClaim.includes('I would like to work on this issue.'));
  assert.ok(minimalClaim.includes('Could you please assign this issue to me?'));
});

test('commit types and git cheatsheet contain required entries', () => {
  assert.ok(COMMIT_TYPES.length >= 6);
  assert.ok(COMMIT_TYPES.some((t) => t.type === 'feat'));
  assert.ok(COMMIT_TYPES.some((t) => t.type === 'fix'));
  assert.ok(COMMIT_TYPES.some((t) => t.type === 'docs'));

  assert.ok(GIT_CHEATSHEET.length >= 3);
  const allCommands = GIT_CHEATSHEET.flatMap((c) => c.commands);
  assert.ok(allCommands.some((c) => c.cmd.includes('upstream')));
  assert.ok(allCommands.some((c) => c.cmd.includes('rebase')));
  assert.ok(allCommands.some((c) => c.cmd.includes('checkout -b')));
});
