import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DiffClient } from './DiffClient';

export const metadata: Metadata = {
  title: 'Proposal Markdown Diff Inspector | Contribo',
  description:
    'Compare proposal versions side-by-side with word-level diffs, progress deltas, and automated changelogs.',
};

export default function ProposalDiffPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-page text-primary flex items-center justify-center p-8">
          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Loading Proposal Diff Inspector…</span>
          </div>
        </div>
      }
    >
      <DiffClient />
    </Suspense>
  );
}
