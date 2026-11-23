import type {
  BusFactorRisk,
  HealthMetricBreakdown,
  HealthTier,
  OrganizationHealth,
} from './types';

export interface RawHealthMetrics {
  medianIssueTriageHours: number;
  medianTtfrHours: number;
  mergeRatePercent: number;
  activeMaintainers90d: number;
  yearsParticipatedCount: number;
}

/**
 * Computes issue triage velocity score (0 to 25 points).
 * Target: < 48 hours for optimal open-source triage.
 */
export function calculateIssueTriageScore(hours: number): number {
  if (hours <= 0) return 25;
  if (hours <= 12) return 25;
  if (hours <= 24) return 23;
  if (hours <= 48) return 20;
  if (hours <= 72) return 16;
  if (hours <= 120) return 12;
  if (hours <= 168) return 8;
  if (hours <= 336) return 4;
  return 2;
}

/**
 * Computes PR Time-To-First-Review (TTFR) score (0 to 30 points).
 * Target: < 24 hours for proactive open-source maintainers.
 */
export function calculatePrReviewScore(hours: number): number {
  if (hours <= 0) return 30;
  if (hours <= 8) return 30;
  if (hours <= 18) return 27;
  if (hours <= 36) return 22;
  if (hours <= 72) return 16;
  if (hours <= 120) return 10;
  if (hours <= 240) return 5;
  return 2;
}

/**
 * Computes merge rate throughput score (0 to 20 points).
 */
export function calculateMergeRateScore(mergeRatePercent: number): number {
  const boundedRate = Math.max(0, Math.min(100, mergeRatePercent));
  return Math.round((boundedRate / 100) * 20);
}

/**
 * Computes mentor distribution score and bus factor risk (0 to 15 points).
 */
export function calculateMentorDistributionScore(
  activeMaintainers: number
): { score: number; busFactor: BusFactorRisk } {
  if (activeMaintainers >= 8) {
    return { score: 15, busFactor: 'Low' };
  }
  if (activeMaintainers >= 5) {
    return { score: 12, busFactor: 'Low' };
  }
  if (activeMaintainers >= 3) {
    return { score: 9, busFactor: 'Moderate' };
  }
  if (activeMaintainers === 2) {
    return { score: 6, busFactor: 'Moderate' };
  }
  if (activeMaintainers === 1) {
    return { score: 3, busFactor: 'High' };
  }
  return { score: 0, busFactor: 'High' };
}

/**
 * Computes historical program slot retention score (0 to 10 points).
 */
export function calculateRetentionScore(yearsParticipated: number): number {
  if (yearsParticipated >= 4) return 10;
  if (yearsParticipated === 3) return 8;
  if (yearsParticipated === 2) return 6;
  if (yearsParticipated === 1) return 4;
  return 0;
}

/**
 * Maps an overall health score (0-100) to a qualitative tier.
 */
export function resolveHealthTier(score: number): HealthTier {
  if (score >= 90) return 'Highly Responsive';
  if (score >= 75) return 'Active & Engaged';
  if (score >= 50) return 'Moderate Activity';
  return 'Slower Triage';
}

/**
 * Computes comprehensive normalized organization health index (0 to 100).
 */
export function computeOrganizationHealth(metrics: RawHealthMetrics): OrganizationHealth {
  const issueTriageScore = calculateIssueTriageScore(metrics.medianIssueTriageHours);
  const prReviewScore = calculatePrReviewScore(metrics.medianTtfrHours);
  const mergeRateScore = calculateMergeRateScore(metrics.mergeRatePercent);
  const { score: mentorDistributionScore, busFactor } = calculateMentorDistributionScore(
    metrics.activeMaintainers90d
  );
  const retentionScore = calculateRetentionScore(metrics.yearsParticipatedCount);

  const breakdown: HealthMetricBreakdown = {
    issueTriageScore,
    prReviewScore,
    mergeRateScore,
    mentorDistributionScore,
    retentionScore,
  };

  const rawSum =
    issueTriageScore +
    prReviewScore +
    mergeRateScore +
    mentorDistributionScore +
    retentionScore;

  // Strict clamp between 0 and 100
  const overallScore = Math.max(0, Math.min(100, Math.round(rawSum)));
  const tier = resolveHealthTier(overallScore);

  return {
    overallScore,
    tier,
    medianTtfrHours: metrics.medianTtfrHours,
    medianIssueTriageHours: metrics.medianIssueTriageHours,
    mergeRatePercent: Math.max(0, Math.min(100, Math.round(metrics.mergeRatePercent))),
    activeMaintainers90d: Math.max(0, metrics.activeMaintainers90d),
    busFactorRisk: busFactor,
    breakdown,
  };
}
