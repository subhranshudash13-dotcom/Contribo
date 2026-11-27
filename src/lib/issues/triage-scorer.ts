import type { IssueRecord } from './types';

export type TriageTier = 'Starter Friendly' | 'Intermediate' | 'Deep Core';

export interface TriageSignals {
  reproductionClarity: number; // 0-100 (weight 30%)
  scopeBlastRadius: number; // 0-100 (weight 25%)
  maintainerResponsiveness: number; // 0-100 (weight 25%)
  skillStackOverlap: number; // 0-100 (weight 20%)
}

export const TRIAGE_SIGNAL_WEIGHTS = {
  reproductionClarity: 0.3,
  scopeBlastRadius: 0.25,
  maintainerResponsiveness: 0.25,
  skillStackOverlap: 0.2,
} as const;

export interface TriageMetadata {
  hasReproSteps?: boolean;
  hasLinkedPr?: boolean;
  daysSinceUpdate?: number;
  filesTouchedCount?: number;
}

export interface ScoredIssueTriage {
  issue: IssueRecord;
  readinessScore: number; // 0-100
  tier: TriageTier;
  estimatedHoursToFirstPr: number;
  signals: TriageSignals;
  isBlocked: boolean;
  blockReasons: string[];
  matchedSkills: string[];
}

export interface ProposalSeed {
  projectTitle: string;
  orgName: string;
  programName: string;
  sourceIssueUrl: string;
  sections: {
    summary: string;
    problemStatement: string;
    deliverables: string;
    testing: string;
  };
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.round(Math.min(Math.max(val, min), max));
}

function normalizeSkill(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Score a single issue across 4 weighted triage signals and detect stale/blocked tickets.
 */
export function scoreIssueForTriage(
  issue: IssueRecord,
  userSkills: string[] = [],
  meta: TriageMetadata = {}
): ScoredIssueTriage {
  const desc = (issue.description ?? '').trim();
  const blockReasons: string[] = [];

  // 1. Reproduction Clarity (30%)
  let clarity = 30;
  if (desc.length >= 160) clarity += 25;
  else if (desc.length >= 80) clarity += 15;

  const hasReproMarkers =
    meta.hasReproSteps === true ||
    /\b(repro|steps|expected|actual|acceptance|criteria|example|error|stack)\b/i.test(desc);
  if (meta.hasReproSteps === false) {
    clarity -= 20;
    blockReasons.push('missing-repro-steps');
  } else if (hasReproMarkers) {
    clarity += 25;
  } else if (desc.length < 60) {
    blockReasons.push('missing-repro-steps');
  }

  if (issue.mentorGuideText && issue.mentorGuideText.trim().length > 20) {
    clarity += 20;
  }

  // 2. Scope & Blast Radius (25%)
  let scopeScore = 50;
  if (issue.scope === 'quick-fix') scopeScore = 92;
  else if (issue.scope === 'feature-slice') scopeScore = 72;
  else if (issue.scope === 'deep-dive') scopeScore = 40;

  if (typeof meta.filesTouchedCount === 'number') {
    if (meta.filesTouchedCount <= 3) scopeScore += 8;
    else if (meta.filesTouchedCount >= 12) scopeScore -= 20;
  }
  if (issue.estimatedHours > 25) {
    scopeScore -= 15;
  }

  // 3. Maintainer Responsiveness (25%)
  let responsiveness = issue.hasMentorAssigned ? 65 : 35;
  if (issue.commentsCount >= 1 && issue.commentsCount <= 8) {
    responsiveness += 25;
  } else if (issue.commentsCount === 0) {
    responsiveness += 10;
  } else if (issue.commentsCount > 15) {
    responsiveness -= 15;
    blockReasons.push('overcrowded-comments');
  }

  if (typeof meta.daysSinceUpdate === 'number') {
    if (meta.daysSinceUpdate <= 14) {
      responsiveness += 10;
    } else if (meta.daysSinceUpdate > 90) {
      responsiveness -= 30;
      blockReasons.push('stale-thread');
    }
  }

  // Linked PR detection
  const hasLinkedPr =
    meta.hasLinkedPr === true ||
    issue.labels.some((l) => /in[- ]progress|pr[- ]open|claimed/i.test(l));
  if (hasLinkedPr) {
    blockReasons.push('existing-linked-pr');
  }

  // 4. Skill-Stack Overlap (20%)
  const normalizedUserSkills = [...new Set(userSkills.map(normalizeSkill).filter(Boolean))];
  const issueTokens = new Set([
    ...issue.languages.map(normalizeSkill),
    ...issue.labels.map(normalizeSkill),
  ]);

  const matchedSkills = normalizedUserSkills.filter((skill) => issueTokens.has(skill));
  let skillOverlap = 50; // Neutral baseline when user hasn't specified skills
  if (normalizedUserSkills.length > 0) {
    const ratio = matchedSkills.length / Math.max(issue.languages.length, 1);
    skillOverlap = clamp(25 + ratio * 75, 15, 100);
  }

  const signals: TriageSignals = {
    reproductionClarity: clamp(clarity, 0, 100),
    scopeBlastRadius: clamp(scopeScore, 0, 100),
    maintainerResponsiveness: clamp(responsiveness, 0, 100),
    skillStackOverlap: clamp(skillOverlap, 0, 100),
  };

  let readinessScore = clamp(
    signals.reproductionClarity * TRIAGE_SIGNAL_WEIGHTS.reproductionClarity +
      signals.scopeBlastRadius * TRIAGE_SIGNAL_WEIGHTS.scopeBlastRadius +
      signals.maintainerResponsiveness * TRIAGE_SIGNAL_WEIGHTS.maintainerResponsiveness +
      signals.skillStackOverlap * TRIAGE_SIGNAL_WEIGHTS.skillStackOverlap,
    0,
    100
  );

  const isBlocked = blockReasons.length > 0;
  if (hasLinkedPr) {
    readinessScore = Math.min(readinessScore, 35);
  }

  let tier: TriageTier = 'Intermediate';
  if (issue.difficulty === 'easy' && readinessScore >= 65 && !isBlocked) {
    tier = 'Starter Friendly';
  } else if (issue.difficulty === 'hard' || issue.scope === 'deep-dive' || readinessScore < 45) {
    tier = 'Deep Core';
  }

  const baseHours = Number.isFinite(issue.estimatedHours) ? issue.estimatedHours : 8;
  const skillDiscount = matchedSkills.length > 0 ? 0.85 : 1.0;
  const estimatedHoursToFirstPr = clamp(baseHours * skillDiscount, 1, 80);

  return {
    issue,
    readinessScore,
    tier,
    estimatedHoursToFirstPr,
    signals,
    isBlocked,
    blockReasons,
    matchedSkills,
  };
}

/**
 * Rank and optionally filter a list of issues for contributor triage.
 */
export function triageIssues(
  issues: IssueRecord[],
  options?: {
    skills?: string[];
    tier?: TriageTier | null;
    includeBlocked?: boolean;
    orgSlug?: string | null;
  }
): ScoredIssueTriage[] {
  const skills = options?.skills ?? [];
  const includeBlocked = options?.includeBlocked ?? true;

  return issues
    .filter((issue) => !options?.orgSlug || issue.orgSlug === options.orgSlug)
    .map((issue) => scoreIssueForTriage(issue, skills))
    .filter((scored) => (includeBlocked ? true : !scored.isBlocked))
    .filter((scored) => (!options?.tier ? true : scored.tier === options.tier))
    .sort((a, b) => b.readinessScore - a.readinessScore || a.estimatedHoursToFirstPr - b.estimatedHoursToFirstPr);
}

/**
 * Convert a triaged issue into a pre-populated Proposal Studio seed.
 */
export function buildProposalSeedFromIssue(
  scored: ScoredIssueTriage
): ProposalSeed {
  const { issue } = scored;
  return {
    projectTitle: `${issue.orgName}: ${issue.title}`,
    orgName: issue.orgName,
    programName: issue.program,
    sourceIssueUrl: issue.issueUrl,
    sections: {
      summary: `Proposal to resolve ${issue.repo}#${issue.number} (${issue.title}) in ${issue.orgName}. Estimated effort: ${scored.estimatedHoursToFirstPr}h (${scored.tier}).`,
      problemStatement: issue.description,
      deliverables: `1. Root-cause fix for ${issue.repo}#${issue.number}\n2. Regression unit & integration tests\n3. Documentation & maintainer review sign-off`,
      testing: `Automated test coverage targeting ${issue.languages.join(', ') || 'core modules'} with CI verification.`,
    },
  };
}
