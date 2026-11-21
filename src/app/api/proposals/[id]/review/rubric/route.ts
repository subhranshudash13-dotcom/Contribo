import { NextRequest, NextResponse } from 'next/server';
import { submitRubricEvaluation } from '@/lib/repositories/proposal-reviews';
import type { ReviewerRole } from '@/lib/proposal-studio/review-types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      evaluatorName = 'Reviewer',
      evaluatorRole = 'peer',
      technicalArchitecture,
      deliverablesTimeline,
      communityBonding,
      longTermImpact,
      strengths,
      improvements,
    } = body;

    if (
      typeof technicalArchitecture !== 'number' ||
      typeof deliverablesTimeline !== 'number' ||
      typeof communityBonding !== 'number' ||
      typeof longTermImpact !== 'number'
    ) {
      return NextResponse.json(
        { error: 'All 4 rubric pillar scores (1-5) are required' },
        { status: 400 }
      );
    }

    const evaluation = await submitRubricEvaluation(id, {
      evaluatorName: String(evaluatorName),
      evaluatorRole: evaluatorRole as ReviewerRole,
      technicalArchitecture,
      deliverablesTimeline,
      communityBonding,
      longTermImpact,
      strengths: strengths ? String(strengths) : undefined,
      improvements: improvements ? String(improvements) : undefined,
    });

    return NextResponse.json({ evaluation }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit rubric evaluation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
