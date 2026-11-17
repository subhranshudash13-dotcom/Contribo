import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getOrganizationBySlug } from '@/lib/repositories/organizations';
import { generateOrganizationInsights } from '@/lib/organizations/insights-data';
import { OrganizationInsightsView } from '@/components/organizations/OrganizationInsightsView';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rawOrg = await getOrganizationBySlug(slug);

  if (!rawOrg) {
    return {
      title: 'Organization Insights Not Found | Contribo',
    };
  }
  const org = rawOrg as Record<string, any>;

  return {
    title: `${org.name || slug} - Responsiveness Index & Historical Acceptance Analytics | Contribo`,
    description: `Inspect mentor responsiveness, median pull request review time, historical slot retention, and bus factor for ${org.name || slug}.`,
    openGraph: {
      title: `${org.name || slug} - Responsiveness & Mentorship Analytics`,
      description: `Data-driven insights on mentor turnaround time and acceptance rates for ${org.name || slug}.`,
      type: 'website',
    },
  };
}

export default async function OrganizationInsightsPage({ params }: Props) {
  const { slug } = await params;
  const rawOrg = await getOrganizationBySlug(slug, null, { includeProjectCount: true });

  if (!rawOrg) {
    notFound();
  }
  const org = rawOrg as Record<string, any>;

  const insights = generateOrganizationInsights({
    name: String(org.name || slug),
    slug: String(org.slug || slug),
    category: org.category ? String(org.category) : undefined,
    websiteUrl: org.websiteUrl ? String(org.websiteUrl) : undefined,
    logoUrl: org.logoUrl ? String(org.logoUrl) : undefined,
    years: Array.isArray(org.years) ? org.years : undefined,
    yearlyStats: org.yearlyStats as Record<string, { projectsCount?: number; slotsCount?: number }>,
    projectsCount: typeof org.projectsCount === 'number' ? org.projectsCount : undefined,
    programName: org.programName ? String(org.programName) : undefined,
  });

  return (
    <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-xs font-mono text-muted mb-8 uppercase tracking-widest font-medium overflow-x-auto whitespace-nowrap pb-1">
        <Link href="/" className="hover:text-primary transition-colors">
          Platform
        </Link>
        <ChevronRight size={14} className="mx-2 shrink-0" />
        <Link href="/organizations" className="hover:text-primary transition-colors">
          Organizations
        </Link>
        <ChevronRight size={14} className="mx-2 shrink-0" />
        <Link
          href={`/organizations/${org.slug}`}
          className="hover:text-primary transition-colors truncate max-w-[180px]"
        >
          {String(org.name || slug)}
        </Link>
        <ChevronRight size={14} className="mx-2 shrink-0" />
        <span className="text-primary font-bold">Insights</span>
      </nav>

      <OrganizationInsightsView insights={insights} />
    </main>
  );
}
