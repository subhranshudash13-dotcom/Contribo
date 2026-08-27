'use client';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HeroSearch } from './HeroSearch';
import { HeroButtons } from './HeroButtons';

export function HeroContent() {
    return (
        <div className="relative z-10 w-full flex flex-col items-center text-center lg:items-start lg:text-left pt-4 sm:pt-8 lg:-ml-[3px]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] xl:text-[72px] font-bold tracking-tight text-primary leading-[1.1] sm:leading-[1.08] mb-4 font-heading text-balance">
                Accelerate Your<br className="hidden sm:inline" />{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-accent to-brass">
                    Open Source
                </span>{' '}
                Career.
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-secondary leading-relaxed max-w-[580px] mb-8 mx-auto lg:mx-0 font-normal text-balance">
                Your one-stop platform to find the <span className="text-primary font-medium">right organizations</span> and craft <span className="text-primary font-medium">maintainer-friendly proposals</span>.
            </p>
            
            <HeroSearch />
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mt-5 mb-8 sm:mb-9 text-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold mr-1">Try:</span>
                {['React', 'Python', 'Machine Learning', 'Blockchain'].map((tag) => (
                    <button 
                        key={tag} 
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('search-query', { detail: tag }));
                                window.dispatchEvent(new Event('open-command-palette'));
                            }
                        }}
                        className="px-3 py-1 rounded-lg bg-surface/70 border border-hairline text-secondary hover:text-accent hover:border-accent/40 text-xs transition-colors cursor-pointer font-medium"
                    >
                        {tag}
                    </button>
                ))}
            </div>
            
            <HeroButtons />
        </div>
    );
}
