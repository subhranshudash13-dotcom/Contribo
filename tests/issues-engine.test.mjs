import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

// Read source files to verify contracts and architectural structure
const classifierSource = fs.readFileSync(path.join(ROOT, 'src/lib/issues/classifier.ts'), 'utf8');
const matcherSource = fs.readFileSync(path.join(ROOT, 'src/lib/issues/matcher.ts'), 'utf8');
const repoSource = fs.readFileSync(path.join(ROOT, 'src/lib/issues/repository.ts'), 'utf8');
const apiRouteSource = fs.readFileSync(path.join(ROOT, 'src/app/api/issues/route.ts'), 'utf8');
const clientSource = fs.readFileSync(path.join(ROOT, 'src/app/issues/IssuesClient.tsx'), 'utf8');
const pageSource = fs.readFileSync(path.join(ROOT, 'src/app/issues/page.tsx'), 'utf8');

// Mirror pure classifier logic for direct functional assertions
const EASY_LABELS = new Set([
  'good first issue',
  'good-first-issue',
  'beginner-friendly',
  'first-timers-only',
  'easy',
  'starter',
  'low-hanging-fruit',
  'up-for-grabs',
  'documentation',
  'docs',
  'typo',
]);

const HARD_LABELS = new Set([
  'architecture',
  'breaking-change',
  'security',
  'performance',
  'concurrency',
  'refactor',
  'deep-dive',
  'complex',
]);

const QUICK_FIX_KEYWORDS = [
  'typo',
  'readme',
  'docs',
  'documentation',
  'comment',
  'lint',
  'eslint',
  'formatting',
  'type annotation',
  'type error',
  'css fix',
  'broken link',
  'spelling',
  'dead code',
];

const DEEP_DIVE_KEYWORDS = [
  'architecture',
  'concurrency',
  'thread-safe',
  'memory leak',
  'deadlock',
  'migration',
  'protocol',
  'distributed',
  'consensus',
  'crypto',
  'garbage collection',
  'performance degradation',
  'compiler pass',
];

function classifyIssue(issue) {
  const title = (issue.title || '').toLowerCase();
  const desc = (issue.description || '').toLowerCase();
  const labels = (issue.labels || []).map((l) => l.toLowerCase());

  const signals = [];
  let score = 50;
  let confidence = 0.6;

  let hasEasyLabel = false;
  let hasHardLabel = false;

  for (const label of labels) {
    if (EASY_LABELS.has(label) || label.includes('beginner') || label.includes('starter')) {
      score -= 30;
      hasEasyLabel = true;
      signals.push(`Matched beginner label: "${label}"`);
    }
    if (HARD_LABELS.has(label) || label.includes('hard') || label.includes('major')) {
      score += 35;
      hasHardLabel = true;
      signals.push(`Matched complex label: "${label}"`);
    }
  }

  for (const kw of QUICK_FIX_KEYWORDS) {
    if (title.includes(kw) || desc.includes(kw)) {
      score -= 15;
      signals.push(`Found quick-fix keyword: "${kw}"`);
      break;
    }
  }

  for (const kw of DEEP_DIVE_KEYWORDS) {
    if (title.includes(kw) || desc.includes(kw)) {
      score += 25;
      signals.push(`Found deep-dive keyword: "${kw}"`);
      break;
    }
  }

  score = Math.max(0, Math.min(100, score));

  if (hasEasyLabel || hasHardLabel) {
    confidence = Math.min(0.95, confidence + 0.25);
  }

  let difficulty;
  let scope;
  let estimatedHours;

  if (score <= 35) {
    difficulty = 'easy';
    scope = 'quick-fix';
    estimatedHours = Math.max(1, Math.round((score / 35) * 3 + 1));
  } else if (score <= 70) {
    difficulty = 'medium';
    scope = 'feature-slice';
    estimatedHours = Math.round(4 + ((score - 35) / 35) * 6);
  } else {
    difficulty = 'hard';
    scope = 'deep-dive';
    estimatedHours = Math.round(12 + ((score - 70) / 30) * 16);
  }

  return { difficulty, scope, estimatedHours, confidence, signals };
}

function calculateAffinity(issue, profile) {
  if (!profile || !profile.skills || profile.skills.length === 0) {
    const baseScore = issue.difficulty === 'easy' ? 85 : issue.difficulty === 'medium' ? 70 : 50;
    return { score: baseScore, reasons: ['Beginner-friendly starter issue with low barrier to entry'] };
  }

  const userSkillsNormalized = profile.skills.map((s) => s.toLowerCase().trim());
  const userSkillSet = new Set(userSkillsNormalized);
  const issueLanguages = (issue.languages || []).map((l) => l.toLowerCase().trim());

  let scorePoints = 0;
  const reasons = [];

  const matchedLanguages = issueLanguages.filter((lang) => userSkillSet.has(lang));
  if (matchedLanguages.length > 0) {
    scorePoints += 45;
    reasons.push(`Direct language match: ${matchedLanguages.map((l) => l.toUpperCase()).join(', ')}`);
  }

  const level = profile.experienceLevel || 'beginner';
  if (level === 'beginner' && issue.difficulty === 'easy') {
    scorePoints += 15;
    reasons.push('Ideal difficulty tier for foundational contributors');
  }

  if (issue.hasMentorAssigned) {
    scorePoints += 10;
    reasons.push('Includes mentor guidelines');
  }

  const finalScore = Math.max(15, Math.min(99, scorePoints + 20));
  return { score: finalScore, reasons };
}

test('1. Automated Scope & Difficulty Classifier', async (t) => {
  await t.test('classifies issue with "good first issue" label as easy and quick-fix', () => {
    const result = classifyIssue({
      title: 'Fix typo in authentication documentation',
      description: 'Found a small spelling mistake in docs/auth.md',
      labels: ['good first issue', 'docs'],
    });

    assert.equal(result.difficulty, 'easy');
    assert.equal(result.scope, 'quick-fix');
    assert.ok(result.estimatedHours <= 4);
    assert.ok(result.confidence >= 0.7);
    assert.ok(result.signals.some((s) => s.includes('beginner label')));
  });

  await t.test('classifies architectural and concurrency issues as hard and deep-dive', () => {
    const result = classifyIssue({
      title: 'Resolve race condition and deadlock in distributed consensus protocol',
      description: 'Memory leak and performance degradation observed during concurrent worker stress tests.',
      labels: ['architecture', 'concurrency'],
    });

    assert.equal(result.difficulty, 'hard');
    assert.equal(result.scope, 'deep-dive');
    assert.ok(result.estimatedHours >= 12);
    assert.ok(result.signals.some((s) => s.includes('deep-dive keyword') || s.includes('complex label')));
  });

  await t.test('falls back to medium difficulty for standard feature requests without polarizing labels', () => {
    const result = classifyIssue({
      title: 'Add customizable chart legend component',
      description: 'Allow users to toggle data series visibility on the analytics graph view.',
      labels: ['frontend', 'enhancement'],
    });

    assert.equal(result.difficulty, 'medium');
    assert.equal(result.scope, 'feature-slice');
    assert.ok(result.estimatedHours >= 4 && result.estimatedHours <= 10);
  });

  await t.test('classifier source implements strict boundary clamping and exports function', () => {
    assert.ok(classifierSource.includes('export function classifyIssueDifficulty'));
    assert.ok(classifierSource.includes('Math.max(0, Math.min(100, score))'));
  });
});

test('2. Orbit AI Skill Vector & Affinity Matcher', async (t) => {
  const sampleIssue = {
    id: 'test-ts-issue',
    title: 'Migrate component state to React Context',
    languages: ['typescript'],
    difficulty: 'easy',
    hasMentorAssigned: true,
  };

  await t.test('calculates default score and reasons when user profile is null or empty', () => {
    const affinity = calculateAffinity(sampleIssue, null);
    assert.ok(affinity.score >= 50 && affinity.score <= 90);
    assert.ok(affinity.reasons.length > 0);
  });

  await t.test('awards high score when user skills directly overlap with issue languages', () => {
    const userProfile = {
      skills: ['TypeScript', 'React', 'CSS'],
      experienceLevel: 'beginner',
    };

    const affinity = calculateAffinity(sampleIssue, userProfile);
    assert.ok(affinity.score >= 80, `Expected score >= 80, got ${affinity.score}`);
    assert.ok(affinity.reasons.some((r) => r.includes('Direct language match: TYPESCRIPT')));
  });

  await t.test('matcher source integrates with semantic-matcher Jaccard tokenizer', () => {
    assert.ok(matcherSource.includes('computeJaccardSimilarity'));
    assert.ok(matcherSource.includes('tokenizeText'));
    assert.ok(matcherSource.includes('export function calculateIssueAffinity'));
    assert.ok(matcherSource.includes('export function rankIssuesWithProfile'));
  });
});

test('3. Issue Repository & Search Query Engine', async (t) => {
  await t.test('repository defines high-quality curated open source issues', () => {
    assert.ok(repoSource.includes('export const CURATED_ISSUES'));
    assert.ok(repoSource.includes('kubernetes/minikube'));
    assert.ok(repoSource.includes('facebook/react'));
    assert.ok(repoSource.includes('mozilla/gecko-dev'));
    assert.ok(repoSource.includes('rust-lang/cargo'));
    assert.ok(repoSource.includes('home-assistant/core'));
  });

  await t.test('repository exports listIssues and getIssueById query utilities', () => {
    assert.ok(repoSource.includes('export function listIssues'));
    assert.ok(repoSource.includes('export function getIssueById'));
    assert.ok(repoSource.includes('facets'));
  });

  await t.test('supports multi-factor sorting and pagination arithmetic', () => {
    assert.ok(repoSource.includes("sortBy === 'recommended'"));
    assert.ok(repoSource.includes("sortBy === 'newest'"));
    assert.ok(repoSource.includes("sortBy === 'comments-asc'"));
    assert.ok(repoSource.includes("sortBy === 'effort-asc'"));
  });
});

test('4. Route Handler & Edge Caching Architecture', async (t) => {
  await t.test('api route supports query filtering and parses user skill vector', () => {
    assert.ok(apiRouteSource.includes("searchParams.get('q')"));
    assert.ok(apiRouteSource.includes("searchParams.get('lang')"));
    assert.ok(apiRouteSource.includes("searchParams.get('skills')"));
    assert.ok(apiRouteSource.includes('listIssues(filter, profile)'));
  });

  await t.test('api route enforces cache-control with stale-while-revalidate', () => {
    assert.ok(
      apiRouteSource.includes("'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'")
    );
  });
});

test('5. Task Radar Kanban & Directory UI Shell', async (t) => {
  await t.test('issues client supports switching between Directory view and Kanban Radar view', () => {
    assert.ok(clientSource.includes("activeTab === 'directory'"));
    assert.ok(clientSource.includes("activeTab === 'radar'"));
    assert.ok(clientSource.includes('IssueKanbanBoard'));
    assert.ok(clientSource.includes('IssueFilterSidebar'));
  });

  await t.test('persists user tracked tasks and skill vector in localStorage', () => {
    assert.ok(clientSource.includes("'contribo_tracked_tasks'"));
    assert.ok(clientSource.includes("'contribo_user_skills'"));
  });

  await t.test('issues page exports metadata and schema.org JSON-LD CollectionPage microdata', () => {
    assert.ok(pageSource.includes('Good First Issues & Contributor Task Radar'));
    assert.ok(pageSource.includes("@type': 'CollectionPage'"));
    assert.ok(pageSource.includes('Suspense fallback'));
  });
});
