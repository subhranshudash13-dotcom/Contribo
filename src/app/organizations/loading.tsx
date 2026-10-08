import React from 'react';

export default function OrganizationsLoading() {
  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-16 bg-hairline/60 rounded" />
        <div className="h-3 w-3 bg-hairline/40 rounded" />
        <div className="h-3 w-20 bg-hairline/60 rounded" />
      </div>

      {/* Header skeleton */}
      <div className="mb-10 space-y-3">
        <div className="h-10 w-72 sm:w-96 bg-hairline/70 rounded-xl" />
        <div className="h-4 w-full max-w-xl bg-hairline/40 rounded" />
      </div>

      {/* Filter / Search bar skeleton */}
      <div className="p-4 rounded-2xl border border-hairline bg-surface mb-8 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 flex-1 min-w-[200px] bg-hairline/30 rounded-xl" />
          <div className="h-10 w-36 bg-hairline/30 rounded-xl" />
        </div>
      </div>

      {/* Organization Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-hairline bg-surface p-5 space-y-4 min-h-[190px]"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-hairline/50 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-4 w-4/5 bg-hairline/70 rounded" />
                <div className="h-3 w-2/5 bg-hairline/40 rounded" />
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-full bg-hairline/30 rounded" />
              <div className="h-3 w-3/4 bg-hairline/30 rounded" />
            </div>
            <div className="flex gap-1.5 pt-2">
              <div className="h-4 w-12 bg-hairline/40 rounded-md" />
              <div className="h-4 w-14 bg-hairline/40 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
