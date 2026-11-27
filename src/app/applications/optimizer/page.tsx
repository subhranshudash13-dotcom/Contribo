import React from 'react';
import type { Metadata } from 'next';
import { OptimizerClient } from './OptimizerClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Multi-Program Portfolio & Timeline Optimizer | Contribo',
  description:
    'Detect overlapping coding windows, evaluation clashes, and weekly hour overflows across GSoC, LFX, Outreachy, and NSoC.',
};

export default function ApplicationOptimizerPage() {
  return (
    <main className="min-h-screen w-full px-4 sm:px-8 lg:px-12 pt-[140px] pb-24">
      <OptimizerClient />
    </main>
  );
}
