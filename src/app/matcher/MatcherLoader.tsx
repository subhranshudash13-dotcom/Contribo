'use client';

import dynamic from 'next/dynamic';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';

const MatcherClient = dynamic(() => import('./MatcherClient'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen w-full bg-noise px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-10 w-64 rounded-xl bg-surface border border-hairline animate-pulse" />
        <div className="h-6 w-full max-w-lg rounded-lg bg-surface border border-hairline animate-pulse" />
        <SectionSkeleton variant="cards" count={6} />
      </div>
    </main>
  ),
});

export default function MatcherLoader() {
  return <MatcherClient />;
}
