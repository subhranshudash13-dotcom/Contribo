import React from 'react';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';

export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading Contribo homepage"
      className="flex flex-col min-h-screen w-full bg-noise"
    >
      {/* Hero Skeleton Shell */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 pt-16 sm:pt-24 pb-12 space-y-8 animate-pulse">
        {/* Badge Skeleton */}
        <div className="mx-auto h-7 w-48 rounded-full bg-hairline/60" />
        {/* Main Title Skeleton */}
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <div className="h-10 sm:h-14 w-3/4 mx-auto rounded-2xl bg-hairline/70" />
          <div className="h-10 sm:h-14 w-1/2 mx-auto rounded-2xl bg-hairline/60" />
        </div>
        {/* Subtitle Skeleton */}
        <div className="mx-auto max-w-xl space-y-2">
          <div className="h-4 w-full rounded bg-hairline/40" />
          <div className="h-4 w-5/6 mx-auto rounded bg-hairline/40" />
        </div>
        {/* Search Bar Skeleton */}
        <div className="mx-auto max-w-2xl h-14 rounded-2xl border border-hairline bg-surface/80" />
        {/* CTA Pills */}
        <div className="flex justify-center gap-3 pt-2">
          <div className="h-11 w-36 rounded-xl bg-hairline/60" />
          <div className="h-11 w-36 rounded-xl bg-hairline/40" />
        </div>
      </div>

      {/* Main Content Sections Skeleton */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 pb-20 space-y-20">
        {/* Stats Band Skeleton */}
        <SectionSkeleton variant="stats" />

        {/* Programs Grid Skeleton */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="h-8 w-64 rounded-xl bg-hairline/60" />
              <div className="h-4 w-96 rounded bg-hairline/40" />
            </div>
            <div className="h-10 w-32 rounded-xl bg-hairline/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[460px] rounded-3xl border border-hairline bg-surface/50 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Trending Projects Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-48 rounded-xl bg-hairline/60" />
          <SectionSkeleton variant="cards" count={6} />
        </div>
      </div>
    </main>
  );
}
