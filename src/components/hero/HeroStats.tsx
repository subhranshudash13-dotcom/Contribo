'use client';

import React from 'react';

export function HeroStats({ stats }: { stats: any }) {
    return (
        <div className="w-full max-w-[1240px] mx-auto bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-[28px] py-8 px-6 md:px-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 items-center text-center">
                
                {/* 1. Projects */}
                <div className="flex flex-col items-center space-y-1">
                    <div className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
                        {stats?.projects?.toLocaleString() || '12,115'}+
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 dark:text-slate-950/50 font-mono">
                        Projects
                    </div>
                    <div className="text-[10px] text-white/40 dark:text-slate-950/40 font-medium">
                        Real opportunities
                    </div>
                </div>

                {/* 2. Organizations */}
                <div className="flex flex-col items-center space-y-1 sm:border-l border-white/10 dark:border-slate-950/10 lg:pl-4">
                    <div className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
                        {stats?.orgs?.toLocaleString() || '639'}+
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 dark:text-slate-950/50 font-mono">
                        Organizations
                    </div>
                    <div className="text-[10px] text-white/40 dark:text-slate-950/40 font-medium">
                        Verified & active
                    </div>
                </div>

                {/* 3. Programs */}
                <div className="flex flex-col items-center space-y-1 lg:border-l border-white/10 dark:border-slate-950/10 lg:pl-4">
                    <div className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
                        {stats?.programs?.toLocaleString() || '9'}+
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 dark:text-slate-950/50 font-mono">
                        Programs
                    </div>
                    <div className="text-[10px] text-white/40 dark:text-slate-950/40 font-medium">
                        All major programs
                    </div>
                </div>

                {/* 4. Contributors */}
                <div className="flex flex-col items-center space-y-1 sm:border-l border-white/10 dark:border-slate-950/10 lg:pl-4">
                    <div className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
                        50K+
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 dark:text-slate-950/50 font-mono">
                        Contributors
                    </div>
                    <div className="text-[10px] text-white/40 dark:text-slate-950/40 font-medium">
                        Growing community
                    </div>
                </div>

                {/* 5. Success Rate */}
                <div className="flex flex-col items-center space-y-1 lg:border-l border-white/10 dark:border-slate-950/10 lg:pl-4 col-span-2 sm:col-span-1">
                    <div className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-emerald-400 dark:text-emerald-600">
                        95%
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 dark:text-slate-950/50 font-mono">
                        Success Rate
                    </div>
                    <div className="text-[10px] text-white/40 dark:text-slate-950/40 font-medium">
                        Application success
                    </div>
                </div>

            </div>
        </div>
    );
}
