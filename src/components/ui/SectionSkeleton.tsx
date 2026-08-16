import React from 'react';

type SectionSkeletonProps = {
  /** Visual density preset */
  variant?: 'cards' | 'grid' | 'hero' | 'faq' | 'chart' | 'stats' | 'list';
  className?: string;
  /** Number of placeholder cards/rows for grid/list variants */
  count?: number;
};

/**
 * Lightweight pulse placeholders for deferred / dynamically loaded sections.
 * Server-safe (no client JS).
 */
export function SectionSkeleton({
  variant = 'cards',
  className = '',
  count = 3,
}: SectionSkeletonProps) {
  if (variant === 'stats') {
    return (
      <div
        role="status"
        aria-label="Loading statistics"
        aria-busy="true"
        className={`w-full rounded-[28px] bg-surface border border-hairline py-10 px-6 animate-pulse ${className}`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-9 w-20 rounded-lg bg-hairline/60" />
              <div className="h-3 w-16 rounded bg-hairline/40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div
        role="status"
        aria-label="Loading timeline"
        aria-busy="true"
        className={`w-full rounded-2xl border border-hairline bg-surface p-6 space-y-4 animate-pulse ${className}`}
      >
        <div className="h-4 w-40 rounded bg-hairline/50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-28 rounded bg-hairline/40 shrink-0" />
            <div className="h-8 flex-1 rounded-lg bg-hairline/30" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'faq') {
    return (
      <div
        role="status"
        aria-label="Loading FAQs"
        aria-busy="true"
        className={`space-y-3 animate-pulse ${className}`}
      >
        {Array.from({ length: count || 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl border border-hairline bg-surface"
          />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        role="status"
        aria-label="Loading content"
        aria-busy="true"
        className={`space-y-3 animate-pulse ${className}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-hairline bg-surface"
          />
        ))}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        role="status"
        aria-label="Loading"
        aria-busy="true"
        className={`w-full min-h-[50vh] rounded-3xl border border-hairline bg-surface animate-pulse ${className}`}
      />
    );
  }

  // cards | grid
  const cols =
    variant === 'grid'
      ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8'
      : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  return (
    <div
      role="status"
      aria-label="Loading section"
      aria-busy="true"
      className={`grid ${cols} gap-4 animate-pulse ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="min-h-[140px] rounded-2xl border border-hairline bg-surface"
        />
      ))}
    </div>
  );
}
