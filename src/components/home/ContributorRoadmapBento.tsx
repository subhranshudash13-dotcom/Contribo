'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  GitFork,
  GitPullRequest,
  Sparkles,
  Calendar,
  UserCheck,
  ArrowRight,
  Terminal,
  Award,
  CheckCircle2,
  Code2,
  ShieldCheck,
} from 'lucide-react';

interface BentoStep {
  step: string;
  title: string;
  desc: string;
  stage: 'Foundation' | 'Contribution' | 'Impact';
  icon: React.ElementType;
}

const STEPS: BentoStep[] = [
  {
    step: '01',
    title: 'I am a Beginner',
    desc: 'Learn code basics and find interests.',
    stage: 'Foundation',
    icon: Compass,
  },
  {
    step: '02',
    title: 'Learn Git',
    desc: 'Learn commits, branches, and merges.',
    stage: 'Foundation',
    icon: GitFork,
  },
  {
    step: '03',
    title: 'First PR',
    desc: 'Contribute documentation or simple typos.',
    stage: 'Contribution',
    icon: GitPullRequest,
  },
  {
    step: '04',
    title: 'Hacktoberfest',
    desc: 'Join your first global open-source event.',
    stage: 'Contribution',
    icon: Sparkles,
  },
  {
    step: '05',
    title: 'GSoC / ESoC',
    desc: 'Engage in full-time summer mentorship.',
    stage: 'Impact',
    icon: Calendar,
  },
  {
    step: '06',
    title: 'Become Maintainer',
    desc: 'Take ownership of projects and mentor others.',
    stage: 'Impact',
    icon: UserCheck,
  },
];

export function ContributorRoadmapBento() {
  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted font-bold flex items-center gap-2">
            <Compass size={14} className="text-accent" /> Path
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary tracking-tight mt-2">
            Contributor roadmap
          </h2>
          <p className="text-secondary text-sm sm:text-base mt-2 max-w-2xl font-normal leading-relaxed">
            Your progressive path from writing your first lines of code to leading global open-source initiatives.
          </p>
        </div>

        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs sm:text-sm font-semibold transition-all hover:border-accent/40 shadow-2xs shrink-0 self-start sm:self-auto group"
        >
          <span>Explore All Roadmaps</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-accent" />
        </Link>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5">
        {/* ── CARD 01: I am a Beginner (Col 7 on desktop) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 group relative rounded-2xl sm:rounded-3xl border border-hairline bg-surface p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-hidden hover:border-accent/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Foundation
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-muted/40 group-hover:text-emerald-500/60 transition-colors">
                01
              </span>
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Compass size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-primary">
                I am a Beginner
              </h3>
            </div>

            <p className="text-secondary text-sm sm:text-[15px] leading-relaxed max-w-md">
              Learn code basics and find interests. Discover where your passion lies across web, AI, systems, or tools.
            </p>
          </div>

          {/* Interactive Visual Element */}
          <div className="mt-5 pt-4 border-t border-hairline/60 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <Code2 size={13} className="text-muted mr-1" />
            <span className="px-2 py-0.5 rounded-md bg-page border border-hairline text-secondary">
              Python
            </span>
            <span className="px-2 py-0.5 rounded-md bg-page border border-hairline text-secondary">
              TypeScript
            </span>
            <span className="px-2 py-0.5 rounded-md bg-page border border-hairline text-secondary">
              Rust
            </span>
            <span className="px-2 py-0.5 rounded-md bg-page border border-hairline text-secondary">
              Go
            </span>
            <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={11} /> Start Here
            </span>
          </div>
        </div>

        {/* ── CARD 02: Learn Git (Col 5 on desktop) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 group relative rounded-2xl sm:rounded-3xl border border-hairline bg-surface p-5 sm:p-6 lg:p-7 flex flex-col justify-between overflow-hidden hover:border-accent/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                Foundation
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-muted/40 group-hover:text-sky-500/60 transition-colors">
                02
              </span>
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <GitFork size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-primary">
                Learn Git
              </h3>
            </div>

            <p className="text-secondary text-sm leading-relaxed">
              Learn commits, branches, and merges. Master local development and pull request workflows.
            </p>
          </div>

          {/* Mini Terminal Visual */}
          <div className="mt-5 pt-4 border-t border-hairline/60">
            <div className="flex items-center gap-2 bg-page/80 border border-hairline rounded-xl px-3 py-2 font-mono text-[11px] text-muted overflow-hidden">
              <Terminal size={12} className="text-sky-500 shrink-0" />
              <span className="text-primary truncate">git commit -m &quot;feat: initial setup&quot;</span>
            </div>
          </div>
        </div>

        {/* ── CARD 03: First PR (Col 4 on desktop) ── */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 group relative rounded-2xl sm:rounded-3xl border border-hairline bg-surface p-5 sm:p-6 flex flex-col justify-between overflow-hidden hover:border-accent/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-28 h-28 bg-brass/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-brass/10 text-brass border border-brass/25 uppercase tracking-wider">
                Contribution
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-muted/40 group-hover:text-brass/60 transition-colors">
                03
              </span>
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-brass/10 text-brass flex items-center justify-center shrink-0">
                <GitPullRequest size={18} />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-primary">
                First PR
              </h3>
            </div>

            <p className="text-secondary text-sm leading-relaxed">
              Contribute documentation or simple typos. Experience the review cycle firsthand.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-hairline/60 flex items-center justify-between font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              #1 Merged
            </span>
            <span className="text-muted text-[10px]">good first issue</span>
          </div>
        </div>

        {/* ── CARD 04: Hacktoberfest (Col 4 on desktop) ── */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 group relative rounded-2xl sm:rounded-3xl border border-hairline bg-surface p-5 sm:p-6 flex flex-col justify-between overflow-hidden hover:border-accent/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 uppercase tracking-wider">
                Contribution
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-muted/40 group-hover:text-amber-500/60 transition-colors">
                04
              </span>
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-primary">
                Hacktoberfest
              </h3>
            </div>

            <p className="text-secondary text-sm leading-relaxed">
              Join your first global open-source event. Build momentum across multiple repos in October.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-hairline/60 flex items-center justify-between font-mono text-[11px]">
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <Award size={13} /> Global Event
            </span>
            <span className="text-muted text-[10px]">4 PRs Goal</span>
          </div>
        </div>

        {/* ── CARD 05: GSoC / ESoC (Col 4 on desktop) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 group relative rounded-2xl sm:rounded-3xl border border-hairline bg-surface p-5 sm:p-6 flex flex-col justify-between overflow-hidden hover:border-accent/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.2)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 uppercase tracking-wider">
                Impact
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-muted/40 group-hover:text-purple-500/60 transition-colors">
                05
              </span>
            </div>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-primary">
                GSoC / ESoC
              </h3>
            </div>

            <p className="text-secondary text-sm leading-relaxed">
              Engage in full-time summer mentorship. Work directly with top industry mentors and earn stipends.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-hairline/60 flex items-center justify-between font-mono text-[11px]">
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              1:1 Mentorship
            </span>
            <span className="text-muted text-[10px]">Stipend Track</span>
          </div>
        </div>

        {/* ── CARD 06: Become Maintainer (Col 12 Full Width Bento Anchor) ── */}
        <div className="col-span-1 md:col-span-12 group relative rounded-2xl sm:rounded-3xl border border-hairline bg-surface p-5 sm:p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden hover:border-accent/40 hover:shadow-[0_16px_45px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_45px_rgba(0,0,0,0.25)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-accent/10 text-accent border border-accent/25 uppercase tracking-wider">
                Impact • Mastery
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-muted/40 group-hover:text-accent/60 transition-colors">
                06
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <UserCheck size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary">
                Become Maintainer
              </h3>
            </div>

            <p className="text-secondary text-sm sm:text-base leading-relaxed font-normal">
              Take ownership of projects and mentor others. Review architecture PRs, shape project roadmaps, and foster the next generation of contributors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-page border border-hairline">
                <ShieldCheck size={13} className="text-accent" /> Triage Issues
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-page border border-hairline">
                <GitPullRequest size={13} className="text-accent" /> Review Code
              </span>
            </div>

            <Link
              href="/roadmaps"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              Start Roadmap <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
