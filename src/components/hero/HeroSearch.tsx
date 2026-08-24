import React from 'react';
import { Search } from 'lucide-react';

export function HeroSearch() {
    return (
        <div 
            className="w-full max-w-[560px] h-[52px] sm:h-[56px] bg-surface/90 dark:bg-surface/80 backdrop-blur-md border border-hairline rounded-2xl shadow-sm pl-4 sm:pl-5 pr-2 flex items-center cursor-text transition-all hover:border-accent/50 focus-within:border-accent group"
            onClick={() => {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('open-command-palette'));
                }
            }}
        >
            <Search size={18} className="text-muted group-hover:text-primary transition-colors mr-3 shrink-0" />
            <span className="flex-1 text-muted text-xs sm:text-sm text-left truncate font-normal">Search projects, organizations, technologies...</span>
            <button className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer">
                Search
            </button>
        </div>
    );
}
