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
  'gemini-1.5-flash',
  'gemini-1.5-pro',
] as const;

export interface GeminiMatchItem {
  id: number;
  matchPercentage: number;
  reasoning: string;
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

Evaluation criteria:
1. Technical & Practical Alignment: Match projects whose tech stack and ecosystem strongly align with user skills.
2. Experience Level Suitability: Align project difficulty (${params.experience}) so beginners get high-quality approachable projects and advanced contributors get complex architecture/systems projects.
3. Realistic Match Percentage: Produce a realistic match score from 40 to 98 (never 100). Higher scores for direct multi-skill synergy.
4. Personalized Rationale: 1–2 sentences explaining why this organization/project fits their skill set and experience. Mention specific matched technologies.

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
    const rawResponse = await generateGeminiContent(prompt, systemInstruction);
    if (!rawResponse) return null;

    let jsonStr = rawResponse.trim();
    // Strip markdown code block if present
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
  systemInstruction?: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  // Bound prompt size to reduce cost / abuse if callers pass huge drafts
  const safePrompt = prompt.slice(0, 24_000);
  const safeSystem = systemInstruction?.slice(0, 4_000);

  const payload = {
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
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
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
