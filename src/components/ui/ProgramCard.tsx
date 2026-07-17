import React from 'react';
import Link from 'next/link';
import { ChevronRight, CalendarDays, DollarSign } from 'lucide-react';
import { Program } from '../../../types';

import { ProgramLogo } from './ProgramLogos';

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link href={`/programs/${program.slug}`} className="group block h-full">
      <div className="border border-hairline rounded-md p-6 bg-surface flex flex-col h-full transition-all duration-150 ease-in-out hover:elevation-2 hover:bg-surface-raised focus-within:ring-2 focus-within:ring-brass focus-within:ring-offset-2 relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ backgroundColor: program.accentColor || 'var(--color-program-accent)' }}
        />
        
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-base border border-hairline p-1 shadow-sm">
            <ProgramLogo slug={program.slug} color={true} className="w-full h-full" />
          </div>
          <div>
            <h2 className="text-lg font-bold line-clamp-1 text-primary group-hover:text-program-accent transition-colors duration-100">
              {program.name}
            </h2>
            <p className="text-xs text-muted font-mono uppercase tracking-wide mt-1">
              {program.organizer}
            </p>
          </div>
        </div>
        
        <p className="text-muted text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
          {program.eligibilitySummary}
        </p>
        
        <div className="mt-auto pt-4 border-t border-hairline grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-muted shrink-0" />
            <span className="text-xs font-mono text-primary truncate">
              {program.durationWeeks ? `${program.durationWeeks} Weeks` : 'Varies'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-brass shrink-0" />
            <span className="text-xs font-mono text-primary truncate font-medium">
              {program.stipendRange}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center text-sm font-semibold text-slate group-hover:translate-x-1 transition-transform duration-150">
          Explore Program <ChevronRight size={16} className="ml-1" />
        </div>
      </div>
    </Link>
  );
}

export function ProgramCardSkeleton() {
  return (
    <div className="border border-hairline rounded-md p-6 bg-surface flex flex-col h-full relative overflow-hidden animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-sm bg-base shrink-0" />
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
