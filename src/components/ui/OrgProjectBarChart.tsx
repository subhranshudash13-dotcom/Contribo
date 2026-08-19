'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export interface OrgYearStat {
  year: number;
  count: number;
}

interface OrgProjectBarChartProps {
  data?: OrgYearStat[];
  orgName?: string;
  className?: string;
}

export function OrgProjectBarChart({
  data = [],
  orgName,
  className = '',
}: OrgProjectBarChartProps) {
  const [hoveredYear, setHoveredYear] = useState<OrgYearStat | null>(null);

  const sortedData = [...data].sort((a, b) => a.year - b.year);

  const chartData =
    sortedData.length > 0
      ? sortedData
      : [
          { year: 2020, count: 4 },
          { year: 2021, count: 8 },
          { year: 2022, count: 11 },
          { year: 2023, count: 9 },
          { year: 2024, count: 14 },
          { year: 2025, count: 16 },
          { year: 2026, count: 10 },
        ];

  const maxVal = Math.max(...chartData.map((d) => d.count), 1);
  const step = Math.max(1, Math.ceil(maxVal / 4));
  const yMax = step * 4;
  const yTicks = [0, step, step * 2, step * 3, yMax];

  return (
    <div
      className={`bg-page/60 border border-hairline rounded-xl p-4 sm:p-5 text-primary select-none ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-hairline/60">
        <div className="flex items-center gap-2">
          <BarChart3 size={15} className="text-accent shrink-0" />
          <span className="text-xs font-bold font-sans tracking-wide uppercase text-secondary">
            Annual Completed Projects History
          </span>
        </div>
        {orgName && (
          <span className="text-[11px] font-mono text-muted truncate max-w-[200px]">
            {orgName}
          </span>
        )}
      </div>

      <div className="relative pt-2 pb-1">
        {/* Tooltip Header */}
        <div className="h-6 mb-2 flex items-center justify-center">
          {hoveredYear ? (
            <motion.div
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono bg-surface border border-hairline px-3 py-0.5 rounded-full text-primary shadow-xs font-medium"
            >
              <span className="text-accent font-bold">{hoveredYear.count}</span> project
              {hoveredYear.count === 1 ? '' : 's'} in <strong className="text-primary">{hoveredYear.year}</strong>
            </motion.div>
          ) : (
            <span className="text-[11px] font-mono text-muted">
              Hover over any year bar to view completed project count
            </span>
          )}
        </div>

        {/* Chart Canvas */}
        <div className="relative h-40 flex items-end ml-7 mr-2">
          {/* Y-Axis Guidelines */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between -ml-7 w-full">
            {[...yTicks].reverse().map((tick) => (
              <div key={tick} className="relative flex items-center w-full">
                <span className="text-[10px] font-mono text-muted w-5 text-right pr-1.5">
                  {tick}
                </span>
                <div className="flex-1 border-b border-hairline/30" />
              </div>
            ))}
          </div>

          {/* Vertical Bars */}
          <div className="relative z-10 w-full h-full flex items-end justify-around gap-1.5 sm:gap-3">
            {chartData.map((item) => {
              const heightPercent = Math.max(6, Math.round((item.count / yMax) * 100));
              const isHovered = hoveredYear?.year === item.year;

              return (
                <div
                  key={item.year}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredYear(item)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={`w-full max-w-[26px] rounded-t-md transition-all duration-150 ${
                      isHovered
                        ? 'bg-accent shadow-md scale-y-[1.02] ring-2 ring-accent/30'
                        : 'bg-[#4B8A9E]/85 hover:bg-accent'
                    }`}
                    style={{ minHeight: '6px' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="border-t border-hairline mt-1.5 ml-7 mr-2 flex justify-around gap-1.5 sm:gap-3 pt-2">
          {chartData.map((item) => (
            <span
              key={item.year}
              className={`flex-1 text-center font-mono text-[10px] sm:text-[11px] transition-colors truncate ${
                hoveredYear?.year === item.year
                  ? 'text-accent font-bold'
                  : 'text-muted hover:text-primary'
              }`}
            >
              {item.year}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
