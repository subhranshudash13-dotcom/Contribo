import React from 'react';
import { Search } from 'lucide-react';

export function HeroSearch() {
    return (
        <div 
            className="w-full max-w-[620px] h-[60px] bg-surface border border-hairline rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.01)] mt-8 pl-5 pr-2 flex items-center cursor-text transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-hairline/80 group"
            onClick={() => {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('open-command-palette'));
                }
            }}
        >
            <Search size={18} className="text-muted group-hover:text-primary transition-colors mr-3 shrink-0" />
            <span className="flex-1 text-muted text-xs sm:text-[14px] text-left truncate font-medium">Search projects by tech stack, organization...</span>
            <button className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-colors shadow-sm shrink-0 cursor-pointer">
                Search
            </button>
        </div>
    );
}
