/**
 * Google Gemini AI Client for Contribo & Proposal Studio
 * API key is never logged — passed only via x-goog-api-key header.
 */

import { safeLogError } from '@/lib/security';

export type GeminiImproveResult = {
  text: string;
  rationale: string;
};

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-1.5-flash',
] as const;

export interface GeminiMatchItem {
  id: number;
  matchPercentage: number;
  reasoning: string;
}

export interface GeminiOrgCandidate {
  id: number;
  name: string;
  category?: string;
  technologies: string;
  matchedSkills: string;
  description: string;
  years?: string;
  projectCount?: number;
  programName?: string;
}

export async function rankOrganizationsWithGemini(params: {
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  location: string;
  availability: number;
  candidates: GeminiOrgCandidate[];
  topLimit?: number;
}): Promise<GeminiMatchItem[] | null> {
  const topLimit = params.topLimit || 24;
  const systemInstruction = `You are Orbit AI, an expert open-source mentorship matchmaker and organization recommendation engine.
Your mission is to evaluate, rank, and recommend open-source organizations to contributors based on their skills (${params.skills.join(', ')}), experience level (${params.experience}), and weekly availability (${params.availability}h/week).

STRICT GROUNDING & ACCURACY RULES:
1. Technical & Practical Alignment: You MUST only consider the technologies and matched skills explicitly provided in each candidate's data. Do NOT hallucinate, infer, or assume technologies that are not listed in the candidate record.
2. Experience Level Suitability: For beginners, highlight supportive organizations with introductory subprojects and established mentorship. For advanced contributors, highlight deep-architecture and specialized domain organizations.
3. Realistic Match Percentage: Produce a realistic match score from 25 to 96 (never 100). Higher scores (85-96%) require high direct skill overlap. Partial overlap should be scored proportionally (40-70%). Never award high scores to candidates without strong skill alignment.
4. Grounded Personalized Rationale: 1–2 sentences explaining specifically why this Organization is an ideal match for their skill profile. Mention ONLY specific matched technologies from their candidate record. Never invent tech stacks or tools.
5. Strictly exclude or demote any candidate that lacks relevance to the user's stated skills.

Output Format:
Return ONLY a valid JSON object matching this schema:
{
  "matches": [
    {
      "id": 0,
      "matchPercentage": 92,
      "reasoning": "Excellent match for your React and TypeScript background. Rocket.Chat has active frontend repositories, rich community mentorship, and consistent program participation."
    }
  ]
}`;

  const prompt = `User Profile:
- Skills: ${params.skills.join(', ')}
- Experience Level: ${params.experience}
- Weekly Availability: ${params.availability} hours/week
- Location: ${params.location}

Candidate Organizations (JSON):
${JSON.stringify(params.candidates)}

Rank the top candidate organizations (up to ${topLimit}) ordered best match first. Return ONLY raw JSON.`;

  try {
    const rawResponse = await generateGeminiContent(prompt, systemInstruction, {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxTokens: 2500,
    });
    if (!rawResponse) return null;

    let jsonStr = rawResponse.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) jsonStr = match[0];
    }

    const parsed = JSON.parse(jsonStr) as { matches?: GeminiMatchItem[] };
    if (Array.isArray(parsed?.matches)) {
      return parsed.matches;
    }
  } catch (err) {
    safeLogError('Gemini org candidate ranking failed:', err);
  }

  return null;
}

export async function rankProjectsWithGemini(params: {
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  location: string;
  availability: number;
  candidates: Array<{
    id: number;
    title: string;
    org: string;
    difficulty: string;
    year?: number;
    techStack: string;
    matchedSkills: string;
    description: string;
    programName?: string;
  }>;
  topLimit?: number;
}): Promise<GeminiMatchItem[] | null> {
  const topLimit = params.topLimit || 30;
  const systemInstruction = `You are Orbit AI, an expert open-source mentorship matchmaker and technical advisor.
Your mission is to evaluate and rank open-source projects and organizations for a contributor based on their skills, experience level, and weekly availability.

STRICT GROUNDING & ACCURACY RULES:
1. Technical & Practical Alignment: Match projects whose tech stack and ecosystem strongly align with user skills (${params.skills.join(', ')}). Do NOT assume or invent technologies.
2. Experience Level Suitability: Align project difficulty (${params.experience}) so beginners get high-quality approachable projects and advanced contributors get complex architecture/systems projects.
3. Realistic Match Percentage: Produce a realistic match score from 25 to 96 (never 100). Higher scores for direct multi-skill synergy. Partial overlap scores proportionally lower.
4. Grounded Personalized Rationale: 1–2 sentences explaining why this organization/project fits their skill set and experience. Mention specific matched technologies from their profile. Never hallucinate.

Output Format:
Return ONLY a valid JSON object matching this schema:
{
  "matches": [
    {
      "id": 0,
      "matchPercentage": 88,
      "reasoning": "Strong alignment with your React and TypeScript background for building modern frontend components."
    }
  ]
}`;

  const prompt = `User Profile:
- Skills: ${params.skills.join(', ')}
- Experience Level: ${params.experience}
- Weekly Availability: ${params.availability} hours/week
- Location: ${params.location}

Candidate Pool (JSON):
${JSON.stringify(params.candidates)}

Rank the top candidate projects (up to ${topLimit}) ordered best match first. Return ONLY raw JSON.`;

  try {
    const rawResponse = await generateGeminiContent(prompt, systemInstruction, {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxTokens: 2400,
    });
    if (!rawResponse) return null;

    let jsonStr = rawResponse.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) jsonStr = match[0];
    }

    const parsed = JSON.parse(jsonStr) as { matches?: GeminiMatchItem[] };
    if (Array.isArray(parsed?.matches)) {
      return parsed.matches;
    }
  } catch (err) {
    safeLogError('Gemini candidate ranking failed:', err);
  }

  return null;
}

export async function generateGeminiContent(
  prompt: string,
  systemInstruction?: string,
  options?: { responseMimeType?: string; maxTokens?: number; temperature?: number }
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const safePrompt = prompt.slice(0, 32_000);
  const safeSystem = systemInstruction?.slice(0, 8_000);

  const payload: Record<string, unknown> = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: safeSystem
              ? `${safeSystem}\n\nUser Request:\n${safePrompt}`
              : safePrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: options?.temperature ?? 0.2,
      maxOutputTokens: options?.maxTokens ?? 2048,
      ...(options?.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
    },
  };

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(9000),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && typeof candidateText === 'string') {
          return candidateText.trim();
        }
      } else if (res.status === 401 || res.status === 403) {
        console.warn(`Gemini auth failed for model ${model} (HTTP ${res.status})`);
        return null;
      }
    } catch (err) {
      safeLogError(`Gemini API call failed (model=${model}):`, err);
    }
  }

  return null;
}

export async function generateGeminiStructuredJson<T>(
  prompt: string,
  systemInstruction?: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<T | null> {
  const text = await generateGeminiContent(prompt, systemInstruction, {
    responseMimeType: 'application/json',
    temperature: options?.temperature ?? 0.2,
    maxTokens: options?.maxTokens ?? 2500,
  });

  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function improveProposalSectionWithGemini(params: {
  sectionTitle: string;
  projectTitle: string;
  orgName: string;
  currentContent: string;
}): Promise<GeminiImproveResult | null> {
  const systemInstruction = `You are a senior open-source maintainer and Google Summer of Code (GSoC/LFX) proposal reviewer.
Your goal is to enhance the student's proposal section to meet open-source maintainer standards.
Requirements:
1. Increase technical specificity, mention concrete interfaces/modules, test coverage goals (e.g. PyTest/Jest 90%+), and risk buffers.
2. Return a JSON object with two fields:
   - "enhancedText": the enhanced section content in clean Markdown.
   - "rationale": 1 short sentence summarizing what was improved.
Do not include code block ticks in the output, return raw JSON.`;

  const prompt = `Project: ${params.projectTitle.slice(0, 300)}
Organization: ${params.orgName.slice(0, 200)}
Section: ${params.sectionTitle.slice(0, 120)}

Current Section Content:
"""
${(params.currentContent || '(Section currently empty)').slice(0, 20_000)}
"""`;

  try {
    const rawResponse = await generateGeminiContent(prompt, systemInstruction);
    if (rawResponse) {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as {
          enhancedText?: string;
          rationale?: string;
        };
        if (parsed.enhancedText && parsed.rationale) {
          return {
            text: String(parsed.enhancedText).slice(0, 50_000),
            rationale: String(parsed.rationale).slice(0, 500),
          };
        }
      }
      return {
        text: rawResponse.slice(0, 50_000),
        rationale: `Enhanced ${params.sectionTitle} using Google Gemini AI.`,
      };
    }
  } catch (err) {
    safeLogError('Gemini section improvement failed:', err);
  }

  return null;
}
