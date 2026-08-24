import React from 'react';
import Link from 'next/link';
import { Sparkles, Building2, ArrowRight } from 'lucide-react';

export function HeroButtons() {
    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3.5 mt-0 w-full justify-center lg:justify-start">
            {/* Button 1: Orbit AI */}
            <Link 
                href="/matcher" 
                className="inline-flex items-center justify-center h-12 px-6 bg-accent hover:bg-accent-hover text-white font-semibold text-sm rounded-xl transition-all shadow-sm gap-2 group w-full sm:w-auto cursor-pointer active:scale-[0.98]"
            >
                <Sparkles size={15} />
                <span>Orbit AI Matcher</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Button 2: Explore Organizations */}
            <Link 
                href="/organizations" 
                className="inline-flex items-center justify-center h-12 px-6 bg-surface border border-hairline hover:bg-surface-raised text-primary font-semibold text-sm rounded-xl transition-all gap-2 group w-full sm:w-auto cursor-pointer active:scale-[0.98]"
            >
                <Building2 size={15} className="text-secondary" />
                <span>Explore Organizations</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-muted" />
            </Link>

            {/* Button 3: Browse All Projects */}
            <Link 
                href="/projects" 
                className="inline-flex items-center justify-center h-12 px-5 text-secondary hover:text-primary font-medium text-sm transition-colors w-full sm:w-auto cursor-pointer"
            >
                Browse Projects
            </Link>
        </div>
    );
}
