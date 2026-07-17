import type { Project } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDocs, serializeDoc, toObjectId } from '@/lib/serialize';
import { resolveProgramFilter } from '@/lib/repositories/programs';

export interface ProjectListQuery {
  programId?: string | null;
  programSlug?: string | null;
  orgSlug?: string | null;
  difficulty?: string | null;
  tech?: string | null;
  year?: string | null;
  search?: string | null;
  sortBy?: string | null;
  limit: number;
  skip: number;
  /** When true, only return fields needed for cards/lists (faster). */
  lean?: boolean;
}

/** Fields needed for project cards and list UIs. */
const LEAN_PROJECT_PROJECTION = {
  title: 1,
  org: 1,
  orgSlug: 1,
  difficulty: 1,
  techStack: 1,
  description: 1,
  year: 1,
  stars: 1,
  programId: 1,
  topics: 1,
  mentors: 1,
  githubUrl: 1,
  applicationDeadline: 1,
  programName: 1,
  programColor: 1,
} as const;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listProjects(query: ProjectListQuery) {
  const collection = await getCollection<Project>(COLLECTIONS.projects);
  const filter: Record<string, unknown> = {};

  const program = await resolveProgramFilter({
    programId: query.programId,
    programSlug: query.programSlug,
  });

  if (program.notFound) {
    return { projects: [], total: 0 };
  }
  if (program.programId !== undefined) {
    filter.programId = program.programId;
  }

  if (query.orgSlug) {
    filter.orgSlug = query.orgSlug;
  }

  if (query.difficulty && query.difficulty !== 'all') {
    filter.difficulty = { $regex: new RegExp(`^${escapeRegex(query.difficulty)}$`, 'i') };
  }

  if (query.tech && query.tech !== 'all') {
    filter.techStack = { $regex: new RegExp(`^${escapeRegex(query.tech)}$`, 'i') };
  }

  if (query.year) {
    const yearNum = parseInt(query.year, 10);
    if (!Number.isNaN(yearNum)) {
      filter.year = yearNum;
    }
  }

  const search = query.search?.trim();
  let useTextScore = false;

  if (search) {
    // Prefer text index when available; fall back to regex OR for partial matches.
    filter.$text = { $search: search };
    useTextScore = true;
  }

  let total: number;
  let projects: Project[];

  const lean = query.lean !== false;
  const baseProjection = lean ? { ...LEAN_PROJECT_PROJECTION } : undefined;

  try {
    // Run count + page fetch in parallel when not using text score projection quirks
    const cursor = collection.find(filter, baseProjection ? { projection: baseProjection } : undefined);

    if (useTextScore) {
      cursor
        .project({ ...(baseProjection || {}), score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
    } else if (query.sortBy === 'stars') {
      cursor.sort({ stars: -1, year: -1 });
    } else if (query.sortBy === 'title') {
      cursor.sort({ title: 1 });
    } else {
      cursor.sort({ year: -1, stars: -1 });
    }

    const [totalCount, pageDocs] = await Promise.all([
      collection.countDocuments(filter),
      cursor.skip(query.skip).limit(query.limit).toArray(),
    ]);
    total = totalCount;
    projects = pageDocs;
  } catch (err) {
    // Text index missing or $text failure → regex fallback
    if (search && useTextScore) {
      delete filter.$text;
      filter.$or = [
        { title: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
        { org: { $regex: escapeRegex(search), $options: 'i' } },
        { techStack: { $regex: escapeRegex(search), $options: 'i' } },
        { topics: { $regex: escapeRegex(search), $options: 'i' } },
      ];
      const [totalCount, pageDocs] = await Promise.all([
        collection.countDocuments(filter),
        collection
          .find(filter, baseProjection ? { projection: baseProjection } : undefined)
          .sort({ year: -1, stars: -1 })
          .skip(query.skip)
          .limit(query.limit)
          .toArray(),
      ]);
      total = totalCount;
      projects = pageDocs;
    } else {
      throw err;
    }
  }

  return {
    projects: serializeDocs(projects as unknown as Record<string, unknown>[]),
    total,
  };
}

export async function getProjectById(id: string) {
  const oid = toObjectId(id);
  if (!oid) return null;
  const collection = await getCollection<Project>(COLLECTIONS.projects);
  const project = await collection.findOne({ _id: oid } as never);
  const serialized = serializeDoc(project as unknown as Record<string, unknown> | null);
  if (!serialized) return null;

  // Enrich with program metadata when available
  if (serialized.programId) {
    try {
      const { getProgramById } = await import('@/lib/repositories/programs');
      const program = await getProgramById(String(serialized.programId));
      if (program) {
        return {
          ...serialized,
          programName: (program.name as string) || serialized.programName,
          programSlug: program.slug as string | undefined,
          programColor:
            (program.accentColor as string) ||
            (serialized.programColor as string | undefined),
        };
      }
    } catch {
      // non-fatal enrichment failure
    }
  }

  return serialized;
}

/** Common skill aliases → DB tokens (techStack is mostly lowercase). */
const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ['javascript', 'js', 'node.js', 'nodejs', 'typescript'],
  typescript: ['typescript', 'ts', 'javascript'],
  python: ['python', 'django', 'flask', 'fastapi'],
  'c++': ['c++', 'c/c++', 'cpp', 'c'],
  'c/c++': ['c/c++', 'c++', 'cpp', 'c'],
  c: ['c', 'c++', 'c/c++'],
  java: ['java', 'android', 'spring boot'],
  'node.js': ['node.js', 'nodejs', 'javascript', 'express'],
  nodejs: ['node.js', 'nodejs', 'javascript'],
  react: ['react', 'javascript', 'typescript', 'next.js'],
  'next.js': ['next.js', 'nextjs', 'react'],
  'machine learning': ['machine learning', 'ml', 'deep learning', 'pytorch', 'tensorflow', 'data science'],
  ml: ['machine learning', 'ml', 'pytorch', 'tensorflow'],
  pytorch: ['pytorch', 'python', 'machine learning', 'deep learning'],
  tensorflow: ['tensorflow', 'python', 'machine learning', 'deep learning'],
  'deep learning': ['deep learning', 'machine learning', 'pytorch', 'tensorflow'],
  'data science': ['data science', 'python', 'machine learning', 'jupyter'],
  golang: ['go', 'golang'],
  go: ['go', 'golang'],
  rust: ['rust'],
  docker: ['docker', 'kubernetes', 'devops'],
  kubernetes: ['kubernetes', 'k8s', 'docker'],
  html: ['html', 'html/css', 'css', 'javascript'],
  'html/css': ['html/css', 'html', 'css', 'javascript'],
  css: ['css', 'html/css', 'tailwindcss'],
  'github actions': ['github actions', 'ci', 'devops'],
  nlp: ['nlp', 'natural language processing', 'machine learning', 'python'],
  'computer vision': ['computer vision', 'opencv', 'machine learning', 'python'],
  reactjs: ['react', 'reactjs', 'react.js', 'javascript', 'typescript'],
  'react.js': ['react', 'reactjs', 'react.js', 'javascript', 'typescript'],
  vuejs: ['vue', 'vuejs', 'vue.js', 'javascript', 'typescript'],
  'vue.js': ['vue', 'vuejs', 'vue.js', 'javascript', 'typescript'],
  angularjs: ['angular', 'angularjs', 'angular.js', 'javascript', 'typescript'],
  'angular.js': ['angular', 'angularjs', 'angular.js', 'javascript', 'typescript'],
  cpp: ['c++', 'c/c++', 'cpp', 'c'],
  cplusplus: ['c++', 'c/c++', 'cpp', 'c'],
};

function expandSkillTokens(skills: string[]): string[] {
  const tokens = new Set<string>();
  for (const raw of skills) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    tokens.add(lower);
    tokens.add(trimmed);
    
    // Add variations without punctuation/spaces (e.g. next.js -> nextjs, spring boot -> springboot)
    const normalized = lower.replace(/[\s\-\.]/g, '');
    tokens.add(normalized);

    // Resolve direct aliases
    const aliases = SKILL_ALIASES[lower] || SKILL_ALIASES[normalized];
    if (aliases) {
      for (const a of aliases) {
        tokens.add(a);
        tokens.add(a.toLowerCase());
      }
    }
    
    // Also try removing plus signs for C++ -> cpp/c
    if (lower.includes('+')) {
      tokens.add(lower.replace(/\+/g, ''));
    }
  }
  return Array.from(tokens);
}

/**
 * Find candidate projects whose techStack intersects the given skills.
 * Uses case-insensitive regex + alias expansion (DB stores lowercase tech).
 * Prefers recent years and richer skill overlap when sorting client-side later.
 */
export async function findProjectsBySkills(
  skills: string[],
  limit = 40,
  options?: { preferRecentYears?: boolean; difficulty?: string | null }
) {
  const expanded = expandSkillTokens(skills);
  if (expanded.length === 0) return [];

  const collection = await getCollection<Project>(COLLECTIONS.projects);

  // Case-insensitive match: techStack is a string[] (often lowercase in DB)
  const techRegexes = expanded.map(
    (t) => new RegExp(`^${escapeRegex(t)}$`, 'i')
  );

  const filter: Record<string, unknown> = {
    techStack: { $in: techRegexes },
  };

  // Prefer 2024–2026 when possible, but fall back to all years if too few hits
  const preferRecent = options?.preferRecentYears !== false;
  const difficulty = options?.difficulty?.trim();

  if (difficulty && difficulty !== 'all') {
    filter.difficulty = {
      $regex: new RegExp(`^${escapeRegex(difficulty)}$`, 'i'),
    };
  }

  let candidates: Project[] = [];

  if (preferRecent) {
    candidates = await collection
      .find({ ...filter, year: { $gte: 2024 } })
      .sort({ year: -1, stars: -1 })
      .limit(limit * 2)
      .toArray();
  }

  if (candidates.length < Math.min(15, limit)) {
    const more = await collection
      .find(filter)
      .sort({ year: -1, stars: -1 })
      .limit(limit * 3)
      .toArray();
    const seen = new Set(candidates.map((p) => String(p._id)));
    for (const p of more) {
      const id = String(p._id);
      if (!seen.has(id)) {
        candidates.push(p);
        seen.add(id);
      }
      if (candidates.length >= limit * 2) break;
    }
  }

  // Score by skill overlap so we pass the best pool to the ranker
  const skillSet = new Set(expanded.map((s) => s.toLowerCase()));
  const scored = candidates.map((p) => {
    const stack = (p.techStack || []).map((t) => String(t).toLowerCase());
    const overlap = stack.filter((t) => skillSet.has(t)).length;
    // also count alias soft matches via partial containment
    let soft = 0;
    for (const t of stack) {
      if (skillSet.has(t)) continue;
      for (const s of skillSet) {
        if (t.includes(s) || s.includes(t)) {
          soft += 0.35;
          break;
        }
      }
    }
    const yearBoost = typeof p.year === 'number' ? Math.max(0, p.year - 2015) * 0.15 : 0;
    return { p, score: overlap * 3 + soft + yearBoost };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.p);
}
