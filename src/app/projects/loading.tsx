import { SectionSkeleton } from '@/components/ui/SectionSkeleton';

export default function ProjectsLoading() {
  return (
    <main className="min-h-screen w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-28 rounded bg-hairline/50" />
        <div className="h-10 w-64 max-w-full rounded-xl bg-surface border border-hairline" />
        <div className="h-5 w-full max-w-md rounded-lg bg-hairline/40" />
      </div>
      <div className="h-14 rounded-2xl border border-hairline bg-surface animate-pulse" />
      <SectionSkeleton variant="cards" count={9} />
    </main>
  );
}
