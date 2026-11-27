import { NextResponse } from 'next/server';
import { getOrganizationEcosystemReport } from '@/lib/organizations/ecosystem-analyzer';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  props: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const slug = (resolvedParams?.slug ?? '').trim().toLowerCase();

    if (!slug || !/^[a-z0-9_-]{1,64}$/.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid or missing organization slug' },
        { status: 400 }
      );
    }

    const report = getOrganizationEcosystemReport(slug);

    return NextResponse.json(report, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('GET /api/organizations/[slug]/ecosystem failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
