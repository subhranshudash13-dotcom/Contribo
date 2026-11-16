'use client';

import React from 'react';
import { Globe2 } from 'lucide-react';
import { SUPPORTED_COUNTRIES, CountryData } from '@/lib/programs/comparison-data';

interface CountryCurrencySelectorProps {
  selectedCountry: CountryData;
  onSelectCountry: (country: CountryData) => void;
  className?: string;
}

export function CountryCurrencySelector({
  selectedCountry,
  onSelectCountry,
  className = '',
}: CountryCurrencySelectorProps) {
  const popularCountryCodes = ['US', 'IN', 'DE', 'GB', 'CA', 'NG', 'BR'];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-1">
        <Globe2 className="w-3.5 h-3.5 text-primary" />
        <span>Location & PPP:</span>
      </div>

      <div className="relative inline-block">
        <select
          value={selectedCountry.code}
          onChange={(e) => {
            const country = SUPPORTED_COUNTRIES.find((c) => c.code === e.target.value);
            if (country) onSelectCountry(country);
          }}
          className="appearance-none bg-background border border-border text-foreground text-xs rounded-lg px-3 py-1.5 pr-7 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 hover:border-primary/50 transition-colors cursor-pointer"
          aria-label="Select country for purchasing power parity calculations"
        >
          {SUPPORTED_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.currency} {c.currencySymbol}) — {(c.pppMultiplier * 100).toFixed(0)}% PPP
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">
          ▼
        </span>
      </div>

      {/* Quick shortcuts for top countries */}
      <div className="hidden sm:flex items-center gap-1 ml-1">
        {popularCountryCodes.map((code) => {
          const c = SUPPORTED_COUNTRIES.find((item) => item.code === code);
          if (!c) return null;
          const isSelected = selectedCountry.code === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onSelectCountry(c)}
              className={`text-[11px] px-2 py-1 rounded-md transition-all font-mono ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              title={`${c.name} (${c.currencySymbol})`}
            >
              {c.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
