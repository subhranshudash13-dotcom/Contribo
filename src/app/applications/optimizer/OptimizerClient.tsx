'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import {
  PROGRAM_WINDOWS,
  optimizeApplicationPortfolio,
  type ProgramWindow,
} from '@/lib/programs/timeline-optimizer';

export function OptimizerClient() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'lfx-spring-2026',
    'gsoc-2026',
    'lfx-summer-2026',
    'nsoc-2026',
  ]);
  const [weeklyCapacity, setWeeklyCapacity] = useState<number>(30);

  const result = useMemo(
    () => optimizeApplicationPortfolio(selectedIds, weeklyCapacity),
    [selectedIds, weeklyCapacity]
  );

  function toggleProgram(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function applySafeBundle() {
    if (result.safeBundleIds.length > 0) {
      setSelectedIds(result.safeBundleIds);
    }
  }

  const maxChartHours = Math.max(weeklyCapacity, result.peakWeeklyHours, 40);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Programs Explorer
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarClock className="w-7 h-7 text-emerald-500 shrink-0" />
            Multi-Program Portfolio &amp; Timeline Optimizer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Detect coding-window collisions, evaluation clashes, and weekly hour overflows across
            GSoC, LFX, Outreachy, and NSoC.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
            result.isConflictFree
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
          }`}
        >
          {result.isConflictFree ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Conflict-Free Schedule
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" /> {result.collisions.length} Collision(s) &middot;{' '}
              {result.overflowWeeksCount} Overflow Weeks
            </>
          )}
        </span>
      </div>

      {/* Capacity Slider & Program Selector */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="capacity-slider"
                className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-sky-500" />
                Weekly Capacity Budget
              </label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {weeklyCapacity} hrs/wk
              </span>
            </div>
            <input
              id="capacity-slider"
              type="range"
              min={10}
              max={50}
              step={5}
              value={weeklyCapacity}
              onChange={(e) => setWeeklyCapacity(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>10h (Part-time)</span>
              <span>30h (Standard)</span>
              <span>50h (Intensive)</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Select Target Programs
            </h2>
            {PROGRAM_WINDOWS.map((prog: ProgramWindow) => {
              const checked = selectedIds.includes(prog.id);
              return (
                <label
                  key={prog.id}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-colors ${
                    checked
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProgram(prog.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {prog.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        W{prog.codingStartWeek}–W{prog.codingEndWeek} &middot; {prog.weeklyHours}h/wk
                        &middot; \${prog.stipendUsd}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {prog.acceptsConcurrent ? 'Flexible' : 'Exclusive'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Weekly Load Heatmap */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Weekly Hour Load Heatmap (Weeks 7–49)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peak load: {result.peakWeeklyHours}h/wk &middot; Budget: {weeklyCapacity}h/wk
              </p>
            </div>
            {!result.isConflictFree && result.safeBundleIds.length > 0 && (
              <button
                type="button"
                onClick={applySafeBundle}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Safe Bundle ({result.safeBundleIds.length})
              </button>
            )}
          </div>

          <div className="h-48 flex items-end gap-1 pt-6 border-b border-slate-200 dark:border-slate-800 relative">
            {result.weeklyLoad.map((point) => {
              const heightPct = Math.round((point.totalHours / maxChartHours) * 100);
              const isOverflow = point.overflowHours > 0;
              return (
                <div
                  key={point.week}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  title={`${point.label}: ${point.totalHours}h/wk (${point.activePrograms.join(', ') || 'No active coding'})`}
                >
                  <div
                    className={`w-full rounded-t transition-all ${
                      point.totalHours === 0
                        ? 'bg-slate-100 dark:bg-slate-800/60'
                        : isOverflow
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ height: `${Math.max(heightPct, point.totalHours === 0 ? 4 : 8)}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            {result.recommendations.map((rec) => (
              <p
                key={rec}
                className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5"
              >
                {rec}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Collisions & Diagnostics */}
      {result.collisions.length > 0 && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Detected Schedule Collisions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.collisions.map((c, idx) => (
              <div
                key={`${c.programA}-${c.programB}-${idx}`}
                className={`rounded-xl border p-4 text-xs space-y-1 ${
                  c.severity === 'critical'
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                }`}
              >
                <p className="font-bold uppercase tracking-wider text-[11px]">{c.type}</p>
                <p>{c.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
