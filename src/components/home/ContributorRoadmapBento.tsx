'use client';

import React from 'react';
import Link from 'next/link';

export function ContributorRoadmapBento() {
  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline/80 pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted font-bold">
            <span className="text-accent font-mono">[SECTION 04]</span>
            <span>/</span>
            <span>FIELD GUIDE &bull; PROGRESSION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary tracking-tight mt-1.5">
            Contributor roadmap
          </h2>
          <p className="text-secondary text-xs sm:text-sm mt-1 max-w-xl font-normal leading-relaxed">
            The six-stage curriculum from beginner discovery to core project stewardship.
          </p>
        </div>

        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-none border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs font-mono font-bold transition-all hover:border-accent shadow-2xs shrink-0 self-start sm:self-auto uppercase tracking-wider"
        >
          <span>All Tracks</span>
          <span className="text-accent">&rarr;</span>
        </Link>
      </div>

      {/* Bento Grid — Sharp Paperback Editorial Style */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
        {/* ── CARD 01: I am a Beginner ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 rounded-none border-2 border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-950/20 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-600/60 transition-colors shadow-2xs">
          {/* Top Registration Mark */}
          <div className="flex items-center justify-between border-b border-emerald-600/20 dark:border-emerald-500/20 pb-2 mb-3 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
              <span>VOL.01</span>
              <span>&bull;</span>
              <span>FOUNDATION</span>
            </div>
            <span className="text-muted/60 font-mono text-xs font-black">
              #01
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-primary mb-1 tracking-tight">
              I am a Beginner
            </h3>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-lg">
              Learn code basics and find interests. Explore fundamentals across languages, data structures, and ecosystem domains.
            </p>
          </div>

          {/* Paperback Tag Strip */}
          <div className="mt-4 pt-3 border-t border-dashed border-emerald-600/20 dark:border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
            <div className="flex flex-wrap items-center gap-1">
              <span className="px-1.5 py-0.5 border border-emerald-600/30 dark:border-emerald-500/30 bg-surface/80 text-emerald-800 dark:text-emerald-200">
                PY
              </span>
              <span className="px-1.5 py-0.5 border border-emerald-600/30 dark:border-emerald-500/30 bg-surface/80 text-emerald-800 dark:text-emerald-200">
                TS
              </span>
              <span className="px-1.5 py-0.5 border border-emerald-600/30 dark:border-emerald-500/30 bg-surface/80 text-emerald-800 dark:text-emerald-200">
                RS
              </span>
              <span className="px-1.5 py-0.5 border border-emerald-600/30 dark:border-emerald-500/30 bg-surface/80 text-emerald-800 dark:text-emerald-200">
                GO
              </span>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest text-[9px]">
              [ENTRY_LEVEL]
            </span>
          </div>
        </div>

        {/* ── CARD 02: Learn Git ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 rounded-none border-2 border-sky-600/30 dark:border-sky-500/30 bg-sky-500/[0.03] dark:bg-sky-950/20 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-sky-600/60 transition-colors shadow-2xs">
          <div className="flex items-center justify-between border-b border-sky-600/20 dark:border-sky-500/20 pb-2 mb-3 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold uppercase tracking-wider">
              <span>VOL.02</span>
              <span>&bull;</span>
              <span>FOUNDATION</span>
            </div>
            <span className="text-muted/60 font-mono text-xs font-black">
              #02
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-primary mb-1 tracking-tight">
              Learn Git
            </h3>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
              Learn commits, branches, and merges. Build comfort with terminal tooling, remotes, and pull requests.
            </p>
          </div>

          {/* Git Branch Typographical Diagram */}
          <div className="mt-4 pt-3 border-t border-dashed border-sky-600/20 dark:border-sky-500/20 font-mono text-[10px] text-sky-700 dark:text-sky-300 flex items-center justify-between">
            <span className="tracking-tight truncate">
              main &bull;&bull;&bull;&gt; branch:feat &bull;&bull;&bull;&gt; merge
            </span>
            <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 border border-sky-600/30 bg-surface/80 shrink-0 ml-2">
              VCS_PASS
            </span>
          </div>
        </div>

        {/* ── CARD 03: First PR ── */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 rounded-none border-2 border-amber-600/30 dark:border-amber-500/30 bg-amber-500/[0.03] dark:bg-amber-950/20 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-amber-600/60 transition-colors shadow-2xs">
          <div className="flex items-center justify-between border-b border-amber-600/20 dark:border-amber-500/20 pb-2 mb-3 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
              <span>VOL.03</span>
              <span>&bull;</span>
              <span>CONTRIBUTION</span>
            </div>
            <span className="text-muted/60 font-mono text-xs font-black">
              #03
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-primary mb-1 tracking-tight">
              First PR
            </h3>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
              Contribute documentation or simple typos. Submit your first patch and experience real maintainer code reviews.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-amber-600/20 dark:border-amber-500/20 flex items-center justify-between font-mono text-[10px]">
            <span className="font-bold text-amber-700 dark:text-amber-400">
              PR #001: MERGED
            </span>
            <span className="text-muted text-[9px] uppercase tracking-wider">
              +42 -8 lines
            </span>
          </div>
        </div>

        {/* ── CARD 04: Hacktoberfest ── */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 rounded-none border-2 border-rose-600/30 dark:border-rose-500/30 bg-rose-500/[0.03] dark:bg-rose-950/20 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-rose-600/60 transition-colors shadow-2xs">
          <div className="flex items-center justify-between border-b border-rose-600/20 dark:border-rose-500/20 pb-2 mb-3 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider">
              <span>VOL.04</span>
              <span>&bull;</span>
              <span>CONTRIBUTION</span>
            </div>
            <span className="text-muted/60 font-mono text-xs font-black">
              #04
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-primary mb-1 tracking-tight">
              Hacktoberfest
            </h3>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
              Join your first global open-source event. Collaborate across diverse codebases and build confidence under review.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-rose-600/20 dark:border-rose-500/20 flex items-center justify-between font-mono text-[10px]">
            <span className="font-bold text-rose-700 dark:text-rose-400">
              4/4 PRS COMPLETED
            </span>
            <span className="text-muted text-[9px] uppercase tracking-wider">
              OCT_CYCLE
            </span>
          </div>
        </div>

        {/* ── CARD 05: GSoC / ESoC ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 rounded-none border-2 border-purple-600/30 dark:border-purple-500/30 bg-purple-500/[0.03] dark:bg-purple-950/20 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-purple-600/60 transition-colors shadow-2xs">
          <div className="flex items-center justify-between border-b border-purple-600/20 dark:border-purple-500/20 pb-2 mb-3 font-mono text-[10px]">
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wider">
              <span>VOL.05</span>
              <span>&bull;</span>
              <span>IMPACT</span>
            </div>
            <span className="text-muted/60 font-mono text-xs font-black">
              #05
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-primary mb-1 tracking-tight">
              GSoC / ESoC
            </h3>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
              Engage in full-time summer mentorship. Work under senior engineers on high-impact public repositories.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-purple-600/20 dark:border-purple-500/20 flex items-center justify-between font-mono text-[10px]">
            <span className="font-bold text-purple-700 dark:text-purple-400">
              1:1 MENTOR STIPEND
            </span>
            <span className="text-muted text-[9px] uppercase tracking-wider">
              12_WEEKS
            </span>
          </div>
        </div>

        {/* ── CARD 06: Become Maintainer (Dossier Anchor) ── */}
        <div className="col-span-1 md:col-span-12 rounded-none border-2 border-accent/40 bg-accent/[0.04] dark:bg-accent/[0.08] p-4 sm:p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden group hover:border-accent/70 transition-colors shadow-2xs">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 border border-accent/30 bg-surface/90 text-accent font-bold uppercase tracking-wider">
                VOL.06 &bull; MASTERY
              </span>
              <span className="text-muted font-bold tracking-widest text-[9px] uppercase">
                [FINAL_STAGE]
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-heading font-bold text-primary tracking-tight">
              Become Maintainer
            </h3>

            <p className="text-secondary text-xs sm:text-sm leading-relaxed font-normal">
              Take ownership of projects and mentor others. Triage incoming issues, review architecture pull requests, and guide the next wave of contributors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline/60">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted">
              <span className="px-2.5 py-1 bg-surface border border-hairline uppercase">
                TRIAGE_ISSUES
              </span>
              <span className="px-2.5 py-1 bg-surface border border-hairline uppercase">
                MERGE_ACCESS
              </span>
            </div>

            <Link
              href="/roadmaps"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-accent hover:bg-accent-hover text-white text-xs font-mono font-bold transition-all shadow-xs shrink-0 uppercase tracking-wider"
            >
              <span>Start Journey</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
