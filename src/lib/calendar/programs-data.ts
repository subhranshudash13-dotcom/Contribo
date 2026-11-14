export interface ProgramCalendarData {
  slug: string;
  name: string;
  organizer: string;
  officialWebsite?: string;
  timeline: {
    event: string;
    date: string;
    description?: string;
  }[];
}

export const FALLBACK_PROGRAMS_CALENDAR: ProgramCalendarData[] = [
  {
    slug: 'gsoc',
    name: 'Google Summer of Code',
    organizer: 'Google',
    officialWebsite: 'https://summerofcode.withgoogle.com',
    timeline: [
      { event: 'Organization Applications Open', date: '2026-01-22' },
      { event: 'Accepted Orgs Announced', date: '2026-02-23' },
      { event: 'Contributor Applications Open', date: '2026-03-16' },
      { event: 'Application Deadline', date: '2026-03-31' },
      { event: 'Accepted Projects Announced', date: '2026-05-04' },
      { event: 'Coding Period Begins', date: '2026-06-01' },
      { event: 'Results Announced', date: '2026-09-03' },
    ],
  },
  {
    slug: 'outreachy',
    name: 'Outreachy',
    organizer: 'Software Freedom Conservancy',
    officialWebsite: 'https://www.outreachy.org',
    timeline: [
      { event: 'Initial Applications Open', date: '2026-08-24' },
      { event: 'Initial Application Deadline', date: '2026-08-31' },
      { event: 'Contribution Period Begins', date: '2026-10-12' },
      { event: 'Internships Start', date: '2026-12-07' },
      { event: 'Internships End', date: '2027-03-08' },
    ],
  },
  {
    slug: 'lfx',
    name: 'LFX Mentorship',
    organizer: 'Linux Foundation',
    officialWebsite: 'https://mentorship.lfx.linuxfoundation.org',
    timeline: [
      { event: 'Applications Open (Summer)', date: '2026-04-15' },
      { event: 'Application Deadline', date: '2026-05-15' },
      { event: 'Mentorship Term Starts', date: '2026-06-01' },
      { event: 'Mentorship Term Ends', date: '2026-08-28' },
    ],
  },
  {
    slug: 'hacktoberfest',
    name: 'Hacktoberfest',
    organizer: 'MLH & DEV (presented by DigitalOcean)',
    officialWebsite: 'https://hacktoberfest.com',
    timeline: [
      { event: 'Registration Opens', date: '2026-09-26' },
      { event: 'Coding Period Starts', date: '2026-10-01' },
      { event: 'Coding Period Ends', date: '2026-10-31' },
    ],
  },
  {
    slug: 'summer-of-bitcoin',
    name: 'Summer of Bitcoin',
    organizer: 'Bitcoin Association',
    officialWebsite: 'https://www.summerofbitcoin.org',
    timeline: [
      { event: 'Applications Open', date: '2026-02-01' },
      { event: 'Application Deadline', date: '2026-02-15' },
      { event: 'Coding Phase Starts', date: '2026-05-18' },
      { event: 'Coding Phase Ends', date: '2026-08-10' },
    ],
  },
  {
    slug: 'mlh-fellowship',
    name: 'MLH Fellowship',
    organizer: 'Major League Hacking',
    officialWebsite: 'https://fellowship.mlh.io',
    timeline: [
      { event: 'Applications Open (Summer)', date: '2026-01-15' },
      { event: 'Application Deadline', date: '2026-04-01' },
      { event: 'Summer Cohort Starts', date: '2026-06-08' },
      { event: 'Summer Cohort Ends', date: '2026-08-28' },
    ],
  },
  {
    slug: 'gssoc',
    name: 'GirlScript Summer of Code',
    organizer: 'GirlScript Foundation',
    officialWebsite: 'https://gssoc.girlscript.tech',
    timeline: [
      { event: 'Contributor Registration Opens', date: '2026-05-01' },
      { event: 'Projects Announced', date: '2026-05-20' },
      { event: 'Coding Period Begins', date: '2026-06-01' },
      { event: 'Coding Period Ends', date: '2026-08-31' },
      { event: 'Results & Certificates', date: '2026-09-15' },
    ],
  },
  {
    slug: 'nsoc',
    name: 'Nexus Spring of Code (NSoC)',
    organizer: 'Nexus Spring of Code Community',
    officialWebsite: 'https://nsoc.in',
    timeline: [
      { event: 'Registration Opens', date: '2026-03-01' },
      { event: 'Registration Closes', date: '2026-03-15' },
      { event: 'Contribution Sprint Starts', date: '2026-03-20' },
      { event: 'Sprint Ends + Results', date: '2026-04-05' },
    ],
  },
  {
    slug: 'esoc',
    name: 'European Summer of Code (ESoC)',
    organizer: 'European Open Source & AI Hubs',
    officialWebsite: 'https://www.esoc.dev',
    timeline: [
      { event: 'Information Sessions', date: '2026-01-25' },
      { event: 'Applications Open', date: '2026-02-15' },
      { event: 'Application Deadline', date: '2026-03-15' },
      { event: 'Accepted Projects Announced', date: '2026-04-10' },
      { event: 'Coding Period Begins', date: '2026-05-01' },
      { event: 'Coding Period Ends', date: '2026-07-31' },
      { event: 'Final Evaluations & Results', date: '2026-08-15' },
    ],
  },
];

