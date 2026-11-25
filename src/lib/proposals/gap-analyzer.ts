export type PillarKey =
  | 'technicalArchitecture'
  | 'deliverablesTimeline'
  | 'communityBonding'
  | 'riskMitigation';

export interface PillarScore {
  key: PillarKey;
  label: string;
  weight: number; // e.g. 0.35
  score: number; // 0-100
  targetBenchmark: number; // 0-100
  weightedContribution: number;
  findings: string[];
}

export interface GapChecklistItem {
  id: string;
  pillar: PillarKey;
  severity: 'critical' | 'moderate' | 'passed';
  title: string;
  recommendation: string;
}

export type ReadinessRating =
  | 'Needs Work'
  | 'Developing'
  | 'Competitive'
  | 'Submission Ready';

export interface ProposalGapAnalysis {
  overallScore: number;
  readinessRating: ReadinessRating;
  pillars: PillarScore[];
  gapChecklist: GapChecklistItem[];
  analyzedAt: string;
}

export const PILLAR_WEIGHTS: Record<PillarKey, number> = {
  technicalArchitecture: 0.35,
  deliverablesTimeline: 0.3,
  communityBonding: 0.2,
  riskMitigation: 0.15,
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(Math.max(value, 0), 100));
}

function hasAnyPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((re) => re.test(text));
}

function getReadinessRating(score: number): ReadinessRating {
  if (score >= 85) return 'Submission Ready';
  if (score >= 70) return 'Competitive';
  if (score >= 45) return 'Developing';
  return 'Needs Work';
}

/**
 * Automated 4-Pillar Rubric Gap Analyzer:
 * - Technical Architecture (35%)
 * - Deliverables & Timeline (30%)
 * - Community Bonding (20%)
 * - Risk Mitigation (15%)
 */
export function analyzeProposalGaps(sections: Record<string, string> = {}): ProposalGapAnalysis {
  const summary = (sections.summary ?? '').trim();
  const problem = (sections.problemStatement ?? '').trim();
  const architecture = (sections.architecture ?? '').trim();
  const deliverables = (sections.deliverables ?? '').trim();
  const timeline = (sections.timeline ?? '').trim();
  const testing = (sections.testing ?? '').trim();
  const risks = (sections.risks ?? '').trim();
  const aboutMe = (sections.aboutMe ?? '').trim();

  const fullText = [
    summary,
    problem,
    architecture,
    deliverables,
    timeline,
    testing,
    risks,
    aboutMe,
  ].join('\n');

  const gapChecklist: GapChecklistItem[] = [];

  // 1. Technical Architecture (35%)
  let archScore = 0;
  const archFindings: string[] = [];

  if (architecture.length >= 220) {
    archScore += 35;
  } else if (architecture.length >= 80) {
    archScore += 20;
    archFindings.push('Architecture section is brief; expand component interactions.');
  } else {
    archFindings.push('Architecture section is missing or too short.');
  }

  const hasComponents = hasAnyPattern(architecture + ' ' + summary, [
    /\b(component|module|service|worker|engine|pipeline|bus|schema|endpoint|api)\b/i,
  ]);
  if (hasComponents) {
    archScore += 25;
  } else {
    gapChecklist.push({
      id: 'gap-arch-components',
      pillar: 'technicalArchitecture',
      severity: 'critical',
      title: 'Missing concrete component specification',
      recommendation:
        'Name specific modules, API routes, or worker services and their responsibilities.',
    });
  }

  const hasDataFlow = hasAnyPattern(architecture, [
    /\b(data flow|pipeline|publish|subscribe|stream|request|response|persist|cache|queue)\b/i,
  ]);
  if (hasDataFlow) {
    archScore += 20;
  } else {
    gapChecklist.push({
      id: 'gap-arch-dataflow',
      pillar: 'technicalArchitecture',
      severity: 'moderate',
      title: 'Unclear end-to-end data flow',
      recommendation:
        'Describe how payloads move from client UI through API validation to storage/cache.',
    });
  }

  const hasStackJustification = hasAnyPattern(architecture + ' ' + summary, [
    /\b(typescript|next\.?js|redis|mongodb|postgres|graphql|rust|go|python|docker|zod|react)\b/i,
  ]);
  if (hasStackJustification) {
    archScore += 20;
  } else {
    gapChecklist.push({
      id: 'gap-arch-stack',
      pillar: 'technicalArchitecture',
      severity: 'moderate',
      title: 'Missing tech stack justification',
      recommendation:
        'Explicitly state the chosen technologies and why they fit latency/scale requirements.',
    });
  }

  // 2. Deliverables & Timeline (30%)
  let delivScore = 0;
  const delivFindings: string[] = [];

  if (deliverables.length >= 80) {
    delivScore += 25;
  } else {
    gapChecklist.push({
      id: 'gap-deliv-list',
      pillar: 'deliverablesTimeline',
      severity: 'critical',
      title: 'Deliverables list lacks measurable artifacts',
      recommendation:
        'Enumerate concrete deliverables (APIs, UI routes, test suites, docs) with acceptance criteria.',
    });
  }

  const hasWeeklyBreakdown = hasAnyPattern(timeline, [
    /\bweeks?\s*\d+/i,
    /\bw\d+\b/i,
  ]);
  if (hasWeeklyBreakdown) {
    delivScore += 30;
  } else {
    delivFindings.push('No explicit week-by-week schedule detected.');
    gapChecklist.push({
      id: 'gap-timeline-weekly',
      pillar: 'deliverablesTimeline',
      severity: 'critical',
      title: 'Missing weekly breakdown in timeline',
      recommendation:
        'Break your timeline into explicit weekly blocks (e.g., Weeks 1-2, Weeks 3-5, Weeks 8-10).',
    });
  }

  const hasLateWeeks = hasAnyPattern(timeline, [
    /\bweeks?\s*(8|9|10|11|12)\b/i,
    /\bfinal\b/i,
  ]);
  if (hasWeeklyBreakdown && !hasLateWeeks) {
    gapChecklist.push({
      id: 'gap-timeline-late-weeks',
      pillar: 'deliverablesTimeline',
      severity: 'moderate',
      title: 'Missing weekly breakdown for weeks 8-10 / final phase',
      recommendation:
        'Add explicit post-midterm milestones covering Weeks 8-10 integration, hardening, and docs.',
    });
  } else if (hasLateWeeks) {
    delivScore += 20;
  }

  const hasMidtermSplit = hasAnyPattern(timeline + ' ' + deliverables, [
    /\bmidterm\b/i,
    /\bevaluation\b/i,
  ]);
  if (hasMidtermSplit) {
    delivScore += 25;
  } else {
    gapChecklist.push({
      id: 'gap-timeline-midterm',
      pillar: 'deliverablesTimeline',
      severity: 'moderate',
      title: 'No explicit midterm vs. final evaluation checkpoint',
      recommendation:
        'Highlight what will be demo-ready by the Midterm evaluation vs. Final evaluation.',
    });
  }

  // 3. Community Bonding (20%)
  let commScore = 0;
  const commFindings: string[] = [];

  const hasBondingMention = hasAnyPattern(fullText, [
    /\b(community bonding|onboarding|maintainer|mentor)\b/i,
  ]);
  if (hasBondingMention) {
    commScore += 35;
  } else {
    gapChecklist.push({
      id: 'gap-comm-bonding',
      pillar: 'communityBonding',
      severity: 'moderate',
      title: 'Missing Community Bonding period plan',
      recommendation:
        'Outline how you will use the Community Bonding period to align on architecture and dev setup.',
    });
  }

  const hasChannelOrRfc = hasAnyPattern(fullText, [
    /\b(discord|slack|zulip|github discussions|mailing list|rfc|office hours|sync|standup)\b/i,
  ]);
  if (hasChannelOrRfc) {
    commScore += 35;
  } else {
    commFindings.push('No communication channels or RFC sync cadence mentioned.');
    gapChecklist.push({
      id: 'gap-comm-channels',
      pillar: 'communityBonding',
      severity: 'critical',
      title: 'Missing communication channel & RFC sync plan',
      recommendation:
        'Specify async channels (Slack/Discord/GitHub Discussions) and weekly mentor sync cadence.',
    });
  }

  const hasPriorEngagement =
    aboutMe.length >= 40 &&
    hasAnyPattern(aboutMe + ' ' + summary, [
      /\b(open[- ]source|pr|pull request|issue|contributor|github|experience)\b/i,
    ]);
  if (hasPriorEngagement) {
    commScore += 30;
  } else {
    gapChecklist.push({
      id: 'gap-comm-bio',
      pillar: 'communityBonding',
      severity: 'moderate',
      title: 'Strengthen contributor background & prior PR links',
      recommendation:
        'Include links or summaries of prior open-source PRs and issue discussions in About Me.',
    });
  }

  // 4. Risk Mitigation (15%)
  let riskScore = 0;
  const riskFindings: string[] = [];

  if (risks.length >= 60) {
    riskScore += 35;
  } else {
    riskFindings.push('Risks section is thin or missing.');
    gapChecklist.push({
      id: 'gap-risk-section',
      pillar: 'riskMitigation',
      severity: 'critical',
      title: 'Missing structured risk mitigation plan',
      recommendation:
        'Document top technical & schedule risks along with concrete fallback strategies.',
    });
  }

  const hasFallbackOrMitigation = hasAnyPattern(risks, [
    /\b(mitigat|fallback|backoff|circuit|cap|rate limit|throttl|timeout|graceful|buffer)\b/i,
  ]);
  if (hasFallbackOrMitigation) {
    riskScore += 35;
  } else {
    gapChecklist.push({
      id: 'gap-risk-fallback',
      pillar: 'riskMitigation',
      severity: 'moderate',
      title: 'No explicit fallback or rate-limit mitigation',
      recommendation:
        'Explain fallback paths for API rate limits, network failures, or memory/queue bounds.',
    });
  }

  const hasTestCoveragePlan =
    testing.length >= 40 &&
    hasAnyPattern(testing + ' ' + deliverables, [
      /\b(unit test|integration test|e2e|playwright|coverage|ci|assertion)\b/i,
    ]);
  if (hasTestCoveragePlan) {
    riskScore += 30;
  } else {
    gapChecklist.push({
      id: 'gap-risk-testing',
      pillar: 'riskMitigation',
      severity: 'moderate',
      title: 'Missing automated test coverage guarantees',
      recommendation:
        'Specify unit, integration, and E2E test targets (e.g., Playwright + Node test runner).',
    });
  }

  const boundedArch = clampScore(archScore);
  const boundedDeliv = clampScore(delivScore);
  const boundedComm = clampScore(commScore);
  const boundedRisk = clampScore(riskScore);

  const pillars: PillarScore[] = [
    {
      key: 'technicalArchitecture',
      label: 'Technical Architecture',
      weight: PILLAR_WEIGHTS.technicalArchitecture,
      score: boundedArch,
      targetBenchmark: 85,
      weightedContribution: Number((boundedArch * PILLAR_WEIGHTS.technicalArchitecture).toFixed(2)),
      findings: archFindings,
    },
    {
      key: 'deliverablesTimeline',
      label: 'Deliverables & Timeline',
      weight: PILLAR_WEIGHTS.deliverablesTimeline,
      score: boundedDeliv,
      targetBenchmark: 85,
      weightedContribution: Number((boundedDeliv * PILLAR_WEIGHTS.deliverablesTimeline).toFixed(2)),
      findings: delivFindings,
    },
    {
      key: 'communityBonding',
      label: 'Community Bonding',
      weight: PILLAR_WEIGHTS.communityBonding,
      score: boundedComm,
      targetBenchmark: 80,
      weightedContribution: Number((boundedComm * PILLAR_WEIGHTS.communityBonding).toFixed(2)),
      findings: commFindings,
    },
    {
      key: 'riskMitigation',
      label: 'Risk Mitigation',
      weight: PILLAR_WEIGHTS.riskMitigation,
      score: boundedRisk,
      targetBenchmark: 80,
      weightedContribution: Number((boundedRisk * PILLAR_WEIGHTS.riskMitigation).toFixed(2)),
      findings: riskFindings,
    },
  ];

  const overallScore = clampScore(
    pillars.reduce((sum, p) => sum + p.score * p.weight, 0)
  );

  if (gapChecklist.length === 0) {
    gapChecklist.push({
      id: 'gap-all-passed',
      pillar: 'technicalArchitecture',
      severity: 'passed',
      title: 'All 4 rubric pillars meet target benchmark',
      recommendation:
        'Your draft covers architecture, weekly/midterm deliverables, community bonding, and risk mitigation.',
    });
  }

  return {
    overallScore,
    readinessRating: getReadinessRating(overallScore),
    pillars,
    gapChecklist,
    analyzedAt: new Date().toISOString(),
  };
}
