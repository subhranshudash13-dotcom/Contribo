import { cache } from 'react';
import type { Organization } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDocs, serializeDoc } from '@/lib/serialize';
import { resolveProgramFilter } from '@/lib/repositories/programs';
import { ORGANIZATION_DOMAIN_GROUPS } from '@/lib/repositories/filters';

export interface OrgListQuery {
  programId?: string | null;
  programSlug?: string | null;
  search?: string | null;
  tag?: string | null;
  category?: string | null;
  years?: number[] | null;
  yearMode?: 'and' | 'or' | null;
  limit: number;
  skip: number;
  lean?: boolean;
}

export interface OrganizationSuggestion {
  name: string;
  slug: string;
  logoUrl?: string | null;
  category?: string | null;
}

function levenshteinDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1)
      );
    }
    for (let column = 0; column <= right.length; column += 1) previous[column] = current[column];
  }
  return previous[right.length];
}

const LEAN_ORG_PROJECTION = {
  name: 1,
  slug: 1,
  logoUrl: 1,
  backgroundColor: 1,
  description: 1,
  websiteUrl: 1,
  category: 1,
  technologies: 1,
  topics: 1,
  years: 1,
  is2026: 1,
  projectCount: 1,
  programId: 1,
} as const;

export async function listOrganizations(query: OrgListQuery) {
  const collection = await getCollection<Organization>(COLLECTIONS.organizations);
  const filter: Record<string, unknown> = {};

  const program = await resolveProgramFilter({
    programId: query.programId,
    programSlug: query.programSlug,
  });

  if (program.notFound) {
    return { organizations: [], total: 0 };
  }
  if (program.programId !== undefined) {
    filter.programId = program.programId;
  }

  if (query.search?.trim()) {
    const safe = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 80);
    filter.name = { $regex: safe, $options: 'i' };
  }

  if (query.tag?.trim()) {
    const escaped = query.tag.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.technologies = { $regex: new RegExp(`^${escaped}$`, 'i') };
  }

  if (query.category?.trim()) {
    const selected = query.category.trim();
    const domain = ORGANIZATION_DOMAIN_GROUPS.find(({ label }) => label === selected);
    const patterns = domain?.keywords.length
      ? domain.keywords.map((keyword) => new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
      : [new RegExp(`^${selected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')];
    const knownDomainPatterns = ORGANIZATION_DOMAIN_GROUPS
      .filter(({ label }) => label !== 'Other')
      .flatMap(({ keywords }) =>
        keywords.map((keyword) => new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
      );
    filter.category = domain?.label === 'Other' ? { $nin: knownDomainPatterns } : { $in: patterns };
  }

  if (query.years && query.years.length > 0) {
    const validYears = query.years.filter(
      (y) => Number.isFinite(y) && y >= 2005 && y <= 2100
    );
    if (validYears.length > 0) {
      if (query.yearMode === 'and') {
        filter.years = { $all: validYears };
      } else {
        filter.years = { $in: validYears };
      }
    }
  }

  const lean = query.lean !== false;
  const findOpts = lean ? { projection: LEAN_ORG_PROJECTION } : undefined;

  let gsocProgramId: unknown;
  if (!query.programId && !query.programSlug) {
    try {
      const { getProgramBySlug } = await import('@/lib/repositories/programs');
      const gsoc = await getProgramBySlug('gsoc');
      if (gsoc?._id) {
        const { toObjectId } = await import('@/lib/serialize');
        gsocProgramId = toObjectId(String(gsoc._id)) || gsoc._id;
      }
    } catch {
      // ignore
    }
  }

  let total: number;
  let organizations: Record<string, unknown>[];

  if (gsocProgramId) {
    const pipeline: Record<string, unknown>[] = [
      { $match: filter },
      {
        $addFields: {
          isGsoc: {
            $cond: [{ $eq: ['$programId', gsocProgramId] }, 1, 0],
          },
        },
      },
      {
        $sort: {
          isGsoc: -1,
          is2026: -1,
          name: 1,
        },
      },
    ];

    if (lean) {
      pipeline.push({ $project: LEAN_ORG_PROJECTION });
    }

    const [totalCount, docs] = await Promise.all([
      collection.countDocuments(filter),
      collection
        .aggregate([
          ...pipeline,
          { $skip: query.skip },
          { $limit: query.limit },
        ])
        .toArray(),
    ]);
    total = totalCount;
    organizations = docs as unknown as Record<string, unknown>[];
  } else {
    const [totalCount, docs] = await Promise.all([
      collection.countDocuments(filter),
      collection
        .find(filter, findOpts)
        .sort({ is2026: -1, name: 1 })
        .skip(query.skip)
        .limit(query.limit)
        .toArray(),
    ]);
    total = totalCount;
    organizations = docs as unknown as Record<string, unknown>[];
  }

  return {
    organizations: serializeDocs(organizations),
    total,
  };
}

export async function suggestOrganizations(
  query: string,
  limit = 8
): Promise<OrganizationSuggestion[]> {
  const normalizedQuery = query.trim().toLowerCase().slice(0, 80);
  if (normalizedQuery.length < 2) return [];

  const collection = await getCollection<Organization>(COLLECTIONS.organizations);
  const candidates = await collection
    .find({}, { projection: { name: 1, slug: 1, logoUrl: 1, category: 1 } })
    .limit(5000)
    .toArray();

  return candidates
    .map((organization) => {
      const name = String(organization.name || '');
      const normalizedName = name.toLowerCase();
      const words = normalizedName.split(/[^a-z0-9]+/).filter(Boolean);
      const acronym = words.map((word) => word[0]).join('');
      const overlap = new Set(normalizedQuery).size
        ? [...new Set(normalizedQuery)].filter((character) => normalizedName.includes(character)).length
        : 0;
      const distance = Math.min(
        levenshteinDistance(normalizedQuery, normalizedName),
        ...words.map((word) => levenshteinDistance(normalizedQuery, word))
      );
      const startsWith = normalizedName.startsWith(normalizedQuery);
      const contains = normalizedName.includes(normalizedQuery);
      const acronymMatch = acronym.includes(normalizedQuery);
      return {
        organization,
        score: (startsWith ? 100 : 0)
          + (contains ? 40 : 0)
          + (acronymMatch ? 80 : 0)
          + (overlap * 12)
          - distance,
      };
    })
    .filter(({ score }) => score >= -Math.max(3, Math.floor(normalizedQuery.length / 2)))
    .sort((a, b) => b.score - a.score || String(a.organization.name).localeCompare(String(b.organization.name)))
    .slice(0, limit)
    .map(({ organization }) => ({
      name: String(organization.name),
      slug: String(organization.slug),
      logoUrl: organization.logoUrl,
      category: organization.category,
    }));
}

export const getOrganizationBySlug = cache(async (
  slug: string,
  programSlug?: string | null,
  options?: { includeProjectCount?: boolean }
) => {
  const collection = await getCollection<Organization>(COLLECTIONS.organizations);
  const filter: Record<string, unknown> = { slug };

  if (programSlug) {
    const program = await resolveProgramFilter({ programSlug });
    if (program.notFound) return null;
    if (program.programId !== undefined) {
      filter.programId = program.programId;
    }
  }

  const org = await collection.findOne(filter);
  const serialized = serializeDoc(org as unknown as Record<string, unknown> | null);
  if (!serialized) return null;

  if (options?.includeProjectCount !== false) {
    try {
      const { programIdFilter } = await import('@/lib/serialize');
      const projects = await getCollection(COLLECTIONS.projects);
      const countFilter: Record<string, unknown> = { orgSlug: slug };
      if (serialized.programId) {
        countFilter.programId = programIdFilter(String(serialized.programId));
      }
      const count = await projects.countDocuments(countFilter as never);
      return { ...serialized, projectCount: count };
    } catch {
      return serialized;
    }
  }

  return serialized;
});

export async function getSimilarOrganizations(
  org: { slug: string; category?: string; technologies?: string[]; topics?: string[]; programId?: unknown },
  limit = 4
): Promise<Organization[]> {
  try {
    const collection = await getCollection<Organization>(COLLECTIONS.organizations);
    const filter: Record<string, unknown> = {
      slug: { $ne: org.slug },
    };

    const conditions: Record<string, unknown>[] = [];

    if (org.category) {
      conditions.push({ category: org.category });
    }

    if (org.technologies && org.technologies.length > 0) {
      conditions.push({ technologies: { $in: org.technologies.slice(0, 5) } });
    }

    if (org.topics && org.topics.length > 0) {
      conditions.push({ topics: { $in: org.topics.slice(0, 5) } });
    }

    if (conditions.length > 0) {
      filter.$or = conditions;
    }

    let results = await collection
      .find(filter, { projection: LEAN_ORG_PROJECTION })
      .sort({ projectCount: -1, is2026: -1, name: 1 })
      .limit(limit)
      .toArray();

    // Fallback if not enough similar orgs found
    if (results.length < limit) {
      const fallbackFilter: Record<string, unknown> = {
        slug: { $nin: [org.slug, ...results.map((r) => r.slug)] },
      };
      if (org.programId) {
        fallbackFilter.programId = org.programId;
      }
      const more = await collection
        .find(fallbackFilter, { projection: LEAN_ORG_PROJECTION })
        .sort({ is2026: -1, name: 1 })
        .limit(limit - results.length)
        .toArray();
      results = [...results, ...more];
    }

    return serializeDocs(results as unknown as Record<string, unknown>[]) as unknown as Organization[];
  } catch (err) {
    console.error('Error fetching similar organizations:', err);
    return [];
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function findOrganizationsBySkills(
  skills: string[],
  limit = 60,
  options?: {
    programSlugs?: string[];
  }
): Promise<Organization[]> {
  const { expandSkillTokens } = await import('@/lib/repositories/projects');
  const { direct, expanded } = expandSkillTokens(skills);
  if (direct.length === 0 && expanded.length === 0) return [];

  const collection = await getCollection<Organization>(COLLECTIONS.organizations);
  const projectsCol = await getCollection(COLLECTIONS.projects);

  const orgFilter: Record<string, unknown> = {};

  if (options?.programSlugs && options.programSlugs.length > 0) {
    const validSlugs = options.programSlugs.map((s) => s.toLowerCase().trim()).filter(Boolean);
    if (validSlugs.length > 0) {
      const programsCol = await getCollection(COLLECTIONS.programs);
      const matchedPrograms = await programsCol
        .find({ slug: { $in: validSlugs } })
        .toArray();
      const programIds = matchedPrograms.map((p) => p._id);
      if (programIds.length > 0) {
        orgFilter.programId = { $in: programIds };
      }
    }
  }

  // 1. Fetch matching project counts per orgSlug across the project catalog
  const tokenList = Array.from(new Set([...direct, ...expanded]));
  const regexList = tokenList.slice(0, 35).map((t) => new RegExp(`^${escapeRegex(t)}$`, 'i'));

  const projectMatchFilter: Record<string, unknown> = {
    $or: [
      { techStack: { $in: regexList } },
      { topics: { $in: regexList } },
    ],
  };
  if (orgFilter.programId) {
    projectMatchFilter.programId = orgFilter.programId;
  }

  const projectCountsByOrg = new Map<string, number>();
  try {
    const projectAgg = await projectsCol
      .aggregate<{ _id: string; count: number }>([
        { $match: projectMatchFilter },
        { $group: { _id: '$orgSlug', count: { $sum: 1 } } },
      ])
      .toArray();

    for (const p of projectAgg) {
      if (p._id) {
        projectCountsByOrg.set(p._id.toLowerCase().trim(), p.count);
      }
    }
  } catch (err) {
    console.warn('Project aggregation for org matcher failed, continuing with direct org scoring:', err);
  }

  // 2. Fetch all organizations within scope (fast in-memory processing of entire catalog)
  const allOrgs = await collection.find(orgFilter).toArray();
  if (allOrgs.length === 0) return [];

  const expandedLower = expanded.map((s) => s.toLowerCase().trim());

  // 3. Multi-signal scoring across all organizations
  const scored = allOrgs.map((org) => {
    const orgTech = (org.technologies || []).map((t) => t.toLowerCase().trim());
    const orgTopics = (org.topics || []).map((t) => t.toLowerCase().trim());
    const orgDesc = (org.description || '').toLowerCase();
    const orgCat = (org.category || '').toLowerCase();
    const orgName = (org.name || '').toLowerCase();
    const orgSlug = (org.slug || '').toLowerCase();

    const matchedDirect = new Set<string>();
    const matchedExpanded = new Set<string>();
    let satisfiedUserSkillCount = 0;

    for (const skill of skills) {
      const sLower = skill.toLowerCase().trim();
      let skillSatisfied = false;

      // Check tech stack
      for (const t of orgTech) {
        if (t === sLower || t.includes(sLower) || sLower.includes(t)) {
          matchedDirect.add(t);
          skillSatisfied = true;
        }
      }
      // Check topics
      for (const top of orgTopics) {
        if (top === sLower || top.includes(sLower) || sLower.includes(top)) {
          matchedDirect.add(top);
          skillSatisfied = true;
        }
      }
      // Check description, category, name
      if (!skillSatisfied && sLower.length >= 3) {
        if (orgDesc.includes(sLower) || orgCat.includes(sLower) || orgName.includes(sLower)) {
          matchedDirect.add(skill);
          skillSatisfied = true;
        }
      }

      if (skillSatisfied) {
        satisfiedUserSkillCount++;
      }
    }

    // Check expanded synonym matches
    for (const exp of expandedLower) {
      if (orgTech.includes(exp) || orgTopics.includes(exp)) {
        matchedExpanded.add(exp);
      }
    }

    const matchingProjects = projectCountsByOrg.get(orgSlug) || 0;
    if (matchingProjects > 0 && satisfiedUserSkillCount === 0) {
      satisfiedUserSkillCount = 1;
    }

    // If completely unrelated and zero matching projects, assign score 0
    if (satisfiedUserSkillCount === 0 && matchedDirect.size === 0 && matchingProjects === 0) {
      return { org, score: 0 };
    }

    const coverageRatio = skills.length > 0 ? satisfiedUserSkillCount / skills.length : 0.5;
    const years = Array.isArray(org.years) ? org.years : [2026];
    const latestYear = years.length > 0 ? Math.max(...years) : 2026;
    const is2026 = Boolean(org.is2026 || latestYear === 2026);
    const isRecent = latestYear >= 2025 ? 1.0 : latestYear >= 2024 ? 0.8 : 0.6;
    const longevityBonus = Math.min(years.length, 10) * 1.5;
    const projectBonus = Math.min(matchingProjects, 60) * 1.2;
    const directHitsBonus = Math.min(matchedDirect.size, 8) * 5;
    const expandedHitsBonus = Math.min(matchedExpanded.size, 6) * 2;

    const score =
      coverageRatio * 60 +
      satisfiedUserSkillCount * 20 +
      directHitsBonus +
      expandedHitsBonus +
      (is2026 ? 24 : 0) +
      isRecent * 10 +
      longevityBonus +
      projectBonus;

    return {
      org,
      score: Math.round(score),
    };
  });

  const validScored = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const finalPool = validScored.slice(0, limit).map((s) => s.org);

  // If pool is sparse, backfill with active recent orgs
  if (finalPool.length < Math.min(limit, 15)) {
    const existingSlugs = new Set(finalPool.map((o) => o.slug));
    const fallbackOrgs = allOrgs
      .filter((o) => !existingSlugs.has(o.slug))
      .sort((a, b) => (b.is2026 ? 1 : 0) - (a.is2026 ? 1 : 0) || (b.projectCount || 0) - (a.projectCount || 0));
    finalPool.push(...fallbackOrgs.slice(0, limit - finalPool.length));
  }

  return serializeDocs(finalPool as unknown as Record<string, unknown>[]) as unknown as Organization[];
}

