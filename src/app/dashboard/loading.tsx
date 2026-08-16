import { SectionSkeleton } from '@/components/ui/SectionSkeleton';

export default function DashboardLoading() {
  return (
    <main className="min-h-screen w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-12 space-y-8">
      <div className="h-24 rounded-2xl border border-hairline bg-surface animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 rounded-2xl border border-hairline bg-surface animate-pulse" />
        <div className="h-28 rounded-2xl border border-hairline bg-surface animate-pulse" />
        <div className="h-28 rounded-2xl border border-hairline bg-surface animate-pulse" />
      </div>
      <SectionSkeleton variant="list" count={4} />
    </main>
  );
}
