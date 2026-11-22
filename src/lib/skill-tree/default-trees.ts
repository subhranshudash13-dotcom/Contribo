/**
 * default-trees.ts
 *
 * Curated 4-tier skill tree pathways for open source programs (GSoC, LFX, Outreachy)
 * and dynamic fallback generator.
 */

import { SkillTreeGraph, SkillNode, SkillEdge } from './types';

export const GSOC_SKILL_TREE: SkillTreeGraph = {
  programSlug: 'gsoc',
  programName: 'Google Summer of Code',
  description:
    'Master open-source contribution fundamentals, repository triage, and competitive proposal drafting for GSoC 2026.',
  badgeName: 'GSoC Fellow Candidate',
  totalXp: 1000,
  nodes: [
    // Tier 1: Foundation
    {
      id: 'gsoc:git-conventions',
      title: 'Conventional Commits & Clean History',
      description: 'Master atomic commits, conventional semantic prefixes (feat, fix, docs), and branch hygiene.',
      tier: 'FOUNDATION',
      xp: 100,
      estimatedHours: 4,
      prerequisites: [],
      resources: [
        { title: 'Conventional Commits 1.0.0', url: 'https://www.conventionalcommits.org', type: 'docs' },
        { title: 'Interactive Git Sandbox', url: '/lab/git-sandbox', type: 'exercise' },
      ],
      verification: {
        type: 'self_attest',
        description: 'Complete 3 clean conventional commits in a practice repository.',
      },
      position: { x: 100, y: 150 },
    },
    {
      id: 'gsoc:community-etiquette',
      title: 'Open Source Community Etiquette',
      description: 'Learn code of conduct compliance, issue discussion etiquette, and mentor communication channels.',
      tier: 'FOUNDATION',
      xp: 100,
      estimatedHours: 3,
      prerequisites: [],
      resources: [
        { title: 'How to Contribute to Open Source', url: 'https://opensource.guide/how-to-contribute/', type: 'docs' },
      ],
      verification: {
        type: 'self_attest',
        description: 'Review the Contribo guidelines and organization Code of Conduct.',
      },
      position: { x: 100, y: 350 },
    },

    // Tier 2: Toolchain
    {
      id: 'gsoc:local-environment',
      title: 'Reproducible Dev Container & Test Harness',
      description: 'Set up local containers, language runtimes, package managers, and automated linters without host friction.',
      tier: 'TOOLCHAIN',
      xp: 150,
      estimatedHours: 6,
      prerequisites: ['gsoc:git-conventions'],
      resources: [
        { title: 'Docker Development Environments', url: 'https://docs.docker.com/desktop/dev-environments/', type: 'docs' },
      ],
      verification: {
        type: 'self_attest',
        description: 'Run repository test suite locally and verify 100% green pass.',
      },
      position: { x: 350, y: 150 },
    },
    {
      id: 'gsoc:issue-triage',
      title: 'Issue Reproduction & Debug Tracing',
      description: 'Reproduce open issues locally, isolate bugs with unit tests, and post verified reproduction steps.',
      tier: 'TOOLCHAIN',
      xp: 150,
      estimatedHours: 6,
      prerequisites: ['gsoc:community-etiquette'],
      resources: [
        { title: 'Good First Issue Radar', url: '/issues', type: 'exercise' },
      ],
      verification: {
        type: 'self_attest',
        description: 'Isolate an issue with an automated test case.',
      },
      position: { x: 350, y: 350 },
    },

    // Tier 3: Domain
    {
      id: 'gsoc:first-pull-request',
      title: 'Verified First Pull Request',
      description: 'Submit an atomic, verified pull request resolving a good first issue with comprehensive unit test coverage.',
      tier: 'DOMAIN',
      xp: 250,
      estimatedHours: 12,
      prerequisites: ['gsoc:local-environment', 'gsoc:issue-triage'],
      resources: [
        { title: 'Contributor Passport Readiness', url: '/passport', type: 'docs' },
      ],
      verification: {
        type: 'pr_link',
        description: 'Link a merged or open community pull request URL.',
      },
      position: { x: 600, y: 250 },
    },

    // Tier 4: Capstone
    {
      id: 'gsoc:proposal-architecture',
      title: 'Proposal Architecture & Timeline Blueprint',
      description: 'Draft a complete GSoC proposal including deliverables, 12-week milestones, risk mitigation, and mentor reviews.',
      tier: 'CAPSTONE',
      xp: 250,
      estimatedHours: 18,
      prerequisites: ['gsoc:first-pull-request'],
      resources: [
        { title: 'Proposal Studio & Markdown Diff', url: '/proposal-studio/diff', type: 'exercise' },
        { title: 'Official GSoC Proposal Guide', url: 'https://google.github.io/gsocguides/student/writing-a-proposal', type: 'docs' },
      ],
      verification: {
        type: 'self_attest',
        description: 'Complete all mandatory sections in Proposal Studio and export PDF.',
      },
      position: { x: 850, y: 250 },
    },
  ],
  edges: [
    { from: 'gsoc:git-conventions', to: 'gsoc:local-environment' },
    { from: 'gsoc:community-etiquette', to: 'gsoc:issue-triage' },
    { from: 'gsoc:local-environment', to: 'gsoc:first-pull-request' },
    { from: 'gsoc:issue-triage', to: 'gsoc:first-pull-request' },
    { from: 'gsoc:first-pull-request', to: 'gsoc:proposal-architecture' },
  ],
};

export const LFX_SKILL_TREE: SkillTreeGraph = {
  programSlug: 'lfx',
  programName: 'LFX Mentorship',
  description:
    'Deep-dive into Linux Foundation, CNCF, and Hyperledger toolchains, unit testing rigor, and system architecture.',
  badgeName: 'Cloud Native Systems Architect',
  totalXp: 1000,
  nodes: [
    {
      id: 'lfx:systems-git',
      title: 'Upstream Synchronization & Rebasing',
      description: 'Master git cherry-pick, upstream rebasing, signed commits (-s / DCO), and merge conflict resolution.',
      tier: 'FOUNDATION',
      xp: 100,
      estimatedHours: 4,
      prerequisites: [],
      resources: [{ title: 'Developer Certificate of Origin (DCO)', url: 'https://developercertificate.org', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Configure commit signing and author signed commits.' },
      position: { x: 100, y: 150 },
    },
    {
      id: 'lfx:architecture-reading',
      title: 'Codebase Architecture & RFC Analysis',
      description: 'Navigate large multi-repo ecosystems, understand architectural decision records, and trace call graphs.',
      tier: 'FOUNDATION',
      xp: 100,
      estimatedHours: 5,
      prerequisites: [],
      resources: [{ title: 'CNCF Architecture Guidelines', url: 'https://github.com/cncf/toc', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Trace core API request lifecycle from gateway to persistence.' },
      position: { x: 100, y: 350 },
    },
    {
      id: 'lfx:test-automation',
      title: 'E2E Testing & Mock Injection',
      description: 'Author unit and integration tests with deterministic mocks and hermetic test fixtures.',
      tier: 'TOOLCHAIN',
      xp: 150,
      estimatedHours: 8,
      prerequisites: ['lfx:systems-git'],
      resources: [{ title: 'Automated CI/CD Patterns', url: 'https://github.com/features/actions', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Add automated tests achieving >85% branch coverage.' },
      position: { x: 350, y: 150 },
    },
    {
      id: 'lfx:distributed-systems',
      title: 'Distributed System Concurrency & Leases',
      description: 'Understand idempotent mutations, atomic leases, distributed rate limiting, and circuit breakers.',
      tier: 'TOOLCHAIN',
      xp: 150,
      estimatedHours: 8,
      prerequisites: ['lfx:architecture-reading'],
      resources: [{ title: 'Distributed Systems Principles', url: 'https://martinfowler.com/articles/patterns-of-distributed-systems/', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Implement mutex/lease pattern with timeout recovery.' },
      position: { x: 350, y: 350 },
    },
    {
      id: 'lfx:subsystem-pr',
      title: 'Subsystem Core Contribution',
      description: 'Author a verified PR touching core module logic with zero regression and benchmark validation.',
      tier: 'DOMAIN',
      xp: 250,
      estimatedHours: 15,
      prerequisites: ['lfx:test-automation', 'lfx:distributed-systems'],
      resources: [{ title: 'LFX Mentorship Portal', url: 'https://mentorship.lfx.linuxfoundation.org', type: 'docs' }],
      verification: { type: 'pr_link', description: 'Link your community contribution PR.' },
      position: { x: 600, y: 250 },
    },
    {
      id: 'lfx:capstone-mentorship',
      title: 'Mentorship Application & Project Plan',
      description: 'Formulate an actionable 12-week workplan with concrete deliverable checkpoints and mentor alignment.',
      tier: 'CAPSTONE',
      xp: 250,
      estimatedHours: 20,
      prerequisites: ['lfx:subsystem-pr'],
      resources: [{ title: 'Proposal Studio', url: '/proposals', type: 'exercise' }],
      verification: { type: 'self_attest', description: 'Submit verified application via LFX portal.' },
      position: { x: 850, y: 250 },
    },
  ],
  edges: [
    { from: 'lfx:systems-git', to: 'lfx:test-automation' },
    { from: 'lfx:architecture-reading', to: 'lfx:distributed-systems' },
    { from: 'lfx:test-automation', to: 'lfx:subsystem-pr' },
    { from: 'lfx:distributed-systems', to: 'lfx:subsystem-pr' },
    { from: 'lfx:subsystem-pr', to: 'lfx:capstone-mentorship' },
  ],
};

export const OUTREACHY_SKILL_TREE: SkillTreeGraph = {
  programSlug: 'outreachy',
  programName: 'Outreachy',
  description:
    'Guidance for the Outreachy initial application, 4-week collaborative contribution phase, and mentor bonding.',
  badgeName: 'Outreachy Impact Contributor',
  totalXp: 1000,
  nodes: [
    {
      id: 'outreachy:essay-refinement',
      title: 'Initial Eligibility & Essay Framing',
      description: 'Draft compelling narrative essays addressing system barriers, learning goals, and community background.',
      tier: 'FOUNDATION',
      xp: 150,
      estimatedHours: 6,
      prerequisites: [],
      resources: [{ title: 'Outreachy Applicant Guide', url: 'https://www.outreachy.org/docs/applicant/', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Pass the Outreachy initial essay round.' },
      position: { x: 100, y: 250 },
    },
    {
      id: 'outreachy:toolchain-setup',
      title: 'Local Environment Setup & Docs Verification',
      description: 'Clone organization codebase, follow onboarding setup, and submit docs corrections for setup friction.',
      tier: 'TOOLCHAIN',
      xp: 150,
      estimatedHours: 6,
      prerequisites: ['outreachy:essay-refinement'],
      resources: [{ title: 'Open Source Guides', url: 'https://opensource.guide', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Run all tests and verify clean local build.' },
      position: { x: 350, y: 250 },
    },
    {
      id: 'outreachy:contribution-period-prs',
      title: 'Contribution Period PRs (Min. 3 Verified PRs)',
      description: 'Actively engage in community chats, resolve 3 contributor tasks, and record PRs on the Outreachy portal.',
      tier: 'DOMAIN',
      xp: 350,
      estimatedHours: 25,
      prerequisites: ['outreachy:toolchain-setup'],
      resources: [{ title: 'Issue Task Radar', url: '/issues', type: 'exercise' }],
      verification: { type: 'pr_link', description: 'Link your Outreachy recorded contribution PRs.' },
      position: { x: 600, y: 250 },
    },
    {
      id: 'outreachy:final-application',
      title: 'Final Project Application & Timeline',
      description: 'Coordinate with community mentors to finalize project goals, timeline, and contingency plans.',
      tier: 'CAPSTONE',
      xp: 350,
      estimatedHours: 15,
      prerequisites: ['outreachy:contribution-period-prs'],
      resources: [{ title: 'Proposal Studio', url: '/proposals', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Submit final project application.' },
      position: { x: 850, y: 250 },
    },
  ],
  edges: [
    { from: 'outreachy:essay-refinement', to: 'outreachy:toolchain-setup' },
    { from: 'outreachy:toolchain-setup', to: 'outreachy:contribution-period-prs' },
    { from: 'outreachy:contribution-period-prs', to: 'outreachy:final-application' },
  ],
};

const CURATED_TREES: Record<string, SkillTreeGraph> = {
  gsoc: GSOC_SKILL_TREE,
  lfx: LFX_SKILL_TREE,
  outreachy: OUTREACHY_SKILL_TREE,
};

/**
 * Retrieves a curated skill tree or dynamically synthesizes a clean 4-tier DAG.
 */
export function getOrGenerateSkillTree(
  slug: string,
  programName = 'Open Source Program'
): SkillTreeGraph {
  const normalized = (slug || 'gsoc').toLowerCase().trim();
  if (CURATED_TREES[normalized]) {
    return CURATED_TREES[normalized];
  }

  // Synthesize consistent 4-tier DAG
  const nodes: SkillNode[] = [
    {
      id: `${normalized}:foundation-git`,
      title: 'Version Control & Conventional Commits',
      description: `Understand Git conventions and PR etiquette for ${programName}.`,
      tier: 'FOUNDATION',
      xp: 150,
      estimatedHours: 4,
      prerequisites: [],
      resources: [{ title: 'Git Sandbox', url: '/lab/git-sandbox', type: 'exercise' }],
      verification: { type: 'self_attest', description: 'Practice atomic commits.' },
      position: { x: 100, y: 250 },
    },
    {
      id: `${normalized}:toolchain-env`,
      title: 'Local Environment Setup & Tests',
      description: `Bootstrap environment and run unit tests for ${programName}.`,
      tier: 'TOOLCHAIN',
      xp: 200,
      estimatedHours: 6,
      prerequisites: [`${normalized}:foundation-git`],
      resources: [{ title: 'Repository Guidelines', url: '/guidelines', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Run test suite locally.' },
      position: { x: 350, y: 250 },
    },
    {
      id: `${normalized}:domain-pr`,
      title: 'First Verified Bug Fix / Feature PR',
      description: `Resolve an open issue with test coverage for ${programName}.`,
      tier: 'DOMAIN',
      xp: 300,
      estimatedHours: 12,
      prerequisites: [`${normalized}:toolchain-env`],
      resources: [{ title: 'Task Radar', url: '/issues', type: 'exercise' }],
      verification: { type: 'pr_link', description: 'Link merged or active PR.' },
      position: { x: 600, y: 250 },
    },
    {
      id: `${normalized}:capstone-proposal`,
      title: 'Application Proposal & Deliverables Roadmap',
      description: `Author a structured grant/mentorship proposal for ${programName}.`,
      tier: 'CAPSTONE',
      xp: 350,
      estimatedHours: 18,
      prerequisites: [`${normalized}:domain-pr`],
      resources: [{ title: 'Proposal Studio', url: '/proposals', type: 'docs' }],
      verification: { type: 'self_attest', description: 'Complete proposal draft.' },
      position: { x: 850, y: 250 },
    },
  ];

  const edges: SkillEdge[] = [
    { from: `${normalized}:foundation-git`, to: `${normalized}:toolchain-env` },
    { from: `${normalized}:toolchain-env`, to: `${normalized}:domain-pr` },
    { from: `${normalized}:domain-pr`, to: `${normalized}:capstone-proposal` },
  ];

  return {
    programSlug: normalized,
    programName,
    description: `Structured contributor skill-tree and progression roadmap for ${programName}.`,
    badgeName: `${programName} Ready`,
    totalXp: 1000,
    nodes,
    edges,
  };
}
