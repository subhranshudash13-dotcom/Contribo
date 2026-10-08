import React from 'react';

export default function ProgramsLoading() {
  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto w-full mt-20 animate-pulse space-y-12">
      {/* Header Hero skeleton */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto py-8">
        <div className="h-6 w-36 bg-hairline/50 rounded-full" />
        <div className="h-10 w-80 sm:w-96 bg-hairline/70 rounded-xl" />
        <div className="h-4 w-full max-w-lg bg-hairline/40 rounded" />
      </div>

      {/* Program Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-hairline bg-surface p-7 space-y-5 min-h-[260px]"
          >
            <div className="flex justify-between items-start">
              <div className="h-14 w-14 rounded-2xl bg-hairline/60" />
              <div className="h-6 w-20 bg-hairline/40 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-3/5 bg-hairline/70 rounded" />
              <div className="h-4 w-full bg-hairline/30 rounded" />
              <div className="h-4 w-4/5 bg-hairline/30 rounded" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-hairline">
              <div className="h-4 w-24 bg-hairline/40 rounded" />
              <div className="h-4 w-20 bg-hairline/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
