'use client';

import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';
import type { IssueListFilter } from '@/lib/issues/types';

interface IssueFilterSidebarProps {
  filters: IssueListFilter;
  facets?: {
    languages: Record<string, number>;
    programs: Record<string, number>;
    difficulties: Record<string, number>;
  };
  onFilterChange: (newFilters: Partial<IssueListFilter>) => void;
  onResetFilters: () => void;
}

export function IssueFilterSidebar({
  filters,
  facets,
  onFilterChange,
  onResetFilters,
}: IssueFilterSidebarProps) {
  const programs = [
    { id: 'all', label: 'All Programs' },
    { id: 'GSoC 2026', label: 'GSoC 2026' },
    { id: 'LFX Mentorship', label: 'LFX Mentorship' },
    { id: 'Outreachy', label: 'Outreachy' },
    { id: 'NSoC 2026', label: 'NSoC 2026' },
    { id: 'Hacktoberfest', label: 'Hacktoberfest' },
  ];

  const languages = [
    'all',
    'typescript',
    'python',
    'rust',
    'go',
    'javascript',
    'java',
    'c++',
    'c',
  ];

  const difficulties = [
    { id: 'all', label: 'All Difficulties' },
    { id: 'easy', label: 'Easy (Good First Issue)' },
    { id: 'medium', label: 'Medium (Feature Slice)' },
    { id: 'hard', label: 'Hard (Deep Dive)' },
  ];

  const scopes = [
    { id: 'all', label: 'All Scopes' },
    { id: 'quick-fix', label: 'Quick-fix (~1-3h)' },
    { id: 'feature-slice', label: 'Feature-slice (~4-8h)' },
    { id: 'deep-dive', label: 'Deep-dive (~12h+)' },
  ];

  const activeFiltersCount = [
    filters.program && filters.program !== 'all',
    filters.language && filters.language !== 'all',
    filters.difficulty && filters.difficulty !== 'all',
    filters.scope && filters.scope !== 'all',
    filters.hasMentor === true,
  ].filter(Boolean).length;

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6 rounded-2xl border border-hairline bg-surface p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-hairline/80 pb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-accent" />
          <h2 className="font-heading text-sm font-bold text-primary">Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 font-mono text-xs text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Program Facet */}
      <div className="space-y-2.5">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">Program</h3>
        <div className="space-y-1">
          {programs.map((prog) => {
            const isSelected = (filters.program || 'all') === prog.id;
            const count = prog.id === 'all' ? undefined : facets?.programs?.[prog.id];
            return (
              <button
                key={prog.id}
                type="button"
                onClick={() => onFilterChange({ program: prog.id, page: 1 })}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-white font-bold'
                    : 'text-secondary hover:bg-surface-raised hover:text-primary'
                }`}
              >
                <span>{prog.label}</span>
                {typeof count === 'number' && (
                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Programming Language Facet */}
      <div className="space-y-2.5">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Programming Language
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {languages.map((lang) => {
            const isSelected = (filters.language || 'all').toLowerCase() === lang.toLowerCase();
            const count = lang === 'all' ? undefined : facets?.languages?.[lang];
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onFilterChange({ language: lang, page: 1 })}
                className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-medium uppercase transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-accent text-white font-bold shadow-xs'
                    : 'border-hairline bg-surface-raised text-secondary hover:border-accent/40 hover:text-primary'
                }`}
              >
                <span>{lang}</span>
                {typeof count === 'number' && (
                  <span className={`ml-1 text-[10px] ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Facet */}
      <div className="space-y-2.5">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Difficulty Tier
        </h3>
        <div className="space-y-1">
          {difficulties.map((diff) => {
            const isSelected = (filters.difficulty || 'all') === diff.id;
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => onFilterChange({ difficulty: diff.id, page: 1 })}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-white font-bold'
                    : 'text-secondary hover:bg-surface-raised hover:text-primary'
                }`}
              >
                <span>{diff.label}</span>
                {isSelected && <Check size={13} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scope / Effort Facet */}
      <div className="space-y-2.5">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Scope / Time Budget
        </h3>
        <div className="space-y-1">
          {scopes.map((sc) => {
            const isSelected = (filters.scope || 'all') === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => onFilterChange({ scope: sc.id, page: 1 })}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-white font-bold'
                    : 'text-secondary hover:bg-surface-raised hover:text-primary'
                }`}
              >
                <span>{sc.label}</span>
                {isSelected && <Check size={13} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mentor Guidance Only Toggle */}
      <div className="pt-2 border-t border-hairline/80">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasMentor === true}
            onChange={(e) => onFilterChange({ hasMentor: e.target.checked ? true : null, page: 1 })}
            className="h-4 w-4 rounded-md border-hairline text-accent focus:ring-accent accent-accent"
          />
          <span className="font-mono text-xs font-semibold text-secondary">
            Only issues with Mentor Guidance
          </span>
        </label>
      </div>
    </aside>
  );
}
