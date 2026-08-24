import React from 'react';
import Link from 'next/link';
import { CalendarDays, DollarSign, ArrowRight } from 'lucide-react';
import { Program } from '../../../types';
import { ProgramLogo } from './ProgramLogos';

export function ProgramCard({ program }: { program: Program }) {
  const accent = program.accentColor || '#4285F4';

  return (
    <Link href={`/programs/${program.slug}`} className="group block h-full">
      <div 
        className="border border-hairline rounded-none p-7 sm:p-8 bg-surface flex flex-col h-full min-h-[380px] sm:min-h-[410px] transition-all duration-300 hover:border-accent/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] relative overflow-hidden"
        style={{
          '--program-accent': accent,
        } as React.CSSProperties}
      >
        {/* Top Accent Line */}
        <div 
          className="absolute top-0 left-0 w-full h-[3px] opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: accent }}
        />

        {/* Ambient Glow */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: accent }}
        />
        
        {/* Header with Logo, Title & Organizer */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-none overflow-hidden shrink-0 flex items-center justify-center bg-page border border-hairline p-2 shadow-xs transition-transform duration-300 group-hover:scale-105">
            <ProgramLogo slug={program.slug} color={true} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-[22px] font-bold text-primary leading-tight truncate group-hover:text-accent transition-colors duration-200">
              {program.name}
            </h2>
            <p className="text-xs text-muted font-mono uppercase tracking-wider font-semibold mt-1 truncate">
              {program.organizer}
            </p>
          </div>
        </div>
        
        {/* Eligibility & Summary Text */}
        <p className="text-secondary text-sm leading-relaxed mb-6 flex-grow font-normal line-clamp-4">
          {program.eligibilitySummary}
        </p>
        
        {/* Metric Cards (Duration & Stipend) */}
        <div className="mt-auto pt-5 border-t border-hairline/80 grid grid-cols-2 gap-3 mb-5">
          <div className="flex flex-col gap-1 p-3 bg-page/70 border border-hairline/60 rounded-none">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider font-semibold">Duration</span>
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-secondary shrink-0" />
              <span className="text-xs font-mono font-bold text-primary truncate">
                {program.durationWeeks ? `${program.durationWeeks} Weeks` : 'Varies'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-3 bg-page/70 border border-hairline/60 rounded-none">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider font-semibold">Stipend / Grant</span>
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-brass shrink-0" />
              <span className="text-xs font-mono font-extrabold text-brass truncate">
                {program.stipendRange}
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer CTA */}
        <div 
          className="flex items-center justify-between pt-3 border-t border-hairline/50 text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200"
          style={{ color: accent }}
        >
          <span>Explore Program</span>
          <span 
            className="w-7 h-7 flex items-center justify-center rounded-none transition-all duration-200 group-hover:translate-x-1"
            style={{ backgroundColor: `${accent}15` }}
          >
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProgramCardSkeleton() {
  return (
    <div className="border border-hairline rounded-none p-7 sm:p-8 bg-surface flex flex-col h-full min-h-[380px] sm:min-h-[410px] relative overflow-hidden animate-pulse">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 bg-page rounded-none shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-5 w-3/4 bg-page rounded-none" />
          <div className="h-3 w-1/3 bg-page rounded-none" />
        </div>
      </div>
      
      <div className="space-y-2 mb-6 flex-grow">
        <div className="h-4 w-full bg-page rounded-none" />
        <div className="h-4 w-5/6 bg-page rounded-none" />
        <div className="h-4 w-4/6 bg-page rounded-none" />
      </div>
      
      <div className="mt-auto pt-5 border-t border-hairline grid grid-cols-2 gap-3 mb-5">
        <div className="h-12 bg-page rounded-none" />
        <div className="h-12 bg-page rounded-none" />
      </div>
      
      <div className="h-5 w-32 bg-page rounded-none" />
    </div>
  );
}
