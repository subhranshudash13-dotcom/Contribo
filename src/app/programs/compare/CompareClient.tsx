'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Scale, Info, Zap } from 'lucide-react';
import {
  CountryData,
  getCountry,
  COMPARISON_PROGRAMS,
} from '@/lib/programs/comparison-data';
import { buildComparisonMatrix } from '@/lib/programs/comparison';
import { ProgramSelectorStrip } from '@/components/programs/comparison/ProgramSelectorStrip';
import { CountryCurrencySelector } from '@/components/programs/comparison/CountryCurrencySelector';
import { ComparisonTable } from '@/components/programs/comparison/ComparisonTable';
import { TimelineOverlapBar } from '@/components/programs/comparison/TimelineOverlapBar';
import { ShareComparisonButton } from '@/components/programs/comparison/ShareComparisonButton';

const PRESETS = [
  { label: 'GSoC vs LFX', slugs: ['gsoc', 'lfx'] },
  { label: 'GSoC vs Outreachy', slugs: ['gsoc', 'outreachy'] },
  { label: 'Top 3 Stipends', slugs: ['gsoc', 'lfx', 'outreachy'] },
  { label: 'Spring & Summer Sprints', slugs: ['nsoc', 'gsoc', 'summer-of-bitcoin'] },
];

export function CompareClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial values from URL query parameters
  const initialSlugs = useMemo(() => {
    const rawPrograms = searchParams.get('programs');
    if (!rawPrograms) return ['gsoc', 'lfx'];
    const parsed = rawPrograms
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !!COMPARISON_PROGRAMS[s]);
    return parsed.length >= 2 ? parsed.slice(0, 4) : ['gsoc', 'lfx'];
  }, [searchParams]);

  const initialCountryCode = useMemo(() => {
    const rawCountry = searchParams.get('country');
    return rawCountry ? rawCountry.trim().toUpperCase() : 'US';
  }, [searchParams]);

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs);
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(getCountry(initialCountryCode));

  // Sync state back to URL query parameters when selections change
  const syncToUrl = useCallback(
    (slugs: string[], country: CountryData) => {
      const params = new URLSearchParams();
      params.set('programs', slugs.join(','));
      params.set('country', country.code);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleToggleSlug = (slug: string) => {
    let next: string[];
    if (selectedSlugs.includes(slug)) {
      if (selectedSlugs.length <= 2) return; // Keep at least 2 programs
      next = selectedSlugs.filter((s) => s !== slug);
    } else {
      if (selectedSlugs.length >= 4) return; // Maximum 4
      next = [...selectedSlugs, slug];
    }
    setSelectedSlugs(next);
    syncToUrl(next, selectedCountry);
  };

  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country);
    syncToUrl(selectedSlugs, country);
  };

  const handleRemoveProgram = (slug: string) => {
    if (selectedSlugs.length <= 2) return;
    const next = selectedSlugs.filter((s) => s !== slug);
    setSelectedSlugs(next);
    syncToUrl(next, selectedCountry);
  };

  const handleReset = () => {
    const defaultSlugs = ['gsoc', 'lfx'];
    const defaultCountry = getCountry('US');
    setSelectedSlugs(defaultSlugs);
    setSelectedCountry(defaultCountry);
    syncToUrl(defaultSlugs, defaultCountry);
  };

  const handleApplyPreset = (presetSlugs: string[]) => {
    setSelectedSlugs(presetSlugs);
    syncToUrl(presetSlugs, selectedCountry);
  };

  // Build matrix computation in real-time
  const matrix = useMemo(() => {
    return buildComparisonMatrix(selectedSlugs, selectedCountry.code);
  }, [selectedSlugs, selectedCountry]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Programs Catalog
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Scale className="w-3 h-3" />
              NSoC 2026 Core Engine
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Real-Time Decision Matrix
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Multi-Program Comparison Engine
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-3xl leading-relaxed">
              Compare regional PPP stipends, eligibility criteria, weekly workloads, and timeline clashes side-by-side
              across open-source mentorship programs.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ShareComparisonButton selectedSlugs={selectedSlugs} countryCode={selectedCountry.code} />
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Quick Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleApplyPreset(preset.slugs)}
              className="text-xs px-2.5 py-1 rounded-lg border border-border bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground font-medium transition-all shadow-2xs hover:border-primary/40"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Controls Card: Program Selector & Country Currency Selector */}
        <div className="p-5 border border-border rounded-2xl bg-card/50 space-y-5 shadow-xs">
          <ProgramSelectorStrip
            selectedSlugs={selectedSlugs}
            onToggleSlug={handleToggleSlug}
            onReset={handleReset}
          />

          <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CountryCurrencySelector
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span>
                Exchange rate: 1 USD = {selectedCountry.exchangeRateToUsd} {selectedCountry.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Collision & Workload Analyzer */}
        <TimelineOverlapBar
          programs={matrix.programs}
          conflicts={matrix.conflicts}
        />

        {/* Responsive Side-by-Side Comparison Matrix */}
        <ComparisonTable
          programs={matrix.programs}
          stipends={matrix.stipends}
          country={selectedCountry}
          onRemoveProgram={handleRemoveProgram}
        />
      </main>
    </div>
  );
}
