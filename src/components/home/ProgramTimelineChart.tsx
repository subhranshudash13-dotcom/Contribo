"use client";

import React, { useState, useEffect } from "react";

interface ProgramTimelineChartProps {
  initialMonthIndex: number;
}

export function ProgramTimelineChart({ initialMonthIndex }: ProgramTimelineChartProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(initialMonthIndex);

  useEffect(() => {
    setCurrentMonthIndex(new Date().getMonth());
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const programsTimelineData = [
    {
      name: "Season of KDE",
      color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 dark:bg-blue-500/15",
      spans: [
        { start: 1, end: 3, label: "Apps & Coding" } // Jan - Mar
      ]
    },
    {
      name: "Outreachy",
      color: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 dark:bg-purple-500/15",
      spans: [
        { start: 1, end: 3, label: "Winter Cohort" }, // Jan - Mar
        { start: 5, end: 8, label: "Summer Cohort" } // May - Aug
      ]
    },
    {
      name: "Google Summer of Code",
      color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/15",
      spans: [
        { start: 3, end: 4, label: "Applications & Selection" }, // Mar - Apr
        { start: 6, end: 8, label: "Coding Phase" } // Jun - Aug
      ]
    },
    {
      name: "LFX Mentorship",
      color: "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 dark:bg-cyan-500/15",
      spans: [
        { start: 3, end: 5, label: "Spring Term" }, // Mar - May
        { start: 6, end: 8, label: "Summer Term" }, // Jun - Aug
        { start: 9, end: 11, label: "Fall Term" } // Sep - Nov
      ]
    },
    {
      name: "MLH Fellowship",
      color: "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300 dark:bg-sky-500/15",
      spans: [
        { start: 1, end: 4, label: "Spring Batch" }, // Jan - Apr
        { start: 6, end: 8, label: "Summer Batch" }, // Jun - Aug
        { start: 9, end: 12, label: "Fall Batch" } // Sep - Dec
      ]
    },
    {
      name: "GirlScript Summer of Code",
      color: "bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300 dark:bg-pink-500/15",
      spans: [
        { start: 5, end: 8, label: "Coding Phase" } // May - Aug
      ]
    },
    {
      name: "European Summer of Code",
      color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 dark:bg-indigo-500/15",
      spans: [
        { start: 2, end: 4, label: "Applications" }, // Feb - Apr
        { start: 4, end: 8, label: "Projects" } // Apr - Aug
      ]
    },
    {
      name: "Hacktoberfest",
      color: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300 dark:bg-orange-500/15",
      spans: [
        { start: 10, end: 10, label: "Active Event" } // Oct
      ]
    }
  ];

  return (
    <div className="bg-surface border border-hairline rounded-2xl p-6 pl-10 shadow-[4px_4px_0px_0px_var(--hairline)] relative overflow-hidden transition-all duration-300">
      {/* Spiral Binding Holes */}
      <div className="absolute left-[3px] top-0 bottom-0 w-2 flex flex-col justify-around py-8 pointer-events-none z-20">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-base border border-hairline shadow-inner" />
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

            {programsTimelineData.map((p) => (
              <div 
                key={p.name} 
                className="flex items-center min-h-[56px] py-2 px-4 rounded-xl bg-surface-raised border border-hairline shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200 group"
              >
                {/* Left: Program Label */}
                <div className="w-52 flex-shrink-0 font-bold text-xs sm:text-sm text-primary pr-4 truncate">
                  {p.name}
                </div>

                {/* Right: Gantt spans */}
                <div className="flex-1 grid grid-cols-12 gap-2 h-9 relative">
                  {p.spans.map((span, sIdx) => {
                    const gridStart = span.start;
                    
                    // Determine if this span covers the current month
                    const coversCurrentMonth = currentMonthIndex >= (span.start - 1) && currentMonthIndex <= (span.end - 1);
                    
                    return (
                      <div
                        key={sIdx}
                        style={{ 
                          gridColumnStart: gridStart, 
                          gridColumnEnd: span.end + 1 
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
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
