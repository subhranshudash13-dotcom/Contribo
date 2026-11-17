'use client';

import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  GitMerge,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { OrganizationHealth } from '@/lib/organizations/types';

interface HealthScoreGaugeProps {
  health: OrganizationHealth;
}

export function HealthScoreGauge({ health }: HealthScoreGaugeProps) {
  const { overallScore, tier, breakdown, busFactorRisk } = health;

  const scoreColor =
    overallScore >= 90
      ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
      : overallScore >= 75
      ? 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10'
      : overallScore >= 50
      ? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-500 border-rose-500/30 bg-rose-500/10';

  const strokeColor =
    overallScore >= 90
      ? '#10b981'
      : overallScore >= 75
      ? '#06b6d4'
      : overallScore >= 50
      ? '#f59e0b'
      : '#f43f5e';

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
            <Activity className="w-3 h-3" />
            Responsiveness Index
          </span>
          <h2 className="mt-1.5 text-xl font-heading font-bold text-primary">
            Mentorship Health Score
          </h2>
          <p className="text-xs font-mono text-muted">
            Algorithmically computed across 5 weighted maintainer velocity signals
          </p>
        </div>

        <div className={`px-3 py-1 rounded-xl border font-mono text-xs font-bold ${scoreColor}`}>
          {tier}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Radial Circle Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                className="text-page"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={strokeColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-mono font-bold text-primary tracking-tight">
                {overallScore}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                out of 100
              </span>
            </div>
          </div>
          <div className="mt-2 text-center text-xs font-mono text-muted">
            Bus Factor Risk: <span className="font-bold text-primary">{busFactorRisk}</span>
          </div>
        </div>

        {/* Breakdown Metric Bars */}
        <div className="md:col-span-7 space-y-3.5">
          {/* PR TTFR */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-secondary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                PR Time-To-First-Review (30%)
              </span>
              <span className="font-bold text-primary">{breakdown.prReviewScore} / 30 pts</span>
            </div>
            <div className="h-2 rounded-full bg-page border border-hairline overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.prReviewScore / 30) * 100}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-muted flex justify-between">
              <span>Median: {health.medianTtfrHours}h</span>
              <span>Target: &lt; 24h</span>
            </div>
          </div>

          {/* Issue Triage Velocity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-secondary flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                Issue Triage Velocity (25%)
              </span>
              <span className="font-bold text-primary">{breakdown.issueTriageScore} / 25 pts</span>
            </div>
            <div className="h-2 rounded-full bg-page border border-hairline overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.issueTriageScore / 25) * 100}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-muted flex justify-between">
              <span>Median: {health.medianIssueTriageHours}h</span>
              <span>Target: &lt; 48h</span>
            </div>
          </div>

          {/* Merge Rate & Throughput */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-secondary flex items-center gap-1.5">
                <GitMerge className="w-3.5 h-3.5 text-cyan-500" />
                Merge Rate & Throughput (20%)
              </span>
              <span className="font-bold text-primary">{breakdown.mergeRateScore} / 20 pts</span>
            </div>
            <div className="h-2 rounded-full bg-page border border-hairline overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.mergeRateScore / 20) * 100}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-muted flex justify-between">
              <span>Success Rate: {health.mergeRatePercent}%</span>
              <span>Target: &gt; 70%</span>
            </div>
          </div>

          {/* Mentor Distribution & Bus Factor */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-secondary flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                Mentor Distribution / Bus Factor (15%)
              </span>
              <span className="font-bold text-primary">
                {breakdown.mentorDistributionScore} / 15 pts
              </span>
            </div>
            <div className="h-2 rounded-full bg-page border border-hairline overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.mentorDistributionScore / 15) * 100}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-muted flex justify-between">
              <span>{health.activeMaintainers90d} active maintainers</span>
              <span>Target: &gt;= 5 reviewers</span>
            </div>
          </div>

          {/* Slot Retention */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-secondary flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                Program Participation Consistency (10%)
              </span>
              <span className="font-bold text-primary">{breakdown.retentionScore} / 10 pts</span>
            </div>
            <div className="h-2 rounded-full bg-page border border-hairline overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.retentionScore / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
