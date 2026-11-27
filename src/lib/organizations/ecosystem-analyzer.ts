export type BusFactorHealth = 'Resilient' | 'Moderate' | 'Concentrated';

export interface MaintainerContribution {
  handle: string;
  commits: number;
  reviews: number;
}

export interface RepoStackEntry {
  repoName: string;
  stacks: string[];
  stars: number;
  openGoodFirstIssues: number;
}

export interface EcosystemGraphNode {
  id: string;
  label: string;
  kind: 'repo' | 'stack';
  weight: number;
}

export interface EcosystemGraphEdge {
  source: string;
  target: string;
}

export interface BusFactorMetrics {
  nakamotoCoefficient: number; // min maintainers for >=50% commits
  giniConcentration: number; // 0 (equal) to 1 (monopoly)
  health: BusFactorHealth;
  totalCommits: number;
  activeMaintainers: number;
  riskNotes: string[];
}

export interface NewcomerVelocityMetrics {
  medianHoursToFirstReview: number;
  firstTimeMergeRatePct: number; // 0-100
  weeklyMergedPrs: number;
}

export interface OrganizationEcosystemReport {
  slug: string;
  orgName: string;
  busFactor: BusFactorMetrics;
  velocity: NewcomerVelocityMetrics;
  graph: {
    nodes: EcosystemGraphNode[];
    edges: EcosystemGraphEdge[];
  };
  repos: RepoStackEntry[];
}

/**
 * Compute Gini concentration coefficient in [0, 1] for commit counts.
 */
export function computeGiniConcentration(counts: number[]): number {
  const clean = counts.filter((n) => Number.isFinite(n) && n >= 0).sort((a, b) => a - b);
  const n = clean.length;
  if (n <= 1) return n === 1 && clean[0] > 0 ? 1 : 0;
  const total = clean.reduce((sum, v) => sum + v, 0);
  if (total === 0) return 0;

  let weightedSum = 0;
  for (let i = 0; i < n; i++) {
    weightedSum += (2 * (i + 1) - n - 1) * clean[i];
  }
  const gini = weightedSum / (n * total);
  return Number(Math.min(Math.max(gini, 0), 1).toFixed(4));
}

/**
 * Compute Bus-Factor telemetry from maintainer commit/review distributions.
 */
export function analyzeBusFactor(maintainers: MaintainerContribution[]): BusFactorMetrics {
  const sorted = [...maintainers]
    .filter((m) => Number.isFinite(m.commits) && m.commits > 0)
    .sort((a, b) => b.commits - a.commits);

  const totalCommits = sorted.reduce((sum, m) => sum + m.commits, 0);
  if (totalCommits === 0 || sorted.length === 0) {
    return {
      nakamotoCoefficient: 0,
      giniConcentration: 0,
      health: 'Concentrated',
      totalCommits: 0,
      activeMaintainers: 0,
      riskNotes: ['No recent maintainer commit telemetry available.'],
    };
  }

  let cumulative = 0;
  let nakamoto = 0;
  for (const m of sorted) {
    cumulative += m.commits;
    nakamoto += 1;
    if (cumulative >= totalCommits * 0.5) break;
  }

  const gini = computeGiniConcentration(sorted.map((m) => m.commits));

  let health: BusFactorHealth = 'Moderate';
  if (nakamoto >= 4 && gini <= 0.45) {
    health = 'Resilient';
  } else if (nakamoto <= 1 || gini >= 0.68) {
    health = 'Concentrated';
  }

  const riskNotes: string[] = [];
  if (health === 'Resilient') {
    riskNotes.push(
      `Healthy contributor distribution: ${nakamoto} maintainers account for 50%+ of commits.`
    );
  } else if (health === 'Concentrated') {
    riskNotes.push(
      `High bus-factor risk: top ${nakamoto} maintainer(s) control >=50% of commits (Gini ${gini}).`
    );
  } else {
    riskNotes.push(
      `Moderate concentration (Nakamoto=${nakamoto}, Gini=${gini}). Verify backup reviewers before midterm.`
    );
  }

  return {
    nakamotoCoefficient: nakamoto,
    giniConcentration: gini,
    health,
    totalCommits,
    activeMaintainers: sorted.length,
    riskNotes,
  };
}

/**
 * Build deduplicated cross-repository tech-stack dependency graph.
 */
export function buildTechStackGraph(repos: RepoStackEntry[]): {
  nodes: EcosystemGraphNode[];
  edges: EcosystemGraphEdge[];
} {
  const nodesMap = new Map<string, EcosystemGraphNode>();
  const edgeKeys = new Set<string>();
  const edges: EcosystemGraphEdge[] = [];

  for (const repo of repos) {
    const repoId = `repo:${repo.repoName}`;
    if (!nodesMap.has(repoId)) {
      nodesMap.set(repoId, {
        id: repoId,
        label: repo.repoName,
        kind: 'repo',
        weight: repo.stars,
      });
    }

    const uniqueStacks = [...new Set(repo.stacks.map((s) => s.trim()).filter(Boolean))];
    for (const stack of uniqueStacks) {
      const stackId = `stack:${stack.toLowerCase()}`;
      const existing = nodesMap.get(stackId);
      if (existing) {
        existing.weight += 1;
      } else {
        nodesMap.set(stackId, {
          id: stackId,
          label: stack,
          kind: 'stack',
          weight: 1,
        });
      }

      const edgeKey = `${repoId}->${stackId}`;
      if (!edgeKeys.has(edgeKey)) {
        edgeKeys.add(edgeKey);
        edges.push({ source: repoId, target: stackId });
      }
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
  };
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(Math.max(value, 0), 100));
}

const CURATED_ECOSYSTEMS: Record<
  string,
  {
    orgName: string;
    maintainers: MaintainerContribution[];
    velocity: NewcomerVelocityMetrics;
    repos: RepoStackEntry[];
  }
> = {
  apache: {
    orgName: 'Apache Software Foundation',
    maintainers: [
      { handle: '@mvance', commits: 140, reviews: 95 },
      { handle: '@ljin', commits: 125, reviews: 88 },
      { handle: '@rkapoor', commits: 118, reviews: 74 },
      { handle: '@tnguyen', commits: 110, reviews: 68 },
      { handle: '@kpatel', commits: 95, reviews: 62 },
      { handle: '@swei', commits: 82, reviews: 50 },
    ],
    velocity: {
      medianHoursToFirstReview: 14,
      firstTimeMergeRatePct: 78,
      weeklyMergedPrs: 42,
    },
    repos: [
      { repoName: 'kafka', stacks: ['Java', 'Scala', 'Gradle', 'RocksDB'], stars: 28500, openGoodFirstIssues: 19 },
      { repoName: 'airflow', stacks: ['Python', 'TypeScript', 'React', 'PostgreSQL'], stars: 36400, openGoodFirstIssues: 31 },
      { repoName: 'superset', stacks: ['TypeScript', 'React', 'Python', 'PostgreSQL'], stars: 62100, openGoodFirstIssues: 24 },
      { repoName: 'flink', stacks: ['Java', 'Scala', 'RocksDB'], stars: 23900, openGoodFirstIssues: 14 },
    ],
  },
  cncf: {
    orgName: 'Cloud Native Computing Foundation',
    maintainers: [
      { handle: '@schen', commits: 165, reviews: 112 },
      { handle: '@dokafor', commits: 148, reviews: 105 },
      { handle: '@arivera', commits: 132, reviews: 90 },
      { handle: '@mzimmer', commits: 120, reviews: 84 },
      { handle: '@kito', commits: 96, reviews: 71 },
    ],
    velocity: {
      medianHoursToFirstReview: 9,
      firstTimeMergeRatePct: 84,
      weeklyMergedPrs: 67,
    },
    repos: [
      { repoName: 'kubernetes', stacks: ['Go', 'Docker', 'gRPC', 'etcd'], stars: 110000, openGoodFirstIssues: 42 },
      { repoName: 'prometheus', stacks: ['Go', 'TypeScript', 'React', 'TSDB'], stars: 55200, openGoodFirstIssues: 18 },
      { repoName: 'opentelemetry-js', stacks: ['TypeScript', 'Node.js', 'gRPC'], stars: 2900, openGoodFirstIssues: 15 },
      { repoName: 'envoy', stacks: ['C++', 'gRPC', 'Bazel'], stars: 24800, openGoodFirstIssues: 11 },
    ],
  },
};

/**
 * Resolve ecosystem report for any valid organization slug (with deterministic fallback).
 */
export function getOrganizationEcosystemReport(rawSlug: string): OrganizationEcosystemReport {
  const slug = rawSlug.trim().toLowerCase();
  const curated = CURATED_ECOSYSTEMS[slug];

  if (curated) {
    return {
      slug,
      orgName: curated.orgName,
      busFactor: analyzeBusFactor(curated.maintainers),
      velocity: {
        ...curated.velocity,
        firstTimeMergeRatePct: clampPct(curated.velocity.firstTimeMergeRatePct),
      },
      graph: buildTechStackGraph(curated.repos),
      repos: curated.repos,
    };
  }

  // Deterministic synthesis for any catalog org slug
  const seed = Array.from(slug).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const orgName = slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');

  const maintainers: MaintainerContribution[] = [
    { handle: `@${slug}-lead`, commits: 120 + (seed % 40), reviews: 65 },
    { handle: `@${slug}-core`, commits: 85 + (seed % 30), reviews: 52 },
    { handle: `@${slug}-infra`, commits: 60 + (seed % 25), reviews: 41 },
    { handle: `@${slug}-docs`, commits: 40 + (seed % 15), reviews: 30 },
  ];

  const repos: RepoStackEntry[] = [
    { repoName: `${slug}-core`, stacks: ['TypeScript', 'Node.js', 'MongoDB'], stars: 1800 + (seed % 500), openGoodFirstIssues: 8 },
    { repoName: `${slug}-web`, stacks: ['TypeScript', 'React', 'Next.js'], stars: 1200 + (seed % 400), openGoodFirstIssues: 12 },
    { repoName: `${slug}-cli`, stacks: ['Go', 'Docker', 'Node.js'], stars: 750 + (seed % 300), openGoodFirstIssues: 5 },
  ];

  return {
    slug,
    orgName: orgName || slug,
    busFactor: analyzeBusFactor(maintainers),
    velocity: {
      medianHoursToFirstReview: 12 + (seed % 20),
      firstTimeMergeRatePct: clampPct(62 + (seed % 28)),
      weeklyMergedPrs: 14 + (seed % 18),
    },
    graph: buildTechStackGraph(repos),
    repos,
  };
}
