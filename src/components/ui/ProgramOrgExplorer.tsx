'use client';

import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Building2,
  Sparkles,
  Filter,
  ChevronDown,
  ArrowRight,
  Zap,
  Shield,
  Code2,
} from 'lucide-react';
import { Organization } from '../../../types';
import { ProgramOrgCard, ProgramOrgCardSkeleton } from './ProgramOrgCard';

interface ProgramOrgExplorerProps {
  programId: string;
  programSlug: string;
  programName: string;
  accentColor: string;
  /** SSR-hydrated initial organizations */
  initialOrgs: Organization[];
  initialTotal: number;
  /** Available years for this program's orgs */
  availableYears: number[];
  /** Distinct technologies for this program's orgs */
  availableTechnologies?: string[];
}

export function ProgramOrgExplorer({
  programId,
  programSlug,
  programName,
  accentColor,
  initialOrgs,
  initialTotal,
  availableYears,
  availableTechnologies = [],
}: ProgramOrgExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter state
  const [selectedYears, setSelectedYears] = useState<number[]>(() => {
    const urlYears = searchParams.get('years');
    if (urlYears) {
      return urlYears
        .split(',')
        .map(Number)
        .filter((n) => Number.isFinite(n));
    }
    return [];
  });
  const [strictMatch, setStrictMatch] = useState(
    searchParams.get('yearMode') === 'and'
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('orgSearch') || ''
  );
  const [selectedTech, setSelectedTech] = useState(
    searchParams.get('technology') || ''
  );

  // Data state
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrgs);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // Fetch organizations when filters change
  const fetchOrganizations = useCallback(
    async (years: number[], strict: boolean, search: string, tech: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('programId', programId);
        params.set('limit', '48');
        if (years.length > 0) {
          params.set('years', years.join(','));
          params.set('yearMode', strict ? 'and' : 'or');
        }
        if (search.trim()) {
          params.set('q', search.trim());
        }
        if (tech.trim()) {
          params.set('technology', tech.trim());
        }

        const res = await fetch(`/api/organizations?${params}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOrganizations(data.organizations || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('ProgramOrgExplorer fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [programId]
  );

  // Sync URL with filter state
  const syncUrl = useCallback(
    (years: number[], strict: boolean, search: string, tech: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (years.length > 0) {
        params.set('years', years.join(','));
        params.set('yearMode', strict ? 'and' : 'or');
      } else {
        params.delete('years');
        params.delete('yearMode');
      }
      if (search.trim()) {
        params.set('orgSearch', search.trim());
      } else {
        params.delete('orgSearch');
      }
      if (tech.trim()) {
        params.set('technology', tech.trim());
      } else {
        params.delete('technology');
      }
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  // Year toggle handler
  const toggleYear = (year: number) => {
    setSelectedYears((prev) => {
      const next = prev.includes(year)
        ? prev.filter((y) => y !== year)
        : [...prev, year];
      fetchOrganizations(next, strictMatch, searchQuery, selectedTech);
      syncUrl(next, strictMatch, searchQuery, selectedTech);
      return next;
    });
  };

  // Strict match toggle
  const toggleStrictMatch = () => {
    setStrictMatch((prev) => {
      const next = !prev;
      fetchOrganizations(selectedYears, next, searchQuery, selectedTech);
      syncUrl(selectedYears, next, searchQuery, selectedTech);
      return next;
    });
  };

  // Search with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrganizations(selectedYears, strictMatch, value, selectedTech);
      syncUrl(selectedYears, strictMatch, value, selectedTech);
    }, 350);
  };

  // Technology selection handler
  const handleTechChange = (value: string) => {
    setSelectedTech(value);
    fetchOrganizations(selectedYears, strictMatch, searchQuery, value);
    syncUrl(selectedYears, strictMatch, searchQuery, value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedYears([]);
    setStrictMatch(false);
    setSearchQuery('');
    setSelectedTech('');
    fetchOrganizations([], false, '', '');
    syncUrl([], false, '', '');
  };

  const hasActiveFilters =
    selectedYears.length > 0 || searchQuery.trim().length > 0 || selectedTech.trim().length > 0;

  return (
    <section className="mt-6" id="explore-orgs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                color: accentColor,
              }}
            >
              <Building2 size={16} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-muted font-bold">
              Organization Explorer
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Explore {programName} Organizations
          </h2>
          <p className="text-secondary text-sm mt-2 max-w-2xl">
            Browse and filter organizations participating in {programName}.
            Select years to find active orgs, or use the search and technology filters.
          </p>
        </div>
      </div>

      {/* Horizontal Filter Bar at the Top */}
      <div className="flex flex-col gap-4 bg-surface border border-hairline rounded-[24px] p-5 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        {/* Row 1: Search and Technology Dropdown */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search organizations by name or keyword..."
              className="w-full bg-base border border-hairline rounded-xl pl-10 pr-8 py-2.5 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent placeholder-muted font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Technology dropdown */}
          <div className="w-full md:w-[260px] relative">
            <select
              value={selectedTech}
              onChange={(e) => handleTechChange(e.target.value)}
              className="w-full bg-base border border-hairline rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent font-medium appearance-none cursor-pointer pr-10"
            >
              <option value="">All Technologies</option>
              {availableTechnologies.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
          </div>
        </div>

        {/* Row 2: Year pills, strict match toggle & clear button */}
        {availableYears.length > 0 && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-hairline/60">
            {/* Year filter pills */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-muted font-bold mr-1">
                Years:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableYears.map((year) => {
                  const isSelected = selectedYears.includes(year);
                  return (
                    <button
                      key={year}
                      onClick={() => toggleYear(year)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'text-white shadow-sm'
                          : 'bg-base border-hairline text-secondary hover:text-primary hover:border-accent/30'
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: accentColor,
                              borderColor: accentColor,
                            }
                          : undefined
                      }
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Strict match toggle & Clear Filters */}
            <div className="flex flex-wrap items-center gap-5">
              {selectedYears.length >= 2 && (
                <button
                  onClick={toggleStrictMatch}
                  className="flex items-center gap-2.5 group cursor-pointer"
                >
                  <div
                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
                      strictMatch ? '' : 'bg-hairline'
                    }`}
                    style={
                      strictMatch
                        ? { backgroundColor: accentColor }
                        : undefined
                    }
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        strictMatch ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield size={13} className="text-muted shrink-0" />
                    <span className="text-[11px] font-bold text-secondary group-hover:text-primary transition-colors">
                      Consistently Active
                    </span>
                  </div>
                </button>
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-muted hover:text-accent border border-hairline hover:border-accent/30 transition-colors cursor-pointer"
                >
                  <X size={12} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="min-w-0">
        {/* Results Counter / Filtering indicator */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted font-mono">
            Showing{' '}
            <span className="text-primary font-bold">
              {organizations.length}
            </span>{' '}
            of{' '}
            <span className="text-primary font-bold">
              {total.toLocaleString()}
            </span>{' '}
            organizations
          </p>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted font-mono">
              <div
                className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${accentColor} transparent transparent transparent` }}
              />
              Filtering...
            </div>
          )}
        </div>

        {/* 3-Column Org Card Grid */}
        {loading && organizations.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProgramOrgCardSkeleton key={i} />
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-hairline bg-surface">
            <Building2
              size={32}
              className="mx-auto mb-3 text-muted"
            />
            <h3 className="font-bold text-primary mb-1">
              No organizations found
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Try adjusting your filters or search terms to discover more
              organizations.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-accent border border-accent/30 hover:bg-accent/5 transition-colors cursor-pointer"
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <ProgramOrgCard
                key={String(org._id)}
                org={org}
                accentColor={accentColor}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
