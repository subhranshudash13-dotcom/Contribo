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

export async function getOrganizationBySlug(
  slug: string,
  programSlug?: string | null,
  options?: { includeProjectCount?: boolean }
) {
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
}

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
