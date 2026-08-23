import React from 'react';

export default function OrganizationDetailLoading() {
  return (
    <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-surface rounded mb-8" />

      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-5 w-28 bg-surface rounded mb-2" />
          <div className="h-10 w-72 bg-surface rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-surface rounded-xl" />
          <div className="h-9 w-24 bg-surface rounded-xl" />
        </div>
      </div>

      {/* 2-Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-5 h-[450px] bg-surface rounded-2xl border border-hairline" />
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="h-[280px] bg-surface rounded-2xl border border-hairline" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface rounded-xl border border-hairline" />
            ))}
          </div>
        </div>
      </div>

      {/* Projects Skeleton */}
      <div className="space-y-4 pt-8 border-t border-hairline">
        <div className="h-8 w-48 bg-surface rounded" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-16 bg-surface rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-surface rounded-2xl border border-hairline" />
          ))}
        </div>
      </div>
    </main>
  );
}
