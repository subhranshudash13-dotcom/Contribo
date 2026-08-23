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
  student: 1,
  contributor: 1,
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
    } else if (query.sortBy === 'newest' || query.sortBy === 'year') {
      cursor.sort({ year: -1, stars: -1 });
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

/** Domain concept pillars mapping abstract / composite / high-level developer terms to technical tokens */
export const DOMAIN_PILLARS: Record<string, { aliases: string[]; tokens: string[] }> = {
  frontend: {
    aliases: ['frontend', 'front-end', 'front end', 'frontend engineering', 'client', 'web frontend', 'web development', 'web-dev', 'web'],
    tokens: ['javascript', 'typescript', 'react', 'reactjs', 'vue', 'vuejs', 'angular', 'svelte', 'next.js', 'nextjs', 'html', 'css', 'html/css', 'tailwindcss', 'electron', 'web', 'ui', 'ui/ux', 'flutter', 'dart', 'website', 'pwa']
  },
  backend: {
    aliases: ['backend', 'back-end', 'back end', 'backend engineering', 'server', 'api', 'apis', 'rest', 'graphql', 'grpc', 'microservices'],
    tokens: ['node.js', 'nodejs', 'express', 'django', 'fastapi', 'flask', 'python', 'spring boot', 'java', 'go', 'golang', 'rust', 'ruby', 'ruby on rails', 'graphql', 'rest', 'api', 'postgresql', 'mongodb', 'mysql', 'sql', 'database', 'sqlite', 'redis', 'server', 'docker', 'c#', '.net']
  },
  'ui/ux': {
    aliases: ['ui/ux', 'product/ui/ux', 'product/ui', 'ui', 'ux', 'product design', 'visual design', 'design', 'user experience', 'user interface', 'aesthetics', 'product', 'design systems'],
    tokens: ['ui/ux', 'ui', 'ux', 'design', 'visual design', 'product design', 'user interface', 'user experience', 'frontend', 'css', 'tailwind', 'tailwindcss', 'html/css', 'react', 'flutter', 'electron', 'web', 'aesthetics', 'responsive', 'visualization', 'website', 'figma', 'canva', 'theme']
  },
  mobile: {
    aliases: ['mobile', 'mobile engineering', 'mobile development', 'ios', 'android', 'app development', 'cross-platform mobile'],
    tokens: ['mobile', 'react native', 'react-native', 'flutter', 'android', 'ios', 'swift', 'kotlin', 'dart', 'capacitor', 'ionic']
  },
  devops: {
    aliases: ['devops', 'cloud', 'ci/cd', 'infrastructure', 'sysadmin', 'automation', 'site reliability', 'sre', 'cloud engineering'],
    tokens: ['devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'continuous integration', 'continuous delivery', 'jenkins', 'github actions', 'cloud', 'aws', 'gcp', 'azure', 'automation', 'linux', 'infrastructure', 'terraform', 'ansible']
  },
  ai: {
    aliases: ['ai', 'ml', 'ai/ml', 'machine learning', 'deep learning', 'data science', 'genai', 'generative ai', 'llm', 'nlp', 'computer vision', 'data engineering', 'agents'],
    tokens: ['ai', 'ml', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'data science', 'nlp', 'computer vision', 'llm', 'generative ai', 'genai', 'agents', 'python', 'jupyter', 'huggingface', 'scikit-learn']
  },
  security: {
    aliases: ['security', 'cybersecurity', 'infosec', 'cryptography', 'auth', 'e2ee', 'privacy', 'appsec'],
    tokens: ['security', 'encryption', 'cryptography', 'auth', 'e2ee', 'vault', 'privacy', 'cve', 'audit', 'oauth', 'jwt']
  },
  desktop: {
    aliases: ['desktop', 'desktop development', 'desktop apps', 'cross-platform desktop'],
    tokens: ['electron', 'tauri', 'qt', 'desktop', 'flutter', 'c++', 'c#', 'cross-platform']
  }
};

/** Common specific tech aliases → DB tokens */
export const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ['javascript', 'js', 'typescript', 'ts', 'node.js', 'nodejs', 'react', 'electron'],
  typescript: ['typescript', 'ts', 'javascript', 'react', 'node.js', 'electron', 'next.js'],
  python: ['python', 'django', 'flask', 'fastapi', 'ai', 'ml', 'pytorch', 'tensorflow'],
  'c++': ['c++', 'c/c++', 'cpp', 'c'],
  'c/c++': ['c/c++', 'c++', 'cpp', 'c'],
  c: ['c', 'c++', 'c/c++'],
  java: ['java', 'spring boot', 'android', 'kotlin'],
  'node.js': ['node.js', 'nodejs', 'javascript', 'express', 'typescript', 'electron'],
  nodejs: ['node.js', 'nodejs', 'javascript', 'express', 'typescript', 'electron'],
  react: ['react', 'reactjs', 'react.js', 'javascript', 'typescript', 'next.js', 'react native', 'electron'],
  'react native': ['react native', 'react-native', 'react', 'mobile', 'javascript', 'typescript'],
  'react-native': ['react native', 'react-native', 'react', 'mobile', 'javascript', 'typescript'],
  electron: ['electron', 'javascript', 'typescript', 'node.js', 'react', 'desktop'],
  'next.js': ['next.js', 'nextjs', 'react', 'typescript', 'javascript'],
  flutter: ['flutter', 'dart', 'mobile', 'ui/ux', 'frontend', 'cross-platform'],
  dart: ['dart', 'flutter', 'mobile', 'frontend'],
  jenkins: ['jenkins', 'ci/cd', 'devops', 'continuous integration', 'java', 'docker', 'automation'],
  'machine learning': ['machine learning', 'ml', 'deep learning', 'pytorch', 'tensorflow', 'data science', 'ai'],
  ml: ['machine learning', 'ml', 'pytorch', 'tensorflow', 'ai'],
  ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'nlp'],
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
  tailwindcss: ['tailwindcss', 'tailwind', 'css'],
  'github actions': ['github actions', 'ci', 'devops'],
  nlp: ['nlp', 'natural language processing', 'machine learning', 'python', 'ai'],
  'computer vision': ['computer vision', 'opencv', 'machine learning', 'python', 'ai'],
  reactjs: ['react', 'reactjs', 'react.js', 'javascript', 'typescript', 'react native'],
  'react.js': ['react', 'reactjs', 'react.js', 'javascript', 'typescript', 'react native'],
  vuejs: ['vue', 'vuejs', 'vue.js', 'javascript', 'typescript'],
  'vue.js': ['vue', 'vuejs', 'vue.js', 'javascript', 'typescript'],
  angularjs: ['angular', 'angularjs', 'angular.js', 'javascript', 'typescript'],
  'angular.js': ['angular', 'angularjs', 'angular.js', 'javascript', 'typescript'],
  sqlite: ['sqlite', 'database', 'sql'],
  sql: ['sql', 'postgresql', 'mysql', 'sqlite', 'database'],
  cpp: ['c++', 'c/c++', 'cpp', 'c'],
  cplusplus: ['c++', 'c/c++', 'cpp', 'c'],
};

export function expandSkillToTokens(rawSkill: string): string[] {
  const lower = rawSkill.toLowerCase().trim();
  const tokens = new Set<string>([lower]);

  const parts = lower.split(/[\/&+,]/).map((p) => p.trim()).filter(Boolean);
  for (const p of parts) tokens.add(p);

  for (const [, def] of Object.entries(DOMAIN_PILLARS)) {
    if (def.aliases.some((a) => lower === a || lower.includes(a) || a.includes(lower))) {
      for (const t of def.tokens) tokens.add(t.toLowerCase());
    }
  }

  for (const p of [lower, ...parts]) {
    const syns = SKILL_ALIASES[p] || SKILL_ALIASES[p.replace(/[\s\-._]/g, '')];
    if (syns) {
      for (const s of syns) tokens.add(s.toLowerCase());
    }
  }

  return Array.from(tokens);
}

export function expandSkillTokens(skills: string[]): {
  direct: string[];
  expanded: string[];
  requirements: Array<{ original: string; tokens: string[] }>;
} {
  const directSet = new Set<string>();
  const expandedSet = new Set<string>();
  const requirements: Array<{ original: string; tokens: string[] }> = [];

  for (const raw of skills) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    directSet.add(lower);

    const subParts = lower.split(/[\/&+,]/).map((p) => p.trim()).filter(Boolean);
    for (const sp of subParts) directSet.add(sp);

    const tokens = expandSkillToTokens(raw);
    requirements.push({ original: raw, tokens });
    for (const t of tokens) {
      expandedSet.add(t);
    }
  }

  return {
    direct: Array.from(directSet),
    expanded: Array.from(expandedSet),
    requirements,
  };
}

/**
 * Find candidate projects whose techStack or topics intersect the given skills.
 * Employs MongoDB aggregation with multi-requirement coverage scoring, alias expansion,
 * and recency weighting to ensure premier org matches (e.g. Joplin, Rocket.Chat, Zulip, API Dash, Jenkins)
 * are never starved by arbitrary star-based truncation.
 */
export async function findProjectsBySkills(
  skills: string[],
  limit = 60,
  options?: {
    preferRecentYears?: boolean;
    difficulty?: string | null;
    programSlugs?: string[] | null;
  }
) {
  const { direct, expanded, requirements } = expandSkillTokens(skills);
  if (direct.length === 0 && expanded.length === 0) return [];

  const collection = await getCollection<Project>(COLLECTIONS.projects);

  const expandedRegexes = expanded.map((t) => new RegExp(`^${escapeRegex(t)}$`, 'i'));

  let programIds: unknown[] | null = null;
  if (options?.programSlugs && options.programSlugs.length > 0) {
    const validSlugs = options.programSlugs.map((s) => s.toLowerCase().trim()).filter(Boolean);
    if (validSlugs.length > 0) {
      const programsCol = await getCollection(COLLECTIONS.programs);
      const programs = await programsCol.find({ slug: { $in: validSlugs } } as never).toArray();
      programIds = programs.map((p) => p._id);
      if (programIds.length === 0) return [];
    }
  }

  const difficulty = options?.difficulty?.trim();
  const difficultyRegex =
    difficulty && difficulty !== 'all'
      ? new RegExp(`^${escapeRegex(difficulty)}$`, 'i')
      : null;

  try {
    const reqFields: Record<string, unknown> = {};
    requirements.forEach((req, idx) => {
      const tokens = req.tokens;
      reqFields[`req_satisfied_${idx}`] = {
        $or: [
          {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: {
                      $concatArrays: [
                        { $ifNull: ['$techStack', []] },
                        { $ifNull: ['$topics', []] },
                      ],
                    },
                    as: 'item',
                    cond: { $in: [{ $toLower: '$$item' }, tokens] },
                  },
                },
              },
              0,
            ],
          },
          {
            $regexMatch: {
              input: { $ifNull: ['$title', ''] },
              regex: new RegExp(tokens.filter((t) => t.length >= 2).map(escapeRegex).join('|'), 'i'),
            },
          },
          {
            $regexMatch: {
              input: { $ifNull: ['$description', ''] },
              regex: new RegExp(tokens.filter((t) => t.length >= 3).slice(0, 16).map(escapeRegex).join('|'), 'i'),
            },
          },
        ],
      };
    });

    const sumReqConditions = requirements.map((_, idx) => ({
      $cond: [`$req_satisfied_${idx}`, 1, 0],
    }));

    const pipeline: Record<string, unknown>[] = [
      {
        $match: {
          $and: [
            {
              $or: [
                { techStack: { $in: expandedRegexes } },
                {
                  topics: {
                    $in: expanded.slice(0, 30).map((t) => new RegExp(escapeRegex(t), 'i')),
                  },
                },
                {
                  title: {
                    $in: expanded.slice(0, 30).map((t) => new RegExp(escapeRegex(t), 'i')),
                  },
                },
              ],
            },
            ...(programIds ? [{ programId: { $in: programIds } }] : []),
            ...(difficultyRegex ? [{ difficulty: difficultyRegex }] : []),
          ],
        },
      },
      {
        $project: {
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
          orgLogoUrl: 1,
          orgWebsiteUrl: 1,
          orgGithubUrl: 1,
          orgCategory: 1,
          orgDescription: 1,
          orgIdeasUrl: 1,
          orgTopics: 1,
          yearlyStats: 1,
        },
      },
      {
        $addFields: {
          ...reqFields,
          directMatchCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$techStack', []] },
                as: 'tech',
                cond: {
                  $in: [{ $toLower: '$$tech' }, direct],
                },
              },
            },
          },
          yearVal: { $ifNull: ['$year', 2020] },
        },
      },
      {
        $addFields: {
          requirementsCoveredCount: {
            $add: sumReqConditions.length > 0 ? sumReqConditions : [0],
          },
        },
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              { $multiply: ['$requirementsCoveredCount', 30] },
              { $multiply: [{ $min: ['$directMatchCount', 3] }, 8] },
              {
                $cond: [
                  { $gte: ['$yearVal', 2024] },
                  6,
                  { $cond: [{ $gte: ['$yearVal', 2020] }, 3, 1] },
                ],
              },
            ],
          },
        },
      },
      {
        $sort: {
          matchScore: -1,
          yearVal: -1,
        },
      },
      {
        $limit: 600,
      },
    ];

    const rawCandidates = await collection.aggregate<Project>(pipeline as never, { allowDiskUse: true }).toArray();
    if (rawCandidates.length > 0) {
      // Group by organization in JS and take top 3 candidate projects per org
      const orgMap = new Map<string, Project[]>();
      for (const p of rawCandidates) {
        const orgKey = (p.orgSlug || p.org || 'unknown').toLowerCase().trim();
        if (!orgMap.has(orgKey)) orgMap.set(orgKey, []);
        if ((orgMap.get(orgKey)?.length || 0) < 3) {
          orgMap.get(orgKey)!.push(p);
        }
      }

      // Sort organizations by their top project's matchScore
      const sortedOrgs = Array.from(orgMap.entries()).sort(
        (a, b) => ((b[1][0] as unknown as { matchScore?: number }).matchScore || 0) -
                  ((a[1][0] as unknown as { matchScore?: number }).matchScore || 0)
      );

      const targetPoolSize = Math.max(limit * 2, 80);
      const pool: Project[] = [];

      // Pass 1: Best project from each org
      for (const [, projects] of sortedOrgs) {
        if (projects[0]) pool.push(projects[0]);
        if (pool.length >= targetPoolSize) break;
      }
      // Pass 2: 2nd best project from each org if pool not yet full
      if (pool.length < targetPoolSize) {
        for (const [, projects] of sortedOrgs) {
          if (projects[1]) pool.push(projects[1]);
          if (pool.length >= targetPoolSize) break;
        }
      }
      // Pass 3: 3rd project if still needed
      if (pool.length < targetPoolSize) {
        for (const [, projects] of sortedOrgs) {
          if (projects[2]) pool.push(projects[2]);
          if (pool.length >= targetPoolSize) break;
        }
      }

      return pool;
    }
  } catch {
    // Fall back to standard query if aggregation fails
  }

  const filter: Record<string, unknown> = {
    techStack: { $in: expandedRegexes },
  };
  if (programIds) filter.programId = { $in: programIds };
  if (difficultyRegex) filter.difficulty = difficultyRegex;

  const fallback = await collection
    .find(filter)
    .sort({ year: -1, stars: -1 })
    .limit(limit * 4)
    .toArray();

  const pool: Project[] = [];
  const orgCounts = new Map<string, number>();
  for (const p of fallback) {
    const orgKey = (p.orgSlug || p.org || 'unknown').toLowerCase().trim();
    const count = orgCounts.get(orgKey) || 0;
    if (count < 3) {
      pool.push(p);
      orgCounts.set(orgKey, count + 1);
    }
    if (pool.length >= limit * 2) break;
  }

  return pool;
}
