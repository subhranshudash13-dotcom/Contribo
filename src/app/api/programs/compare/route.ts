import { NextRequest, NextResponse } from 'next/server';
import { buildComparisonMatrix } from '@/lib/programs/comparison';

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const programsParam = searchParams.get('programs') || '';
    const countryParam = searchParams.get('country') || 'US';

    const slugs = programsParam
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const matrix = buildComparisonMatrix(slugs.length > 0 ? slugs : ['gsoc', 'lfx'], countryParam);

    return NextResponse.json(
      {
        success: true,
        data: matrix,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
