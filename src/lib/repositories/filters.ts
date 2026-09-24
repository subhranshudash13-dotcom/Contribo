import { COLLECTIONS, getCollection } from '@/lib/db';
import { resolveProgramFilter } from '@/lib/repositories/programs';

export interface FilterFacets {
  technologies: string[];
  difficulties: string[];
  years: number[];
  topics: string[];
  orgCategories: string[];
}

export const ORGANIZATION_DOMAIN_GROUPS = [
  {
    label: 'AI & Machine Learning',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'data science'],
  },
  {
    label: 'Cloud, DevOps & Infrastructure',
    keywords: ['cloud', 'devops', 'infrastructure', 'kubernetes', 'distributed systems'],
  },
  {
    label: 'Developer Tools & Compilers',
    keywords: ['developer tool', 'developer tooling', 'compiler', 'ide', 'cli', 'debugger'],
  },
  {
    label: 'Databases & Data Engineering',
    keywords: ['database', 'sql', 'nosql', 'storage', 'big data', 'data engineering'],
  },
  {
    label: 'Web, Mobile & Fullstack',
    keywords: ['web', 'frontend', 'backend', 'fullstack', 'full stack', 'mobile', 'api', 'framework'],
  },
  {
    label: 'Security, Cryptography & Blockchain',
    keywords: ['security', 'cryptograph', 'blockchain', 'ledger', 'web3', 'zero knowledge', 'zk'],
  },
  {
    label: 'Science, Aerospace & Simulation',
    keywords: ['science', 'aerospace', 'astronomy', 'bioinformatics', 'physics', 'simulation'],
  },
  { label: 'Other', keywords: [] },
] as const;

export function normalizeOrganizationCategory(category: string): string {
  const value = category.toLowerCase();
  const group = ORGANIZATION_DOMAIN_GROUPS.find(({ keywords }) =>
    keywords.some((keyword) => value.includes(keyword))
  );
  return group?.label || 'Other';
}

function cleanStringList(values: unknown[], max = 80): string[] {
  const seen = new Map<string, string>();
  for (const v of values) {
    if (typeof v !== 'string') continue;
    const trimmed = v.trim();
    if (!trimmed || trimmed.length > 64) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return Array.from(seen.values())
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .slice(0, max);
}

function cleanOrganizationCategories(values: unknown[]): string[] {
  const normalized = new Set(
    values
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map(normalizeOrganizationCategory)
  );
  return ORGANIZATION_DOMAIN_GROUPS
    .map(({ label }) => label)
    .filter((label) => normalized.has(label));
}

function cleanYears(values: unknown[]): number[] {
  const years = values
    .map((v) => (typeof v === 'number' ? v : parseInt(String(v), 10)))
    .filter((n) => Number.isFinite(n) && n >= 2005 && n <= 2100);
  return Array.from(new Set(years)).sort((a, b) => b - a);
}

/**
 * Distinct filter facets for projects / organizations.
 * Optional programSlug scopes facets to one program.
 */
export async function getFilterFacets(options?: {
  programSlug?: string | null;
  programId?: string | null;
}): Promise<FilterFacets> {
  const program = await resolveProgramFilter({
    programId: options?.programId,
    programSlug: options?.programSlug,
  });

  if (program.notFound) {
    return {
      technologies: [],
      difficulties: [],
      years: [],
      topics: [],
      orgCategories: [],
    };
  }

  const projectFilter: Record<string, unknown> = {};
  const orgFilter: Record<string, unknown> = {};
  if (program.programId !== undefined) {
    projectFilter.programId = program.programId;
    orgFilter.programId = program.programId;
  }

  const projects = await getCollection(COLLECTIONS.projects);
  const organizations = await getCollection(COLLECTIONS.organizations);

  const [tech, difficulties, years, topics, categories] = await Promise.all([
    projects.distinct('techStack', projectFilter),
    projects.distinct('difficulty', projectFilter),
    projects.distinct('year', projectFilter),
    projects.distinct('topics', projectFilter),
    organizations.distinct('category', orgFilter),
  ]);

  return {
    technologies: cleanStringList(tech as unknown[], 120),
    difficulties: cleanStringList(difficulties as unknown[], 20),
    years: cleanYears(years as unknown[]),
    topics: cleanStringList(topics as unknown[], 80),
    orgCategories: cleanOrganizationCategories(categories as unknown[]),
  };
}

/**
 * Distinct years from organizations belonging to a specific program.
 * Used to dynamically populate year filter pills on program pages.
 */
export async function getOrgYearsForProgram(options: {
  programId?: string | null;
  programSlug?: string | null;
}): Promise<number[]> {
  const program = await resolveProgramFilter({
    programId: options.programId,
    programSlug: options.programSlug,
  });

  if (program.notFound) return [];

  const orgFilter: Record<string, unknown> = {};
  if (program.programId !== undefined) {
    orgFilter.programId = program.programId;
  }

  const organizations = await getCollection(COLLECTIONS.organizations);
  const years = await organizations.distinct('years', orgFilter);
  return cleanYears(years as unknown[]);
}

/**
 * Distinct technologies from organizations belonging to a specific program.
 * Used to dynamically populate technology filter dropdown on program pages.
 */
export async function getOrgTechnologiesForProgram(options: {
  programId?: string | null;
  programSlug?: string | null;
}): Promise<string[]> {
  const program = await resolveProgramFilter({
    programId: options.programId,
    programSlug: options.programSlug,
  });

  if (program.notFound) return [];

  const orgFilter: Record<string, unknown> = {};
  if (program.programId !== undefined) {
    orgFilter.programId = program.programId;
  }

  const organizations = await getCollection(COLLECTIONS.organizations);
  const tech = await organizations.distinct('technologies', orgFilter);
  return cleanStringList(tech as unknown[], 120);
}
