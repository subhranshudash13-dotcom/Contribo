'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';
import type { TrendingProject } from '@/components/home/TrendingProjects';
import type { FeaturedOrganization } from '@/lib/repositories/organizations';

/**
 * Server-rendered & streaming home sections with Suspense boundaries.
 * SSR-hydrated without blocking main-thread waterfalls or search engine crawlers.
 */

const OpenSourceExplainer = dynamic(
  () =>
    import('@/components/programs/OpenSourceExplainer').then((m) => ({
      default: m.OpenSourceExplainer,
    })),
  { loading: () => <SectionSkeleton variant="cards" count={3} /> }
);

const ProposalStudioSection = dynamic(
  () =>
    import('@/components/home/ProposalStudioSection').then((m) => ({
      default: m.ProposalStudioSection,
    })),
  { loading: () => <SectionSkeleton variant="cards" count={3} /> }
);

const ProgramTimelineChart = dynamic(
  () =>
    import('@/components/home/ProgramTimelineChart').then((m) => ({
      default: m.ProgramTimelineChart,
    })),
  { loading: () => <SectionSkeleton variant="chart" /> }
);

const PopularOrgsGrid = dynamic(
  () =>
    import('@/components/ui/PopularOrgsGrid').then((m) => ({
      default: m.PopularOrgsGrid,
    })),
  { loading: () => <SectionSkeleton variant="grid" count={8} /> }
);

const FaqAccordion = dynamic(
  () =>
    import('@/components/home/FaqAccordion').then((m) => ({
      default: m.FaqAccordion,
    })),
  { loading: () => <SectionSkeleton variant="faq" count={5} /> }
);

const TrendingProjects = dynamic(
  () =>
    import('@/components/home/TrendingProjects').then((m) => ({
      default: m.TrendingProjects,
    })),
  { loading: () => <SectionSkeleton variant="cards" count={6} /> }
);

const HeroStats = dynamic(
  () =>
    import('@/components/hero/HeroStats').then((m) => ({ default: m.HeroStats })),
  { loading: () => <SectionSkeleton variant="stats" /> }
);

export function DeferredOpenSourceExplainer() {
  return (
    <Suspense fallback={<SectionSkeleton variant="cards" count={3} />}>
      <OpenSourceExplainer />
    </Suspense>
  );
}

export function DeferredHeroStats({ stats }: { stats: Record<string, number> }) {
  return (
    <section className="hidden sm:block">
      <Suspense fallback={<SectionSkeleton variant="stats" />}>
        <HeroStats stats={stats} />
      </Suspense>
    </section>
  );
}

export function DeferredProposalStudioSection() {
  return (
    <Suspense fallback={<SectionSkeleton variant="cards" count={3} />}>
      <ProposalStudioSection />
    </Suspense>
  );
}

export function DeferredTrendingProjects({
  projects,
  savedProjects,
  trackedProjects,
  projectTotal,
}: {
  projects: TrendingProject[];
  savedProjects: string[];
  trackedProjects: string[];
  projectTotal?: number;
}) {
  return (
    <Suspense fallback={<SectionSkeleton variant="cards" count={6} />}>
      <TrendingProjects
        projects={projects}
        savedProjects={savedProjects}
        trackedProjects={trackedProjects}
        projectTotal={projectTotal}
      />
    </Suspense>
  );
}

export function DeferredProgramTimeline({ initialMonthIndex }: { initialMonthIndex: number }) {
  return (
    <Suspense fallback={<SectionSkeleton variant="chart" />}>
      <ProgramTimelineChart initialMonthIndex={initialMonthIndex} />
    </Suspense>
  );
}

export function DeferredPopularOrgs({
  organizations,
  total,
}: {
  organizations: FeaturedOrganization[];
  total: number;
}) {
  return (
    <Suspense fallback={<SectionSkeleton variant="grid" count={8} />}>
      <PopularOrgsGrid organizations={organizations} total={total} />
    </Suspense>
  );
}

export function DeferredFaq() {
  return (
    <Suspense fallback={<SectionSkeleton variant="faq" count={5} />}>
      <FaqAccordion />
    </Suspense>
  );
}
