import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateReviewToken } from '@/lib/repositories/proposal-reviews';
import type { ReviewTokenPermission } from '@/lib/proposal-studio/review-types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const session = await auth();

    // In demo mode or local testing, allow generating a token
    const userId = session?.user?.id || 'demo_user';

    const body = await request.json().catch(() => ({}));
    const expiresInDays = typeof body.expiresInDays === 'number' ? body.expiresInDays : 14;
    const permission = (body.permission as ReviewTokenPermission) || 'can_comment';
    const restrictedEmail = body.restrictedEmail ? String(body.restrictedEmail) : undefined;

    const tokenDoc = await generateReviewToken({
      proposalId: id,
      userId,
      expiresInDays,
      permission,
      restrictedEmail,
    });

    return NextResponse.json({ token: tokenDoc }, { status: 201 });
  } catch (error) {
    console.error('Failed to generate review token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
