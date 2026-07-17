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
}

export function ProgramOrgExplorer({
  programId,
  programSlug,
  programName,
  accentColor,
  initialOrgs,
  initialTotal,
  availableYears,
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
  const [showFilters, setShowFilters] = useState(true);

  // Data state
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrgs);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // Fetch organizations when filters change
  const fetchOrganizations = useCallback(
    async (years: number[], strict: boolean, search: string) => {
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
    (years: number[], strict: boolean, search: string) => {
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
      fetchOrganizations(next, strictMatch, searchQuery);
      syncUrl(next, strictMatch, searchQuery);
      return next;
    });
  };

  // Strict match toggle
  const toggleStrictMatch = () => {
    setStrictMatch((prev) => {
      const next = !prev;
      if (selectedYears.length > 0) {
        fetchOrganizations(selectedYears, next, searchQuery);
      }
      syncUrl(selectedYears, next, searchQuery);
      return next;
    });
  };

  // Search with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrganizations(selectedYears, strictMatch, value);
      syncUrl(selectedYears, strictMatch, value);
    }, 350);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedYears([]);
    setStrictMatch(false);
    setSearchQuery('');
    fetchOrganizations([], false, '');
    syncUrl([], false, '');
  };

  const hasActiveFilters =
    selectedYears.length > 0 || searchQuery.trim().length > 0;

  return (
    <section className="mt-12 lg:mt-16" id="explore-orgs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
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
            Select years to find active orgs, or use the search to find
            specific ones.
          </p>
        </div>
        <button
          onClick={() => setShowFilters((p) => !p)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-hairline text-xs font-mono uppercase tracking-wider text-secondary hover:text-primary hover:border-accent/30 transition-colors cursor-pointer lg:hidden"
        >
          <Filter size={14} />
          {showFilters ? 'Hide' : 'Show'} Filters
          <ChevronDown
            size={14}
            className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Filter Sidebar */}
        <aside
          className={`lg:w-[280px] shrink-0 space-y-5 transition-all duration-300 ${
            showFilters
              ? 'max-h-[2000px] opacity-100'
              : 'max-h-0 opacity-0 overflow-hidden lg:max-h-none lg:opacity-100'
          }`}
        >
          {/* Search */}
          <div className="bg-surface border border-hairline rounded-2xl p-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search organizations by name, technology, or keyword..."
                className="w-full bg-base border border-hairline rounded-xl pl-9 pr-8 py-2.5 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent placeholder-muted font-medium"
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
          </div>

          {/* Year Filters */}
          {availableYears.length > 0 && (
            <div className="bg-surface border border-hairline rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted font-bold">
                  Years
                </h3>
                {selectedYears.length > 0 && (
                  <span className="text-[10px] font-mono text-accent font-bold">
                    {selectedYears.length} selected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {availableYears.map((year) => {
                  const isSelected = selectedYears.includes(year);
                  return (
                    <button
                      key={year}
                      onClick={() => toggleYear(year)}
                      className={`year-filter-pill px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all duration-150 cursor-pointer ${
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

              {/* Consistently Active toggle — unique filter concept */}
              {selectedYears.length >= 2 && (
                <div className="border-t border-hairline pt-3">
                  <button
                    onClick={toggleStrictMatch}
                    className="flex items-center gap-2.5 w-full group cursor-pointer"
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
                  <p className="text-[10px] text-muted mt-1.5 ml-[46px] leading-relaxed">
                    {strictMatch
                      ? 'Showing orgs active in ALL selected years'
                      : 'Showing orgs active in ANY selected year'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Matcher CTA */}
          <div
            className="rounded-2xl p-4 border relative overflow-hidden"
            style={{
              borderColor: `color-mix(in srgb, ${accentColor} 25%, transparent)`,
              background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 6%, transparent), color-mix(in srgb, ${accentColor} 2%, transparent))`,
            }}
          >
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20"
              style={{ backgroundColor: accentColor }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-brass" />
                <span className="text-xs font-bold text-primary">
                  AI Project Matcher
                </span>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed mb-3">
                Not sure which org fits your skills? Let our AI find the best{' '}
                {programName} projects for you.
              </p>
              <a
                href="/matcher"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                style={{
                  borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
                  color: accentColor,
                }}
              >
                <Zap size={12} />
                Find my match
                <ArrowRight size={12} />
              </a>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-muted hover:text-accent border border-hairline hover:border-accent/30 transition-colors cursor-pointer"
            >
              <X size={12} />
              Clear all filters
            </button>
          )}
        </aside>

        {/* Main content grid */}
        <div className="flex-1 min-w-0">
          {/* Results counter */}
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

          {/* Org grid */}
          {loading && organizations.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
      </div>
    </section>
  );
}
