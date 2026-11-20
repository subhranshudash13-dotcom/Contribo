import type { IssueDifficulty, IssueScope } from './types';

export interface ClassificationResult {
  difficulty: IssueDifficulty;
  scope: IssueScope;
  estimatedHours: number;
  confidence: number;
  signals: string[];
}

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

/**
 * Automatically infers difficulty, scope, and estimated completion time for open source issues.
 */
export function classifyIssueDifficulty(issue: {
  title: string;
  description?: string;
  labels?: string[];
}): ClassificationResult {
  const title = (issue.title || '').toLowerCase();
  const desc = (issue.description || '').toLowerCase();
  const labels = (issue.labels || []).map((l) => l.toLowerCase());

  const signals: string[] = [];
  let score = 50; // 0 = easiest, 100 = hardest
  let confidence = 0.6;

  // 1. Label Analysis
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

  // 2. Keyword Analysis
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

  // 3. Length & context heuristics
  if (desc.length > 0 && desc.length < 200 && (title.includes('fix') || title.includes('update'))) {
    score -= 10;
  } else if (desc.length > 2500) {
    score += 15;
  }

  // Clamp score [0, 100]
  score = Math.max(0, Math.min(100, score));

  if (hasEasyLabel || hasHardLabel) {
    confidence = Math.min(0.95, confidence + 0.25);
  }

  let difficulty: IssueDifficulty;
  let scope: IssueScope;
  let estimatedHours: number;

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

  if (signals.length === 0) {
    signals.push('Heuristic estimate from issue length and title syntax');
  }

  return {
    difficulty,
    scope,
    estimatedHours,
    confidence: Number(confidence.toFixed(2)),
    signals,
  };
}
