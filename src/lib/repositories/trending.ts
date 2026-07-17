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

  let projects = await collection
    .find(filter)
    .sort({ stars: -1, year: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  // If domain filter is too sparse, relax year and refill
  if (projects.length < Math.min(6, limit) && domain !== 'all') {
    const relaxed = { ...filter };
    delete relaxed.year;
    const more = await collection
      .find(relaxed)
      .sort({ stars: -1, year: -1 })
      .limit(limit)
      .toArray();
    const seen = new Set(projects.map((p) => String(p._id)));
    for (const p of more) {
      const id = String(p._id);
      if (!seen.has(id)) {
        projects.push(p);
        seen.add(id);
      }
      if (projects.length >= limit) break;
    }
  }

  // Final fallback: top starred overall
  if (projects.length === 0) {
    const fallbackFilter: Record<string, unknown> = {};
    if (program.programId !== undefined) {
      fallbackFilter.programId = program.programId;
    }
    projects = await collection
      .find(fallbackFilter as never)
      .sort({ stars: -1, year: -1 })
      .limit(limit)
      .toArray();
  }

  return {
    projects: serializeDocs(projects as unknown as Record<string, unknown>[]),
    total: projects.length,
    domain: domain || 'all',
  };
}
