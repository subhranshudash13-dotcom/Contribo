import { tokenizeText, computeJaccardSimilarity } from '@/lib/ai/semantic-matcher';
import type { IssueRecord, UserSkillProfile } from './types';

export interface IssueMatchResult {
  score: number;
  reasons: string[];
}

/**
 * Calculates a personalized affinity score (0 - 100) and explanation reasons
 * connecting a contributor's skillset and experience to a target issue.
 */
export function calculateIssueAffinity(
  issue: IssueRecord,
  profile?: UserSkillProfile | null
): IssueMatchResult {
  if (!profile || !profile.skills || profile.skills.length === 0) {
    // Baseline score based on issue accessibility when no profile is supplied
    const baseScore = issue.difficulty === 'easy' ? 85 : issue.difficulty === 'medium' ? 70 : 50;
    const reasons: string[] = [];
    if (issue.difficulty === 'easy') {
      reasons.push('Beginner-friendly starter issue with low barrier to entry');
    }
    if (issue.hasMentorAssigned) {
      reasons.push('Dedicated mentor triage guide provided');
    }
    return { score: baseScore, reasons };
  }

  const userSkillsNormalized = profile.skills.map((s) => s.toLowerCase().trim());
  const userSkillSet = new Set(userSkillsNormalized);

  const issueLanguages = (issue.languages || []).map((l) => l.toLowerCase().trim());
  const issueLabels = (issue.labels || []).map((l) => l.toLowerCase().trim());
  const issueTextTokens = tokenizeText(`${issue.title} ${issue.description} ${issue.repo}`);
  const issueTokenSet = new Set([...issueLanguages, ...issueLabels, ...issueTextTokens]);

  const reasons: string[] = [];
  let scorePoints = 0;

  // 1. Exact programming language match (Weight: 45 pts)
  const matchedLanguages = issueLanguages.filter((lang) => userSkillSet.has(lang));
  if (matchedLanguages.length > 0) {
    scorePoints += 45;
    reasons.push(`Direct language match: ${matchedLanguages.map((l) => l.toUpperCase()).join(', ')}`);
  } else {
    // Check if any language token appears in user skills or vice versa
    const partialMatch = userSkillsNormalized.some((skill) =>
      issueLanguages.some((lang) => lang.includes(skill) || skill.includes(lang))
    );
    if (partialMatch) {
      scorePoints += 25;
      reasons.push('Familiar ecosystem & related runtime stack');
    }
  }

  // 2. Semantic token overlap via Jaccard (Weight: 30 pts)
  const jaccard = computeJaccardSimilarity(userSkillsNormalized, Array.from(issueTokenSet));
  const jaccardPoints = Math.round(jaccard * 100 * 0.3);
  scorePoints += Math.min(30, jaccardPoints + (matchedLanguages.length > 0 ? 15 : 0));

  // Find overlapping framework / domain tokens for explainer
  const domainMatches = userSkillsNormalized.filter(
    (skill) => !matchedLanguages.includes(skill) && issueTokenSet.has(skill)
  );
  if (domainMatches.length > 0) {
    reasons.push(`Relevant framework / tool skills: ${domainMatches.slice(0, 3).join(', ')}`);
  }

  // 3. Experience level suitability (Weight: 15 pts)
  const level = profile.experienceLevel || 'beginner';
  if (level === 'beginner') {
    if (issue.difficulty === 'easy') {
      scorePoints += 15;
      reasons.push('Ideal difficulty tier for foundational contributors');
    } else if (issue.difficulty === 'medium') {
      scorePoints += 8;
      reasons.push('Moderate stretch goal to build intermediate expertise');
    } else {
      scorePoints -= 10;
    }
  } else if (level === 'intermediate') {
    if (issue.difficulty === 'medium') {
      scorePoints += 15;
      reasons.push('Tailored complexity for intermediate contributors');
    } else if (issue.difficulty === 'easy') {
      scorePoints += 12;
      reasons.push('Quick turnaround contribution');
    } else {
      scorePoints += 8;
    }
  } else {
    // Advanced
    if (issue.difficulty === 'hard') {
      scorePoints += 15;
      reasons.push('Deep architectural scope suited for advanced contributors');
    } else {
      scorePoints += 10;
    }
  }

  // 4. Mentor guidance bonus (Weight: 10 pts)
  if (issue.hasMentorAssigned) {
    scorePoints += 10;
    reasons.push('Includes mentor guidelines and reproduction pointers');
  }

  // Clamp strictly between 15 and 99 (100 reserved for absolute theoretical perfect)
  const finalScore = Math.max(15, Math.min(99, scorePoints));

  if (reasons.length === 0) {
    reasons.push('Exploratory opportunity in active open source repository');
  }

  return {
    score: finalScore,
    reasons,
  };
}

/**
 * Augment a list of issues with real-time match scores and sort by highest affinity.
 */
export function rankIssuesWithProfile(
  issues: IssueRecord[],
  profile?: UserSkillProfile | null
): IssueRecord[] {
  return issues.map((issue) => {
    const affinity = calculateIssueAffinity(issue, profile);
    return {
      ...issue,
      matchScore: affinity.score,
      matchReasons: affinity.reasons,
    };
  });
}
