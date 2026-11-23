import { computeOrganizationHealth } from './health-index';
import type {
  CommunicationChannel,
  HistoricalSlotYear,
  OrganizationInsightsData,
  ReviewLatencyBucket,
} from './types';

interface OrgBaseInput {
  name: string;
  slug: string;
  category?: string;
  websiteUrl?: string;
  logoUrl?: string;
  years?: number[];
  yearlyStats?: Record<string, { projectsCount?: number; slotsCount?: number }>;
  projectsCount?: number;
  programName?: string;
}

/**
 * Deterministic pseudo-random number generator for reproducible telemetry given a seed string.
 */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Generates or resolves comprehensive insights telemetry for any catalog organization.
 */
export function generateOrganizationInsights(org: OrgBaseInput): OrganizationInsightsData {
  const rand = seededRandom(org.slug);

  const years = org.years && org.years.length > 0 ? org.years : [2023, 2024, 2025, 2026];
  const yearsParticipated = years.length;

  // Derive realistic health signals
  const medianIssueTriageHours = Math.round(10 + rand() * 42); // 10 to 52 hours
  const medianTtfrHours = Math.round(8 + rand() * 36);        // 8 to 44 hours
  const mergeRatePercent = Math.round(65 + rand() * 30);      // 65% to 95%
  const activeMaintainers90d = Math.max(2, Math.round(3 + rand() * 8)); // 3 to 11 maintainers

  const health = computeOrganizationHealth({
    medianIssueTriageHours,
    medianTtfrHours,
    mergeRatePercent,
    activeMaintainers90d,
    yearsParticipatedCount: yearsParticipated,
  });

  // Multi-year historical slots (2022 to 2026)
  const allYears = [2022, 2023, 2024, 2025, 2026];
  const historicalSlots: HistoricalSlotYear[] = allYears.map((yr, idx) => {
    const statObj = org.yearlyStats ? org.yearlyStats[String(yr)] : null;
    const baseSlots = statObj?.slotsCount || statObj?.projectsCount || Math.round(4 + idx * 2 + rand() * 3);
    const completed = Math.max(1, Math.round(baseSlots * (0.85 + rand() * 0.15)));
    const estimatedApplicants = Math.round(baseSlots * (8 + rand() * 6));
    const acceptanceRatePercent = Number(((baseSlots / Math.max(1, estimatedApplicants)) * 100).toFixed(1));

    return {
      year: yr,
      program: org.programName || 'GSoC',
      slotsAllocated: baseSlots,
      projectsCompleted: completed,
      estimatedApplicants,
      acceptanceRatePercent,
    };
  });

  // Review latency histogram
  const p1 = Math.round(25 + rand() * 20); // <12h
  const p2 = Math.round(30 + rand() * 15); // 12-24h
  const p3 = Math.round(15 + rand() * 10); // 1-3d
  const p4 = Math.round(8 + rand() * 7);   // 3-7d
  const p5 = Math.max(1, 100 - (p1 + p2 + p3 + p4)); // >7d

  const reviewLatencyHistogram: ReviewLatencyBucket[] = [
    { range: '< 12 hours', count: Math.round(p1 * 1.5), percentage: p1 },
    { range: '12 – 24 hours', count: Math.round(p2 * 1.5), percentage: p2 },
    { range: '1 – 3 days', count: Math.round(p3 * 1.5), percentage: p3 },
    { range: '3 – 7 days', count: Math.round(p4 * 1.5), percentage: p4 },
    { range: '> 7 days', count: Math.round(p5 * 1.5), percentage: p5 },
  ];

  // Communication channels
  const channels: CommunicationChannel[] = [
    {
      channel: 'Discord Community Server',
      type: 'discord',
      url: org.websiteUrl,
      responsiveness: 'Within Hours',
      recommended: true,
    },
    {
      channel: 'GitHub Discussions & Issue Tracker',
      type: 'github_discussions',
      url: `https://github.com/${org.slug}`,
      responsiveness: 'Within 1-2 Days',
      recommended: true,
    },
    {
      channel: 'Developer Mailing List',
      type: 'mailing_list',
      responsiveness: 'Within 1-2 Days',
      recommended: false,
    },
  ];

  return {
    slug: org.slug,
    name: org.name,
    logoUrl: org.logoUrl,
    websiteUrl: org.websiteUrl,
    category: org.category || 'Open Source Software',
    primaryProgram: org.programName || 'Google Summer of Code',
    health,
    historicalSlots,
    reviewLatencyHistogram,
    communicationChannels: channels,
    bestTimeToSubmit: {
      recommendedWindow: '3-4 weeks prior to official program proposal deadline',
      timezone: 'UTC / US Eastern / Central European Time',
      peakActivityDays: ['Tuesday', 'Wednesday', 'Thursday'],
      tips: 'Mentors actively triage proposals submitted early in the review period. Engage in GitHub Discussions first to validate architecture choices before submitting your full draft.',
    },
    lastUpdated: new Date().toISOString(),
  };
}
