'use client';

import React from 'react';
import { Award, BarChart3, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import type { HistoricalSlotYear } from '@/lib/organizations/types';

interface HistoricalSlotsChartProps {
  slots: HistoricalSlotYear[];
  orgName: string;
}

export function HistoricalSlotsChart({ slots, orgName }: HistoricalSlotsChartProps) {
  const maxSlots = Math.max(...slots.map((s) => s.slotsAllocated), 12);

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <BarChart3 className="w-3 h-3" />
            Historical Acceptance Trends
          </span>
          <h2 className="mt-1.5 text-xl font-heading font-bold text-primary">
            Program Slot Allocation & Retention (2022–2026)
          </h2>
          <p className="text-xs font-mono text-muted">
            Year-over-year mentorship capacity, completion rate, and estimated applicant competitiveness
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted">
            <span className="w-3 h-3 rounded bg-accent" />
            <span>Slots Allocated</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="grid grid-cols-5 gap-3 pt-6 pb-2 items-end min-h-[220px]">
        {slots.map((item) => {
          const slotHeightPercent = Math.max(15, (item.slotsAllocated / maxSlots) * 100);
          const completedHeightPercent = Math.max(
            10,
            (item.projectsCompleted / maxSlots) * 100
          );

          return (
            <div key={item.year} className="flex flex-col items-center gap-2 group">
              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-page border border-hairline px-2 py-0.5 rounded shadow-sm text-center">
                {item.slotsAllocated} slots ({item.acceptanceRatePercent}% acc.)
              </div>

              {/* Bars side by side */}
              <div className="flex items-end gap-1.5 h-40 w-full max-w-[60px] justify-center">
                <div
                  className="w-1/2 rounded-t-lg bg-accent group-hover:bg-accent/80 transition-all duration-500 shadow-sm"
                  style={{ height: `${slotHeightPercent}%` }}
                />
                <div
                  className="w-1/2 rounded-t-lg bg-emerald-500 group-hover:bg-emerald-500/80 transition-all duration-500 shadow-sm"
                  style={{ height: `${completedHeightPercent}%` }}
                />
              </div>

              {/* Year Label */}
              <div className="text-xs font-mono font-bold text-primary">{item.year}</div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="rounded-2xl border border-hairline bg-page/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-mono">
            <span>Total Historical Slots</span>
            <Award className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono text-primary">
            {slots.reduce((acc, s) => acc + s.slotsAllocated, 0)}
          </div>
          <div className="text-[11px] font-mono text-muted">across last 5 program editions</div>
        </div>

        <div className="rounded-2xl border border-hairline bg-page/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-mono">
            <span>Average Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500">
            {Math.round(
              (slots.reduce((acc, s) => acc + s.projectsCompleted, 0) /
                Math.max(1, slots.reduce((acc, s) => acc + s.slotsAllocated, 0))) *
                100
            )}
            %
          </div>
          <div className="text-[11px] font-mono text-muted">projects successfully graduated</div>
        </div>

        <div className="rounded-2xl border border-hairline bg-page/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-mono">
            <span>Estimated Acceptance Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-primary">
            ~
            {(
              slots.reduce((acc, s) => acc + s.acceptanceRatePercent, 0) /
              Math.max(1, slots.length)
            ).toFixed(1)}
            %
          </div>
          <div className="text-[11px] font-mono text-muted">based on community applicant census</div>
        </div>
      </div>
    </div>
  );
}
