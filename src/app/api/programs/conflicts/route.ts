import { NextRequest, NextResponse } from 'next/server';
import { detectConflicts, scheduleFromRecord } from '@/lib/calendar/conflict-detector';
import { COMPARISON_PROGRAMS } from '@/lib/programs/comparison-data';
import { safeLogError } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const requested = [
      ...new Set(
        (new URL(request.url).searchParams.get('programs') || '')
          .split(',')
          .map((slug) => slug.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
    const known = requested.filter((slug) => Object.hasOwn(COMPARISON_PROGRAMS, slug));

    if (known.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pass at least one known program, for example ?programs=gsoc,lfx,outreachy',
          availablePrograms: Object.keys(COMPARISON_PROGRAMS),
        },
        { status: 400 }
      );
    }

    const report = detectConflicts(known.map((slug) => scheduleFromRecord(COMPARISON_PROGRAMS[slug])));

    return NextResponse.json(
      {
        success: true,
        data: { ...report, unknownPrograms: requested.filter((slug) => !known.includes(slug)) },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    safeLogError('GET /api/programs/conflicts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to analyze conflicts' }, { status: 500 });
  }
}
