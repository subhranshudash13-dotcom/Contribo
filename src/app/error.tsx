'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12">
      <div className="w-14 h-14 bg-error/10 border border-error/20 text-error rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <AlertTriangle size={28} />
      </div>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase bg-error/10 text-error border border-error/20 mb-3">
        Error Recovery
      </div>
      <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-primary mb-2">
        Something didn&apos;t load as expected
      </h2>
      <p className="text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed">
        We encountered a temporary issue rendering this view. You can retry the request or return to the main directory.
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={() => reset()}
          className="h-10 px-5 rounded-full bg-primary text-page text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="h-10 px-5 rounded-full border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs font-bold transition-colors"
        >
          Reload Page
        </button>
        <Link 
          href="/"
          className="h-10 px-5 rounded-full border border-hairline hover:border-accent/40 text-secondary hover:text-primary text-xs font-bold inline-flex items-center transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
