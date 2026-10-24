"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import type { TimelineProgram } from './programsTimeline';
import { PROGRAMS_TIMELINE } from './programsTimeline';

interface ProgramTimelineChartProps {
  initialMonthIndex: number;
  programs?: TimelineProgram[];
}

export function ProgramTimelineChart({
  initialMonthIndex,
  programs: programsProp,
}: ProgramTimelineChartProps) {
  const [currentMonthIndex] = useState(() =>
    typeof initialMonthIndex === 'number' ? initialMonthIndex : new Date().getMonth(),
  );

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const programs = programsProp || PROGRAMS_TIMELINE;

  return (
    <div className="bg-surface border border-hairline rounded-2xl p-6 pl-10 shadow-[4px_4px_0px_0px_var(--hairline)] relative overflow-hidden transition-all duration-300">
      {/* Spiral Binding Holes */}
      <div className="absolute left-[3px] top-0 bottom-0 w-2 flex flex-col justify-around py-8 pointer-events-none z-20">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-page border border-hairline shadow-inner" />
        ))}
      </div>

      {/* Notebook Margin Line */}
      <div className="absolute left-[24px] top-0 bottom-0 w-[1px] bg-red-400/20 dark:bg-red-950/40 pointer-events-none z-20" />

      <div className="overflow-x-auto">
        <div className="min-w-[950px] space-y-5 pr-2">
          {/* Timeline Grid Header (Months) */}
          <div className="flex border-b border-hairline pb-4">
            <div className="w-56 flex-shrink-0 font-mono text-xs uppercase tracking-widest text-secondary font-bold pr-4 flex items-center">
              Mentorship Program
            </div>

            <div className="flex-1 grid grid-cols-12 gap-2 text-center font-mono text-[11px] md:text-xs uppercase tracking-widest text-secondary font-extrabold relative">
              {monthNames.map((m, idx) => {
                const isCurrent = idx === currentMonthIndex;
                return (
                  <div
                    key={m}
                    className={`py-1.5 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-accent/15 text-accent border border-dashed border-accent/40 font-black scale-105 shadow-sm'
                        : ''
                    }`}
                  >
                    {m.slice(0, 3)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Program Rows */}
          <div className="space-y-4 relative">
            {/* Vertical current month highlighter strip */}
            <div className="absolute top-0 bottom-0 left-56 right-0 pointer-events-none">
              <div className="grid grid-cols-12 gap-2 h-full">
                {[...Array(12)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-full border-r border-dashed border-hairline/40 relative ${
                      idx === currentMonthIndex
                        ? 'bg-accent/[0.03] dark:bg-accent/[0.01] border-x border-accent/10'
                        : ''
                    }`}
                  >
                    {idx === currentMonthIndex && (
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-accent/30 dark:bg-accent/15" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {programs.map((p) => (
              <div
                key={p.slug}
                className="flex items-center min-h-[56px] py-2 px-4 rounded-xl bg-surface-raised border border-hairline shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200 group"
              >
                {/* Left: Program Label (linked to the program page) */}
                <div className="w-52 flex-shrink-0 font-bold text-xs sm:text-sm text-primary pr-4 truncate">
                  <Link
                    href={`/programs/${p.slug}`}
                    className="text-primary hover:text-accent hover:underline truncate"
                    title={`View ${p.name} program`}
                  >
                    {p.name}
                  </Link>
                </div>

                {/* Right: Gantt spans */}
                <div className="flex-1 grid grid-cols-12 gap-2 h-9 relative">
                  {p.spans.length === 0 ? (
                    <div
                      style={{ gridColumnStart: 1, gridColumnEnd: 13 }}
                      className="flex items-center justify-center rounded-lg border border-dashed text-[11px] sm:text-xs font-bold px-3 truncate text-muted"
                    >
                      dates not published — see program page
                    </div>
                  ) : (
                    p.spans.map((span, sIdx) => {
                      const gridStart = span.start;

                      // Determine if this span covers the current month
                      const coversCurrentMonth =
                        currentMonthIndex >= span.start - 1 &&
                        currentMonthIndex <= span.end - 1;

                      return (
                        <div
                          key={sIdx}
                          style={{
                            gridColumnStart: gridStart,
                            gridColumnEnd: span.end + 1,
                          }}
                          className={`flex items-center justify-center rounded-lg border border-dashed text-[11px] sm:text-xs font-bold px-3 truncate transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${p.color} ${
                            coversCurrentMonth
                              ? 'ring-2 ring-accent font-extrabold shadow-sm'
                              : ''
                          }`}
                          title={`${p.name} (${span.label}): ${monthNames[span.start - 1]} - ${monthNames[span.end - 1]}`}
                        >
                          <span className="truncate leading-none">{span.label}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
