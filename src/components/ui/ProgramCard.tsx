import React from 'react';
import Link from 'next/link';
import { ChevronRight, CalendarDays, DollarSign, ArrowRight } from 'lucide-react';
import { Program } from '../../../types';

import { ProgramLogo } from './ProgramLogos';

export function ProgramCard({ program }: { program: Program }) {
  const accent = program.accentColor || '#4285F4';

  return (
    <Link href={`/programs/${program.slug}`} className="group block h-full">
      <div 
        className="border border-hairline rounded-[24px] p-6 bg-surface flex flex-col h-full transition-all duration-200 hover:border-accent/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden"
        style={{
          '--program-accent': accent,
        } as React.CSSProperties}
      >
        {/* Hover glow top bar */}
        <div 
          className="absolute top-0 left-0 w-full h-[3px] opacity-70 transition-colors"
          style={{ backgroundColor: accent }}
        />

        {/* Hover subtle radial light gradient */}
        <div 
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity duration-200 pointer-events-none"
          style={{ backgroundColor: accent }}
        />
        
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-base border border-hairline p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
            <ProgramLogo slug={program.slug} color={true} className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 
              className="text-lg font-bold line-clamp-1 text-primary transition-colors duration-150"
              style={{ color: 'var(--color-primary)' }}
            >
              {program.name}
            </h2>
            <p className="text-xs text-muted font-mono uppercase tracking-wider mt-0.5">
              {program.organizer}
            </p>
          </div>
        </div>
        
        <p className="text-muted text-sm mb-6 line-clamp-2 flex-grow leading-relaxed font-medium">
          {program.eligibilitySummary}
        </p>
        
        <div className="mt-auto pt-4 border-t border-hairline grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-muted shrink-0" />
            <span className="text-xs font-mono text-primary truncate font-semibold">
              {program.durationWeeks ? `${program.durationWeeks} Weeks` : 'Varies'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-brass shrink-0" />
            <span className="text-xs font-mono text-brass truncate font-bold">
              {program.stipendRange}
            </span>
          </div>
        </div>
        
        <div 
          className="mt-4 flex items-center text-xs font-mono uppercase tracking-wider font-bold transition-all duration-150"
          style={{ color: accent }}
        >
          Explore Program 
          <ArrowRight size={14} className="ml-1.5 transition-transform duration-150 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function ProgramCardSkeleton() {
  return (
    <div className="border border-hairline rounded-[24px] p-6 bg-surface flex flex-col h-full relative overflow-hidden animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-base shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-5 w-3/4 bg-base rounded-sm" />
          <div className="h-3 w-1/3 bg-base rounded-sm" />
        </div>
      </div>
      
      <div className="space-y-2 mb-6 flex-grow">
        <div className="h-4 w-full bg-base rounded-sm" />
        <div className="h-4 w-5/6 bg-base rounded-sm" />
      </div>
      
      <div className="mt-auto pt-4 border-t border-hairline grid grid-cols-2 gap-4">
        <div className="h-4 w-20 bg-base rounded-sm" />
        <div className="h-4 w-24 bg-base rounded-sm" />
      </div>
      
      <div className="mt-4 h-4 w-32 bg-base rounded-sm" />
    </div>
  );
}
