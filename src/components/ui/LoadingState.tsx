'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type LoadingStateProps = {
  title?: string;
  description?: string;
  /** compact = inline/row; page = full section; card = bordered block */
  variant?: 'page' | 'card' | 'inline';
  className?: string;
  /** Accessible live region label */
  label?: string;
};

/**
 * Shared loading UI for client-driven data fetches.
 */
export function LoadingState({
  title = 'Loading…',
  description,
  variant = 'page',
  className = '',
  label = 'Loading content',
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <span
        role="status"
        aria-live="polite"
        aria-label={label}
        className={`inline-flex items-center gap-2 text-sm text-muted ${className}`}
      >
        <Loader2 size={14} className="animate-spin text-brass shrink-0" />
        <span>{title}</span>
      </span>
    );
  }

  const shell =
    variant === 'card'
      ? 'flex flex-col items-center justify-center py-16 px-6 border border-hairline border-dashed rounded-sm bg-surface'
      : 'flex flex-col items-center justify-center min-h-[40vh] py-20 px-4';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={`${shell} ${className}`}
    >
      <div className="relative w-12 h-12 mb-5" aria-hidden>
        <div className="absolute inset-0 border-2 border-hairline rounded-full" />
        <div className="absolute inset-0 border-2 border-t-brass border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
      <h2 className="text-lg font-bold text-primary mb-1">{title}</h2>
      {description && (
        <p className="text-sm text-muted max-w-sm text-center leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

/** Skeleton pulse block for list/card placeholders. */
export function LoadingSkeleton({
  rows = 3,
  className = '',
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-busy="true"
      className={`space-y-3 ${className}`}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-sm border border-hairline bg-surface animate-pulse"
        />
      ))}
    </div>
  );
}
