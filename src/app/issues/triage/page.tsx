import React from 'react';
import type { Metadata } from 'next';
import { CURATED_ISSUES } from '@/lib/issues/repository';
import { TriageClient } from './TriageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Good-First-Issue Triage & Readiness Scorer | Contribo',
  description:
    'Score open-source issues across reproduction clarity, scope safety, maintainer responsiveness, and skill-stack overlap.',
};

export default function IssueTriagePage() {
  return (
    <main className="min-h-screen w-full px-4 sm:px-8 lg:px-12 pt-[140px] pb-24">
      <TriageClient issues={CURATED_ISSUES} />
    </main>
  );
}
