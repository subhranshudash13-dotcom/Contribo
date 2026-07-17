'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function OrgSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isPending, startTransition] = useTransition();

  // Update query state if search parameter changes elsewhere
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query);
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
    <form onSubmit={handleSearch} className="w-full max-w-[500px]">
      <div className="relative flex items-center h-[52px] bg-surface border border-hairline rounded-full pl-5 pr-2 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] group shadow-sm focus-within:ring-1 focus-within:ring-accent">
        <Search size={18} className="text-muted group-hover:text-primary transition-colors mr-3 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search organizations by name..."
          className="flex-1 bg-transparent text-primary text-sm focus:outline-none placeholder-muted font-semibold w-full"
        />
        {query && (
          <button 
            type="button"
            onClick={() => { setQuery(''); updateUrl(''); }}
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
    </form>
  );
}
