import { SectionSkeleton } from '@/components/ui/SectionSkeleton';

export default function ProgramsLoading() {
  return (
    <main className="min-h-screen w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-24 rounded bg-hairline/50" />
        <div className="h-10 w-72 max-w-full rounded-xl bg-surface border border-hairline" />
      </div>
      <SectionSkeleton variant="cards" count={6} />
    </main>
  );
}
