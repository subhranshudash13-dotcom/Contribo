import OpenAI from 'openai';
import {
  apiError,
  apiOk,
  parseMutationBody,
  isNextResponse,
  normalizeStringArray,
} from '@/lib/api';
import { expandSkillTokens } from '@/lib/repositories/projects';
import { findOrganizationsBySkills } from '@/lib/repositories/organizations';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { MAX_AI_BODY_BYTES, safeLogError } from '@/lib/security';
import { rankOrganizationsWithGemini, type GeminiOrgCandidate } from '@/lib/ai/gemini';
import {
  tokenizeText,
  buildIdfMap,
  computeJaccardSimilarity,
  computeTextCosineSimilarity,
  inferOrgComplexity,
  computeExperienceSuitability,
  computeAvailabilityScore,
  calculateHybridMatchScore,
} from '@/lib/ai/semantic-matcher';
import type { Program, Organization, Project } from '@/../types';

const MAX_SKILLS = 40;
const MAX_SKILL_LEN = 48;
const MAX_CANDIDATES = 75;
const TOP_RESULTS = 24;

/** Skip OpenAI for a cool-down after auth/quota failures so heuristic stays fast. */
let openAiDisabledUntil = 0;

function getOpenAIClient() {
  if (Date.now() < openAiDisabledUntil) return null;
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || key.length < 20) return null;
  return new OpenAI({ apiKey: key, timeout: 6000, maxRetries: 0 });
}

function disableOpenAITemporarily(ms = 15 * 60_000) {
  openAiDisabledUntil = Date.now() + ms;
}

export type OrgMatchResult = {
  id: string;
  name: string;
  slug: string;
  orgName: string;
  orgSlug: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  techStack: string[];
  matchedSkills: string[];
  matchPercentage: number;
  reasoning: string;
  years: number[];
  latestYear: number;
  projectCount: number;
  websiteUrl?: string;
  githubUrl?: string;
  ideasUrl?: string;
  orgLogoUrl?: string;
  orgWebsiteUrl?: string;
  orgGithubUrl?: string;
  orgCategory?: string;
  orgDescription?: string;
  orgIdeasUrl?: string;
  orgTopics?: string[];
  programName: string;
  programColor: string;
  programSlug?: string;
  exploreProjectsUrl: string;
  yearlyStats?: Array<{ year: number; count: number }>;
  stars?: number;
};

type EnrichedOrganization = Organization & {
  programName?: string;
  programColor?: string;
  programSlug?: string;
  yearlyStats?: Array<{ year: number; count: number }>;
  resolvedGithubUrl?: string;
  resolvedWebsiteUrl?: string;
};

function normalizeSkills(input: unknown): string[] | null {
  const cleaned = normalizeStringArray(input, {
    maxItems: MAX_SKILLS,
    maxItemLen: MAX_SKILL_LEN,
  });
  if (!cleaned || cleaned.length === 0) return null;
  return cleaned;
}

function normalizeExperience(value: unknown): 'beginner' | 'intermediate' | 'advanced' {
  const s = typeof value === 'string' ? value.toLowerCase().trim() : '';
  if (s.startsWith('begin')) return 'beginner';
  if (s.startsWith('adv')) return 'advanced';
  return 'intermediate';
}

const KNOWN_ORG_WEBSITES: Record<string, string> = {
  'rocket-chat': 'https://rocket.chat',
  'rocketchat': 'https://rocket.chat',
  'apache': 'https://apache.org',
  'python': 'https://python.org',
  'kde': 'https://kde.org',
  'gnome': 'https://gnome.org',
  'mozilla': 'https://mozilla.org',
  'wikimedia': 'https://wikimediafoundation.org',
  'tor': 'https://torproject.org',
  'homebrew': 'https://brew.sh',
  'bioconductor': 'https://bioconductor.org',
  'creative-commons': 'https://creativecommons.org',
  'debian': 'https://debian.org',
  'rust': 'https://www.rust-lang.org',
  'cncf': 'https://cncf.io',
  'open-robotics': 'https://www.openrobotics.org',
  'opencv': 'https://opencv.org',
  'numfocus': 'https://numfocus.org',
  'jupyter': 'https://jupyter.org',
  'videolan': 'https://videolan.org',
  'hyperledger': 'https://hyperledger.org',
  'huggingface': 'https://huggingface.co',
  'appwrite': 'https://appwrite.io',
  'novu': 'https://novu.co',
  'supabase': 'https://supabase.com',
  'cal.com': 'https://cal.com',
  'strapi': 'https://strapi.io',
  'posthog': 'https://posthog.com',
  'hoppscotch': 'https://hoppscotch.io',
  'girlscript': 'https://girlscript.tech',
  'nsoc': 'https://nsoc.in',
  '52north': 'https://52north.org',
  'joplin': 'https://joplinapp.org',
};

async function enrichOrganizations(orgs: Organization[]): Promise<EnrichedOrganization[]> {
  const programIds = [
    ...new Set(
      orgs
        .map((o) => (o.programId != null ? String(o.programId) : null))
        .filter(Boolean) as string[]
    ),
  ];
  const orgSlugs = orgs.map((o) => o.slug).filter(Boolean);

  const { ObjectId } = await import('mongodb');
  const programsCol = await getCollection<Program>(COLLECTIONS.programs);
  const projectsCol = await getCollection<Project>(COLLECTIONS.projects);

  const oids = programIds
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  const [programs, yearlyAgg] = await Promise.all([
    oids.length > 0
      ? programsCol.find({ _id: { $in: oids } } as never).toArray()
      : [],
    orgSlugs.length > 0
      ? projectsCol
          .aggregate<{ _id: { orgSlug: string; year: number }; count: number }>([
            { $match: { orgSlug: { $in: orgSlugs } } },
            { $group: { _id: { orgSlug: '$orgSlug', year: '$year' }, count: { $sum: 1 } } },
          ])
          .toArray()
      : Promise.resolve([]),
  ]);

  const progById = new Map(programs.map((p) => [String(p._id), p]));
  const countByOrgAndYear = new Map<string, Map<number, number>>();

  for (const row of yearlyAgg) {
    if (row._id?.orgSlug && row._id.year) {
      const slug = row._id.orgSlug.toLowerCase();
      if (!countByOrgAndYear.has(slug)) {
        countByOrgAndYear.set(slug, new Map());
      }
      countByOrgAndYear.get(slug)!.set(row._id.year, row.count);
    }
  }

  return orgs.map((org) => {
    const prog = org.programId ? progById.get(String(org.programId)) : undefined;
    const slugKey = (org.slug || org.name || '').toLowerCase().trim();

    let websiteUrl = typeof org.websiteUrl === 'string' && org.websiteUrl.trim().length > 0
      ? org.websiteUrl.trim()
      : undefined;

    if (!websiteUrl) {
      websiteUrl = KNOWN_ORG_WEBSITES[slugKey] || KNOWN_ORG_WEBSITES[slugKey.replace(/[\s\-_.]/g, '')];
    }

    let resolvedGithubUrl = '';
    if (websiteUrl && /github\.com\/[a-zA-Z0-9_.-]+\/?$/i.test(websiteUrl)) {
      resolvedGithubUrl = websiteUrl;
    } else if (org.slug) {
      const slugCandidate = org.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      resolvedGithubUrl = `https://github.com/${slugCandidate}`;
    }

    if (!websiteUrl) {
      websiteUrl = resolvedGithubUrl || `https://${slugKey.replace(/[^a-z0-9]/g, '')}.org`;
    }

    const orgCounts = countByOrgAndYear.get(slugKey) || new Map<number, number>();
    const orgYears = Array.isArray(org.years) ? (org.years as number[]) : [];

    const yearSet = new Set<number>([
      ...orgYears,
      ...Array.from(orgCounts.keys()),
    ]);

    const sortedYears = Array.from(yearSet).filter((y) => y >= 2017 && y <= 2026).sort((a, b) => a - b);
    const yearlyStats: Array<{ year: number; count: number }> = [];

    // Strictly real data from MongoDB project aggregations — zero pseudo-random or seeded placeholders
    for (const y of sortedYears) {
      const directCount = orgCounts.get(y);
      if (typeof directCount === 'number' && directCount > 0) {
        yearlyStats.push({ year: y, count: directCount });
      }
    }

    return {
      ...org,
      programName: prog?.name || 'Google Summer of Code',
      programColor: prog?.accentColor || '#4285F4',
      programSlug: prog?.slug || 'gsoc',
      resolvedWebsiteUrl: websiteUrl,
      resolvedGithubUrl,
      yearlyStats,
    };
  });
}

function normalizeToken(token: string): string {
  return token.toLowerCase().trim().replace(/[\s\-_.]/g, '');
}

function addTagToMap(raw: string, map: Map<string, string>) {
  if (!raw) return;
  const trimmed = raw.trim();
  if (!trimmed) return;
  map.set(normalizeToken(trimmed), trimmed);
  const parts = trimmed.split(/[\/,]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    for (const p of parts) {
      map.set(normalizeToken(p), p);
    }
  }
}

function orgSkillOverlap(
  org: EnrichedOrganization,
  userSkills: string[]
) {
  const { requirements } = expandSkillTokens(userSkills);
  const orgTech = org.technologies || [];
  const orgTopics = org.topics || [];

  const orgTechMap = new Map<string, string>();
  for (const ot of orgTech) addTagToMap(ot, orgTechMap);

  const orgTopicMap = new Map<string, string>();
  for (const top of orgTopics) addTagToMap(top, orgTopicMap);

  const matchedSkillsSet = new Set<string>();
  let satisfiedReqCount = 0;

  for (const req of requirements) {
    let reqHit = false;
    for (const token of req.tokens) {
      const normToken = normalizeToken(token);
      if (!normToken) continue;

      if (orgTechMap.has(normToken)) {
        reqHit = true;
        matchedSkillsSet.add(orgTechMap.get(normToken)!);
      } else if (orgTopicMap.has(normToken)) {
        reqHit = true;
        matchedSkillsSet.add(orgTopicMap.get(normToken)!);
      }
    }
    if (reqHit) {
      satisfiedReqCount++;
    }
  }

  return {
    matched: Array.from(matchedSkillsSet),
    matchedUserSkillCount: satisfiedReqCount,
    totalUserSkills: userSkills.length,
  };
}

function orderWithGsocPriority(matches: OrgMatchResult[], targetGsocCount = 6): OrgMatchResult[] {
  const isGsocOrg = (m: OrgMatchResult) => {
    const slug = (m.programSlug || '').toLowerCase().trim();
    const name = (m.programName || '').toLowerCase().trim();
    return slug === 'gsoc' || name.includes('summer of code') || name.includes('gsoc');
  };

  const gsocOrgs = matches.filter(isGsocOrg);
  const otherOrgs = matches.filter((m) => !isGsocOrg(m));

  // If there are no other programs or no GSoC orgs, keep order as-is
  if (otherOrgs.length === 0 || gsocOrgs.length === 0) {
    return matches;
  }

  // Put first 5-6 orgs from GSoC, followed by orgs from other programs, then remaining GSoC orgs
  const topGsoc = gsocOrgs.slice(0, targetGsocCount);
  const remainingGsoc = gsocOrgs.slice(targetGsocCount);

  return [...topGsoc, ...otherOrgs, ...remainingGsoc];
}

function heuristicRankOrganizations(
  candidates: EnrichedOrganization[],
  skills: string[],
  exp: 'beginner' | 'intermediate' | 'advanced',
  availNum: number
): OrgMatchResult[] {
  if (candidates.length === 0) return [];

  // 1. Pre-compute text tokens & IDF map across all candidate descriptions & metadata (< 2ms)
  const candidateDocTokens = candidates.map((org) => {
    const textCorpus = [
      org.name,
      org.category || '',
      org.description || '',
      ...(org.topics || []),
      ...(org.technologies || []),
    ].join(' ');
    return tokenizeText(textCorpus);
  });

  const idfMap = buildIdfMap(candidateDocTokens);
  const queryTokens = tokenizeText(skills.join(' '));
  const normalizedUserSkills = new Set(skills.map((s) => s.toLowerCase().trim()));
  const availScore = computeAvailabilityScore(availNum);

  const scored = candidates
    .map((org, idx) => {
      const orgTech = org.technologies || [];
      const { matched, matchedUserSkillCount, totalUserSkills } = orgSkillOverlap(org, skills);

      // Compute exact Jaccard similarity coefficient: J(U, O) = |U ∩ O| / |U ∪ O|
      const normalizedOrgTech = new Set(orgTech.map((t) => t.toLowerCase().trim()));
      const jaccard = computeJaccardSimilarity(normalizedUserSkills, normalizedOrgTech);

      // Compute sublinear TF-IDF vector cosine similarity over organization description & topics
      const docTokens = candidateDocTokens[idx];
      const textSimilarity = computeTextCosineSimilarity(queryTokens, docTokens, idfMap);

      // STRICT GROUNDING: Must have at least 1 verified skill match or significant semantic description similarity
      if (totalUserSkills > 0 && matchedUserSkillCount === 0 && textSimilarity < 0.08) {
        return null;
      }

      const years = Array.isArray(org.years) ? org.years : [2026];
      const latestYear = years.length > 0 ? Math.max(...years) : 2026;
      const is2026 = Boolean(org.is2026 || latestYear === 2026);

      // Continuous Gaussian suitability curve aligning contributor experience with org complexity
      const orgComplexity = inferOrgComplexity(org.category, org.topics, orgTech);
      const expSuitability = computeExperienceSuitability(exp, orgComplexity);

      // Multi-factor hybrid score calculation (guaranteed range [15, 96])
      const { matchPercentage, compositeScore } = calculateHybridMatchScore({
        matchedUserSkillsCount: matchedUserSkillCount,
        totalUserSkills,
        jaccardSimilarity: jaccard,
        tfidfTextSimilarity: textSimilarity,
        experienceSuitability: expSuitability,
        availabilityScore: availScore,
        latestYear,
        is2026,
      });

      // Grounded, personalized rationale highlighting verified skills & domain focus
      const matchedDisplay = matched.length > 0 ? matched.slice(0, 4).join(', ') : orgTech.slice(0, 3).join(', ');
      let reasoning = `Verified stack match with ${matchedDisplay}.`;
      if (org.category) {
        reasoning += ` Specializes in ${org.category}.`;
      }
      if (expSuitability >= 0.75) {
        const expTone =
          exp === 'beginner'
            ? 'Approachable project scope suited for beginner contributors.'
            : exp === 'advanced'
              ? 'Architecture complexity matches advanced contributor background.'
              : 'Well-aligned for intermediate contributors.';
        reasoning += ` ${expTone}`;
      }
      if (latestYear >= 2025) {
        reasoning += ` Active participant in ${latestYear}.`;
      }

      const exploreProjectsUrl = `/organizations/${org.slug || encodeURIComponent(org.name)}`;
      const totalRecordedProjects = org.yearlyStats?.reduce((acc, s) => acc + s.count, 0) || 0;

      const score =
        compositeScore * 100 +
        matchedUserSkillCount * 25 +
        jaccard * 20 +
        textSimilarity * 15 +
        (is2026 ? 10 : 0);

      return {
        id: String(org._id || org.slug),
        name: org.name,
        slug: org.slug,
        orgName: org.name,
        orgSlug: org.slug,
        title: org.name,
        category: org.category || 'Open Source',
        description: org.description || `Leading open-source organization in ${org.category || 'technology'}.`,
        technologies: orgTech,
        techStack: orgTech,
        matchedSkills: matched.slice(0, 8),
        matchPercentage,
        reasoning: reasoning.trim(),
        years,
        latestYear,
        projectCount: org.projectCount || (totalRecordedProjects > 0 ? totalRecordedProjects : 0),
        websiteUrl: org.resolvedWebsiteUrl,
        githubUrl: org.resolvedGithubUrl,
        ideasUrl: org.ideasUrl,
        orgLogoUrl: org.logoUrl,
        orgWebsiteUrl: org.resolvedWebsiteUrl,
        orgGithubUrl: org.resolvedGithubUrl,
        orgCategory: org.category,
        orgDescription: org.description,
        orgIdeasUrl: org.ideasUrl,
        orgTopics: org.topics,
        programName: org.programName || 'Google Summer of Code',
        programColor: org.programColor || '#4285F4',
        programSlug: org.programSlug || 'gsoc',
        exploreProjectsUrl,
        yearlyStats: org.yearlyStats,
        _score: score,
      };
    })
    .filter(Boolean) as (OrgMatchResult & { _score: number })[];

  const sorted = scored
    .sort((a, b) => b._score - a._score || b.matchPercentage - a.matchPercentage)
    .map((item) => {
      const rest = { ...item };
      delete (rest as { _score?: number })._score;
      return rest as OrgMatchResult;
    });

  const prioritized = orderWithGsocPriority(sorted, 6);
  return prioritized.slice(0, TOP_RESULTS);
}

function clampMatchPercentage(n: unknown, fallback: number): number {
  const v = typeof n === 'number' ? n : parseInt(String(n), 10);
  if (Number.isNaN(v)) return fallback;
  return Math.min(96, Math.max(15, Math.round(v)));
}

export async function POST(req: Request) {
  try {
    const body = await parseMutationBody(req, { maxBytes: MAX_AI_BODY_BYTES });
    if (isNextResponse(body)) return body;

    const skills = normalizeSkills(body.skills);
    if (!skills) {
      return apiError('Skills must be a non-empty array of strings (max 40)', 400);
    }

    const exp = normalizeExperience(body.experience);
    const locStr =
      typeof body.location === 'string' ? body.location.slice(0, 64) : 'Remote';
    const availNum = Math.min(
      60,
      Math.max(
        1,
        typeof body.availability === 'number'
          ? body.availability
          : parseInt(String(body.availability ?? '10'), 10) || 10
      )
    );

    const rawProgramSlugs = normalizeStringArray(body.programSlugs || body.programs, {
      maxItems: 12,
      maxItemLen: 48,
    });
    const programSlugs =
      rawProgramSlugs && rawProgramSlugs.length > 0
        ? rawProgramSlugs.filter((s) => s.toLowerCase() !== 'all')
        : null;

    const rawCandidates = await findOrganizationsBySkills(skills, MAX_CANDIDATES, {
      programSlugs: programSlugs && programSlugs.length > 0 ? programSlugs : undefined,
    });

    if (rawCandidates.length === 0) {
      return apiOk({ matches: [], meta: { candidateCount: 0, mode: 'none', requestedProgramSlugs: programSlugs || [] } });
    }

    const candidates = await enrichOrganizations(rawCandidates);
    const heuristic = heuristicRankOrganizations(candidates, skills, exp, availNum);

    if (heuristic.length === 0) {
      return apiOk({ matches: [], meta: { candidateCount: 0, mode: 'none', requestedProgramSlugs: programSlugs || [] } });
    }

    let finalMatches: OrgMatchResult[] = heuristic;
    let mode: 'openai' | 'gemini' | 'heuristic' = 'heuristic';

    // Strictly pass verified heuristic matches to AI — never send zero-skill orgs to LLMs
    const pool = heuristic
      .map((h, index) => {
        const org = candidates.find((c) => c.slug === h.slug);
        return org ? { org, index } : null;
      })
      .filter((item): item is { org: EnrichedOrganization; index: number } => item !== null)
      .slice(0, 30);

    const orgsContext: GeminiOrgCandidate[] = pool.map(({ org, index }) => {
      const { matched } = orgSkillOverlap(org, skills);
      const years = Array.isArray(org.years) ? org.years.join(', ') : '2026';
      return {
        id: index,
        name: org.name,
        category: org.category,
        technologies: (org.technologies || []).slice(0, 12).join(', '),
        matchedSkills: matched.slice(0, 6).join(', '),
        description: (org.description || '').substring(0, 220),
        years,
        projectCount: org.projectCount,
        programName: org.programName,
      };
    });

    const activeProvider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();
    let aiSuccess = false;

    // 1. Try Google Gemini (Primary Orbit AI Recommendation Engine)
    if (activeProvider !== 'openai' && process.env.GEMINI_API_KEY && pool.length > 0) {
      try {
        const geminiMatches = await rankOrganizationsWithGemini({
          skills,
          experience: exp,
          location: locStr,
          availability: availNum,
          candidates: orgsContext,
          topLimit: TOP_RESULTS,
        });

        if (geminiMatches && geminiMatches.length > 0) {
          const mapped = geminiMatches
            .map((match) => {
              const entry = pool.find((x) => x.index === match.id);
              const dbOrg = entry?.org;
              if (!dbOrg) return null;
              const { matched, matchedUserSkillCount } = orgSkillOverlap(dbOrg, skills);
              if (matchedUserSkillCount === 0 || matched.length === 0) return null;

              const base = heuristic.find((h) => h.slug === dbOrg.slug);
              const heuristicPct = base?.matchPercentage ?? 55;
              const aiPct = clampMatchPercentage(match.matchPercentage, heuristicPct);
              const blended = Math.round(aiPct * 0.60 + heuristicPct * 0.40);

              return {
                id: String(dbOrg._id || dbOrg.slug),
                name: dbOrg.name,
                slug: dbOrg.slug,
                orgName: dbOrg.name,
                orgSlug: dbOrg.slug,
                title: dbOrg.name,
                category: dbOrg.category || 'Open Source',
                description: dbOrg.description || `Leading open-source organization in ${dbOrg.category || 'technology'}.`,
                technologies: dbOrg.technologies || [],
                techStack: dbOrg.technologies || [],
                matchedSkills: matched.slice(0, 8),
                matchPercentage: clampMatchPercentage(blended, heuristicPct),
                reasoning:
                  typeof match.reasoning === 'string' && match.reasoning.trim()
                    ? match.reasoning.trim().slice(0, 600)
                    : base?.reasoning || `Ideal skill match for ${skills.join(', ')} with ${dbOrg.name}.`,
                years: Array.isArray(dbOrg.years) ? dbOrg.years : [2026],
                latestYear: dbOrg.years?.length ? Math.max(...dbOrg.years) : 2026,
                projectCount:
                  dbOrg.projectCount ||
                  (dbOrg.yearlyStats?.reduce((acc, s) => acc + s.count, 0) || 0),
                websiteUrl: dbOrg.resolvedWebsiteUrl,
                githubUrl: dbOrg.resolvedGithubUrl,
                ideasUrl: dbOrg.ideasUrl,
                orgLogoUrl: dbOrg.logoUrl,
                orgWebsiteUrl: dbOrg.resolvedWebsiteUrl,
                orgGithubUrl: dbOrg.resolvedGithubUrl,
                orgCategory: dbOrg.category,
                orgDescription: dbOrg.description,
                orgIdeasUrl: dbOrg.ideasUrl,
                orgTopics: dbOrg.topics,
                programName: dbOrg.programName || 'Google Summer of Code',
                programColor: dbOrg.programColor || '#4285F4',
                programSlug: dbOrg.programSlug || 'gsoc',
                exploreProjectsUrl: `/organizations/${dbOrg.slug || encodeURIComponent(dbOrg.name)}`,
                yearlyStats: dbOrg.yearlyStats,
              } as OrgMatchResult;
            })
            .filter(Boolean) as OrgMatchResult[];

          if (mapped.length > 0) {
            finalMatches = mapped;
            mode = 'gemini';
            aiSuccess = true;
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini matcher call failed, trying fallback:', geminiErr);
      }
    }

    // 2. Try OpenAI if Gemini was not used or failed
    if (!aiSuccess && pool.length > 0) {
      const openai = getOpenAIClient();
      if (openai) {
        try {
          const systemPrompt = `You are Orbit AI, an expert open-source mentorship matchmaker and organization recommendation engine.
Rank ONLY from the candidate organizations list. Never invent organizations or technologies.

User Profile:
- Skills: ${skills.join(', ')}
- Experience: ${exp}
- Location: ${locStr}
- Availability: ${availNum} hours/week

Candidates (JSON):
${JSON.stringify(orgsContext)}

Rules:
1. Return up to ${TOP_RESULTS} best fits ordered best-first.
2. Strictly prioritize organizations where the user's requested skills (${skills.join(', ')}) are central to their ecosystem.
3. matchPercentage must reflect real overlap (weak overlap ≤55; strong multi-skill ≥75; never 100).
4. reasoning: 1–2 sentences, concrete, mention matched skills and how this org fits the contributor profile.
6. Program Prioritization: Place the first 5–6 best-matching Google Summer of Code (GSoC) organizations first, followed by top-matching organizations from other programs (e.g. LFX Mentorship, Outreachy, Summer of Bitcoin).
7. Return ONLY JSON: { "matches": [ { "id": number, "matchPercentage": number, "reasoning": string } ] }
`;

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 2400,
          });

          const aiResponseText = completion.choices[0].message.content || '{"matches":[]}';
          const parsedAI = JSON.parse(aiResponseText) as {
            matches?: Array<{ id: number; matchPercentage: number; reasoning: string }>;
          };

          const aiMapped = (parsedAI.matches || [])
            .map((match) => {
              const entry = pool.find((x) => x.index === match.id);
              const dbOrg = entry?.org;
              if (!dbOrg) return null;
              const { matched, matchedUserSkillCount } = orgSkillOverlap(dbOrg, skills);
              if (matchedUserSkillCount === 0 || matched.length === 0) return null;

              const base = heuristic.find((h) => h.slug === dbOrg.slug);
              const heuristicPct = base?.matchPercentage ?? 50;
              const aiPct = clampMatchPercentage(match.matchPercentage, heuristicPct);
              const blended = Math.round(aiPct * 0.55 + heuristicPct * 0.45);

              return {
                id: String(dbOrg._id || dbOrg.slug),
                name: dbOrg.name,
                slug: dbOrg.slug,
                orgName: dbOrg.name,
                orgSlug: dbOrg.slug,
                title: dbOrg.name,
                category: dbOrg.category || 'Open Source',
                description: dbOrg.description || `Leading open-source organization in ${dbOrg.category || 'technology'}.`,
                technologies: dbOrg.technologies || [],
                techStack: dbOrg.technologies || [],
                matchedSkills: matched.slice(0, 8),
                matchPercentage: clampMatchPercentage(blended, heuristicPct),
                reasoning:
                  typeof match.reasoning === 'string' && match.reasoning.trim()
                    ? match.reasoning.trim().slice(0, 600)
                    : base?.reasoning || 'Strong stack alignment with your developer profile.',
                years: Array.isArray(dbOrg.years) ? dbOrg.years : [2026],
                latestYear: dbOrg.years?.length ? Math.max(...dbOrg.years) : 2026,
                projectCount:
                  dbOrg.projectCount ||
                  (dbOrg.yearlyStats?.reduce((acc, s) => acc + s.count, 0) || 0),
                websiteUrl: dbOrg.resolvedWebsiteUrl,
                githubUrl: dbOrg.resolvedGithubUrl,
                ideasUrl: dbOrg.ideasUrl,
                orgLogoUrl: dbOrg.logoUrl,
                orgWebsiteUrl: dbOrg.resolvedWebsiteUrl,
                orgGithubUrl: dbOrg.resolvedGithubUrl,
                orgCategory: dbOrg.category,
                orgDescription: dbOrg.description,
                orgIdeasUrl: dbOrg.ideasUrl,
                orgTopics: dbOrg.topics,
                programName: dbOrg.programName || 'Google Summer of Code',
                programColor: dbOrg.programColor || '#4285F4',
                programSlug: dbOrg.programSlug || 'gsoc',
                exploreProjectsUrl: `/organizations/${dbOrg.slug || encodeURIComponent(dbOrg.name)}`,
                yearlyStats: dbOrg.yearlyStats,
              } as OrgMatchResult;
            })
            .filter(Boolean) as OrgMatchResult[];

          if (aiMapped.length > 0) {
            finalMatches = aiMapped;
            mode = 'openai';
            aiSuccess = true;
          }
        } catch (apiErr) {
          const status =
            apiErr && typeof apiErr === 'object' && 'status' in apiErr
              ? Number((apiErr as { status?: number }).status)
              : 0;
          if (status === 401 || status === 403 || status === 429) {
            disableOpenAITemporarily(status === 429 ? 5 * 60_000 : 30 * 60_000);
          }
        }
      }
    }

    finalMatches = finalMatches.filter((m) => m.matchedSkills && m.matchedSkills.length > 0);
    finalMatches = orderWithGsocPriority(finalMatches, 6);
    if (finalMatches.length === 0) {
      finalMatches = heuristic;
      mode = 'heuristic';
    }

    return apiOk({
      matches: finalMatches,
      meta: {
        candidateCount: candidates.length,
        resultCount: finalMatches.length,
        mode,
      },
    });
  } catch (error) {
    safeLogError('Matcher Error:', error);
    return apiError('Failed to run AI Matcher', 500);
  }
}
