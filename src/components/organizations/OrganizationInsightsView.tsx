'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import type { OrganizationInsightsData } from '@/lib/organizations/types';
import { HealthScoreGauge } from './HealthScoreGauge';
import { HistoricalSlotsChart } from './HistoricalSlotsChart';
import { ReviewLatencyDistribution } from './ReviewLatencyDistribution';
import { MentorBandwidthCard } from './MentorBandwidthCard';

interface OrganizationInsightsViewProps {
  insights: OrganizationInsightsData;
}

export function OrganizationInsightsView({ insights }: OrganizationInsightsViewProps) {
  const { slug, name, logoUrl, category, primaryProgram, health, historicalSlots, reviewLatencyHistogram, communicationChannels, bestTimeToSubmit } = insights;

  return (
    <div className="w-full pb-16 space-y-8">
      {/* Top Header & Org Profile Snapshot */}
      <div className="border-b border-hairline pb-6 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-hairline pb-3">
          <Link
            href={`/organizations/${slug}`}
            className="px-3.5 py-1.5 rounded-xl border border-hairline bg-page text-xs font-mono text-secondary hover:text-primary hover:bg-surface-raised transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Overview & Details</span>
          </Link>
          <div className="px-3.5 py-1.5 rounded-xl bg-accent text-white text-xs font-mono font-semibold shadow-sm flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Insights & Responsiveness</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`${name} logo`}
                className="w-14 h-14 rounded-2xl border border-hairline object-contain bg-white p-2 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl border border-hairline bg-surface flex items-center justify-center text-muted font-heading font-bold text-xl">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                  {primaryProgram}
                </span>
                <span className="text-xs font-mono text-muted">{category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary tracking-tight">
                {name} Responsiveness & Acceptance Analytics
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/organizations/${slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline bg-surface hover:bg-surface-raised text-xs font-mono text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Health Score Gauge */}
      <HealthScoreGauge health={health} />

      {/* Historical Slots Multi-Year Chart */}
      <HistoricalSlotsChart slots={historicalSlots} orgName={name} />

      {/* 2-Column Grid: Review Latency & Mentor Bandwidth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReviewLatencyDistribution
          histogram={reviewLatencyHistogram}
          medianTtfrHours={health.medianTtfrHours}
        />
        <MentorBandwidthCard
          activeMaintainers={health.activeMaintainers90d}
          busFactor={health.busFactorRisk}
          channels={communicationChannels}
          bestTimeToSubmit={bestTimeToSubmit}
        />
      </div>
    </div>
  );
}
