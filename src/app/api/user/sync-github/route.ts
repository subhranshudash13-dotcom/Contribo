import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sanitizeUsername } from '@/lib/passport';
import {
  checkSyncCooldown,
  getOrSyncUserActivity,
} from '@/lib/github/activity-sync';
import { getPublicPassport } from '@/lib/repositories/passport';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    let requestedUsername = '';

    try {
      const body = await req.json();
      if (body && typeof body.username === 'string') {
        requestedUsername = body.username;
      }
    } catch {
      // Body is optional if authenticated session exists
    }

    const username = sanitizeUsername(
      requestedUsername || session?.user?.name || session?.user?.email?.split('@')[0]
    );

    if (!username) {
      return NextResponse.json(
        { error: 'Authentication required or username must be provided in request body.' },
        { status: 400 }
      );
    }

    // Check rate-limiting cooldown (15 minutes window)
    const cooldown = checkSyncCooldown(username);
    if (cooldown.onCooldown) {
      return NextResponse.json(
        {
          error: `Sync cooldown active. Please wait ${cooldown.remainingSeconds} seconds before requesting a fresh sync.`,
          retryAfter: cooldown.remainingSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(cooldown.remainingSeconds),
          },
        }
      );
    }

    // Fetch user target orgs to match
    const passport = await getPublicPassport(username);
    const targetOrgs = passport?.targetOrganizations || [];

    const result = await getOrSyncUserActivity(username, {
      force: true,
      userId: session?.user?.id,
      targetOrgs,
    });

    return NextResponse.json({
      success: true,
      message: 'GitHub activity synchronized successfully.',
      stats: result.stats,
      itemsCount: result.items.length,
      cooldownSeconds: result.cooldownSeconds,
    });
  } catch (error) {
    console.error('POST /api/user/sync-github failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during GitHub synchronization.' },
      { status: 500 }
    );
  }
}
