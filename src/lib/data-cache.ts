import { unstable_cache } from 'next/cache';
import { getPlatformStats } from '@/lib/repositories/stats';
import { listPrograms } from '@/lib/repositories/programs';
import { getFilterFacets } from '@/lib/repositories/filters';
import { getTrendingProjects } from '@/lib/repositories/trending';
import { listOrganizations, listFeaturedOrganizations } from '@/lib/repositories/organizations';
import { listProjects } from '@/lib/repositories/projects';

/** Platform stats — short TTL, high traffic. */
export const getCachedPlatformStats = unstable_cache(
  async () => getPlatformStats({ bypassCache: false }),
  ['platform-stats-v2'],
  { revalidate: 180 }
);

/** Programs catalog — rarely changes. */
export const getCachedPrograms = unstable_cache(
  async () => listPrograms(),
  ['programs-list-v2'],
  { revalidate: 600 }
);

/** Filter facets for projects UI (global or per-program). */
export function getCachedFilterFacets(programSlug?: string) {
  const slugKey = programSlug ? programSlug.toLowerCase().trim() : 'all';
  return unstable_cache(
    async () => getFilterFacets({ programSlug: programSlug || null }),
    [`filter-facets-v2-${slugKey}`],
    { revalidate: 300 }
  )();
}

/** Homepage / trending rail. */
export const getCachedTrending = unstable_cache(
  async (domain = 'all', limit = 18) =>
    getTrendingProjects({ domain, limit }),
  ['trending-projects-v2'],
  { revalidate: 180 }
);

/** Homepage bundle: stats + trending in one cache entry. */
export const getCachedHomeBundle = unstable_cache(
  async () => {
    const [stats, trending] = await Promise.all([
      getPlatformStats({ bypassCache: false }),
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
  ['home-bundle-v4'],
  { revalidate: 180 }
);

export const ORGANIZATIONS_PAGE_SIZE = 120;

/** One page of the default organizations catalog (no filters), cached per page. */
export const getCachedDefaultOrganizations = unstable_cache(
  async (page: number = 1) =>
    listOrganizations({
      limit: ORGANIZATIONS_PAGE_SIZE,
      skip: (page - 1) * ORGANIZATIONS_PAGE_SIZE,
      lean: true,
    }),
  ['default-organizations-v7'],
  { revalidate: 300 }
);

/** Home page org showcase + the real total it is allowed to advertise. */
export const getCachedFeaturedOrganizations = unstable_cache(
  async () => listFeaturedOrganizations(16),
  ['featured-organizations-v1'],
  { revalidate: 300 }
);

/** Default projects catalog page (first 24 projects, no filters). */
export const getCachedDefaultProjects = unstable_cache(
  async () =>
    listProjects({
      limit: 24,
      skip: 0,
      lean: true,
    }),
  ['default-projects-v5'],
  { revalidate: 300 }
);

