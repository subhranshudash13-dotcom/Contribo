export interface CountryData {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  pppMultiplier: number;
  exchangeRateToUsd: number;
}

export const SUPPORTED_COUNTRIES: CountryData[] = [
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', pppMultiplier: 1.0, exchangeRateToUsd: 1.0 },
  { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', pppMultiplier: 0.5, exchangeRateToUsd: 86.5 },
  { code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€', pppMultiplier: 0.85, exchangeRateToUsd: 0.95 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', pppMultiplier: 0.9, exchangeRateToUsd: 0.79 },
  { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'CA$', pppMultiplier: 0.9, exchangeRateToUsd: 1.4 },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', currencySymbol: '₦', pppMultiplier: 0.4, exchangeRateToUsd: 1550 },
  { code: 'BR', name: 'Brazil', currency: 'BRL', currencySymbol: 'R$', pppMultiplier: 0.45, exchangeRateToUsd: 5.8 },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', currencySymbol: 'Rs', pppMultiplier: 0.4, exchangeRateToUsd: 278.0 },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', currencySymbol: '৳', pppMultiplier: 0.4, exchangeRateToUsd: 120.0 },
  { code: 'KE', name: 'Kenya', currency: 'KES', currencySymbol: 'KSh', pppMultiplier: 0.42, exchangeRateToUsd: 130.0 },
  { code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€', pppMultiplier: 0.85, exchangeRateToUsd: 0.95 },
  { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', pppMultiplier: 0.95, exchangeRateToUsd: 1.55 },
  { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: 'S$', pppMultiplier: 0.85, exchangeRateToUsd: 1.35 },
];

export function getCountry(code: string): CountryData {
  const normalized = (code || 'US').trim().toUpperCase();
  return SUPPORTED_COUNTRIES.find((c) => c.code === normalized) || SUPPORTED_COUNTRIES[0];
}

export interface ProgramComparisonRecord {
  slug: string;
  name: string;
  organizer: string;
  officialWebsite: string;
  accentColor: string;
  stipend: {
    type: 'fixed' | 'ppp-adjusted' | 'performance-based' | 'unpaid';
    baseUsd: number;
    maxUsd: number;
    payoutModel: string;
    description: string;
  };
  eligibility: {
    studentStatusRequired: boolean;
    minAge: number;
    requiresWorkAuth: boolean;
    fullTimeEmployedAllowed: boolean;
    geographicScope: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
    notes: string;
  };
  commitment: {
    weeklyHours: number;
    durationWeeks: number;
    totalEstimatedHours: number;
    codingStartDate: string;
    codingEndDate: string;
  };
  mentorship: {
    ratio: string;
    format: string;
  };
  application: {
    requiresWrittenProposal: boolean;
    priorContributionsEvaluated: boolean;
    applicationStartDate: string;
    applicationEndDate: string;
    acceptanceAnnouncementDate: string;
  };
}

export const COMPARISON_PROGRAMS: Record<string, ProgramComparisonRecord> = {
  gsoc: {
    slug: 'gsoc',
    name: 'Google Summer of Code',
    organizer: 'Google',
    officialWebsite: 'https://summerofcode.withgoogle.com',
    accentColor: '#4285F4',
    stipend: {
      type: 'ppp-adjusted',
      baseUsd: 3000,
      maxUsd: 6000,
      payoutModel: '2 Milestones (45% midterm, 55% final)',
      description: 'Purchasing power parity adjusted by contributor residence country (Medium 175h vs Large 350h project).',
    },
    eligibility: {
      studentStatusRequired: false,
      minAge: 18,
      requiresWorkAuth: false,
      fullTimeEmployedAllowed: true,
      geographicScope: 'Worldwide (except sanctioned regions)',
      experienceLevel: 'beginner',
      notes: 'Open to all open-source newcomers and students enrolled in post-secondary education.',
    },
    commitment: {
      weeklyHours: 30,
      durationWeeks: 12,
      totalEstimatedHours: 350,
      codingStartDate: '2026-06-01',
      codingEndDate: '2026-09-03',
    },
    mentorship: {
      ratio: '1:1 to 1:2 dedicated org mentors',
      format: 'Weekly synchronous syncs, asynchronous code reviews, public mailing lists.',
    },
    application: {
      requiresWrittenProposal: true,
      priorContributionsEvaluated: true,
      applicationStartDate: '2026-03-16',
      applicationEndDate: '2026-03-31',
      acceptanceAnnouncementDate: '2026-05-04',
    },
  },
  lfx: {
    slug: 'lfx',
    name: 'LFX Mentorship',
    organizer: 'Linux Foundation',
    officialWebsite: 'https://mentorship.lfx.linuxfoundation.org',
    accentColor: '#003366',
    stipend: {
      type: 'ppp-adjusted',
      baseUsd: 3000,
      maxUsd: 6600,
      payoutModel: '3 Milestones (monthly evaluation approval)',
      description: 'Stipend calibrated to local country tier per Linux Foundation guidelines.',
    },
    eligibility: {
      studentStatusRequired: false,
      minAge: 18,
      requiresWorkAuth: false,
      fullTimeEmployedAllowed: false,
      geographicScope: 'Worldwide',
      experienceLevel: 'intermediate',
      notes: 'Cannot be employed full-time (or >20 hrs/week) during mentorship term.',
    },
    commitment: {
      weeklyHours: 40,
      durationWeeks: 12,
      totalEstimatedHours: 480,
      codingStartDate: '2026-06-01',
      codingEndDate: '2026-08-28',
    },
    mentorship: {
      ratio: '1:1 dedicated Linux Foundation maintainer',
      format: 'Direct project PR reviews, technical design mentoring, community workgroup calls.',
    },
    application: {
      requiresWrittenProposal: false,
      priorContributionsEvaluated: true,
      applicationStartDate: '2026-04-15',
      applicationEndDate: '2026-05-15',
      acceptanceAnnouncementDate: '2026-05-25',
    },
  },
  outreachy: {
    slug: 'outreachy',
    name: 'Outreachy',
    organizer: 'Software Freedom Conservancy',
    officialWebsite: 'https://www.outreachy.org',
    accentColor: '#9A258F',
    stipend: {
      type: 'fixed',
      baseUsd: 7000,
      maxUsd: 7000,
      payoutModel: 'Bi-weekly disbursements + $500 travel/equipment stipend',
      description: 'Fixed global USD stipend disbursed regardless of geographic country of residence.',
    },
    eligibility: {
      studentStatusRequired: false,
      minAge: 18,
      requiresWorkAuth: false,
      fullTimeEmployedAllowed: false,
      geographicScope: 'Worldwide for underrepresented tech demographics',
      experienceLevel: 'all',
      notes: 'Applicants must pass initial eligibility essay screening and complete 1+ contribution during contribution phase.',
    },
    commitment: {
      weeklyHours: 30,
      durationWeeks: 13,
      totalEstimatedHours: 390,
      codingStartDate: '2026-12-07',
      codingEndDate: '2027-03-08',
    },
    mentorship: {
      ratio: '1:1 to 1:2 dedicated mentors',
      format: 'Supportive remote mentorship tailored to systemic inclusion in FLOSS.',
    },
    application: {
      requiresWrittenProposal: true,
      priorContributionsEvaluated: true,
      applicationStartDate: '2026-08-24',
      applicationEndDate: '2026-08-31',
      acceptanceAnnouncementDate: '2026-11-20',
    },
  },
  'summer-of-bitcoin': {
    slug: 'summer-of-bitcoin',
    name: 'Summer of Bitcoin',
    organizer: 'Bitcoin Association',
    officialWebsite: 'https://www.summerofbitcoin.org',
    accentColor: '#F7931A',
    stipend: {
      type: 'performance-based',
      baseUsd: 2500,
      maxUsd: 4000,
      payoutModel: 'Disbursed in BTC or USD across 2 milestone checkpoints',
      description: 'Competitive performance-based stipend funded in Bitcoin protocol development.',
    },
    eligibility: {
      studentStatusRequired: true,
      minAge: 18,
      requiresWorkAuth: false,
      fullTimeEmployedAllowed: false,
      geographicScope: 'Worldwide enrolled students',
      experienceLevel: 'intermediate',
      notes: 'Must be actively enrolled university undergraduate or master student during program.',
    },
    commitment: {
      weeklyHours: 35,
      durationWeeks: 12,
      totalEstimatedHours: 420,
      codingStartDate: '2026-05-18',
      codingEndDate: '2026-08-10',
    },
    mentorship: {
      ratio: '1:1 core Bitcoin Core / Lightning maintainer',
      format: 'Code reviews, cryptographic design discussions, Bitcoin Optech seminars.',
    },
    application: {
      requiresWrittenProposal: true,
      priorContributionsEvaluated: true,
      applicationStartDate: '2026-02-01',
      applicationEndDate: '2026-02-15',
      acceptanceAnnouncementDate: '2026-05-04',
    },
  },
  'mlh-fellowship': {
    slug: 'mlh-fellowship',
    name: 'MLH Fellowship',
    organizer: 'Major League Hacking',
    officialWebsite: 'https://fellowship.mlh.io',
    accentColor: '#E73427',
    stipend: {
      type: 'ppp-adjusted',
      baseUsd: 2000,
      maxUsd: 5000,
      payoutModel: 'Monthly educational grant disbursements',
      description: 'Need-based and regional educational stipends supported by corporate sponsors.',
    },
    eligibility: {
      studentStatusRequired: false,
      minAge: 18,
      requiresWorkAuth: false,
      fullTimeEmployedAllowed: false,
      geographicScope: 'Worldwide (timezone cohort alignment required)',
      experienceLevel: 'beginner',
      notes: 'Available in Open Source, Software Engineering, and Web3 tracks.',
    },
    commitment: {
      weeklyHours: 40,
      durationWeeks: 12,
      totalEstimatedHours: 480,
      codingStartDate: '2026-06-08',
      codingEndDate: '2026-08-28',
    },
    mentorship: {
      ratio: '1:10 Pod Leader + dedicated sponsor mentor',
      format: 'Daily standups, pod hackathons, code review pairing.',
    },
    application: {
      requiresWrittenProposal: false,
      priorContributionsEvaluated: false,
      applicationStartDate: '2026-01-15',
      applicationEndDate: '2026-04-01',
      acceptanceAnnouncementDate: '2026-05-15',
    },
  },
  nsoc: {
    slug: 'nsoc',
    name: 'Nexus Spring of Code (NSoC)',
    organizer: 'Nexus Spring of Code Community',
    officialWebsite: 'https://nsoc.in',
    accentColor: '#10B981',
    stipend: {
      type: 'unpaid',
      baseUsd: 0,
      maxUsd: 0,
      payoutModel: 'Prizes, sponsor bounties, swag kits & verified certificates',
      description: 'Merit-based open-source spring sprint with verified leaderboard credentials.',
    },
    eligibility: {
      studentStatusRequired: false,
      minAge: 16,
      requiresWorkAuth: false,
      fullTimeEmployedAllowed: true,
      geographicScope: 'Worldwide open registration',
      experienceLevel: 'all',
      notes: 'Fast-paced contribution sprint open to all beginner and experienced coders.',
    },
    commitment: {
      weeklyHours: 15,
      durationWeeks: 3,
      totalEstimatedHours: 45,
      codingStartDate: '2026-03-20',
      codingEndDate: '2026-04-05',
    },
    mentorship: {
      ratio: 'Project maintainers in Discord / GitHub discussions',
      format: 'Issue triage labels, review guidelines, sprint leaderboards.',
    },
    application: {
      requiresWrittenProposal: false,
      priorContributionsEvaluated: false,
      applicationStartDate: '2026-03-01',
      applicationEndDate: '2026-03-15',
      acceptanceAnnouncementDate: '2026-03-18',
    },
  },
  gssoc: {
    slug: 'gssoc',
    name: 'GirlScript Summer of Code',
    organizer: 'GirlScript Foundation',
    officialWebsite: 'https://gssoc.girlscript.tech',
    accentColor: '#FF6F61',
    stipend: {
      type: 'unpaid',
      baseUsd: 0,
      maxUsd: 0,
      payoutModel: 'Swag boxes, top contributor prizes & certificates of excellence',
      description: 'Beginner-friendly open source program celebrating diversity with community recognition.',
    },
    eligibility: {
      studentStatusRequired: false,
      minAge: 16,
      requiresWorkAuth: false,
      fullTimeEmployedAllowed: true,
      geographicScope: 'Worldwide open participation',
      experienceLevel: 'beginner',
      notes: 'Warm welcome to first-time contributors and open source enthusiasts.',
    },
    commitment: {
      weeklyHours: 15,
      durationWeeks: 12,
      totalEstimatedHours: 180,
      codingStartDate: '2026-06-01',
      codingEndDate: '2026-08-31',
    },
    mentorship: {
      ratio: 'Project maintainers & community mentors',
      format: 'Community Discord server, issue assignment threads, weekly AMA sessions.',
    },
    application: {
      requiresWrittenProposal: false,
      priorContributionsEvaluated: false,
      applicationStartDate: '2026-05-01',
      applicationEndDate: '2026-05-20',
      acceptanceAnnouncementDate: '2026-05-25',
    },
  },
  hacktoberfest: {
    slug: 'hacktoberfest',
    name: 'Hacktoberfest',
    organizer: 'DigitalOcean, MLH & DEV',
    officialWebsite: 'https://hacktoberfest.com',
    accentColor: '#FF8A00',
    stipend: {
      type: 'unpaid',
      baseUsd: 0,
      maxUsd: 0,
      payoutModel: 'Digital tree planted in your name, digital badges & sponsor perks',
      description: 'Month-long celebration of open-source software with rewards for 4 accepted pull requests.',
    },
    eligibility: {
      studentStatusRequired: false,
      minAge: 13,
      requiresWorkAuth: false,
      fullTimeEmployedAllowed: true,
      geographicScope: 'Worldwide',
      experienceLevel: 'all',
      notes: 'Open to everyone; requires 4 valid PRs to opted-in GitHub or GitLab repositories.',
    },
    commitment: {
      weeklyHours: 10,
      durationWeeks: 4,
      totalEstimatedHours: 40,
      codingStartDate: '2026-10-01',
      codingEndDate: '2026-10-31',
    },
    mentorship: {
      ratio: 'Community repo maintainers',
      format: 'GitHub PR review workflows, hacktoberfest-tagged issues.',
    },
    application: {
      requiresWrittenProposal: false,
      priorContributionsEvaluated: false,
      applicationStartDate: '2026-09-26',
      applicationEndDate: '2026-10-31',
      acceptanceAnnouncementDate: '2026-09-26',
    },
  },
};

export function getProgramRecord(slug: string): ProgramComparisonRecord | undefined {
  return COMPARISON_PROGRAMS[slug.toLowerCase()];
}

export function getAllProgramRecords(): ProgramComparisonRecord[] {
  return Object.values(COMPARISON_PROGRAMS);
}
