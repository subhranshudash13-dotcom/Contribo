'use client';

import React from 'react';

interface HeroStatsProps {
  stats?: {
    projects?: number;
    organizations?: number;
    orgs?: number;
    programs?: number;
    contributors?: number;
  } | null;
}

/**
 * Every tile here is a count of rows in the database. A tile with no source
 * query is a tile that should not exist: this band used to advertise a
 * contributor total and an application success rate that no collection could
 * account for (acceptance outcomes were never recorded, so the rate was not
 * computable at all). Both are gone rather than re-labelled.
 */
function statValue(value: number | undefined | null): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString()
    : '—';
}

export function HeroStats({ stats }: HeroStatsProps) {
    const tiles = [
        {
            value: statValue(stats?.projects),
            label: 'Projects',
            caption: 'Listed in the catalog',
        },
        {
            value: statValue(stats?.orgs ?? stats?.organizations),
            label: 'Organizations',
            caption: 'Indexed from program data',
        },
        {
            value: statValue(stats?.programs),
            label: 'Programs',
            caption: 'Tracked on Contribo',
        },
        {
            value: statValue(stats?.contributors),
            label: 'Contributors',
            caption: 'Registered users and listed mentors',
        },
    ];

    return (
        <div className="hidden sm:block w-full max-w-[1240px] mx-auto bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-[28px] py-8 px-6 md:px-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-center text-center">
                {tiles.map((tile, index) => (
                    <div
                        key={tile.label}
                        className={`flex flex-col items-center space-y-1 ${
                            index > 0 ? 'sm:border-l border-white/10 dark:border-slate-950/10 sm:pl-4' : ''
                        }`}
                    >
                        <div className="text-3xl md:text-4xl font-bold font-heading tracking-tight">
                            {tile.value}
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-widest text-white/50 dark:text-slate-950/50 font-mono">
                            {tile.label}
                        </div>
                        <div className="text-[10px] text-white/40 dark:text-slate-950/40 font-medium">
                            {tile.caption}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
