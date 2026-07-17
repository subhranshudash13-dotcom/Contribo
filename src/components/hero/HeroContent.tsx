'use client';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HeroSearch } from './HeroSearch';
import { HeroButtons } from './HeroButtons';

export function HeroContent() {
    return (
        <div className="relative z-10 w-full flex flex-col items-start pt-10 sm:pt-16 -ml-[3px]">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold mb-8 px-4 py-2 bg-accent/5 backdrop-blur-md rounded-full border border-accent/20 inline-flex items-center shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]">
                <Sparkles size={14} className="mr-2 text-accent" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2 animate-pulse" /> GLOBAL MENTORSHIP HUB • 2026 EDITION
            </span>
            <h1 className="text-[44px] sm:text-[64px] lg:text-[76px] leading-[1.05] font-bold tracking-tight text-primary mb-6 whitespace-normal sm:whitespace-nowrap font-heading">
                Accelerate Your<br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-brass">Open Source</span> Career.
            </h1>
            <p className="text-base sm:text-lg font-normal leading-[1.7] text-secondary max-w-[560px] mb-2">
                Direct access to <strong className="font-bold text-primary">120+ global mentorship programs</strong>, <strong className="font-bold text-primary">800+ top organizations</strong>, and <strong className="font-bold text-primary">40,000+ verified starter issues</strong>.
            </p>
            
            <HeroSearch />
            <div className="flex flex-wrap items-center gap-2.5 mt-5 text-xs font-medium text-secondary">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">Try:</span>
                {['React', 'Python', 'Machine Learning', 'Blockchain'].map((tag) => (
                    <button 
                        key={tag} 
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('search-query', { detail: tag }));
                                window.dispatchEvent(new Event('open-command-palette'));
                            }
                        }}
                        className="bg-surface/80 backdrop-blur-sm border border-hairline hover:border-accent hover:bg-accent/5 hover:text-accent px-3.5 py-1.5 rounded-full font-mono text-[10px] text-primary transition-all cursor-pointer shadow-sm font-semibold"
                    >
                        {tag}
                    </button>
                ))}
            </div>
            <HeroButtons />
        </div>
    );
}
