'use client';

import React from 'react';
import { Clock, Zap } from 'lucide-react';
import type { ReviewLatencyBucket } from '@/lib/organizations/types';

interface ReviewLatencyDistributionProps {
  histogram: ReviewLatencyBucket[];
  medianTtfrHours: number;
}

export function ReviewLatencyDistribution({
  histogram,
  medianTtfrHours,
}: ReviewLatencyDistributionProps) {
  const quickTurnaroundPercent = histogram
    .filter((h) => h.range === '< 12 hours' || h.range === '12 – 24 hours')
    .reduce((sum, h) => sum + h.percentage, 0);

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" />
            Turnaround Latency
          </span>
          <h2 className="mt-1.5 text-xl font-heading font-bold text-primary">
            Pull Request Time-to-First-Review (TTFR)
          </h2>
          <p className="text-xs font-mono text-muted">
            Empirical breakdown of review response latency across recent contributor submissions
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-hairline bg-page text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span>Median TTFR:</span>
          <span className="font-bold text-primary">{medianTtfrHours} hours</span>
        </div>
      </div>

      {/* Latency Bars */}
      <div className="space-y-3.5">
        {histogram.map((bucket) => {
          const isFast = bucket.range.includes('12') || bucket.range.includes('<');
          const isMedium = bucket.range.includes('1 – 3');

          const barColor = isFast
            ? 'bg-emerald-500'
            : isMedium
            ? 'bg-cyan-500'
            : bucket.range.includes('3 – 7')
            ? 'bg-amber-500'
            : 'bg-rose-500';

          return (
            <div key={bucket.range} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-secondary">{bucket.range}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted text-[11px]">{bucket.count} PRs</span>
                  <span className="font-bold text-primary">{bucket.percentage}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-page border border-hairline overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${bucket.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Takeaway Box */}
      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
        <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div className="text-xs font-mono leading-relaxed text-secondary">
          <span className="font-bold text-primary">{quickTurnaroundPercent}% of pull requests</span> receive an initial maintainer code review within 24 hours. This indicates high mentor engagement and rapid review cycles for applicants.
        </div>
      </div>
    </div>
  );
}
