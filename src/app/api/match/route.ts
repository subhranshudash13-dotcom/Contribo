import OpenAI from 'openai';
import { apiError, apiOk, parseJsonBody, isNextResponse, normalizeStringArray } from '@/lib/api';
import { findProjectsBySkills } from '@/lib/repositories/projects';
import { getCollection, COLLECTIONS } from '@/lib/db';
import type { Program, Project } from '@/../types';

const MAX_SKILLS = 40;
const MAX_SKILL_LEN = 48;
const MAX_CANDIDATES = 36;
const TOP_RESULTS = 8;

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

type MatchResult = {
  id?: string;
  title: string;
  orgName: string;
  orgSlug?: string;
  techStack: string[];
  description: string;
  matchPercentage: number;
  reasoning: string;
  programName: string;
  programColor: string;
  programSlug?: string;
  projectId?: string;
  difficulty?: string;
  year?: number;
  matchedSkills?: string[];
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

async function enrichWithPrograms(candidates: Project[]) {
  const programIds = [
    ...new Set(
      candidates
        .map((p) => (p.programId != null ? String(p.programId) : null))
        .filter(Boolean) as string[]
    ),
  ];

  const programsCol = await getCollection<Program>(COLLECTIONS.programs);
  const { ObjectId } = await import('mongodb');
  const oids = programIds
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  const programs =
    oids.length > 0
      ? await programsCol.find({ _id: { $in: oids } } as never).toArray()
      : [];

  const byId = new Map(programs.map((p) => [String(p._id), p]));

  return candidates.map((p) => {
    const prog = p.programId ? byId.get(String(p.programId)) : undefined;
    return {
      ...p,
      programName: prog?.name || p.programName || 'Open Source Program',
      programColor: prog?.accentColor || p.programColor || '#4285F4',
      programSlug: prog?.slug,
    };
  });
}

function skillOverlap(projectSkills: string[], userSkills: string[]) {
  const user = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  const matched: string[] = [];
  const missing: string[] = [];
  for (const raw of projectSkills) {
    const t = String(raw).toLowerCase().trim();
    let hit = user.has(t);
    if (!hit) {
      for (const u of user) {
        if (t.includes(u) || u.includes(t)) {
          hit = true;
          break;
        }
      }
    }
    if (hit) matched.push(raw);
    else missing.push(raw);
  }
  return { matched, missing };
}

function difficultyFit(
  projectDifficulty: string | undefined,
  experience: 'beginner' | 'intermediate' | 'advanced'
): number {
  const d = (projectDifficulty || '').toLowerCase();
  if (!d) return 0.5;
  const isBeginner = d.includes('begin');
  const isAdvanced = d.includes('adv') || d.includes('hard') || d.includes('expert');
  const isIntermediate = !isBeginner && !isAdvanced;

  if (experience === 'beginner') {
    if (isBeginner) return 1;
    if (isIntermediate) return 0.65;
    return 0.25;
  }
  if (experience === 'advanced') {
    if (isAdvanced) return 1;
    if (isIntermediate) return 0.75;
    return 0.45;
  }
  // intermediate
  if (isIntermediate) return 1;
  if (isBeginner) return 0.7;
  return 0.55;
}

function heuristicRank(
  candidates: Array<
    Project & { programName?: string; programColor?: string; programSlug?: string }
  >,
  skills: string[],
  exp: 'beginner' | 'intermediate' | 'advanced',
  availNum: number
): MatchResult[] {
  const scored = candidates.map((p) => {
    const projectSkills = p.techStack || [];
    const { matched, missing } = skillOverlap(projectSkills, skills);

    const ratio =
      projectSkills.length > 0 ? matched.length / projectSkills.length : 0.35;
    const countScore = Math.min(matched.length, 6) / 6;
    const diffScore = difficultyFit(p.difficulty, exp);
    const yearScore =
      typeof p.year === 'number' ? Math.min(1, Math.max(0, (p.year - 2018) / 8)) : 0.4;
    // light availability signal: longer projects favor higher weekly hours
    const availScore = availNum >= 20 ? 0.7 : availNum >= 15 ? 0.55 : 0.4;

    const raw =
      ratio * 0.42 + countScore * 0.28 + diffScore * 0.18 + yearScore * 0.08 + availScore * 0.04;

    // Honest band: ~35–96 based on real overlap (no floor of 72 for weak matches)
    const matchPercentage = Math.round(
      Math.min(96, Math.max(28, 28 + raw * 68 + Math.min(matched.length, 4) * 2))
    );

    let reasoning = '';
    if (matched.length > 0) {
      reasoning += `Matched ${matched.length} skill${matched.length === 1 ? '' : 's'}: ${matched
        .slice(0, 4)
        .join(', ')}. `;
    } else {
      reasoning += `Limited direct skill overlap — considered related stack terms. `;
    }
    if (missing.length > 0) {
      reasoning += `Growth areas: ${missing.slice(0, 3).join(', ')}. `;
    }
    if (p.difficulty) {
      reasoning += `Difficulty (${p.difficulty}) fits a ${exp} contributor profile. `;
    }
    if (p.year) {
      reasoning += `Listed for ${p.year}.`;
    }

    return {
      id: p._id?.toString(),
      projectId: p._id?.toString(),
      title: p.title,
      orgName: p.org,
      orgSlug: p.orgSlug,
      techStack: projectSkills,
      description: p.description,
      matchPercentage,
      reasoning: reasoning.trim(),
      programName: p.programName || 'Open Source Program',
      programColor: p.programColor || '#4285F4',
      programSlug: p.programSlug,
      difficulty: p.difficulty,
      year: p.year,
      matchedSkills: matched.slice(0, 8),
      _score: raw * 100 + matched.length * 5 + (p.year || 0) * 0.01,
    };
  });

  return scored
    .sort((a, b) => b._score - a._score || b.matchPercentage - a.matchPercentage)
    .slice(0, TOP_RESULTS)
    .map(({ _score: _s, ...rest }) => rest);
}

function clampMatchPercentage(n: unknown, fallback: number): number {
  const v = typeof n === 'number' ? n : parseInt(String(n), 10);
  if (Number.isNaN(v)) return fallback;
  return Math.min(96, Math.max(20, Math.round(v)));
}

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody(req);
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

    const difficulty =
      typeof body.difficulty === 'string' ? body.difficulty.trim().slice(0, 40) : null;

    const rawCandidates = await findProjectsBySkills(skills, MAX_CANDIDATES, {
      preferRecentYears: true,
      difficulty,
    });
    if (rawCandidates.length === 0) {
      return apiOk({ matches: [], meta: { candidateCount: 0, mode: 'none' } });
    }

    const candidates = await enrichWithPrograms(rawCandidates);
    const heuristic = heuristicRank(candidates, skills, exp, availNum);

    let finalMatches: MatchResult[] = heuristic;
    let mode: 'openai' | 'heuristic' = 'heuristic';
    const openai = getOpenAIClient();

    if (openai && candidates.length > 0) {
      try {
        // Pass only top pool by heuristic to keep tokens small & ranking grounded
        const pool = candidates
          .map((p, index) => ({ p, index }))
          .sort((a, b) => {
            const ha = heuristic.find((h) => h.projectId === String(a.p._id));
            const hb = heuristic.find((h) => h.projectId === String(b.p._id));
            return (hb?.matchPercentage || 0) - (ha?.matchPercentage || 0);
          })
          .slice(0, 18);

        const projectsContext = pool.map(({ p, index }) => {
          const { matched } = skillOverlap(p.techStack || [], skills);
          return {
            id: index,
            title: p.title,
            org: p.org,
            difficulty: p.difficulty || 'unknown',
            year: p.year,
            techStack: (p.techStack || []).slice(0, 12).join(', '),
            matchedSkills: matched.slice(0, 6).join(', '),
            description: (p.description || '').substring(0, 220),
            programName: p.programName,
          };
        });

        const systemPrompt = `You are an expert open-source mentorship matchmaker.
Rank ONLY from the candidate list. Never invent projects, orgs, or technologies.

User:
- Skills: ${skills.join(', ')}
- Experience: ${exp}
- Location: ${locStr}
- Availability: ${availNum} hours/week

Candidates (JSON):
${JSON.stringify(projectsContext)}

Rules:
1. Return up to ${TOP_RESULTS} best fits ordered best-first.
2. Prefer higher matchedSkills count and recent year.
3. Prefer difficulty aligned with experience (${exp}).
4. Align weekly availability (${availNum}h/week) with expected workload:
   - If availability is low (< 20 hours/week), favor "Beginner" difficulty projects or programs like Hacktoberfest, NSoC, GSSoC.
   - If availability is high (>= 20 hours/week), intermediate and advanced projects or programs like GSoC, Outreachy, LFX, MLH Fellowship are highly suitable.
5. matchPercentage must reflect real overlap (weak overlap ≤55; strong multi-skill ≥75; never 100).
6. reasoning: 1–2 sentences, concrete, mention matched skills and how they fit user experience/availability.
7. Return ONLY JSON: { "matches": [ { "id": number, "matchPercentage": number, "reasoning": string } ] }
`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 900,
        });

        const aiResponseText = completion.choices[0].message.content || '{"matches":[]}';
        const parsedAI = JSON.parse(aiResponseText) as {
          matches?: Array<{ id: number; matchPercentage: number; reasoning: string }>;
        };

        const aiMapped = (parsedAI.matches || [])
          .map((match) => {
            const entry = pool.find((x) => x.index === match.id);
            const dbProject = entry?.p;
            if (!dbProject) return null;
            const { matched } = skillOverlap(dbProject.techStack || [], skills);
            const base = heuristic.find((h) => h.projectId === String(dbProject._id));
            // Blend AI % with heuristic so inflated AI scores get grounded
            const heuristicPct = base?.matchPercentage ?? 50;
            const aiPct = clampMatchPercentage(match.matchPercentage, heuristicPct);
            const blended = Math.round(aiPct * 0.55 + heuristicPct * 0.45);

            return {
              id: dbProject._id?.toString(),
              projectId: dbProject._id?.toString(),
              title: dbProject.title,
              orgName: dbProject.org,
              orgSlug: dbProject.orgSlug,
              techStack: dbProject.techStack || [],
              description: dbProject.description,
              matchPercentage: clampMatchPercentage(blended, heuristicPct),
              reasoning:
                typeof match.reasoning === 'string' && match.reasoning.trim()
                  ? match.reasoning.trim().slice(0, 600)
                  : base?.reasoning || 'Strong skill alignment with your profile.',
              programName: dbProject.programName || 'Open Source Program',
              programColor: dbProject.programColor || '#4285F4',
              programSlug: dbProject.programSlug,
              difficulty: dbProject.difficulty,
              year: dbProject.year,
              matchedSkills: matched.slice(0, 8),
            } as MatchResult;
          })
          .filter(Boolean) as MatchResult[];

        if (aiMapped.length > 0) {
          finalMatches = aiMapped.slice(0, TOP_RESULTS);
          mode = 'openai';
        }
      } catch (apiErr) {
        console.warn('OpenAI matcher failed, using heuristic:', apiErr);
        finalMatches = heuristic;
        mode = 'heuristic';
      }
    }

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
    console.error('Matcher Error:', error);
    return apiError('Failed to run AI Matcher', 500);
  }
}
