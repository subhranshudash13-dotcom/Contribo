import type { IssueRecord, IssueListFilter, IssueQueryResult, UserSkillProfile } from './types';
import { rankIssuesWithProfile } from './matcher';

export const CURATED_ISSUES: IssueRecord[] = [
  {
    id: 'issue-cncf-1',
    title: 'Add structured JSON log output formatter for CLI worker events',
    description: 'Currently the CLI only outputs plain human text. We need a --json flag that serializes task status and errors into RFC 8259 compliant JSON for automated monitoring scripts.',
    repo: 'kubernetes/minikube',
    orgSlug: 'cncf',
    orgName: 'Cloud Native Computing Foundation',
    program: 'GSoC 2026',
    issueUrl: 'https://github.com/kubernetes/minikube/issues/18420',
    number: 18420,
    labels: ['good first issue', 'help wanted', 'go', 'cli', 'logging'],
    languages: ['go', 'bash'],
    difficulty: 'easy',
    scope: 'quick-fix',
    estimatedHours: 3,
    commentsCount: 2,
    createdAt: '2026-10-18T14:20:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Look at pkg/minikube/out/out.go. Add JSON formatter with unit tests in out_test.go.',
  },
  {
    id: 'issue-react-2',
    title: 'Improve accessible error announcement on combobox dropdown filter',
    description: 'Screen reader users do not receive live region announcements when filtering options in Combobox returns 0 results. Add aria-live="polite" announcement with descriptive empty state text.',
    repo: 'facebook/react',
    orgSlug: 'react',
    orgName: 'React Open Source Project',
    program: 'NSoC 2026',
    issueUrl: 'https://github.com/facebook/react/issues/29841',
    number: 29841,
    labels: ['good first issue', 'accessibility', 'typescript', 'react', 'a11y'],
    languages: ['typescript', 'javascript'],
    difficulty: 'easy',
    scope: 'quick-fix',
    estimatedHours: 2,
    commentsCount: 1,
    createdAt: '2026-10-24T09:12:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Verify with NVDA and VoiceOver. Update packages/react-aria/combobox.tsx.',
  },
  {
    id: 'issue-apache-3',
    title: 'Implement retry backoff with jitter for transient S3 connection errors',
    description: 'During heavy ingestion pipelines, S3 PUT requests occasionally fail with 503 Slow Down. Add exponential backoff with full jitter to avoid thundering herd problem on checkpoint uploads.',
    repo: 'apache/spark',
    orgSlug: 'apache',
    orgName: 'Apache Software Foundation',
    program: 'LFX Mentorship',
    issueUrl: 'https://github.com/apache/spark/issues/45129',
    number: 45129,
    labels: ['help wanted', 'scala', 'python', 'cloud', 'resilience'],
    languages: ['python', 'scala', 'java'],
    difficulty: 'medium',
    scope: 'feature-slice',
    estimatedHours: 6,
    commentsCount: 4,
    createdAt: '2026-11-02T11:45:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Check RetryUtils in core module. Ensure unit tests mock flaky S3 responses.',
  },
  {
    id: 'issue-mozilla-4',
    title: 'Migrate legacy CSS color values to modern OKLCH semantic palette',
    description: 'Modernize browser devtools component styling to utilize CSS color-mix() and OKLCH color spaces for higher color fidelity across high-gamut displays.',
    repo: 'mozilla/gecko-dev',
    orgSlug: 'mozilla',
    orgName: 'Mozilla Foundation',
    program: 'Outreachy',
    issueUrl: 'https://github.com/mozilla/gecko-dev/issues/92841',
    number: 92841,
    labels: ['good first issue', 'css', 'devtools', 'frontend'],
    languages: ['css', 'javascript'],
    difficulty: 'easy',
    scope: 'quick-fix',
    estimatedHours: 4,
    commentsCount: 3,
    createdAt: '2026-11-05T16:00:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Detailed migration guide available at docs.firefox-dev.org/styles. Ping mentor @mconley for review.',
  },
  {
    id: 'issue-tor-5',
    title: 'Add connection health probe and circuit latency percentile metrics',
    description: 'Extend onion service diagnostic tool with p50, p90, and p99 circuit establishment latency telemetry to detect bridge degradation early.',
    repo: 'torproject/arti',
    orgSlug: 'tor-project',
    orgName: 'The Tor Project',
    program: 'GSoC 2026',
    issueUrl: 'https://github.com/torproject/arti/issues/1304',
    number: 1304,
    labels: ['help wanted', 'rust', 'networking', 'security', 'privacy'],
    languages: ['rust'],
    difficulty: 'medium',
    scope: 'feature-slice',
    estimatedHours: 8,
    commentsCount: 5,
    createdAt: '2026-11-06T18:30:00Z',
    hasMentorAssigned: false,
    mentorGuideText: 'Arti crate tor-circmgr contains metrics collector. Join #tor-dev on OFTC IRC for assistance.',
  },
  {
    id: 'issue-zulip-6',
    title: 'Add search filter syntax highlighting in message search bar',
    description: 'When users type search operators like sender:alice or stream:devel, provide immediate visual token highlighting and autocomplete dropdown hints in the web app UI.',
    repo: 'zulip/zulip',
    orgSlug: 'zulip',
    orgName: 'Zulip',
    program: 'GSoC 2026',
    issueUrl: 'https://github.com/zulip/zulip/issues/28190',
    number: 28190,
    labels: ['good first issue', 'typescript', 'frontend', 'search'],
    languages: ['typescript', 'python', 'html'],
    difficulty: 'easy',
    scope: 'feature-slice',
    estimatedHours: 5,
    commentsCount: 6,
    createdAt: '2026-11-08T10:15:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Check web/src/search_suggestion.ts. Interactive dev server runs via ./tools/run-dev.',
  },
  {
    id: 'issue-homeassistant-7',
    title: 'Add battery level threshold alerts for Zigbee sensor integration',
    description: 'Enable users to configure proactive notifications when IoT Zigbee wireless door sensors fall below customizable percentage thresholds (e.g. 15%).',
    repo: 'home-assistant/core',
    orgSlug: 'home-assistant',
    orgName: 'Home Assistant',
    program: 'Hacktoberfest',
    issueUrl: 'https://github.com/home-assistant/core/issues/112940',
    number: 112940,
    labels: ['good first issue', 'python', 'iot', 'home-automation'],
    languages: ['python'],
    difficulty: 'easy',
    scope: 'quick-fix',
    estimatedHours: 3,
    commentsCount: 2,
    createdAt: '2026-11-09T13:40:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Review homeassistant/components/zha/sensor.py. Add pytest test cases in tests/components/zha/.',
  },
  {
    id: 'issue-videolan-8',
    title: 'Implement AVIF image cover art extraction in media library scanner',
    description: 'Modern audio files frequently embed AVIF or WebP cover art tags. Enhance the metadata extraction pipeline to recognize AVIF MIME types without fallback errors.',
    repo: 'videolan/vlc',
    orgSlug: 'videolan',
    orgName: 'VideoLAN',
    program: 'GSoC 2026',
    issueUrl: 'https://github.com/videolan/vlc/issues/26450',
    number: 26450,
    labels: ['help wanted', 'c', 'c++', 'multimedia', 'vlc'],
    languages: ['c', 'c++'],
    difficulty: 'hard',
    scope: 'deep-dive',
    estimatedHours: 14,
    commentsCount: 7,
    createdAt: '2026-11-10T12:00:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'See src/input/meta.c and modules/meta/art/. C99 standard compliant patches required.',
  },
  {
    id: 'issue-openelis-9',
    title: 'Fix sample barcode print alignment on thermal 2x1 label format',
    description: 'Laboratory technicians reported that Code128 barcodes truncate by 2mm when printing on Zebra 2x1 thermal roll printers. Adjust PDF canvas coordinates and SVG layout margins.',
    repo: 'openelisglobal/openelis-global-2',
    orgSlug: 'openelis-global',
    orgName: 'OpenELIS Global',
    program: 'Outreachy',
    issueUrl: 'https://github.com/openelisglobal/openelis-global-2/issues/1294',
    number: 1294,
    labels: ['good first issue', 'java', 'healthcare', 'printing'],
    languages: ['java', 'javascript'],
    difficulty: 'easy',
    scope: 'quick-fix',
    estimatedHours: 2,
    commentsCount: 1,
    createdAt: '2026-11-11T08:20:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Inspect LabelPrintService.java. Testing guide is documented on OpenELIS wiki.',
  },
  {
    id: 'issue-oppia-10',
    title: 'Refactor learner audio bar to use Web Audio API volume normalization',
    description: 'Voiceover audio recordings in elementary math lessons vary significantly in recorded amplitude. Integrate a lightweight DynamicsCompressorNode to normalize playback levels across lessons.',
    repo: 'oppia/oppia',
    orgSlug: 'oppia',
    orgName: 'Oppia Foundation',
    program: 'GSoC 2026',
    issueUrl: 'https://github.com/oppia/oppia/issues/19482',
    number: 19482,
    labels: ['help wanted', 'angular', 'typescript', 'audio', 'education'],
    languages: ['typescript', 'html', 'css'],
    difficulty: 'medium',
    scope: 'feature-slice',
    estimatedHours: 7,
    commentsCount: 3,
    createdAt: '2026-11-12T15:10:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Refer to core/templates/services/audio-player.service.ts. Oppia contributor onboarding team will mentor.',
  },
  {
    id: 'issue-rust-11',
    title: 'Enhance error diagnostic message when target directory is write-protected',
    description: 'When running cargo build on a read-only filesystem or locked folder, Cargo throws an unhelpful OS error 13 (Permission denied). Provide a friendly suggestion to check file permissions or CARGO_TARGET_DIR.',
    repo: 'rust-lang/cargo',
    orgSlug: 'rust-lang',
    orgName: 'Rust Programming Language',
    program: 'NSoC 2026',
    issueUrl: 'https://github.com/rust-lang/cargo/issues/13840',
    number: 13840,
    labels: ['good first issue', 'rust', 'cli', 'diagnostics'],
    languages: ['rust'],
    difficulty: 'easy',
    scope: 'quick-fix',
    estimatedHours: 3,
    commentsCount: 2,
    createdAt: '2026-11-13T11:00:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Look in src/cargo/core/workspace.rs. Add UI test under tests/testsuite/.',
  },
  {
    id: 'issue-cpython-12',
    title: 'Optimize memory footprint of dataclasses with __slots__ flag',
    description: 'Benchmark and profile memory consumption improvements in Python 3.14 dataclasses when slots=True is combined with weakref support.',
    repo: 'python/cpython',
    orgSlug: 'python',
    orgName: 'Python Software Foundation',
    program: 'LFX Mentorship',
    issueUrl: 'https://github.com/python/cpython/issues/118320',
    number: 118320,
    labels: ['help wanted', 'python', 'c', 'core-dev', 'performance'],
    languages: ['python', 'c'],
    difficulty: 'hard',
    scope: 'deep-dive',
    estimatedHours: 18,
    commentsCount: 9,
    createdAt: '2026-11-14T09:40:00Z',
    hasMentorAssigned: true,
    mentorGuideText: 'Discuss on discuss.python.org #core-dev. Benchmark script in Tools/scripts/dataclass_bench.py.',
  },
];

/**
 * Filter, search, rank, and paginate open issues.
 */
export function listIssues(
  filter: IssueListFilter = {},
  profile?: UserSkillProfile | null
): IssueQueryResult {
  const {
    search,
    language,
    program,
    difficulty,
    scope,
    hasMentor,
    sortBy = 'recommended',
    page = 1,
    limit = 10,
  } = filter;

  // 1. Augment issues with real-time match scoring
  let results = rankIssuesWithProfile(CURATED_ISSUES, profile);

  // 2. Facet computation (calculated across full unfiltered dataset for intuitive UI counts)
  const facets = {
    languages: {} as Record<string, number>,
    programs: {} as Record<string, number>,
    difficulties: {} as Record<string, number>,
  };

  for (const item of results) {
    for (const lang of item.languages) {
      facets.languages[lang] = (facets.languages[lang] || 0) + 1;
    }
    facets.programs[item.program] = (facets.programs[item.program] || 0) + 1;
    facets.difficulties[item.difficulty] = (facets.difficulties[item.difficulty] || 0) + 1;
  }

  // 3. Apply Filters
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter((i) => {
      return (
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.repo.toLowerCase().includes(q) ||
        i.orgName.toLowerCase().includes(q) ||
        i.labels.some((l) => l.toLowerCase().includes(q))
      );
    });
  }

  if (language && language.trim() && language !== 'all') {
    const langLower = language.toLowerCase().trim();
    results = results.filter((i) =>
      i.languages.some((l) => l.toLowerCase() === langLower)
    );
  }

  if (program && program.trim() && program !== 'all') {
    const progLower = program.toLowerCase().trim();
    results = results.filter((i) => i.program.toLowerCase() === progLower);
  }

  if (difficulty && difficulty.trim() && difficulty !== 'all') {
    results = results.filter((i) => i.difficulty === difficulty);
  }

  if (scope && scope.trim() && scope !== 'all') {
    results = results.filter((i) => i.scope === scope);
  }

  if (typeof hasMentor === 'boolean') {
    results = results.filter((i) => i.hasMentorAssigned === hasMentor);
  }

  // 4. Sort Results
  if (sortBy === 'recommended') {
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else if (sortBy === 'newest') {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'comments-asc') {
    results.sort((a, b) => a.commentsCount - b.commentsCount);
  } else if (sortBy === 'effort-asc') {
    results.sort((a, b) => a.estimatedHours - b.estimatedHours);
  }

  // 5. Pagination
  const total = results.length;
  const currentPage = Math.max(1, page);
  const itemsPerPage = Math.max(1, Math.min(50, limit));
  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = results.slice(startIndex, startIndex + itemsPerPage);

  return {
    issues: paginatedIssues,
    total,
    page: currentPage,
    limit: itemsPerPage,
    totalPages,
    facets,
  };
}

/**
 * Retrieve a single issue by ID.
 */
export function getIssueById(id: string): IssueRecord | null {
  return CURATED_ISSUES.find((i) => i.id === id) || null;
}
