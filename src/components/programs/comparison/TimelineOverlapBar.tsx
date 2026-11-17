'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { ProgramComparisonRecord } from '@/lib/programs/comparison-data';
import { TimelineConflict } from '@/lib/programs/comparison';

interface TimelineOverlapBarProps {
  programs: ProgramComparisonRecord[];
  conflicts: TimelineConflict[];
  className?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dayOfYear(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const diff = date.getTime() - startOfYear.getTime();
  return Math.min(365, Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1));
}

export function TimelineOverlapBar({
  programs,
  conflicts,
  className = '',
}: TimelineOverlapBarProps) {
  const hasCriticalConflict = conflicts.some((c) => c.severity === 'critical');

  return (
    <div className={`border border-border rounded-2xl bg-card p-5 space-y-6 shadow-xs ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Timeline Collision & Workload Analyzer</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualizes coding windows, concurrent proposal windows, and cumulative weekly workload.
          </p>
        </div>

        <div>
          {conflicts.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Zero Timeline Clashes
            </span>
          ) : hasCriticalConflict ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              {conflicts.length} Overload / Clash Alert{conflicts.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              {conflicts.length} Timeline Warning{conflicts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Visual Gantt Chart Grid */}
      <div className="space-y-2 pt-2">
        {/* Month Header */}
        <div className="grid grid-cols-12 text-[10px] text-muted-foreground font-mono text-center border-b border-border pb-1">
          {MONTHS.map((m) => (
            <div key={m} className="truncate">
              {m}
            </div>
          ))}
        </div>

        {/* Program Timeline Bars */}
        <div className="space-y-3 pt-1">
          {programs.map((p) => {
            const startDay = dayOfYear(p.commitment.codingStartDate);
            const endDay = dayOfYear(p.commitment.codingEndDate);
            const leftPercent = Math.max(0, Math.min(100, ((startDay - 1) / 365) * 100));
            const widthPercent = Math.max(2, Math.min(100 - leftPercent, ((endDay - startDay + 1) / 365) * 100));

            return (
              <div key={p.slug} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.accentColor }}
                    />
                    <span className="font-semibold text-foreground text-xs">{p.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {p.commitment.weeklyHours}h/wk ({p.commitment.durationWeeks} wks)
                  </span>
                </div>

                {/* Bar Track */}
                <div className="h-6 w-full bg-muted/40 rounded-lg relative overflow-hidden border border-border/60">
                  {/* Grid lines for months */}
                  <div className="absolute inset-0 grid grid-cols-12 divide-x divide-border/20 pointer-events-none" />

                  {/* Active Coding Period Bar */}
                  <div
                    className="absolute top-1 bottom-1 rounded-md text-[10px] text-white font-medium flex items-center justify-center shadow-xs transition-all duration-300 px-2 truncate"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: p.accentColor,
                    }}
                    title={`${p.name}: ${p.commitment.codingStartDate} to ${p.commitment.codingEndDate}`}
                  >
                    <span className="truncate drop-shadow-xs">
                      {p.commitment.codingStartDate.slice(5)} → {p.commitment.codingEndDate.slice(5)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conflicts & Warnings List */}
      {conflicts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Detected Overlaps & Feasibility Warnings
          </h4>

          <div className="grid gap-2 sm:grid-cols-2">
            {conflicts.map((conflict) => {
              const isCrit = conflict.severity === 'critical';
              return (
                <div
                  key={conflict.id}
                  className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    isCrit
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCrit ? (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>
                      {conflict.type === 'coding_overlap' ? 'Coding Window Overlap' : 'Concurrent Applications'}
                    </span>
                  </div>

                  <p className="text-[11px] opacity-90">{conflict.message}</p>

                  {conflict.combinedWeeklyHours > 40 && (
                    <div className="text-[10px] font-semibold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-800 dark:text-rose-200 inline-block">
                      ⚠️ Workload Exceeds Full-Time Capacity ({conflict.combinedWeeklyHours}h/wk)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
