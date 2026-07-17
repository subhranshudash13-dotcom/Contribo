import { unstable_cache } from 'next/cache';
import { getPlatformStats } from '@/lib/repositories/stats';
import { listPrograms } from '@/lib/repositories/programs';
import { getFilterFacets } from '@/lib/repositories/filters';
import { getTrendingProjects } from '@/lib/repositories/trending';

/** Platform stats — short TTL, high traffic. */
export const getCachedPlatformStats = unstable_cache(
  async () => getPlatformStats({ bypassCache: true }),
  ['platform-stats-v1'],
  { revalidate: 120 }
);

/** Programs catalog — rarely changes. */
export const getCachedPrograms = unstable_cache(
  async () => listPrograms(),
  ['programs-list-v1'],
  { revalidate: 300 }
);

/** Filter facets for projects UI (global). */
export const getCachedFilterFacets = unstable_cache(
  async (programSlug?: string) =>
    getFilterFacets({ programSlug: programSlug || null }),
  ['filter-facets-v1'],
  { revalidate: 180 }
);

/** Homepage / trending rail. */
export const getCachedTrending = unstable_cache(
  async (domain = 'all', limit = 18) =>
    getTrendingProjects({ domain, limit }),
  ['trending-projects-v1'],
  { revalidate: 180 }
);

/** Homepage bundle: stats + trending in one cache entry. */
export const getCachedHomeBundle = unstable_cache(
  async () => {
    const [stats, trending] = await Promise.all([
      getPlatformStats({ bypassCache: true }),
      getTrendingProjects({ domain: 'all', limit: 18 }),
    ]);

    return {
      stats: {
        projects: stats.projects,
        orgs: stats.organizations,
        programs: stats.programs,
        contributors: stats.contributors,
      },
      trending: trending.projects.map((p) => ({
        id: String(p._id),
        title: p.title as string,
        org: p.org as string,
        orgSlug: p.orgSlug as string | undefined,
        difficulty: (p.difficulty as string) || 'Intermediate',
        techStack: (p.techStack as string[]) || [],
        stars: (p.stars as number) || 0,
        description: (p.description as string) || '',
        programId: p.programId != null ? String(p.programId) : undefined,
        programName: (p.programName as string) || undefined,
        year: typeof p.year === 'number' ? p.year : undefined,
      })),
    };
  },
  ['home-bundle-v3'],
  { revalidate: 180 }
);
