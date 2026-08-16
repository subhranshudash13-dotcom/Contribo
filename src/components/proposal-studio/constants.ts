import {
  BookOpen,
  CheckCircle2,
  Download,
  Edit3,
  Layers,
  Star,
  type LucideIcon,
} from 'lucide-react';

export type StudioTab =
  | 'overview'
  | 'builder'
  | 'examples'
  | 'guide'
  | 'review'
  | 'export';

export type StudioMode = 'hub' | 'workspace';

export type ProgramTagFilter = 'ALL' | 'GSOC' | 'LFX' | 'SOB' | 'C4GT' | 'Outreachy';

export interface BuilderSectionDef {
  id: string;
  title: string;
  shortLabel: string;
  placeholder: string;
  tips: string;
  acceptedSnippet: string;
  minChars: number;
}

export const BUILDER_SECTIONS: BuilderSectionDef[] = [
  {
    id: 'summary',
    title: 'Summary',
    shortLabel: 'Summary',
    placeholder:
      'Brief high-level summary of your project goals and expected outcomes...',
    tips: 'Keep it clear and concise (2–4 sentences). Lead with the core deliverable and who benefits.',
    acceptedSnippet:
      'Integration of dynamic ECharts-based geospatial visualization modules and caching optimization in Apache Superset for large-scale analytical dashboards.',
    minChars: 40,
  },
  {
    id: 'problemStatement',
    title: 'Problem Statement',
    shortLabel: 'Problem',
    placeholder:
      'Explain the current pain point or technical limitation in the project...',
    tips: 'Reference concrete GitHub issues, UI bottlenecks, or missing APIs. Quantify impact when possible.',
    acceptedSnippet:
      'Existing map visualizations in Superset rely on legacy deck.gl layers that lack custom tile server fallback and real-time query aggregation. When rendering datasets >500,000 rows, frontend rendering frames drop below 15 FPS.',
    minChars: 60,
  },
  {
    id: 'architecture',
    title: 'Architecture & Technical Design',
    shortLabel: 'Architecture',
    placeholder:
      'Detail your technical approach, data flow, APIs, and components...',
    tips: 'Name real directories, classes, hooks, and schemas. Include testing and benchmark strategy.',
    acceptedSnippet:
      'We propose a decoupled spatial rendering layer using ECharts GL engine backed by an asynchronous Redis query cache. Backend (Flask + SQLAlchemy) will generate spatial buckets before transferring GeoJSON to React frontend.',
    minChars: 80,
  },
  {
    id: 'timeline',
    title: 'Timeline & Milestones',
    shortLabel: 'Timeline',
    placeholder:
      'Break down work into bi-weekly milestones across the program duration...',
    tips: 'Include explicit buffers for reviews, docs, and testing. Align phases with community bonding if applicable.',
    acceptedSnippet:
      'Weeks 1-2: Community bonding & API schema design.\nWeeks 3-6: Implement GeoECharts visualization component.\nWeeks 7-10: Redis spatial caching middleware.\nWeeks 11-12: Integration tests, docs, and final merge.',
    minChars: 50,
  },
  {
    id: 'deliverables',
    title: 'Deliverables & Acceptance Criteria',
    shortLabel: 'Deliverables',
    placeholder: 'List explicit, verifiable outputs and testing metrics...',
    tips: 'Mentors prefer measurable targets (coverage %, FPS, latency SLOs).',
    acceptedSnippet:
      '1. Reusable GeoECharts component in superset-frontend.\n2. Redis spatial cache middleware.\n3. Unit & Cypress test suites with 90%+ coverage.\n4. Official contributor documentation.',
    minChars: 40,
  },
  {
    id: 'stretchGoals',
    title: 'Stretch Goals',
    shortLabel: 'Stretch',
    placeholder:
      'Optional additional features if main deliverables finish ahead of schedule...',
    tips: 'Show ambition without risking core delivery. Keep stretch goals clearly optional.',
    acceptedSnippet:
      'Support for WebGL vector tile streaming and offline map canvas exporting (PNG/SVG).',
    minChars: 20,
  },
  {
    id: 'communityContributions',
    title: 'Community Contributions & PRs',
    shortLabel: 'Contributions',
    placeholder: 'List your past PRs, issues opened, or community discussions...',
    tips: 'Even small merged docs fixes or bug reports build trust. Link PR/issue numbers.',
    acceptedSnippet:
      'PR #14209 (Merged): Fixed SQL Lab query execution timer bug.\nPR #14311 (In Review): Added unit test coverage for dashboard filter component.\nIssue #14102: Reported spatial layer glitch.',
    minChars: 30,
  },
  {
    id: 'aboutMe',
    title: 'About Me',
    shortLabel: 'About',
    placeholder:
      'Your background, programming experience, and relevant work...',
    tips: 'Highlight stack fit, education, and prior open-source collaboration style.',
    acceptedSnippet:
      'Final year CS student with 2 years of experience in React, TypeScript, and Python Flask. Previously contributed to Apache ECharts and active open-source enthusiast.',
    minChars: 40,
  },
];

export interface StudioNavItem {
  id: StudioTab;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
}

export const STUDIO_NAV: StudioNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    icon: Layers,
    description: 'Draft status and next actions',
  },
  {
    id: 'builder',
    label: 'Builder',
    shortLabel: 'Write',
    icon: Edit3,
    description: 'Section-by-section writing',
  },
  {
    id: 'examples',
    label: 'Library',
    shortLabel: 'Library',
    icon: Star,
    description: 'Annotated accepted proposals',
  },
  {
    id: 'guide',
    label: 'Project Guide',
    shortLabel: 'Guide',
    icon: BookOpen,
    description: 'Repo layout and mentor expectations',
  },
  {
    id: 'review',
    label: 'Review',
    shortLabel: 'Review',
    icon: CheckCircle2,
    description: 'Readiness score and gaps',
  },
  {
    id: 'export',
    label: 'Export',
    shortLabel: 'Export',
    icon: Download,
    description: 'Markdown and clipboard',
  },
];

export const PROGRAM_FILTERS: ProgramTagFilter[] = [
  'ALL',
  'GSOC',
  'LFX',
  'SOB',
  'C4GT',
  'Outreachy',
];

export const HUB_CAPABILITIES = [
  {
    title: 'Structured builder',
    body: 'Eight maintainer-aligned sections with live tips and progress tracking.',
  },
  {
    title: 'Winning examples',
    body: 'Browse annotated accepted proposals and clone structure into your draft.',
  },
  {
    title: 'Readiness scoring',
    body: 'Score technical depth, timeline realism, and missing criteria before export.',
  },
] as const;
