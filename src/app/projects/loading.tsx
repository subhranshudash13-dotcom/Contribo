import React from 'react';

export default function ProjectsLoading() {
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

      {/* Filter bar skeleton */}
      <div className="p-4 rounded-2xl border border-hairline bg-surface mb-8 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 flex-1 min-w-[200px] bg-hairline/30 rounded-xl" />
          <div className="h-10 w-32 bg-hairline/30 rounded-xl" />
          <div className="h-10 w-32 bg-hairline/30 rounded-xl" />
        </div>
      </div>

      {/* Project Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-hairline bg-surface p-6 space-y-4 min-h-[220px]"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-hairline/50 rounded" />
                <div className="h-5 w-4/5 bg-hairline/70 rounded" />
              </div>
              <div className="h-6 w-16 bg-hairline/40 rounded-full" />
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-full bg-hairline/30 rounded" />
              <div className="h-3 w-5/6 bg-hairline/30 rounded" />
            </div>
            <div className="flex gap-1.5 pt-3">
              <div className="h-5 w-14 bg-hairline/40 rounded-md" />
              <div className="h-5 w-16 bg-hairline/40 rounded-md" />
              <div className="h-5 w-12 bg-hairline/40 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
