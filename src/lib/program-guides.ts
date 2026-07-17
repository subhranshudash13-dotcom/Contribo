/**
 * Editorial copy for program detail pages — how each program works,
 * who it is for, and what success looks like. Keep factual and helpful.
 */

export type ProgramGuide = {
  /** One-line positioning for the hero */
  tagline: string;
  /** What the program is and why it exists */
  overview: string;
  /** How the program actually runs */
  howItWorks: string[];
  /** Who should apply */
  whoItsFor: string[];
  /** Practical tips for first-time applicants */
  tips: string[];
  /** What you typically get out of it */
  outcomes: string[];
};

const GUIDES: Record<string, ProgramGuide> = {
  gsoc: {
    tagline: 'A paid summer of open-source mentorship with global organizations.',
    overview:
      'Google Summer of Code pairs new and early-career contributors with open-source organizations for a multi-week coding project. You write a proposal, get matched with mentors, and ship real work that ships upstream — with a stipend when accepted.',
    howItWorks: [
      'Organizations apply and publish project idea lists on the official GSoC site.',
      'Contributors explore orgs, join community channels, and often make early PRs before applying.',
      'You submit one or more detailed proposals during the application window.',
      'Accepted contributors code full-time for the coding period with mid-term and final evaluations.',
      'Successful completion typically includes a stipend and a strong portfolio contribution.',
    ],
    whoItsFor: [
      'Students and beginners (18+) who can commit several weeks of focused work',
      'People comfortable learning a large codebase with mentor guidance',
      'Contributors who can write a clear technical proposal',
    ],
    tips: [
      'Start early: introduce yourself in mailing lists / Discord weeks before proposals open.',
      'Read past accepted proposals for your target org.',
      'Pick 1–2 projects and go deep rather than spraying many shallow applications.',
    ],
    outcomes: [
      'Upstream code merged under real maintainers',
      'Mentorship letter / public GSoC profile',
      'Stipend (varies by region and project size)',
    ],
  },
  outreachy: {
    tagline: 'Paid internships for people underrepresented in tech — remote and mentor-led.',
    overview:
      'Outreachy offers remote internships with free and open-source projects. It emphasizes equity: applicants from groups subject to systemic bias in tech complete a contribution period, then a paid internship with dedicated mentors.',
    howItWorks: [
      'Submit an initial application explaining your background and eligibility.',
      'During the contribution period, pick projects and ship real PRs with mentor feedback.',
      'Finalize a project proposal with your mentors before the final deadline.',
      'Selected interns work full-time for ~13 weeks and receive a stipend.',
    ],
    whoItsFor: [
      'People from underrepresented groups in tech (see official eligibility rules)',
      'Applicants who can commit to a full-time remote internship',
      'Those ready to contribute during the unpaid contribution period',
    ],
    tips: [
      'Treat the contribution period as part of the interview — quality PRs matter.',
      'Ask mentors early what “good” looks like for their project.',
      'Document your setup and blockers; communication is scored.',
    ],
    outcomes: [
      'Paid remote internship experience',
      'Strong open-source portfolio and references',
      'Community that supports underrepresented contributors',
    ],
  },
  lfx: {
    tagline: 'Linux Foundation mentorships across cloud-native, kernel, and infrastructure projects.',
    overview:
      'LFX Mentorship (Linux Foundation) runs term-based mentorships with CNCF and other LF projects. You apply to specific project postings, complete screening tasks if required, and work with mentors on production infrastructure code.',
    howItWorks: [
      'Browse open mentorship terms (Spring, Summer, Fall) on the LFX portal.',
      'Apply to up to a small number of projects with resume and motivation.',
      'Complete any required screening tasks or interviews.',
      'Accepted mentees work for the term and receive a stipend tier based on location.',
    ],
    whoItsFor: [
      'Developers interested in Kubernetes, observability, networking, or kernel-adjacent work',
      'Applicants with some systems or backend experience (often intermediate+)',
      'People who can work asynchronously with global mentors',
    ],
    tips: [
      'Star projects early and read their “good first issues” and contribution guides.',
      'Tailor each application — generic cover letters underperform.',
      'Show prior OSS PRs even if small (docs, tests, bug fixes).',
    ],
    outcomes: [
      'Stipend-based mentorship term',
      'Contributions to widely used infrastructure',
      'Network in the Linux Foundation / CNCF ecosystem',
    ],
  },
  hacktoberfest: {
    tagline: 'A global October event to make four quality pull requests and earn recognition.',
    overview:
      'Hacktoberfest is a month-long celebration of open source run by DigitalOcean and partners. Anyone can register, find repos that opt in, and submit valid pull requests. Completing the challenge usually unlocks digital rewards and sometimes swag.',
    howItWorks: [
      'Register on the official Hacktoberfest site during the event window.',
      'Find repositories participating (often labeled hacktoberfest).',
      'Open pull requests that meet quality rules (not spam).',
      'Maintainers approve or merge valid PRs; complete the required count by month end.',
    ],
    whoItsFor: [
      'Absolute beginners making their first PR',
      'Experienced contributors who want a focused contribution month',
      'Anyone worldwide — no student requirement',
    ],
    tips: [
      'Avoid “spam” PRs — low-quality drive-by changes can get you disqualified.',
      'Start with documentation or good-first-issue labels.',
      'Communicate on issues before large code changes.',
    ],
    outcomes: [
      'Digital badge / rewards for completing the challenge',
      'Habit of contributing in public repos',
      'A gentle on-ramp into larger mentorships later',
    ],
  },
  'summer-of-bitcoin': {
    tagline: 'A focused summer for students building in the Bitcoin and open-money ecosystem.',
    overview:
      'Summer of Bitcoin is a global program for university students to contribute to Bitcoin Core and ecosystem projects. It typically includes screening challenges, proposal writing, and a full summer of mentored development with a stipend paid in BTC.',
    howItWorks: [
      'Apply with background information and complete any screening challenges.',
      'Engage mentors on Bitcoin-related projects and draft a proposal.',
      'Accepted students code through the summer under mentor review.',
      'Successful completion includes a stipend and deep domain experience.',
    ],
    whoItsFor: [
      'University students comfortable with systems, cryptography, or distributed systems',
      'Applicants willing to learn Bitcoin protocol concepts',
      'People who can handle intermediate-to-advanced technical work',
    ],
    tips: [
      'Study Bitcoin design docs before applying — domain literacy shows.',
      'Prior C++/Rust/Go experience helps for many projects.',
      'Engage early on project communication channels.',
    ],
    outcomes: [
      'Stipend (often in BTC)',
      'Specialized Bitcoin / open-finance resume signal',
      'Mentor relationships in a high-trust ecosystem',
    ],
  },
  'mlh-fellowship': {
    tagline: 'A cohort-based fellowship: production projects, podmates, and career support.',
    overview:
      'The MLH Fellowship places developers into pods that ship real open-source or partner projects over a multi-week batch. Selection includes code samples and interviews; fellows get structure, community, and often a stipend depending on the track.',
    howItWorks: [
      'Apply with a strong code sample and complete behavioral + technical screens.',
      'Accepted fellows join a batch and are assigned to a project pod.',
      'You ship weekly with mentors and fellow developers.',
      'Present outcomes and use the experience for internships or full-time roles.',
    ],
    whoItsFor: [
      'Students, bootcamp grads, and self-taught developers with proven code',
      'People who thrive in teams and standups',
      'Applicants who can commit to the full batch schedule',
    ],
    tips: [
      'Your code sample is critical — polish a small but complete project.',
      'Practice explaining tradeoffs; interviews care about communication.',
      'Show collaboration history (PRs, issues, pair work).',
    ],
    outcomes: [
      'Portfolio project built with a team',
      'MLH community and career resources',
      'Possible educational stipend depending on track',
    ],
  },
  gssoc: {
    tagline: 'A beginner-friendly multi-week contribution program led by GirlScript Foundation.',
    overview:
      'GirlScript Summer of Code (GSSoC) helps newcomers contribute to curated open-source projects over a summer-like window. It emphasizes learning, community, and consistent contributions rather than a high bar for prior experience.',
    howItWorks: [
      'Register as a contributor when the portal opens.',
      'Browse participating projects and pick stacks you want to learn.',
      'Open issues and PRs throughout the coding period following each project’s rules.',
      'Stay active in community channels; leaders track contribution quality for certificates.',
    ],
    whoItsFor: [
      'Students and beginners worldwide',
      'People making their first sustained open-source contributions',
      'Anyone who wants structure without a heavy proposal process',
    ],
    tips: [
      'Consistency beats one giant PR — small weekly contributions add up.',
      'Read each project’s CONTRIBUTING.md carefully.',
      'Ask for help early; GSSoC communities are built for newcomers.',
    ],
    outcomes: [
      'Certificates and recognition for active contributors',
      'Public GitHub history across real projects',
      'Confidence to apply to paid programs later (GSoC, Outreachy, LFX)',
    ],
  },
  nsoc: {
    tagline: 'Hands-on contribution sprints with mentorship from the Nexus community.',
    overview:
      'Nexus Spring of Code (NSoC) is a community-driven open-source program focused on practical contribution sprints. Participants pick curated projects, ship work with mentor guidance, and build portfolio-ready experience over a compact timeline.',
    howItWorks: [
      'Visit the official site for registration windows and project listings.',
      'Choose a project aligned with your skills and join the contributor community.',
      'Ship features, fixes, or docs during the sprint with mentor feedback.',
      'Complete the sprint goals to earn certificates and showcase your work.',
    ],
    whoItsFor: [
      'Developers and students of all levels seeking structured practice',
      'People who prefer short, intense contribution windows',
      'Beginners who want mentorship without a long formal application essay',
    ],
    tips: [
      'Read project guidelines on nsoc.in before registering.',
      'Introduce yourself to mentors with a short “what I can help with” note.',
      'Prefer issues labeled for newcomers if it is your first sprint.',
    ],
    outcomes: [
      'Certificates and mentor feedback',
      'Real commits in open repositories',
      'A clear next step toward larger fellowships',
    ],
  },
  esoc: {
    tagline: 'Paid open-source and applied AI mentorships with European organizations.',
    overview:
      'European Summer of Code (ESoC) matches contributors with open-source and applied AI projects, focusing on building strong ecosystems around open-source software in Europe. Under the guidance of EU-based mentors, you work on 3-month coding projects with paid stipends.',
    howItWorks: [
      'Organizations submit project idea lists in early spring.',
      'Contributors register on esoc.dev and discuss ideas with project mentors.',
      'You draft and submit technical proposals for the selected projects.',
      'Accepted contributors spend 3 months coding with structured milestones.',
      'Successful completion awards a stipend and a verified European OSS contribution certificate.',
    ],
    whoItsFor: [
      'Students and developers globally looking for stipend-based open-source work',
      'Anyone interested in applied AI, open science, and European open-source initiatives',
      'Contributors who value mentor-led project structuring',
    ],
    tips: [
      'Explore esoc.dev starting in January to view project registries.',
      'Focus on how your skills align with the project\'s tech stack (AI/OSS).',
      'Start communication with mentors early to refine your proposal.',
    ],
    outcomes: [
      'Stipend (typically €4,800+ or project-dependent)',
      'Industry-recognized mentor feedback and certificate',
      'Real-world applied AI or open-source software contributions',
    ],
  },
};

const FALLBACK: ProgramGuide = {
  tagline: 'An open-source mentorship opportunity tracked on Contribo.',
  overview:
    'This program helps contributors discover organizations, ship real work, and grow with mentors. Check the official website for the latest eligibility and dates — timelines on Contribo are verified periodically.',
  howItWorks: [
    'Review eligibility and official timelines on the program website.',
    'Explore organizations and project ideas listed for the current cycle.',
    'Engage the community early and follow application or contribution steps.',
    'Ship work, request reviews, and track deadlines in your Contribo dashboard.',
  ],
  whoItsFor: [
    'Contributors exploring open source mentorship',
    'People who want structured paths rather than random issues',
  ],
  tips: [
    'Verify dates on the official site before applying.',
    'Use Contribo to save projects and track application status.',
  ],
  outcomes: [
    'Portfolio contributions',
    'Mentor and community experience',
  ],
};

export function getProgramGuide(slug: string): ProgramGuide {
  return GUIDES[slug] || FALLBACK;
}

/** True when editorial content exists for this program slug (not just the generic fallback). */
export function hasProgramGuide(slug: string): boolean {
  return Boolean(slug && GUIDES[slug]);
}

/** All slugs with dedicated editorial guides. */
export function listGuidedProgramSlugs(): string[] {
  return Object.keys(GUIDES);
}
