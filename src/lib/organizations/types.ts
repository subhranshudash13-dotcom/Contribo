export type HealthTier =
  | 'Highly Responsive'
  | 'Active & Engaged'
  | 'Moderate Activity'
  | 'Slower Triage';

export type BusFactorRisk = 'Low' | 'Moderate' | 'High';

export interface HealthMetricBreakdown {
  issueTriageScore: number;       // 0 - 25
  prReviewScore: number;          // 0 - 30
  mergeRateScore: number;         // 0 - 20
  mentorDistributionScore: number; // 0 - 15
  retentionScore: number;         // 0 - 10
}

export interface OrganizationHealth {
  overallScore: number;           // 0 - 100
  tier: HealthTier;
  medianTtfrHours: number;        // Time-To-First-Review in hours
  medianIssueTriageHours: number; // Time-to-first-response on issues
  mergeRatePercent: number;       // e.g. 78%
  activeMaintainers90d: number;   // active reviewers in past 90 days
  busFactorRisk: BusFactorRisk;
  breakdown: HealthMetricBreakdown;
}

export interface HistoricalSlotYear {
  year: number;
  program: string;
  slotsAllocated: number;
  projectsCompleted: number;
  estimatedApplicants: number;
  acceptanceRatePercent: number;
}

export interface ReviewLatencyBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface CommunicationChannel {
  channel: string;
  type: 'discord' | 'slack' | 'github_discussions' | 'mailing_list' | 'matrix' | 'zulip' | 'irc' | 'forum';
  url?: string;
  responsiveness: 'Instant' | 'Within Hours' | 'Within 1-2 Days' | 'Slow';
  recommended: boolean;
}

export interface OrganizationInsightsData {
  slug: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  category?: string;
  primaryProgram?: string;
  health: OrganizationHealth;
  historicalSlots: HistoricalSlotYear[];
  reviewLatencyHistogram: ReviewLatencyBucket[];
  communicationChannels: CommunicationChannel[];
  bestTimeToSubmit: {
    recommendedWindow: string;
    timezone: string;
    peakActivityDays: string[];
    tips: string;
  };
  lastUpdated: string;
}
