import type { Organization } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDocs, serializeDoc } from '@/lib/serialize';
import { resolveProgramFilter } from '@/lib/repositories/programs';

export interface OrgListQuery {
  programId?: string | null;
  programSlug?: string | null;
  search?: string | null;
  tag?: string | null;
  years?: number[] | null;
  yearMode?: 'and' | 'or' | null;
  limit: number;
  skip: number;
  lean?: boolean;
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

  const [total, organizations] = await Promise.all([
    collection.countDocuments(filter),
    collection
      .find(filter, findOpts)
      .sort({ name: 1 })
      .skip(query.skip)
      .limit(query.limit)
      .toArray(),
  ]);

  return {
    organizations: serializeDocs(organizations as unknown as Record<string, unknown>[]),
    total,
  };
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
