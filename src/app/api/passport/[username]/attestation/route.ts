import { NextResponse } from 'next/server';
import { sanitizeUsername } from '@/lib/passport';
import { getPublicPassport } from '@/lib/repositories/passport';
import { createAttestationReceipt } from '@/lib/passport/attestation';

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
        { error: `Passport for username "${username}" is private` },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const expiresInDaysParam = url.searchParams.get('expiresInDays');
    const parsedDays = expiresInDaysParam ? Number(expiresInDaysParam) : 365;
    const expiresInDays =
      Number.isFinite(parsedDays) && parsedDays > 0 ? Math.min(parsedDays, 3650) : null;

    const receipt = createAttestationReceipt(passport, {
      expiresInDays,
    });

    const format = url.searchParams.get('format')?.toLowerCase();
    if (format === 'vc' || format === 'openbadge') {
      return NextResponse.json(receipt.credential, {
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json(receipt, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('GET /api/passport/[username]/attestation failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
