import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationBySlug } from '@/lib/repositories/organizations';
import { generateOrganizationInsights } from '@/lib/organizations/insights-data';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Organization slug is required' }, { status: 400 });
    }

    const rawOrg = await getOrganizationBySlug(slug.trim(), null, { includeProjectCount: true });
    if (!rawOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    const org = rawOrg as Record<string, unknown>;

    const insights = generateOrganizationInsights({
      name: String(org.name || slug),
      slug: String(org.slug || slug),
      category: org.category ? String(org.category) : undefined,
      websiteUrl: org.websiteUrl ? String(org.websiteUrl) : undefined,
      logoUrl: org.logoUrl ? String(org.logoUrl) : undefined,
      years: Array.isArray(org.years) ? (org.years as (string | number)[]) : undefined,
      yearlyStats: org.yearlyStats as Record<string, { projectsCount?: number; slotsCount?: number }> | undefined,
      projectsCount: typeof org.projectsCount === 'number' ? org.projectsCount : undefined,
      programName: org.programName ? String(org.programName) : undefined,
    });

    return NextResponse.json(
      { insights },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get organization insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
