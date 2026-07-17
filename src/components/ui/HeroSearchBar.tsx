'use client';

import React from 'react';
import { Search } from 'lucide-react';

export function HeroSearchBar() {
  return (
    <button 
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('open-command-palette'));
        }
      }}
      className="flex items-center gap-3 px-5 py-3.5 mb-8 border border-hairline rounded-full bg-surface hover:border-muted transition-colors text-muted text-sm group w-full max-w-lg shadow-sm cursor-pointer"
    >
      <Search size={18} className="group-hover:text-primary transition-colors" />
      <span className="flex-1 text-left truncate">Search programs, organizations or projects...</span>
      <kbd className="hidden sm:inline-flex items-center justify-center font-mono text-[10px] bg-base w-5 h-5 rounded border border-hairline font-bold">
        /
      </kbd>
    </button>
  );
}
