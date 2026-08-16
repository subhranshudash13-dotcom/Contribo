import { SectionSkeleton } from '@/components/ui/SectionSkeleton';

export default function MatcherLoading() {
  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto px-4 py-16 space-y-6">
      <div className="h-10 w-64 rounded-xl bg-surface border border-hairline animate-pulse" />
      <div className="h-6 w-full max-w-lg rounded-lg bg-hairline/40 animate-pulse" />
      <SectionSkeleton variant="cards" count={6} />
    </main>
  );
}
