import {
  getProgramGuide,
  hasProgramGuide,
  type ProgramGuide,
} from '@/lib/program-guides';
import { listPrograms, getProgramBySlug } from '@/lib/repositories/programs';

export type GuidelineEntry = {
  programSlug: string;
  programName: string;
  accentColor?: string;
  officialWebsite?: string;
  guide: ProgramGuide;
};

/**
 * Editorial guidelines for mentorship programs (static content + program metadata).
 */
export async function listGuidelines(programSlug?: string | null): Promise<{
  guidelines: GuidelineEntry[];
  notFound?: boolean;
}> {
  if (programSlug) {
    const slug = programSlug.trim().toLowerCase();
    const program = await getProgramBySlug(slug);
    const hasGuide = hasProgramGuide(slug);

    if (!program && !hasGuide) {
      return { guidelines: [], notFound: true };
    }

    const guide = getProgramGuide(slug);
    return {
      guidelines: [
        {
          programSlug: slug,
          programName: (program?.name as string) || slug,
          accentColor: program?.accentColor as string | undefined,
          officialWebsite: program?.officialWebsite as string | undefined,
          guide,
        },
      ],
    };
  }

  const programs = await listPrograms();
  const guidelines: GuidelineEntry[] = [];
  const seen = new Set<string>();

  for (const p of programs) {
    const slug = String(p.slug || '').toLowerCase();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    guidelines.push({
      programSlug: slug,
      programName: (p.name as string) || slug,
      accentColor: p.accentColor as string | undefined,
      officialWebsite: p.officialWebsite as string | undefined,
      guide: getProgramGuide(slug),
    });
  }

  return { guidelines };
}
