import {
  BookOpen,
  Download,
  Edit3,
  FolderArchive,
  type LucideIcon,
} from 'lucide-react';

export type StudioTab =
  | 'builder'
  | 'archive'
  | 'guide'
  | 'export'
  // Backwards-compatibility aliases
  | 'overview'
  | 'examples'
  | 'review';

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
    title: 'Executive Summary & Abstract',
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
    title: 'Problem Statement & Motivation',
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
    title: 'Proposed Solution & Technical Architecture',
    shortLabel: 'Architecture',
    placeholder:
      'Detail your technical approach, data flow, APIs, and components...',
    tips: 'Name real directories, classes, hooks, and schemas. Include testing and benchmark strategy.',
    acceptedSnippet:
      'We propose a decoupled spatial rendering layer using ECharts GL engine backed by an asynchronous Redis query cache. Backend (Flask + SQLAlchemy) will generate spatial buckets before transferring GeoJSON to React frontend.',
    minChars: 80,
  },
  {
    id: 'deliverables',
    title: 'Key Deliverables & Acceptance Criteria',
    shortLabel: 'Deliverables',
    placeholder: 'List explicit, verifiable outputs and testing metrics...',
    tips: 'Mentors prefer measurable targets (coverage %, FPS, latency SLOs).',
    acceptedSnippet:
      '1. Reusable GeoECharts component in superset-frontend.\n2. Redis spatial cache middleware.\n3. Unit & Cypress test suites with 90%+ coverage.\n4. Official contributor documentation.',
    minChars: 40,
  },
  {
    id: 'timeline',
    title: 'Timeline & Milestone Breakdown',
    shortLabel: 'Timeline',
    placeholder:
      'Break down work into bi-weekly milestones across the program duration...',
    tips: 'Include explicit buffers for reviews, docs, and testing. Align phases with community bonding if applicable.',
    acceptedSnippet:
      'Weeks 1-2: Community bonding & API schema design.\nWeeks 3-6: Implement GeoECharts visualization component.\nWeeks 7-10: Redis spatial caching middleware.\nWeeks 11-12: Integration tests, docs, and final merge.',
    minChars: 50,
  },
  {
    id: 'testing',
    title: 'Testing Strategy & Quality Assurance',
    shortLabel: 'Testing',
    placeholder: 'Testing frameworks, coverage goals, mock strategy, and CI pipeline...',
    tips: 'Mention PyTest, Jest, Vitest, Cypress or whatever matches the target repository.',
    acceptedSnippet:
      'Unit tests using Jest & React Testing Library (target 90%+ branch coverage). End-to-end integration tests in Cypress for multi-layer map rendering. Automated CI checks on GitHub Actions.',
    minChars: 40,
  },
  {
    id: 'risks',
    title: 'Risk Assessment & Contingency Plan',
    shortLabel: 'Risks',
    placeholder:
      'Potential technical bottlenecks, dependency risks, and mitigation strategies...',
    tips: 'Shows maturity and engineering foresight. Include time buffers for unexpected blockers.',
    acceptedSnippet:
      'Risk 1: Upstream WebGL tile renderer memory leak. Mitigation: Fallback to canvas rasterizer and load-on-demand bounding box caching with 1-week buffer allocated in Phase 2.',
    minChars: 30,
  },
  {
    id: 'aboutMe',
    title: 'Contributor Background & Past PRs',
    shortLabel: 'About Me',
    placeholder:
      'Your background, programming experience, merged PRs, and relevant work...',
    tips: 'Highlight stack fit, prior merged PRs, open-source communication, and timezone availability.',
    acceptedSnippet:
      'Final year CS student with 2 years of experience in React, TypeScript, and Python Flask. Merged PRs: #14209 (SQL Lab execution timer), #14311 (Filter component tests). Timezone: UTC+5:30 (40h/week dedicated).',
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
    id: 'builder',
    label: 'Builder',
    shortLabel: 'Builder',
    icon: Edit3,
    description: 'End-to-end proposal builder with 8 guided sections',
  },
  {
    id: 'archive',
    label: 'Archive',
    shortLabel: 'Archive',
    icon: FolderArchive,
    description: 'Real accepted proposals from past contributors',
  },
  {
    id: 'guide',
    label: 'Project Guide',
    shortLabel: 'Guide',
    icon: BookOpen,
    description: 'Maintainer expectations, rubrics, and timeline guides',
  },
  {
    id: 'export',
    label: 'Export',
    shortLabel: 'Export',
    icon: Download,
    description: 'Python ReportLab PDF, Markdown, and JSON export',
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
