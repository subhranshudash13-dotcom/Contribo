export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  tips: string;
  acceptedSnippet?: string;
  aiSuggestion?: string;
}

export interface ProposalDraft {
  id: string;
  /** Owner user id when persisted server-side */
  userId?: string;
  projectTitle: string;
  projectSlug: string;
  orgName: string;
  orgSlug: string;
  programName: string;
  programSlug: string;
  progress: number; // 0 - 100
  deadline: string;
  daysLeft: number;
  mentorName: string;
  mentorRole: string;
  techStack: string[];
  difficulty: string;
  acceptedExamplesCount: number;
  communityContributionsCount: number;
  sections: Record<string, string>;
  updatedAt: string;
  createdAt?: string;
}

export interface AcceptedProposal {
  id: string;
  projectTitle: string;
  orgName: string;
  year: number;
  programName: string;
  programTag?: 'GSOC' | 'LFX' | 'SOB' | 'C4GT' | 'Outreachy';
  similarityScore?: number; // e.g. 93%
  rating: number; // 1 - 5
  pdfUrl?: string;
  sourceUrl?: string;
  summary: string;
  rationale: {
    sectionName: string;
    rating: number;
    reason: string;
  }[];
  contentSnippet: string;
}

export interface OrgProposalGroup {
  id: string;
  orgName: string;
  orgSlug: string;
  programTag: 'GSOC' | 'LFX' | 'SOB' | 'C4GT' | 'Outreachy';
  proposalCount: number;
  ratingAverage: number;
  techStack: string[];
  proposals: AcceptedProposal[];
}

export interface ProjectGuide {
  projectTitle: string;
  orgName: string;
  repoStructure: { path: string; description: string }[];
  mentorExpectations: string[];
  suggestedReading: { title: string; url: string; type: string }[];
  architectureOverview: string;
  proposalExpectations: string[];
  commonMistakes: string[];
}

export const DRAFT_PROPOSALS: ProposalDraft[] = [
  {
    id: 'draft-superset-gsoc',
    projectTitle: 'Apache Superset',
    projectSlug: 'apache-superset',
    orgName: 'Apache Software Foundation',
    orgSlug: 'apache',
    programName: 'Google Summer of Code',
    programSlug: 'gsoc',
    progress: 62,
    deadline: '28 March 2026',
    daysLeft: 38,
    mentorName: 'John Doe',
    mentorRole: 'ASF PMC Member / Core Maintainer',
    techStack: ['Python', 'React', 'TypeScript', 'SQL', 'Redis'],
    difficulty: 'Intermediate',
    acceptedExamplesCount: 4,
    communityContributionsCount: 7,
    updatedAt: '2 hours ago',
    sections: {
      summary:
        'Integration of dynamic ECharts-based geospatial visualization modules and caching optimization in Apache Superset for large-scale analytical dashboards.',
      problemStatement:
        'Existing geospatial map visualizations in Apache Superset rely on legacy deck.gl layers that lack custom tile server fallback and real-time query aggregation. When rendering datasets >500,000 rows, frontend rendering frames drop below 15 FPS.',
      architecture:
        'We propose a decoupled spatial rendering layer using ECharts GL engine backed by an asynchronous Redis query cache. The backend (Flask + SQLAlchemy) will generate spatial buckets before transferring aggregated GeoJSON to the React frontend.',
      timeline:
        'Phase 1 (Weeks 1-2): Community bonding, dev environment setup, and API schema design.\nPhase 2 (Weeks 3-6): Implement ECharts geospatial visualization component in superset-frontend.\nPhase 3 (Weeks 7-10): Redis spatial caching middleware and query optimizer on backend.\nPhase 4 (Weeks 11-12): Integration tests, documentation, performance benchmark, and final submission.',
      deliverables:
        '1. Fully integrated GeoECharts visualization component.\n2. Backend Redis spatial caching middleware.\n3. Comprehensive test suite with 90%+ coverage on new modules.\n4. Contributor user guide in Superset official documentation.',
      stretchGoals:
        'Support for WebGL vector tile streaming and offline map canvas exporting (PNG/SVG).',
      communityContributions:
        'PR #14209 (Merged): Fixed SQL Lab query execution timer bug.\nPR #14311 (In Review): Added unit test coverage for dashboard filter component.\nIssue #14102: Identified and reported spatial layer rendering glitch on Safari.',
      aboutMe:
        'Final year CS student with 2 years of experience in React, TypeScript, and Python Flask. Previously contributed to Apache ECharts and active open-source enthusiast.',
    },
  },
  {
    id: 'draft-lfx-kernel',
    projectTitle: 'Linux Kernel eBPF Tracer',
    projectSlug: 'linux-kernel-ebpf',
    orgName: 'Linux Foundation',
    orgSlug: 'linux-foundation',
    programName: 'LFX Mentorship',
    programSlug: 'lfx',
    progress: 18,
    deadline: '15 April 2026',
    daysLeft: 56,
    mentorName: 'Sarah Connor',
    mentorRole: 'Kernel Subsystem Maintainer',
    techStack: ['C', 'Linux', 'eBPF', 'Rust'],
    difficulty: 'Advanced',
    acceptedExamplesCount: 3,
    communityContributionsCount: 4,
    updatedAt: 'Yesterday',
    sections: {
      summary: 'Automated ring-buffer trace telemetry for containerized Linux kernel subsystems via eBPF.',
      problemStatement: 'Monitoring kernel tracepoints under high IOPS causes overhead exceeding 8% CPU time.',
      architecture: 'Utilize eBPF maps with CO-RE (Compile Once - Run Everywhere) to buffer telemetry events directly in ring buffer memory.',
      timeline: 'Weeks 1-4: Kernel probe prototypes. Weeks 5-8: CO-RE implementation. Weeks 9-12: Benchmarking & docs.',
      deliverables: '1. eBPF C program library. 2. User-space CLI runner. 3. Performance analysis report.',
      stretchGoals: 'Rust bindings for user-space collector CLI.',
      communityContributions: 'Fixed kernel doc typos (Commit #89a1f); submitted 2 bug reports to kernel mailing list.',
      aboutMe: 'Systems engineering practitioner passionate about kernel internals, C programming, and low-level performance analysis.',
    },
  },
];

export const ACCEPTED_PROPOSALS_LIBRARY: AcceptedProposal[] = [
  {
    id: 'acc-superset-2025',
    projectTitle: 'Apache Superset',
    orgName: 'Apache Software Foundation',
    year: 2025,
    programName: 'Google Summer of Code',
    similarityScore: 100,
    rating: 5,
    summary:
      'Accepted GSoC 2025 proposal on Next-Gen Dashboard Filter Engine & Async Caching in Apache Superset.',
    rationale: [
      {
        sectionName: 'Timeline',
        rating: 5,
        reason: 'Realistic weekly milestones broken into 2-week sprints with explicit buffer periods.',
      },
      {
        sectionName: 'Introduction & Problem Statement',
        rating: 5,
        reason: 'Clearly articulated pain points backed by GitHub issue references and performance profiles.',
      },
      {
        sectionName: 'Deliverables & Testing',
        rating: 5,
        reason: 'Measurable acceptance criteria including unit tests, end-to-end Cypress tests, and docs.',
      },
    ],
    contentSnippet: `### Project Goals & Motivation
Apache Superset is a modern data exploration and visualization platform. As organizations scale their dashboards, complex cross-filtering across dozens of SQL charts introduces noticeable latency.

This proposal introduces an asynchronous query batcher and memoized filter state hook.

### Proposed Architecture
1. Frontend State Hook: \`useAsyncFilterState\`
2. Backend Middleware: Batch SQL query resolver in \`superset/views/core.py\`
3. Integration: Jest test suites for filter propagation.`,
    sourceUrl: 'https://github.com/apache/superset/wiki/GSoC-2025-Accepted-Proposals',
  },
  {
    id: 'acc-airflow-2024',
    projectTitle: 'Apache Airflow',
    orgName: 'Apache Software Foundation',
    year: 2024,
    programName: 'Google Summer of Code',
    similarityScore: 93,
    rating: 5,
    summary:
      'Accepted GSoC 2024 proposal on Dynamic Task Group Execution Visualizer & Monitoring Hooks.',
    rationale: [
      {
        sectionName: 'Timeline',
        rating: 5,
        reason: 'Structured phases matching Apache Airflow release cycles.',
      },
      {
        sectionName: 'Community Contributions',
        rating: 5,
        reason: 'Highlighted 5 merged pull requests demonstrating existing codebase familiarity.',
      },
      {
        sectionName: 'Deliverables',
        rating: 4,
        reason: 'Well defined scope with clear stretch goals.',
      },
    ],
    contentSnippet: `### Overview
Visualizing dynamic DAG expansion during runtime is essential for complex ETL pipelines in Airflow. This project delivers a real-time DAG node status renderer built on React Flow.`,
    sourceUrl: 'https://airflow.apache.org/community/',
  },
  {
    id: 'acc-beam-2024',
    projectTitle: 'Apache Beam',
    orgName: 'Apache Software Foundation',
    year: 2024,
    programName: 'Google Summer of Code',
    similarityScore: 89,
    rating: 4,
    summary:
      'Accepted GSoC 2024 proposal for Multi-Language Pipeline Metrics & Interactive Debugger.',
    rationale: [
      {
        sectionName: 'Architecture',
        rating: 5,
        reason: 'Comprehensive diagram showing gRPC boundary interactions between Python & Java SDKs.',
      },
      {
        sectionName: 'Timeline',
        rating: 4,
        reason: 'Well paced with clear community review checkpoints.',
      },
    ],
    contentSnippet: `### Technical Design
Apache Beam pipelines span multiple languages (Python, Java, Go). Debugging stateful transforms across language boundaries requires a unified telemetry protocol over gRPC.`,
    sourceUrl: 'https://beam.apache.org/contribute/',
  },
];

export const ORG_PROPOSALS_CATALOG: OrgProposalGroup[] = [
  {
    id: 'org-apache',
    orgName: 'Apache Software Foundation',
    orgSlug: 'apache',
    programTag: 'GSOC',
    proposalCount: 3,
    ratingAverage: 4.9,
    techStack: ['Python', 'React', 'Java', 'SQL'],
    proposals: [
      ACCEPTED_PROPOSALS_LIBRARY[0],
      ACCEPTED_PROPOSALS_LIBRARY[1],
      ACCEPTED_PROPOSALS_LIBRARY[2],
    ],
  },
  {
    id: 'org-52north',
    orgName: '52°North Spatial Information Research GmbH',
    orgSlug: '52north',
    programTag: 'GSOC',
    proposalCount: 1,
    ratingAverage: 4.8,
    techStack: ['Java', 'GIS', 'OGC Standards', 'PostGIS'],
    proposals: [
      {
        id: 'acc-52n-1',
        projectTitle: 'GeoServices REST API Sensor Observation Service',
        orgName: '52°North Spatial Information Research GmbH',
        year: 2025,
        programName: 'Google Summer of Code',
        programTag: 'GSOC',
        rating: 5,
        summary: 'Implementation of GeoServices REST Specification for Sensor Observation Service v5.0.',
        rationale: [
          { sectionName: 'OGC Standard Specs', rating: 5, reason: 'Strict adherence to OGC API specifications with clear OpenAPI schemas.' },
          { sectionName: 'Testing', rating: 5, reason: 'Included automated GeoServer integration tests.' },
        ],
        contentSnippet: '### Objective\nEnable Esri GeoServices REST endpoint specs on 52°North SOS server using Java Spring Boot and Hibernate spatial extensions.',
        sourceUrl: 'https://52north.org/',
      },
    ],
  },
  {
    id: 'org-aboutcode',
    orgName: 'AboutCode',
    orgSlug: 'aboutcode',
    programTag: 'GSOC',
    proposalCount: 1,
    ratingAverage: 4.7,
    techStack: ['Python', 'Django', 'License Analysis', 'SQLite'],
    proposals: [
      {
        id: 'acc-aboutcode-1',
        projectTitle: 'ScanCode Toolkit License Policy Engine',
        orgName: 'AboutCode',
        year: 2024,
        programName: 'Google Summer of Code',
        programTag: 'GSOC',
        rating: 5,
        summary: 'Automated SBOM license compliance and vulnerability indexing parser.',
        rationale: [
          { sectionName: 'Codebase Familiarity', rating: 5, reason: 'Merged 3 ScanCode starter PRs before proposal deadline.' },
        ],
        contentSnippet: '### Architecture\nScanCode Toolkit analyzes source code packages for copyright and open-source license declarations. This project adds automated SPDX policy evaluation.',
        sourceUrl: 'https://www.aboutcode.org/',
      },
    ],
  },
  {
    id: 'org-accord',
    orgName: 'Accord Project',
    orgSlug: 'accord-project',
    programTag: 'LFX',
    proposalCount: 1,
    ratingAverage: 4.9,
    techStack: ['TypeScript', 'Node.js', 'Smart Contracts', 'Cicero'],
    proposals: [
      {
        id: 'acc-accord-1',
        projectTitle: 'Smart Legal Contract Template Compiler',
        orgName: 'Accord Project',
        year: 2025,
        programName: 'LFX Mentorship',
        programTag: 'LFX',
        rating: 5,
        summary: 'Cicero template language compiler for WebAssembly target runtimes.',
        rationale: [
          { sectionName: 'WASM Compiler Specs', rating: 5, reason: 'Clear abstract syntax tree (AST) transformation diagrams.' },
        ],
        contentSnippet: '### Proposal Overview\nAccord Project standardizes open source smart legal contracts. This mentorship delivers a lightweight WASM runtime for offline contract execution.',
        sourceUrl: 'https://accordproject.org/',
      },
    ],
  },
  {
    id: 'org-alaska',
    orgName: 'Alaska Native Language Center',
    orgSlug: 'alaska',
    programTag: 'GSOC',
    proposalCount: 2,
    ratingAverage: 4.8,
    techStack: ['Python', 'NLP', 'Linguistics', 'React'],
    proposals: [
      {
        id: 'acc-alaska-1',
        projectTitle: 'Indigenous Language Morphological Parser & Dictionary',
        orgName: 'Alaska Native Language Center',
        year: 2025,
        programName: 'Google Summer of Code',
        programTag: 'GSOC',
        rating: 5,
        summary: 'Interactive Finite-State Transducer (FST) morphological analyzer for Central Alaskan Yup’ik.',
        rationale: [
          { sectionName: 'Linguistic Model', rating: 5, reason: 'Detailed breakdown of FST lexicon rules and orthography validation.' },
        ],
        contentSnippet: '### Abstract\nDigitizing endangered indigenous languages using Python FST lexicons and a responsive React web interface.',
        sourceUrl: 'https://www.uaf.edu/anlc/',
      },
      {
        id: 'acc-alaska-2',
        projectTitle: 'Audio Annotation & Corpus Collector',
        orgName: 'Alaska Native Language Center',
        year: 2024,
        programName: 'Google Summer of Code',
        programTag: 'GSOC',
        rating: 4,
        summary: 'Web-based audio snippet alignment tool for linguists.',
        rationale: [
          { sectionName: 'UI Mockups', rating: 5, reason: 'Included interactive audio waveform component mockups.' },
        ],
        contentSnippet: '### Overview\nProvides speech-to-text alignment using Web Audio API and PyTorch acoustic models.',
      },
    ],
  },
  {
    id: 'org-aossie',
    orgName: 'AOSSIE',
    orgSlug: 'aossie',
    programTag: 'GSOC',
    proposalCount: 4,
    ratingAverage: 4.9,
    techStack: ['Java', 'Scala', 'Blockchain', 'Vue.js', 'Python'],
    proposals: [
      {
        id: 'acc-aossie-1',
        projectTitle: 'Agora — Decentralized E-Voting System',
        orgName: 'AOSSIE',
        year: 2025,
        programName: 'Google Summer of Code',
        programTag: 'GSOC',
        rating: 5,
        summary: 'Implementation of Zero-Knowledge Proofs for Anonymous Vote Verification in Agora.',
        rationale: [
          { sectionName: 'Cryptographic Proofs', rating: 5, reason: 'Math notation and zk-SNARK circuit diagrams.' },
        ],
        contentSnippet: '### System Architecture\nAgora is an open-source voting platform. This proposal implements zk-SNARK circuits to guarantee voter anonymity.',
        sourceUrl: 'https://aossie.org/',
      },
      {
        id: 'acc-aossie-2',
        projectTitle: 'Social Street Smart — Online Harassment Detector',
        orgName: 'AOSSIE',
        year: 2024,
        programName: 'Google Summer of Code',
        programTag: 'GSOC',
        rating: 5,
        summary: 'Browser extension using BERT models for real-time hate speech detection.',
        rationale: [
          { sectionName: 'ML Inference', rating: 5, reason: 'Quantized ONNX model benchmarks running client-side.' },
        ],
        contentSnippet: '### Abstract\nSocial Street Smart protects users by evaluating sentiment and toxicity via ONNX runtime inside Chrome Extension sandbox.',
      },
    ],
  },
  {
    id: 'org-c4gt',
    orgName: 'Code for Gov Tech (C4GT)',
    orgSlug: 'c4gt',
    programTag: 'C4GT',
    proposalCount: 2,
    ratingAverage: 4.9,
    techStack: ['Java', 'Node.js', 'PostgreSQL', 'Flutter'],
    proposals: [
      {
        id: 'acc-c4gt-1',
        projectTitle: 'Sunbird Telemetry & Credential Verifier',
        orgName: 'Code for Gov Tech (C4GT)',
        year: 2025,
        programName: 'Code for Gov Tech',
        programTag: 'C4GT',
        rating: 5,
        summary: 'Decentralized Identity (DID) & W3C Verifiable Credentials Engine for Digital Public Infrastructure.',
        rationale: [
          { sectionName: 'DPI Standards', rating: 5, reason: 'Clear sequence diagrams for W3C VC issuance & verification.' },
        ],
        contentSnippet: '### Project Scope\nSunbird powers national-scale digital infrastructure. This project adds QR-code offline verification for identity cards.',
        sourceUrl: 'https://www.codeforgovtech.in/',
      },
    ],
  },
  {
    id: 'org-sob',
    orgName: 'Linux Foundation Season of Docs',
    orgSlug: 'sod-lf',
    programTag: 'SOB',
    proposalCount: 1,
    ratingAverage: 4.8,
    techStack: ['Markdown', 'MkDocs', 'OpenAPI', 'Technical Writing'],
    proposals: [
      {
        id: 'acc-sob-1',
        projectTitle: 'Kubeflow Developer Documentation Overhaul',
        orgName: 'Linux Foundation Season of Docs',
        year: 2025,
        programName: 'Season of Docs',
        programTag: 'SOB',
        rating: 5,
        summary: 'Comprehensive API tutorial restructuring and interactive code notebooks for Kubeflow SDK.',
        rationale: [
          { sectionName: 'Information Architecture', rating: 5, reason: 'Detailed doc tree mapping and user persona journeys.' },
        ],
        contentSnippet: '### Summary\nRestructure legacy Kubeflow documentation into Diátaxis framework (Tutorials, How-To Guides, Reference, Explanation).',
        sourceUrl: 'https://developers.google.com/season-of-docs',
      },
    ],
  },
];

export const DYNAMIC_PROJECT_GUIDE: ProjectGuide = {
  projectTitle: 'Apache Superset',
  orgName: 'Apache Software Foundation',
  repoStructure: [
    {
      path: 'superset-frontend/src/',
      description: 'React, TypeScript, Redux, and Emotion CSS frontend components & visualization plugins.',
    },
    {
      path: 'superset/',
      description: 'Python backend application powered by Flask, SQLAlchemy ORM, and Celery worker tasks.',
    },
    {
      path: 'superset/models/',
      description: 'SQLAlchemy database model schemas (Dashboards, Slices, Databases, Datasets).',
    },
    {
      path: 'docs/',
      description: 'Official MkDocs documentation and SIP (Superset Improvement Proposals) specs.',
    },
  ],
  mentorExpectations: [
    'Submissions must follow strict TypeScript typing (no \`any\` types permitted without explicit reason).',
    'Every backend addition requires corresponding PyTest test cases in \`tests/unit_tests/\`.',
    'Demonstrate prior engagement in community discussions or merged PRs in \`apache/superset\`.',
    'Keep pull requests small and reviewable (under 400 lines per PR when possible).',
  ],
  suggestedReading: [
    {
      title: 'Superset Improvement Proposal (SIP-42): Modular Viz Plugins',
      url: 'https://github.com/apache/superset/issues',
      type: 'SIP Specification',
    },
    {
      title: 'Apache Superset Frontend Developer Guide',
      url: 'https://superset.apache.org/docs/contributing/development',
      type: 'Official Docs',
    },
    {
      title: 'ECharts 5.0 Custom Series API Reference',
      url: 'https://echarts.apache.org',
      type: 'Library Docs',
    },
  ],
  architectureOverview:
    'Apache Superset uses a Flask-AppBuilder backend communicating via REST/JSON APIs with a React SPA frontend. Heavy SQL queries are offloaded asynchronously to Celery workers backed by Redis cache.',
  proposalExpectations: [
    'Detailed problem statement with metrics or steps to reproduce existing limitations.',
    'Concrete architectural diagram or API payload schema.',
    'Week-by-week timeline with built-in buffers for mentor review and documentation.',
    'Proof of existing contributions (merged PRs, reviewed issues, community chat participation).',
  ],
  commonMistakes: [
    'Submitting a generic proposal that does not reference Superset codebase files or classes.',
    'Over-promising un realistic features without allowing time for testing and review.',
    'Failing to mention unit test strategies (Jest for frontend, PyTest for backend).',
    'Ignoring licensing/ASF header requirements on new source files.',
  ],
};

export function calculateProposalScore(sections: Record<string, string>): {
  totalScore: number;
  breakdown: {
    technicalDepth: number;
    timeline: number;
    grammar: number;
    projectUnderstanding: number;
    risks: number;
  };
  missingItems: string[];
} {
  const summaryLength = (sections.summary || '').length;
  const problemLength = (sections.problemStatement || '').length;
  const archLength = (sections.architecture || '').length;
  const timelineLength = (sections.timeline || '').length;
  const deliverablesLength = (sections.deliverables || '').length;
  const contribLength = (sections.communityContributions || '').length;

  const technicalDepth = Math.min(95, Math.max(50, Math.floor(archLength / 8) + 40));
  const timeline = Math.min(95, Math.max(45, Math.floor(timelineLength / 7) + 35));
  const grammar = Math.min(98, Math.max(70, Math.floor(summaryLength / 10) + 65));
  const projectUnderstanding = Math.min(96, Math.max(50, Math.floor((problemLength + contribLength) / 10) + 40));
  const risks = Math.min(90, Math.max(40, Math.floor(deliverablesLength / 9) + 30));

  const totalScore = Math.round(
    (technicalDepth * 0.25 + timeline * 0.25 + grammar * 0.15 + projectUnderstanding * 0.2 + risks * 0.15)
  );

  const missingItems: string[] = [];
  if (archLength < 100 || !sections.architecture?.toLowerCase().includes('test')) {
    missingItems.push('Testing Plan & Test Suite Specs');
  }
  if (!sections.architecture?.toLowerCase().includes('benchmark') && !sections.timeline?.toLowerCase().includes('benchmark')) {
    missingItems.push('Performance Benchmarks & Metrics');
  }
  if (!sections.stretchGoals || sections.stretchGoals.length < 20) {
    missingItems.push('Stretch Goals & Future Work Scope');
  }

  return {
    totalScore,
    breakdown: {
      technicalDepth,
      timeline,
      grammar,
      projectUnderstanding,
      risks,
    },
    missingItems,
  };
}
