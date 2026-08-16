export default function ProposalStudioLoading() {
  return (
    <main className="min-h-screen w-full bg-noise">
      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-10 sm:px-6 lg:px-10">
        <div className="h-48 animate-pulse rounded-3xl border border-hairline bg-surface" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-28 animate-pulse rounded-2xl border border-hairline bg-surface" />
          <div className="h-28 animate-pulse rounded-2xl border border-hairline bg-surface" />
          <div className="h-28 animate-pulse rounded-2xl border border-hairline bg-surface" />
        </div>
        <div className="h-64 animate-pulse rounded-3xl border border-hairline bg-surface" />
      </div>
    </main>
  );
}
