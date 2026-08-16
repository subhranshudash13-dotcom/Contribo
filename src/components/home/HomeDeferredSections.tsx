'use client';

import dynamic from 'next/dynamic';
import { LazySection } from '@/components/ui/LazySection';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';
import type { TrendingProject } from '@/components/home/TrendingProjects';

/**
 * Client-only deferred home sections.
 * Uses ssr:false + LazySection so heavy interactive UI loads near the viewport.
 */

const OpenSourceExplainer = dynamic(
  () =>
    import('@/components/programs/OpenSourceExplainer').then((m) => ({
      default: m.OpenSourceExplainer,
    })),
  { ssr: false, loading: () => <SectionSkeleton variant="cards" count={3} /> }
);

const ProposalStudioSection = dynamic(
  () =>
    import('@/components/home/ProposalStudioSection').then((m) => ({
      default: m.ProposalStudioSection,
    })),
  { ssr: false, loading: () => <SectionSkeleton variant="cards" count={3} /> }
);

const ProgramTimelineChart = dynamic(
  () =>
    import('@/components/home/ProgramTimelineChart').then((m) => ({
      default: m.ProgramTimelineChart,
    })),
  { ssr: false, loading: () => <SectionSkeleton variant="chart" /> }
);

const PopularOrgsGrid = dynamic(
  () =>
    import('@/components/ui/PopularOrgsGrid').then((m) => ({
      default: m.PopularOrgsGrid,
    })),
  { ssr: false, loading: () => <SectionSkeleton variant="grid" count={8} /> }
);

const FaqAccordion = dynamic(
  () =>
    import('@/components/home/FaqAccordion').then((m) => ({
      default: m.FaqAccordion,
    })),
  { ssr: false, loading: () => <SectionSkeleton variant="faq" count={5} /> }
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
    <LazySection
      fallback={<SectionSkeleton variant="cards" count={3} />}
      minHeight={420}
      className="content-visibility-auto"
    >
      <OpenSourceExplainer />
    </LazySection>
  );
}

export function DeferredHeroStats({ stats }: { stats: Record<string, number> }) {
  return (
    <section className="content-visibility-auto">
      <HeroStats stats={stats} />
    </section>
  );
}

export function DeferredProposalStudioSection() {
  return (
    <LazySection
      fallback={<SectionSkeleton variant="cards" count={3} />}
      minHeight={480}
      className="content-visibility-auto"
    >
      <ProposalStudioSection />
    </LazySection>
  );
}

export function DeferredTrendingProjects({
  projects,
  savedProjects,
  trackedProjects,
}: {
  projects: TrendingProject[];
  savedProjects: string[];
  trackedProjects: string[];
}) {
  return (
    <LazySection
      fallback={<SectionSkeleton variant="cards" count={6} />}
      minHeight={520}
      className="content-visibility-auto"
    >
      <TrendingProjects
        projects={projects}
        savedProjects={savedProjects}
        trackedProjects={trackedProjects}
      />
    </LazySection>
  );
}

export function DeferredProgramTimeline({ initialMonthIndex }: { initialMonthIndex: number }) {
  return (
    <LazySection fallback={<SectionSkeleton variant="chart" />} minHeight={280}>
      <ProgramTimelineChart initialMonthIndex={initialMonthIndex} />
    </LazySection>
  );
}

export function DeferredPopularOrgs() {
  return (
    <LazySection fallback={<SectionSkeleton variant="grid" count={8} />} minHeight={160}>
      <PopularOrgsGrid />
    </LazySection>
  );
}

export function DeferredFaq() {
  return (
    <LazySection fallback={<SectionSkeleton variant="faq" count={5} />} minHeight={280}>
      <FaqAccordion />
    </LazySection>
  );
}
