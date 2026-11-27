import { NextResponse } from 'next/server';
import { CURATED_ISSUES } from '@/lib/issues/repository';
import {
  triageIssues,
  type TriageTier,
} from '@/lib/issues/triage-scorer';

export const dynamic = 'force-dynamic';

const VALID_TIERS = new Set<TriageTier>([
  'Starter Friendly',
  'Intermediate',
  'Deep Core',
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const skillsParam = url.searchParams.get('skills') ?? '';
    const skills = skillsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const tierParam = url.searchParams.get('tier');
    const tier =
      tierParam && VALID_TIERS.has(tierParam as TriageTier)
        ? (tierParam as TriageTier)
        : null;

    const includeBlockedParam = url.searchParams.get('includeBlocked');
    const includeBlocked = includeBlockedParam !== 'false';
    const orgSlug = url.searchParams.get('org')?.trim() || null;

    const items = triageIssues(CURATED_ISSUES, {
      skills,
      tier,
      includeBlocked,
      orgSlug,
    });

    const summary = {
      total: items.length,
      starterFriendly: items.filter((i) => i.tier === 'Starter Friendly').length,
      intermediate: items.filter((i) => i.tier === 'Intermediate').length,
      deepCore: items.filter((i) => i.tier === 'Deep Core').length,
      blocked: items.filter((i) => i.isBlocked).length,
    };

    return NextResponse.json(
      {
        items,
        summary,
        appliedFilters: {
          skills,
          tier,
          includeBlocked,
          orgSlug,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/issues/triage failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
