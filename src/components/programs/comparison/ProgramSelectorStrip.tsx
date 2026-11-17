'use client';

import React from 'react';
import { Check, Plus, AlertCircle, RotateCcw } from 'lucide-react';
import { COMPARISON_PROGRAMS, ProgramComparisonRecord } from '@/lib/programs/comparison-data';

interface ProgramSelectorStripProps {
  selectedSlugs: string[];
  onToggleSlug: (slug: string) => void;
  onReset: () => void;
  className?: string;
}

export function ProgramSelectorStrip({
  selectedSlugs,
  onToggleSlug,
  onReset,
  className = '',
}: ProgramSelectorStripProps) {
  const allPrograms: ProgramComparisonRecord[] = Object.values(COMPARISON_PROGRAMS);
  const isMaxReached = selectedSlugs.length >= 4;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Select Programs to Compare:</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
            {selectedSlugs.length} / 4 selected
          </span>
          {selectedSlugs.length < 2 && (
            <span className="text-xs flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Pick at least 2 programs
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {allPrograms.map((program) => {
          const isSelected = selectedSlugs.includes(program.slug);
          const isDisabled = !isSelected && isMaxReached;

          return (
            <button
              key={program.slug}
              type="button"
              disabled={isDisabled}
              onClick={() => onToggleSlug(program.slug)}
              className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                isSelected
                  ? 'bg-card text-foreground shadow-xs border-primary/60 ring-2 ring-primary/20'
                  : isDisabled
                  ? 'bg-muted/30 text-muted-foreground/50 border-dashed border-border cursor-not-allowed opacity-60'
                  : 'bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border-border hover:border-border/80'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: program.accentColor }}
                aria-hidden="true"
              />

              <span>{program.name}</span>

              {isSelected ? (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ml-1">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-muted/80 text-muted-foreground flex items-center justify-center shrink-0 ml-1 group-hover:bg-muted group-hover:text-foreground">
                  <Plus className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
