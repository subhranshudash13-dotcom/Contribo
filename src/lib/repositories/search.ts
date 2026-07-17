import { COLLECTIONS, getCollection } from '@/lib/db';

export type SearchEntityType = 'all' | 'program' | 'organization' | 'project';

export async function globalSearch(
  rawQuery: string,
  options?: {
    type?: SearchEntityType | string | null;
    limit?: number;
  }
) {
  const query = rawQuery.trim();
  if (!query) {
    return { programs: [], organizations: [], projects: [], meta: { query: '', total: 0 } };
  }

  // Cap regex length to avoid ReDoS-style abuse
  const safe = query.slice(0, 80);
  const escaped = safe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const searchRegex = new RegExp(escaped, 'i');

  const rawType = (options?.type || 'all').toLowerCase();
  const type: SearchEntityType =
    rawType === 'org' || rawType === 'organization'
      ? 'organization'
      : rawType === 'program'
        ? 'program'
        : rawType === 'project'
          ? 'project'
          : 'all';
  const baseLimit = Math.min(Math.max(options?.limit ?? 15, 1), 40);

  const programLimit = type === 'program' ? baseLimit : Math.min(5, baseLimit);
  const orgLimit = type === 'organization' ? baseLimit : Math.min(10, baseLimit);
  const projectLimit = type === 'project' ? baseLimit : Math.min(15, baseLimit);

  const wantPrograms = type === 'all' || type === 'program';
  const wantOrgs = type === 'all' || type === 'organization';
  const wantProjects = type === 'all' || type === 'project';

  const [programsCol, orgsCol, projectsCol] = await Promise.all([
    getCollection(COLLECTIONS.programs),
    getCollection(COLLECTIONS.organizations),
    getCollection(COLLECTIONS.projects),
  ]);

  const [programsRaw, organizationsRaw, projectsRaw] = await Promise.all([
    wantPrograms
      ? programsCol
          .find({
            $or: [{ name: searchRegex }, { organizer: searchRegex }, { slug: searchRegex }],
          })
          .limit(programLimit)
          .toArray()
      : Promise.resolve([]),
    wantOrgs
      ? orgsCol
          .find({
            $or: [
              { name: searchRegex },
              { technologies: searchRegex },
              { topics: searchRegex },
              { slug: searchRegex },
              { category: searchRegex },
            ],
          })
          .limit(orgLimit)
          .toArray()
      : Promise.resolve([]),
    wantProjects
      ? projectsCol
          .find({
            $or: [
              { title: searchRegex },
              { org: searchRegex },
              { techStack: searchRegex },
              { topics: searchRegex },
              { description: searchRegex },
            ],
          })
          .sort({ year: -1, stars: -1 })
          .limit(projectLimit)
          .toArray()
      : Promise.resolve([]),
  ]);

  const programs = programsRaw.map((p) => ({
    id: p._id.toString(),
    name: p.name as string,
    slug: p.slug as string,
    organizer: p.organizer as string,
    accentColor: p.accentColor as string | undefined,
    stipendRange: p.stipendRange as string | undefined,
    type: 'program' as const,
  }));

  const organizations = organizationsRaw.map((o) => ({
    id: o._id.toString(),
    name: o.name as string,
    slug: o.slug as string,
    category: o.category as string | undefined,
    logoUrl: o.logoUrl as string | undefined,
    technologies: (o.technologies as string[]) || [],
    type: 'org' as const,
  }));

  const projects = projectsRaw.map((p) => ({
    id: p._id.toString(),
    title: p.title as string,
    org: p.org as string,
    orgSlug: p.orgSlug as string,
    difficulty: p.difficulty as string | undefined,
    techStack: (p.techStack as string[]) || [],
    year: p.year as number | undefined,
    programId: p.programId != null ? String(p.programId) : undefined,
    type: 'project' as const,
  }));

  return {
    programs,
    organizations,
    projects,
    meta: {
      query: safe,
      total: programs.length + organizations.length + projects.length,
      type,
    },
  };
}

/** Lightweight text search over projects only (for dedicated clients). */
export async function searchProjects(rawQuery: string, limit = 20) {
  const result = await globalSearch(rawQuery, { type: 'project', limit });
  return {
    projects: result.projects,
    total: result.projects.length,
    query: result.meta.query,
  };
}
