'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, ArrowDown, ArrowUp } from 'lucide-react';
import { OrgLogo } from './OrgLogo';

type Suggestion = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  category?: string | null;
};

export function OrgSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(paramQuery);
  const [prevParam, setPrevParam] = useState(paramQuery);
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await fetch(`/api/organizations/suggest?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Suggestion request failed');
        const data = (await response.json()) as { suggestions?: Suggestion[] };
        setSuggestions(data.suggestions || []);
        setActiveSuggestion(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setSuggestions([]);
      }
    }, 250);
    return () => {
      window.clearTimeout(timeout);
      abortRef.current?.abort();
    };
  }, [query]);

  if (paramQuery !== prevParam) {
    setPrevParam(paramQuery);
    setQuery(paramQuery);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      router.push(`/organizations/${suggestions[activeSuggestion].slug}`);
      return;
    }
    updateUrl(query);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSuggestions([]);
      setActiveSuggestion(-1);
    } else if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    }
  };

  const updateUrl = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    startTransition(() => {
      router.push(`/organizations?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-[500px] relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsFocused(false);
    }}>
      <div className="relative flex items-center h-[52px] bg-surface border border-hairline rounded-full pl-5 pr-2 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] group shadow-sm focus-within:ring-1 focus-within:ring-accent">
        <Search size={18} className="text-muted group-hover:text-primary transition-colors mr-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-controls="organization-suggestions"
          aria-expanded={isFocused && suggestions.length > 0}
          placeholder="Search organizations by name..."
          className="flex-1 bg-transparent text-primary text-sm focus:outline-none placeholder-muted font-semibold w-full"
        />
        {query && (
          <button 
            type="button"
            onClick={() => { setQuery(''); updateUrl(''); }}
            aria-label="Clear organization search"
            className="p-1 mr-2 text-muted hover:text-primary transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-accent hover:bg-accent-hover text-white px-5 h-[36px] rounded-full font-bold text-xs transition-all shadow-sm shrink-0 cursor-pointer"
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>
      </div>
      {isFocused && suggestions.length > 0 && (
        <div id="organization-suggestions" role="listbox" className="absolute z-20 top-[60px] left-0 right-0 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.slug}
              type="button"
              role="option"
              aria-selected={index === activeSuggestion}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => router.push(`/organizations/${suggestion.slug}`)}
              className={`flex min-h-[52px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-surface-raised ${index === activeSuggestion ? 'bg-surface-raised' : ''}`}
            >
              <OrgLogo name={suggestion.name} slug={suggestion.slug} logoUrl={suggestion.logoUrl} className="h-8 w-8 rounded-lg" size={16} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-primary">{suggestion.name}</span>
                {suggestion.category && <span className="block truncate text-xs text-muted">{suggestion.category}</span>}
              </span>
              {index === activeSuggestion && <ArrowUp size={14} className="text-muted" />}
              {index !== activeSuggestion && <ArrowDown size={14} className="text-muted/40" />}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
