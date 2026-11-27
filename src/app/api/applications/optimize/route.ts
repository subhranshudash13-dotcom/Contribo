import { NextResponse } from 'next/server';
import {
  PROGRAM_WINDOWS,
  optimizeApplicationPortfolio,
} from '@/lib/programs/timeline-optimizer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const defaultIds = ['lfx-spring-2026', 'gsoc-2026', 'nsoc-2026'];
  const result = optimizeApplicationPortfolio(defaultIds, 30);
  return NextResponse.json(
    {
      catalog: PROGRAM_WINDOWS,
      result,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { programIds, weeklyCapacityHours } = body as {
      programIds?: unknown;
      weeklyCapacityHours?: unknown;
    };

    if (!Array.isArray(programIds) || programIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json(
        { error: 'programIds must be an array of program ID strings' },
        { status: 400 }
      );
    }

    const capacity =
      typeof weeklyCapacityHours === 'number' && Number.isFinite(weeklyCapacityHours)
        ? weeklyCapacityHours
        : 30;

    const result = optimizeApplicationPortfolio(programIds, capacity);

    return NextResponse.json(
      {
        catalog: PROGRAM_WINDOWS,
        result,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('POST /api/applications/optimize failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
