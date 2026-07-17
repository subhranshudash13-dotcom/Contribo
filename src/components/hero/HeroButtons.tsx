import React from 'react';
import Link from 'next/link';
import { Sparkles, Building2, ArrowRight } from 'lucide-react';

export function HeroButtons() {
    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-8 w-full">
            {/* Button 1: Orbit AI */}
            <Link 
                href="/matcher" 
                className="flex items-center justify-center h-[52px] px-6 bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl transition-all shadow-[0_4px_20px_rgba(198,120,72,0.15)] dark:shadow-[0_4px_20px_rgba(229,149,105,0.1)] gap-2 group w-full sm:w-auto"
            >
                <Sparkles size={16} />
                <span>Orbit AI</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Button 2: Explore Organizations */}
            <Link 
                href="/organizations" 
                className="flex items-center justify-center h-[52px] px-6 bg-surface border border-hairline hover:bg-surface-raised/60 text-primary font-bold rounded-2xl transition-all gap-2 group w-full sm:w-auto"
            >
                <Building2 size={16} className="text-secondary" />
                <span>Explore Organizations</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-muted" />
            </Link>

            {/* Button 3: Browse All Projects */}
            <Link 
                href="/projects" 
                className="flex items-center justify-center h-[52px] px-6 bg-transparent hover:bg-surface-raised/40 text-primary font-bold rounded-2xl transition-all w-full sm:w-auto"
            >
                Browse All Projects
            </Link>
        </div>
    );
}
