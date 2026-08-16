import React from 'react';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div className="relative w-12 h-12 mb-5" aria-hidden>
        <div className="absolute inset-0 border-2 border-hairline rounded-full" />
        <div className="absolute inset-0 border-2 border-t-brass border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
      <h2 className="text-lg font-bold text-primary mb-1">Loading…</h2>
      <p className="text-sm text-muted text-center max-w-sm">
        Fetching the latest programs, projects, and workspace data.
      </p>
    </div>
  );
}
