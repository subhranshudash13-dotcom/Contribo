import type { Project } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDocs } from '@/lib/serialize';
import { resolveProgramFilter } from '@/lib/repositories/programs';

export type TrendingDomain = 'all' | 'web' | 'ai' | 'systems';

const DOMAIN_TOKENS: Record<Exclude<TrendingDomain, 'all'>, string[]> = {
  web: [
    'javascript',
    'typescript',
    'react',
    'next.js',
    'nextjs',
    'vue',
    'angular',
    'html',
    'css',
    'svelte',
    'tailwindcss',
    'frontend',
    'graphql',
  ],
  ai: [
    'python',
    'machine learning',
    'pytorch',
    'tensorflow',
    'deep learning',
    'data science',
    'nlp',
    'computer vision',
    'llm',
    'genai',
    'scikit-learn',
    'pandas',
    'numpy',
  ],
  systems: [
    'c',
    'c++',
    'c/c++',
    'rust',
    'go',
    'golang',
    'linux',
    'kernel',
    'docker',
    'kubernetes',
    'devops',
    'embedded',
    'systems',
  ],
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getTrendingProjects(options?: {
  domain?: TrendingDomain | string | null;
  programSlug?: string | null;
  limit?: number;
  yearMin?: number;
}) {
  const limit = Math.min(Math.max(options?.limit ?? 18, 1), 48);
  const domain = (options?.domain || 'all').toLowerCase() as TrendingDomain;
  const yearMin = options?.yearMin ?? 2023;

  const program = await resolveProgramFilter({
    programSlug: options?.programSlug,
  });
  if (program.notFound) {
    return { projects: [], total: 0, domain: domain || 'all' };
  }

  const filter: Record<string, unknown> = {
    year: { $gte: yearMin },
  };
  if (program.programId !== undefined) {
    filter.programId = program.programId;
  }

  if (domain !== 'all' && DOMAIN_TOKENS[domain as Exclude<TrendingDomain, 'all'>]) {
    const tokens = DOMAIN_TOKENS[domain as Exclude<TrendingDomain, 'all'>];
    filter.techStack = {
      $in: tokens.map((t) => new RegExp(`^${escapeRegex(t)}$`, 'i')),
    };
  }

  const collection = await getCollection<Project>(COLLECTIONS.projects);

  const sortOrder = { stars: -1, year: -1, createdAt: -1 } as const;
  let activeFilter = filter;
  let projects = await collection
    .find(activeFilter)
    .sort(sortOrder)
    .limit(limit)
    .toArray();

  // If the domain filter is too sparse, relax only the year constraint.
  // The domain and program constraints always stay in place.
  if (projects.length < Math.min(6, limit) && domain !== 'all') {
    const relaxed = { ...filter };
    delete relaxed.year;
    activeFilter = relaxed;
    projects = await collection
      .find(activeFilter)
      .sort(sortOrder)
      .limit(limit)
      .toArray();
  }

  // Count against the filter that produced the returned page. No fallback to
  // unrelated top-starred projects when a domain has no matches.
  const total = await collection.countDocuments(activeFilter);

  return {
    projects: serializeDocs(projects as unknown as Record<string, unknown>[]),
    total,
    domain: domain || 'all',
  };
}
