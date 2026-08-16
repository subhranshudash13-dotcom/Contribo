import type { LucideIcon } from 'lucide-react';
import {
  Compass,
  GitBranch,
  GitPullRequest,
  Award,
  BookOpen,
  Heart,
  Target,
  Calendar,
  Users,
  Sparkles,
  Terminal,
  MessageSquare,
  FileText,
  Search,
  ShieldCheck,
  Rocket,
} from 'lucide-react';

export type TrackAccent = 'accent' | 'brass' | 'merge' | 'success';

export interface ProductLink {
  label: string;
  href: string;
  description?: string;
}

export interface ResourceLink {
  title: string;
  url: string;
  external?: boolean;
}

export interface RoadmapStage {
  id: string;
  title: string;
  subtitle: string;
  outcome: string;
  estimatedTime: string;
  checklist: string[];
  skills: string[];
  productLinks: ProductLink[];
  resources: ResourceLink[];
  tips?: string[];
  icon: LucideIcon;
}

export interface RoadmapTrack {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  audience: string;
  outcome: string;
  duration: string;
  accent: TrackAccent;
  icon: LucideIcon;
  stages: RoadmapStage[];
}

export const ROADMAP_TRACKS: RoadmapTrack[] = [
  {
    id: 'foundations',
    title: 'Open Source Foundations',
    shortTitle: 'Foundations',
    tagline: 'From zero to your first meaningful contribution',
    audience: 'New to open source or Git/GitHub',
    outcome: 'Ship a quality first PR and know how to find the next issue',
    duration: '2–6 weeks',
    accent: 'accent',
    icon: Compass,
    stages: [
      {
        id: 'f-orient',
        title: 'Mindset & orientation',
        subtitle: 'Understand how open source communities work',
        outcome: 'You can explain licensing, contribution etiquette, and why maintainers care about communication.',
        estimatedTime: '2–4 days',
        icon: BookOpen,
        checklist: [
          'Read opensource.guide “How to Contribute” end to end',
          'Skim a project LICENSE and CODE_OF_CONDUCT on GitHub',
          'Identify 2–3 domains you care about (web, AI, systems, docs, design)',
          'Create or clean up your GitHub profile (bio, pin 1–2 repos)',
        ],
        skills: [
          'Open-source norms & etiquette',
          'Basic licensing awareness',
          'Choosing a focus area',
        ],
        productLinks: [
          {
            label: 'Browse programs',
            href: '/programs',
            description: 'See mentorship options you may aim for later',
          },
          {
            label: 'Resource: good first issues',
            href: '/resources#finding-first-issues',
            description: 'How maintainers signal beginner-friendly work',
          },
        ],
        resources: [
          {
            title: 'How to Contribute to Open Source',
            url: 'https://opensource.guide/how-to-contribute/',
            external: true,
          },
          {
            title: 'Open Source Licenses (overview)',
            url: 'https://choosealicense.com/licenses/',
            external: true,
          },
        ],
        tips: [
          'Start with projects you already use — motivation beats random “good first issue” lists.',
          'Read recent merged PRs before opening an issue. Patterns matter more than tutorials.',
        ],
      },
      {
        id: 'f-git',
        title: 'Git fundamentals',
        subtitle: 'Clone, branch, commit, and push safely',
        outcome: 'You can create a branch, commit with a clear message, and push without rewriting main.',
        estimatedTime: '3–7 days',
        icon: GitBranch,
        checklist: [
          'Install Git and configure user.name / user.email',
          'Practice clone → branch → commit → push on a personal repo',
          'Complete an interactive Git branching exercise',
          'Learn how to sync with upstream (fetch + rebase or merge)',
        ],
        skills: [
          'git clone / status / add / commit',
          'Branches & pull requests',
          'Basic conflict resolution',
        ],
        productLinks: [
          {
            label: 'Contribo Git guide',
            href: '/resources#git-guide',
            description: 'Cheat sheet for common collaboration commands',
          },
        ],
        resources: [
          {
            title: 'Learn Git Branching',
            url: 'https://learngitbranching.js.org/',
            external: true,
          },
          {
            title: 'GitHub Git Handbook',
            url: 'https://docs.github.com/en/get-started/using-git',
            external: true,
          },
        ],
        tips: [
          'Write commits as “why”, not “what”. Reviewers read history under pressure.',
          'Never force-push to main/master. Feature branches only.',
        ],
      },
      {
        id: 'f-github',
        title: 'GitHub fluency',
        subtitle: 'Issues, discussions, and project layout',
        outcome: 'You can navigate a repo, find CONTRIBUTING.md, and comment productively on issues.',
        estimatedTime: '2–4 days',
        icon: Terminal,
        checklist: [
          'Locate README, CONTRIBUTING, and issue templates in a real project',
          'Star and watch one org you might contribute to',
          'Comment on an issue with a concrete question or reproduction (not “assign me”)',
          'Fork a repository and keep the fork up to date once',
        ],
        skills: [
          'Reading contribution docs',
          'Issue etiquette',
          'Fork + upstream workflow',
        ],
        productLinks: [
          {
            label: 'GitHub guide',
            href: '/resources#github-guide',
            description: 'Issues, PRs, and collaboration surface area',
          },
          {
            label: 'Explore organizations',
            href: '/organizations',
            description: 'Find orgs participating in mentorship programs',
          },
        ],
        resources: [
          {
            title: 'GitHub Docs: Collaborating',
            url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests',
            external: true,
          },
        ],
        tips: [
          '“Assign me” without context is noise. Show you read the issue and can reproduce it.',
        ],
      },
      {
        id: 'f-first-pr',
        title: 'Ship your first PR',
        subtitle: 'Small, reviewable, and useful',
        outcome: 'You open a PR that follows the project template and responds to review feedback.',
        estimatedTime: '1–2 weeks',
        icon: GitPullRequest,
        checklist: [
          'Pick a labeled good-first-issue or docs fix you can finish in days, not months',
          'Reproduce the bug or document the gap before coding',
          'Open a draft PR early if the change is non-trivial',
          'Address review comments in follow-up commits (or amend if the project prefers)',
          'Thank reviewers and link related issues in the PR body',
        ],
        skills: [
          'Forking & PR creation',
          'Writing PR descriptions',
          'Responding to code review',
        ],
        productLinks: [
          {
            label: 'Browse beginner-friendly projects',
            href: '/projects',
            description: 'Filter projects and tech stacks on Contribo',
          },
          {
            label: 'Finding first issues',
            href: '/resources#finding-first-issues',
          },
        ],
        resources: [
          {
            title: 'First Contributions practice repo',
            url: 'https://github.com/firstcontributions/first-contributions',
            external: true,
          },
        ],
        tips: [
          'Docs, typo, test, and accessibility fixes are real contributions — and great first merges.',
          'One focused PR beats a kitchen-sink branch every time.',
        ],
      },
      {
        id: 'f-momentum',
        title: 'Build momentum',
        subtitle: 'Turn one merge into a habit',
        outcome: 'You have a second contribution in progress and a short public trail of work.',
        estimatedTime: 'Ongoing',
        icon: Rocket,
        checklist: [
          'Open or claim a second issue in the same or related project',
          'Pin the merged PR (or mention it) on your GitHub / resume notes',
          'Join the project chat or mailing list and introduce yourself once',
          'Decide your next goal: events track or mentorship track',
        ],
        skills: [
          'Sustained contribution cadence',
          'Community communication',
          'Personal branding of OSS work',
        ],
        productLinks: [
          {
            label: 'Community events path',
            href: '/roadmaps?track=events',
            description: 'Switch to the Events track when ready',
          },
          {
            label: 'AI project matcher',
            href: '/matcher',
            description: 'Match skills to mentorship projects',
          },
          {
            label: 'Resume tips',
            href: '/resources#resume-tips',
          },
        ],
        resources: [
          {
            title: 'Maintainer Guide (read as a contributor)',
            url: 'https://opensource.guide/best-practices/',
            external: true,
          },
        ],
        tips: [
          'Depth in one ecosystem beats random one-off PRs across twenty repos for mentorship apps.',
        ],
      },
    ],
  },
  {
    id: 'mentorship',
    title: 'Paid Mentorship Path',
    shortTitle: 'Mentorship',
    tagline: 'Get application-ready for stipend programs',
    audience: 'Aiming for GSoC, Outreachy, LFX, Summer of Bitcoin, MLH, and similar',
    outcome: 'Eligibility checked, contribution signal built, proposal drafted, applications tracked',
    duration: '2–4 months prep',
    accent: 'merge',
    icon: Target,
    stages: [
      {
        id: 'm-choose',
        title: 'Choose programs that fit',
        subtitle: 'Eligibility, timelines, and stipend realities',
        outcome: 'You shortlist 1–3 programs that match your status, calendar, and goals.',
        estimatedTime: '3–5 days',
        icon: Calendar,
        checklist: [
          'Compare eligibility rules (student status, underrepresentation, region, age)',
          'Map application windows against your semester / work calendar',
          'Note stipend expectations and time commitment (full-time vs part-time)',
          'Pick a primary program + one backup path',
        ],
        skills: [
          'Program comparison',
          'Timeline planning',
          'Eligibility self-check',
        ],
        productLinks: [
          {
            label: 'All programs',
            href: '/programs',
            description: 'GSoC, Outreachy, LFX, MLH, GSSoC, NSoC, and more',
          },
          {
            label: 'GSoC program page',
            href: '/programs/gsoc',
          },
          {
            label: 'Outreachy program page',
            href: '/programs/outreachy',
          },
          {
            label: 'LFX Mentorship',
            href: '/programs/lfx',
          },
        ],
        resources: [
          {
            title: 'GSoC contributor guide',
            url: 'https://google.github.io/gsocguides/student/',
            external: true,
          },
        ],
        tips: [
          'Do not apply to every program. Depth with one org beats scattershot applications.',
        ],
      },
      {
        id: 'm-signal',
        title: 'Build contribution signal',
        subtitle: 'Prove you can work in the community early',
        outcome: 'You have merged or in-review work on target orgs before proposal season peaks.',
        estimatedTime: '4–8 weeks',
        icon: GitPullRequest,
        checklist: [
          'Join the org’s chat / mailing list and read recent contributor threads',
          'Set up the project locally and run tests',
          'Land at least one meaningful PR (feature, fix, tests, or docs)',
          'Engage on 2–3 issues with substance (repros, reviews, design notes)',
        ],
        skills: [
          'Local project setup',
          'Issue-driven development',
          'Async community communication',
        ],
        productLinks: [
          {
            label: 'Organizations catalog',
            href: '/organizations',
          },
          {
            label: 'Projects explorer',
            href: '/projects',
          },
          {
            label: 'Foundations track',
            href: '/roadmaps?track=foundations',
            description: 'If Git/PR basics still feel shaky',
          },
        ],
        resources: [
          {
            title: 'Finding good first issues',
            url: '/resources#finding-first-issues',
          },
        ],
        tips: [
          'Mentors filter on demonstrated interest. Cold proposals with zero prior contact rarely win.',
        ],
      },
      {
        id: 'm-shortlist',
        title: 'Shortlist orgs & projects',
        subtitle: 'Match skills to ideas that ship',
        outcome: 'You have 2–3 project ideas with clear scope and known mentors or org contacts.',
        estimatedTime: '1–2 weeks',
        icon: Search,
        checklist: [
          'List your strongest skills and languages honestly',
          'Run the AI matcher and save promising projects',
          'Read prior-year project ideas and accepted proposals if available',
          'Confirm each idea is scoped for ~12 weeks with midterm deliverables',
        ],
        skills: [
          'Project scoping',
          'Skill–project matching',
          'Reading org project lists',
        ],
        productLinks: [
          {
            label: 'AI project matcher',
            href: '/matcher',
            description: 'Semantic + heuristic matching against the catalog',
          },
          {
            label: 'Save & track on dashboard',
            href: '/dashboard',
            description: 'Keep shortlists and application status in one place',
          },
        ],
        resources: [
          {
            title: 'Mentor outreach guide',
            url: '/resources#mentor-outreach-guide',
          },
        ],
        tips: [
          'Prefer ideas the org already wants. Inventing a project nobody asked for is harder to sell.',
        ],
      },
      {
        id: 'm-proposal',
        title: 'Write the proposal',
        subtitle: 'Spec, timeline, prior work, and bio',
        outcome: 'You have a draft mentors can comment on at least two weeks before the deadline.',
        estimatedTime: '2–3 weeks',
        icon: FileText,
        checklist: [
          'Outline technical approach, architecture, and risks',
          'Build a week-by-week timeline with buffer for tests and docs',
          'List prior contributions with PR/issue links',
          'Share draft with mentors early; iterate on feedback',
          'Proofread and match any official template fields exactly',
        ],
        skills: [
          'Technical writing',
          'Milestone planning',
          'Mentor collaboration',
        ],
        productLinks: [
          {
            label: 'Proposal writing guide',
            href: '/resources#proposal-writing',
          },
          {
            label: '12-week timeline planner',
            href: '/resources#timeline-planner',
          },
          {
            label: 'Readiness checklist',
            href: '/resources#readiness-checklist',
          },
        ],
        resources: [
          {
            title: 'Winning proposal structure (Contribo)',
            url: '/resources#proposal-writing',
          },
        ],
        tips: [
          'Never submit a first draft on deadline day. Early feedback is the real differentiator.',
        ],
      },
      {
        id: 'm-submit',
        title: 'Submit & track',
        subtitle: 'Official portals and personal follow-through',
        outcome: 'Applications are submitted correctly and tracked; next steps are clear either way.',
        estimatedTime: 'Deadline week + wait period',
        icon: ShieldCheck,
        checklist: [
          'Submit on the official program portal before the cutoff (timezone double-check)',
          'Save confirmation IDs / screenshots',
          'Log status on your Contribo dashboard',
          'Continue small contributions during the wait — silence is normal',
        ],
        skills: [
          'Application hygiene',
          'Status tracking',
          'Emotional resilience during waitlists',
        ],
        productLinks: [
          {
            label: 'Dashboard applications',
            href: '/dashboard',
          },
          {
            label: 'Interview tips',
            href: '/resources#interview-tips',
          },
        ],
        resources: [
          {
            title: 'Program guidelines hub',
            url: '/guidelines',
          },
        ],
        tips: [
          'Rejection is common and often capacity-based. Reuse the proposal work for the next cycle.',
        ],
      },
      {
        id: 'm-deliver',
        title: 'If accepted: deliver',
        subtitle: 'Community bonding through final evaluations',
        outcome: 'You communicate weekly, hit milestones, and leave code the org can maintain.',
        estimatedTime: 'Program duration (~12 weeks)',
        icon: Award,
        checklist: [
          'Agree communication cadence with mentors in week one',
          'Ship midterm-ready work early; avoid last-week heroics',
          'Write docs and tests as you go, not only at the end',
          'Publish a final report / blog if the program expects one',
        ],
        skills: [
          'Mentored delivery',
          'Weekly reporting',
          'Production-quality finish',
        ],
        productLinks: [
          {
            label: 'Resume tips for OSS',
            href: '/resources#resume-tips',
          },
          {
            label: 'Maintainer growth track',
            href: '/roadmaps?track=maintainer',
            description: 'Continue contributing after the program ends',
          },
        ],
        resources: [
          {
            title: 'GSoC mentor/student communication tips',
            url: 'https://google.github.io/gsocguides/student/communication',
            external: true,
          },
        ],
        tips: [
          'Treat the stipend as a job: blockers raised early beat silent delays.',
        ],
      },
    ],
  },
  {
    id: 'events',
    title: 'Community Events Path',
    shortTitle: 'Events',
    tagline: 'Sprint contributions without the spam',
    audience: 'Hacktoberfest, GSSoC, NSoC, and seasonal contribution drives',
    outcome: 'Multiple quality PRs during an event season, converted into long-term habits',
    duration: '2–6 weeks per event',
    accent: 'brass',
    icon: Sparkles,
    stages: [
      {
        id: 'e-pick',
        title: 'Pick an event season',
        subtitle: 'Rules, rewards, and quality bars',
        outcome: 'You know registration steps, PR quality rules, and your personal contribution target.',
        estimatedTime: '1–2 days',
        icon: Calendar,
        checklist: [
          'Read official event rules (spam PRs can be rejected or banned)',
          'Register on the event portal if required',
          'Set a realistic goal (e.g. 4 solid PRs, not 20 drive-bys)',
          'Block calendar time for review rounds, not only coding',
        ],
        skills: [
          'Event rule literacy',
          'Goal setting',
          'Time boxing',
        ],
        productLinks: [
          {
            label: 'Hacktoberfest on Contribo',
            href: '/programs/hacktoberfest',
          },
          {
            label: 'GSSoC program page',
            href: '/programs/gssoc',
          },
          {
            label: 'NSoC program page',
            href: '/programs/nsoc',
          },
          {
            label: 'All programs',
            href: '/programs',
          },
        ],
        resources: [
          {
            title: 'Hacktoberfest official site',
            url: 'https://hacktoberfest.com',
            external: true,
          },
        ],
        tips: [
          'Event badges mean nothing if maintainers remember you as spam. Quality is the brand.',
        ],
      },
      {
        id: 'e-find',
        title: 'Find the right issues',
        subtitle: 'Active repos, real labels, responsive maintainers',
        outcome: 'You have a shortlist of issues in healthy repositories, not abandoned ones.',
        estimatedTime: '2–4 days',
        icon: Search,
        checklist: [
          'Filter for recent commits and recent PR merges (activity > star count)',
          'Prefer issues labeled good-first-issue / hacktoberfest / documentation',
          'Comment with a plan before large changes',
          'Avoid repos that mass-merge low-value PRs for event metrics',
        ],
        skills: [
          'Repo health signals',
          'Issue triage for yourself',
          'Scope estimation',
        ],
        productLinks: [
          {
            label: 'Projects catalog',
            href: '/projects',
          },
          {
            label: 'Finding first issues guide',
            href: '/resources#finding-first-issues',
          },
          {
            label: 'Organizations',
            href: '/organizations',
          },
        ],
        resources: [
          {
            title: 'How to contribute (open source guide)',
            url: 'https://opensource.guide/how-to-contribute/',
            external: true,
          },
        ],
        tips: [
          'A quiet maintainer for 6 months is a red flag during a 30-day event.',
        ],
      },
      {
        id: 'e-quality',
        title: 'Ship quality PRs',
        subtitle: 'Review-ready, tested, respectful of guidelines',
        outcome: 'Your PRs follow CONTRIBUTING.md and are easy to review.',
        estimatedTime: 'Event duration',
        icon: GitPullRequest,
        checklist: [
          'Match code style and existing patterns in the file you touch',
          'Add or update tests when behavior changes',
          'Write PR titles and bodies that explain user impact',
          'Respond to review within a few days while the event is live',
        ],
        skills: [
          'PR quality bar',
          'Test hygiene',
          'Review turnaround',
        ],
        productLinks: [
          {
            label: 'PR & Git guide',
            href: '/resources#pr-starter-guide',
          },
          {
            label: 'Git collaboration guide',
            href: '/resources#git-guide',
          },
        ],
        resources: [
          {
            title: 'First Contributions',
            url: 'https://github.com/firstcontributions/first-contributions',
            external: true,
          },
        ],
        tips: [
          'If a maintainer asks for changes, that is success — engagement beats instant merge.',
        ],
      },
      {
        id: 'e-convert',
        title: 'Convert event work into a path',
        subtitle: 'Stay after the badges',
        outcome: 'You keep contributing to at least one project and plan a mentorship or maintainer step.',
        estimatedTime: '1–2 weeks post-event',
        icon: Rocket,
        checklist: [
          'Write a short recap of what you shipped (for resume / blog)',
          'Pick one repo to continue with after the event ends',
          'Evaluate mentorship programs using your new contribution history',
          'Update saved projects and application goals on the dashboard',
        ],
        skills: [
          'Reflection & storytelling',
          'Long-term project selection',
          'Career packaging of OSS',
        ],
        productLinks: [
          {
            label: 'Mentorship track',
            href: '/roadmaps?track=mentorship',
            description: 'Switch track when you are ready for paid programs',
          },
          {
            label: 'AI matcher',
            href: '/matcher',
          },
          {
            label: 'Dashboard',
            href: '/dashboard',
          },
        ],
        resources: [
          {
            title: 'Resume tips',
            url: '/resources#resume-tips',
          },
        ],
        tips: [
          'Event seasons are on-ramps. The career value is relationships and repeated contribution.',
        ],
      },
    ],
  },
  {
    id: 'maintainer',
    title: 'Growth to Maintainer',
    shortTitle: 'Maintainer',
    tagline: 'From regular contributor to trusted steward',
    audience: 'Contributors with repeated merges who want ownership',
    outcome: 'You review, triage, mentor, and help shape project direction responsibly',
    duration: '3–12+ months',
    accent: 'success',
    icon: Heart,
    stages: [
      {
        id: 'r-cadence',
        title: 'Consistent contribution cadence',
        subtitle: 'Reliability before authority',
        outcome: 'Maintainers recognize you as someone who finishes work and communicates clearly.',
        estimatedTime: 'Ongoing (baseline)',
        icon: GitBranch,
        checklist: [
          'Ship small, regular PRs rather than rare mega-branches',
          'Keep issue comments honest about capacity and blockers',
          'Document non-obvious decisions in PR bodies',
          'Volunteer for unglamorous work (tests, CI, docs) occasionally',
        ],
        skills: [
          'Reliability',
          'Technical communication',
          'Scope control',
        ],
        productLinks: [
          {
            label: 'Projects to deepen in',
            href: '/projects',
          },
          {
            label: 'Organizations',
            href: '/organizations',
          },
        ],
        resources: [
          {
            title: 'Best practices for maintainers (read early)',
            url: 'https://opensource.guide/best-practices/',
            external: true,
          },
        ],
        tips: [
          'Trust is earned by closing the loop — not by asking for commit bits.',
        ],
      },
      {
        id: 'r-review',
        title: 'Learn code review culture',
        subtitle: 'Give feedback that lands',
        outcome: 'You can leave constructive, specific review comments and approve with confidence.',
        estimatedTime: '4–8 weeks practice',
        icon: MessageSquare,
        checklist: [
          'Review 5+ community PRs focusing on correctness and clarity',
          'Separate “blocking” vs “nit” comments explicitly',
          'Test pull requests locally when feasible',
          'Model kindness: critique the code, not the person',
        ],
        skills: [
          'Code review',
          'Risk assessment',
          'Empathetic feedback',
        ],
        productLinks: [
          {
            label: 'GitHub collaboration guide',
            href: '/resources#github-guide',
          },
        ],
        resources: [
          {
            title: 'Google Engineering Practices — Code Review',
            url: 'https://google.github.io/eng-practices/review/',
            external: true,
          },
        ],
        tips: [
          'A good review teaches. A bad review only gates.',
        ],
      },
      {
        id: 'r-triage',
        title: 'Issue triage & docs ownership',
        subtitle: 'Keep the project navigable',
        outcome: 'You can label, reproduce, and route issues; docs stay accurate for newcomers.',
        estimatedTime: 'Ongoing',
        icon: BookOpen,
        checklist: [
          'Reproduce and confirm bugs before asking for more info',
          'Close or redirect duplicates with links and context',
          'Refresh CONTRIBUTING or onboarding docs after pain points you hit',
          'Maintain a short “good first issue” pipeline if the project wants one',
        ],
        skills: [
          'Issue triage',
          'Technical writing',
          'Newcomer onboarding',
        ],
        productLinks: [
          {
            label: 'Finding first issues (invert the lens)',
            href: '/resources#finding-first-issues',
            description: 'Use this to design better first issues for others',
          },
        ],
        resources: [
          {
            title: 'Open Source Guides — Maintainers',
            url: 'https://opensource.guide/maintainers/',
            external: true,
          },
        ],
        tips: [
          'Documentation ownership is often the fastest path to maintainer trust.',
        ],
      },
      {
        id: 'r-mentor',
        title: 'Mentor newcomers',
        subtitle: 'Multiply your impact',
        outcome: 'You can guide first-time contributors without burning out.',
        estimatedTime: 'Ongoing',
        icon: Users,
        checklist: [
          'Pair on a good-first-issue with a newcomer (async is fine)',
          'Write canned responses for common setup questions',
          'Protect your time: office hours or limited review windows',
          'Celebrate first merges publicly when appropriate',
        ],
        skills: [
          'Mentorship',
          'Async teaching',
          'Boundary setting',
        ],
        productLinks: [
          {
            label: 'Programs that need mentors',
            href: '/programs',
            description: 'Many mentorship programs recruit org mentors yearly',
          },
        ],
        resources: [
          {
            title: 'Mentoring in open source',
            url: 'https://opensource.guide/building-community/',
            external: true,
          },
        ],
        tips: [
          'Mentorship is a force multiplier — and a common path into formal co-maintainership.',
        ],
      },
      {
        id: 'r-steward',
        title: 'Stewardship & direction',
        subtitle: 'Shape the roadmap responsibly',
        outcome: 'You participate in design decisions, releases, and healthy project governance.',
        estimatedTime: 'Long-term',
        icon: Award,
        checklist: [
          'Join roadmap / design discussions with written proposals',
          'Help with releases, changelogs, or security response if invited',
          'Document decision records for future contributors',
          'Plan succession: no bus factor of one',
        ],
        skills: [
          'Technical leadership',
          'Governance basics',
          'Release discipline',
        ],
        productLinks: [
          {
            label: 'Back to foundations (for mentees you onboard)',
            href: '/roadmaps?track=foundations',
          },
          {
            label: 'Explore programs as an org mentor',
            href: '/programs',
          },
        ],
        resources: [
          {
            title: 'Leadership and governance',
            url: 'https://opensource.guide/leadership-and-governance/',
            external: true,
          },
        ],
        tips: [
          'Maintainer status is service, not status. Protect sustainability — including your own.',
        ],
      },
    ],
  },
];

export function getTrackById(id: string): RoadmapTrack | undefined {
  return ROADMAP_TRACKS.find((t) => t.id === id);
}

export function countTrackChecklistItems(track: RoadmapTrack): number {
  return track.stages.reduce((sum, s) => sum + s.checklist.length, 0);
}
