import { NextResponse } from 'next/server';
import { sanitizeUsername } from '@/lib/passport';
import { getPublicPassport } from '@/lib/repositories/passport';
import {
  getOrSyncUserActivity,
  calculateActivityStats,
  GitHubContributionItem,
} from '@/lib/github/activity-sync';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  props: { params: Promise<{ username: string }> | { username: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const username = sanitizeUsername(resolvedParams?.username);

    if (!username) {
      return NextResponse.json(
        { error: 'Invalid or missing username parameter' },
        { status: 400 }
      );
    }

    const passport = await getPublicPassport(username);

    if (!passport) {
      return NextResponse.json(
        { error: `Passport for username "${username}" not found` },
        { status: 404 }
      );
    }

    if (passport.isPrivate) {
      return NextResponse.json(
        {
          username,
          items: [],
          stats: calculateActivityStats([]),
          isPrivate: true,
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
        { status: 200 }
      );
    }

    const { items, stats, cooldownSeconds } = await getOrSyncUserActivity(
      passport.githubUsername || username,
      { targetOrgs: passport.targetOrganizations }
    );

    const url = new URL(req.url);
    const filterState = url.searchParams.get('state')?.toUpperCase() || 'ALL';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));

    let filtered: GitHubContributionItem[] = items;
    if (filterState === 'MERGED') {
      filtered = items.filter((i) => i.state === 'MERGED');
    } else if (filterState === 'OPEN') {
      filtered = items.filter((i) => i.state === 'OPEN');
    } else if (filterState === 'TARGET_ORG') {
      filtered = items.filter((i) => i.isTargetOrg);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        username,
        items: paginatedItems,
        stats,
        cooldownSeconds,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/passport/[username]/activity failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
