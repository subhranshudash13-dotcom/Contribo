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
    tokens: ['mobile', 'react native', 'react-native', 'flutter', 'android', 'ios', 'swift', 'kotlin', 'dart', 'capacitor', 'ionic', 'kmp']
  },
  devops: {
    aliases: ['devops', 'cloud', 'ci/cd', 'infrastructure', 'sysadmin', 'automation', 'site reliability', 'sre', 'cloud engineering', 'systems engineering'],
    tokens: ['devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'continuous integration', 'continuous delivery', 'jenkins', 'github actions', 'cloud', 'aws', 'gcp', 'azure', 'automation', 'linux', 'infrastructure', 'terraform', 'ansible', 'helm', 'cloud native', 'cncf']
  },
  ai: {
    aliases: ['ai', 'ml', 'ai/ml', 'machine learning', 'deep learning', 'data science', 'genai', 'generative ai', 'llm', 'nlp', 'computer vision', 'data engineering', 'agents', 'neural networks'],
    tokens: ['ai', 'ml', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'data science', 'nlp', 'computer vision', 'llm', 'generative ai', 'genai', 'agents', 'python', 'jupyter', 'huggingface', 'scikit-learn', 'numpy', 'pandas', 'keras', 'jax', 'cuda']
  },
  security: {
    aliases: ['security', 'cybersecurity', 'infosec', 'cryptography', 'auth', 'e2ee', 'privacy', 'appsec', 'penetration testing'],
    tokens: ['security', 'encryption', 'cryptography', 'auth', 'e2ee', 'vault', 'privacy', 'cve', 'audit', 'oauth', 'jwt', 'blockchain', 'zero knowledge']
  },
  desktop: {
    aliases: ['desktop', 'desktop development', 'desktop apps', 'cross-platform desktop'],
    tokens: ['electron', 'tauri', 'qt', 'desktop', 'flutter', 'c++', 'c#', 'cross-platform']
  }
};

/** Common specific tech aliases → DB tokens */
export const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ['javascript', 'js', 'typescript', 'ts', 'node.js', 'nodejs', 'react', 'electron', 'web'],
  typescript: ['typescript', 'ts', 'javascript', 'react', 'node.js', 'electron', 'next.js', 'web'],
  python: ['python', 'python3', 'django', 'flask', 'fastapi', 'ai', 'ml', 'pytorch', 'tensorflow', 'numpy', 'pandas', 'data science'],
  'c++': ['c++', 'c/c++', 'cpp', 'c', 'qt', 'cmake', 'c++11', 'c++14', 'c++17', 'c++20', 'clang'],
  'c/c++': ['c/c++', 'c++', 'cpp', 'c', 'cmake', 'clang'],
  c: ['c', 'c++', 'c/c++', 'posix', 'linux', 'systems'],
  java: ['java', 'spring', 'spring boot', 'android', 'kotlin', 'gradle', 'maven', 'jvm'],
  kotlin: ['kotlin', 'android', 'java', 'mobile', 'kmp', 'kotlin multiplatform'],
  swift: ['swift', 'ios', 'mobile', 'macos', 'apple', 'xcode', 'swiftui'],
  'node.js': ['node.js', 'nodejs', 'javascript', 'express', 'typescript', 'electron', 'backend'],
  nodejs: ['node.js', 'nodejs', 'javascript', 'express', 'typescript', 'electron', 'backend'],
  react: ['react', 'reactjs', 'react.js', 'javascript', 'typescript', 'next.js', 'react native', 'electron', 'frontend', 'web'],
  'react native': ['react native', 'react-native', 'react', 'mobile', 'javascript', 'typescript', 'cross-platform'],
  'react-native': ['react native', 'react-native', 'react', 'mobile', 'javascript', 'typescript', 'cross-platform'],
  electron: ['electron', 'javascript', 'typescript', 'node.js', 'react', 'desktop'],
  'next.js': ['next.js', 'nextjs', 'react', 'typescript', 'javascript', 'frontend', 'web'],
  flutter: ['flutter', 'dart', 'mobile', 'cross-platform', 'desktop'],
  dart: ['dart', 'flutter', 'mobile'],
  jenkins: ['jenkins', 'ci/cd', 'devops', 'continuous integration', 'java', 'docker', 'automation'],
  'machine learning': ['machine learning', 'ml', 'deep learning', 'pytorch', 'tensorflow', 'data science', 'ai', 'neural networks', 'scikit-learn'],
  ml: ['machine learning', 'ml', 'pytorch', 'tensorflow', 'ai', 'deep learning', 'data science'],
  ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'nlp', 'deep learning'],
  pytorch: ['pytorch', 'python', 'machine learning', 'deep learning', 'ai', 'torch'],
  tensorflow: ['tensorflow', 'python', 'machine learning', 'deep learning', 'ai', 'keras'],
  'deep learning': ['deep learning', 'machine learning', 'pytorch', 'tensorflow', 'ai', 'neural networks'],
  'data science': ['data science', 'python', 'machine learning', 'jupyter', 'pandas', 'numpy'],
  golang: ['go', 'golang', 'cloud native', 'kubernetes', 'docker', 'backend'],
  go: ['go', 'golang', 'cloud native', 'kubernetes', 'docker', 'backend'],
  rust: ['rust', 'cargo', 'tokio', 'actix', 'serde', 'tauri', 'webassembly', 'wasm', 'systems'],
  docker: ['docker', 'containers', 'containerd', 'kubernetes', 'devops', 'cloud native'],
  kubernetes: ['kubernetes', 'k8s', 'docker', 'cloud native', 'cncf', 'devops', 'containers'],
  html: ['html', 'html/css', 'css', 'javascript', 'web', 'frontend'],
  'html/css': ['html/css', 'html', 'css', 'javascript', 'web', 'frontend'],
  css: ['css', 'html/css', 'tailwindcss', 'frontend', 'web'],
  tailwindcss: ['tailwindcss', 'tailwind', 'css', 'frontend', 'web'],
  tailwind: ['tailwindcss', 'tailwind', 'css', 'frontend', 'web'],
  'github actions': ['github actions', 'ci', 'devops', 'automation'],
  nlp: ['nlp', 'natural language processing', 'machine learning', 'python', 'ai', 'transformers', 'llm'],
  'computer vision': ['computer vision', 'opencv', 'machine learning', 'python', 'ai', 'image processing'],
  reactjs: ['react', 'reactjs', 'react.js', 'javascript', 'typescript', 'react native', 'frontend'],
  'react.js': ['react', 'reactjs', 'react.js', 'javascript', 'typescript', 'react native', 'frontend'],
  vuejs: ['vue', 'vuejs', 'vue.js', 'frontend', 'javascript', 'typescript'],
  'vue.js': ['vue', 'vuejs', 'vue.js', 'frontend', 'javascript', 'typescript'],
  vue: ['vue', 'vuejs', 'vue.js', 'frontend', 'javascript', 'typescript'],
  angularjs: ['angular', 'angularjs', 'angular.js', 'typescript', 'frontend'],
  'angular.js': ['angular', 'angularjs', 'angular.js', 'typescript', 'frontend'],
  angular: ['angular', 'angularjs', 'angular.js', 'typescript', 'frontend'],
  svelte: ['svelte', 'sveltekit', 'javascript', 'typescript', 'frontend'],
  sqlite: ['sqlite', 'database', 'sql'],
  sql: ['sql', 'postgresql', 'mysql', 'sqlite', 'database'],
  postgresql: ['postgresql', 'postgres', 'sql', 'database'],
  postgres: ['postgresql', 'postgres', 'sql', 'database'],
  mongodb: ['mongodb', 'nosql', 'database'],
  redis: ['redis', 'cache', 'database', 'in-memory'],
  cpp: ['c++', 'c/c++', 'cpp', 'c', 'cmake'],
  cplusplus: ['c++', 'c/c++', 'cpp', 'c', 'cmake'],
  'c#': ['c#', '.net', 'dotnet', 'asp.net', 'csharp', 'unity'],
  csharp: ['c#', '.net', 'dotnet', 'asp.net', 'csharp', 'unity'],
  ruby: ['ruby', 'rails', 'ruby on rails'],
  php: ['php', 'laravel', 'symfony', 'wordpress'],
  r: ['r', 'r-project', 'cran', 'bioconductor', 'statistics'],
  julia: ['julia', 'scientific computing', 'machine learning'],
  linux: ['linux', 'kernel', 'posix', 'shell', 'bash', 'unix', 'systems'],
  shell: ['shell', 'bash', 'zsh', 'sh', 'linux'],
  bash: ['shell', 'bash', 'zsh', 'sh', 'linux'],
  graphql: ['graphql', 'apollo', 'api', 'backend'],
  solana: ['solana', 'rust', 'web3', 'blockchain', 'smart contracts'],
  ethereum: ['ethereum', 'solidity', 'web3', 'blockchain', 'smart contracts'],
  blockchain: ['blockchain', 'web3', 'cryptography', 'smart contracts', 'ethereum', 'solana'],
  webassembly: ['webassembly', 'wasm', 'rust', 'c++', 'c'],
  wasm: ['webassembly', 'wasm', 'rust', 'c++', 'c'],
};

export function expandSkillToTokens(rawSkill: string): string[] {
  const lower = rawSkill.toLowerCase().trim();
  const tokens = new Set<string>([lower]);

  const parts = lower.split(/[\/&+,]/).map((p) => p.trim()).filter(Boolean);
  for (const p of parts) tokens.add(p);

  // Exact matching for domain pillars to prevent false substring collisions
  for (const [, def] of Object.entries(DOMAIN_PILLARS)) {
    if (def.aliases.some((a) => lower === a)) {
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
  const { direct, expanded } = expandSkillTokens(skills);
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

  // Title search tokens for direct skills (length >= 2, e.g. rust, go, c++, qt, python, react)
  const titleRegexes = direct
    .filter((t) => t.length >= 2)
    .map((t) => new RegExp(escapeRegex(t), 'i'));

  const filter: Record<string, unknown> = {
    $or: [
      { techStack: { $in: expandedRegexes } },
      { topics: { $in: expandedRegexes } },
      ...(titleRegexes.length > 0 ? [{ title: { $in: titleRegexes } }] : []),
    ],
  };

  if (programIds) filter.programId = { $in: programIds };
  if (difficultyRegex) filter.difficulty = difficultyRegex;

  // Fetch candidate pool
  const candidates = await collection
    .find(filter)
    .sort({ year: -1, stars: -1 })
    .limit(limit * 5)
    .toArray();

  if (candidates.length === 0) return [];

  // Score each project specifically based on user requested skills
  const scored = candidates.map((p) => {
    const pTechOriginal = p.techStack || [];
    const pTech = pTechOriginal.map((t) => t.toLowerCase().trim());
    const pTopics = (p.topics || []).map((t) => t.toLowerCase().trim());
    const titleLower = (p.title || '').toLowerCase();

    // Direct and expanded skill matches
    const matchedDirect = direct.filter((s) => pTech.includes(s) || pTopics.includes(s));
    const matchedExpanded = expanded.filter(
      (s) => !matchedDirect.includes(s) && (pTech.includes(s) || pTopics.includes(s))
    );

    let titleHits = 0;
    for (const s of direct) {
      if (s.length >= 2 && titleLower.includes(s)) titleHits++;
    }

    const techCount = Math.max(1, pTech.length);

    // Specificity: rewards projects where user skills are core rather than 1 of 15 tags
    const specificity = matchedDirect.length / Math.min(techCount, 6);
    const coverage = direct.length > 0 ? matchedDirect.length / direct.length : 0.5;

    const yearBonus =
      typeof p.year === 'number'
        ? p.year >= 2024
          ? 12
          : p.year >= 2020
          ? 6
          : 2
        : 2;

    const titleBonus = titleHits * 25;

    const matchScore = coverage * 45 + specificity * 35 + titleBonus + yearBonus;

    // REORDER techStack: matched skills always come first!
    const matchedSet = new Set([...matchedDirect, ...matchedExpanded]);
    const reorderedTech = [
      ...pTechOriginal.filter((t) => matchedSet.has(t.toLowerCase().trim())),
      ...pTechOriginal.filter((t) => !matchedSet.has(t.toLowerCase().trim())),
    ];

    return {
      project: {
        ...p,
        techStack: reorderedTech,
      },
      matchScore,
      year: p.year || 0,
      orgKey: (p.orgSlug || p.org || 'unknown').toLowerCase().trim(),
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore || b.year - a.year);

  // Group by organization to ensure diversity (max 2-3 per org)
  const orgMap = new Map<string, Project[]>();
  for (const item of scored) {
    if (!orgMap.has(item.orgKey)) orgMap.set(item.orgKey, []);
    const list = orgMap.get(item.orgKey)!;
    if (list.length < 3) {
      list.push(item.project);
    }
  }

  const targetPoolSize = Math.max(limit * 2, 80);
  const pool: Project[] = [];

  // Pass 1: Best project from each org
  for (const [, projects] of orgMap) {
    if (projects[0]) pool.push(projects[0]);
    if (pool.length >= targetPoolSize) break;
  }
  // Pass 2: 2nd best project from each org
  if (pool.length < targetPoolSize) {
    for (const [, projects] of orgMap) {
      if (projects[1]) pool.push(projects[1]);
      if (pool.length >= targetPoolSize) break;
    }
  }
  // Pass 3: 3rd project if still needed
  if (pool.length < targetPoolSize) {
    for (const [, projects] of orgMap) {
      if (projects[2]) pool.push(projects[2]);
      if (pool.length >= targetPoolSize) break;
    }
  }

  return pool;
}
