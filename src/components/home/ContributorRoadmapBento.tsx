'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ContributorRoadmapBento() {
  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs font-mono font-bold text-accent uppercase tracking-wider mb-2">
            <span>The Proven 6-Step Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary tracking-tight">
            Contributor roadmap
          </h2>
          <p className="text-secondary text-sm sm:text-base mt-2 max-w-2xl font-normal leading-relaxed">
            The exact step-by-step path from selecting your stack to getting selected with a winning proposal and becoming an open-source maintainer.
          </p>
        </div>

        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs sm:text-sm font-semibold transition-all hover:border-accent/40 shadow-xs shrink-0 self-start sm:self-auto group"
        >
          <span>View Detailed Roadmaps</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-accent" />
        </Link>
      </div>

      {/* Bento Grid with Solid Color Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
        
        {/* ── CARD 01: Pick Your Stack (Wide Lavender / Indigo) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 rounded-2xl sm:rounded-3xl border border-[#C7D2FE] dark:border-[#3730A3]/50 bg-[#EEF2FF] dark:bg-[#141838] p-5 sm:p-7 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
          {/* Top Visual Showcase: Floating Stack Icons on subtle grid */}
          <div className="relative w-full h-28 sm:h-32 bg-white/70 dark:bg-black/20 rounded-xl sm:rounded-2xl border border-[#C7D2FE]/60 dark:border-[#3730A3]/40 flex items-center justify-center mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#C7D2FE_1px,transparent_1px),linear-gradient(to_bottom,#C7D2FE_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#312E81_1px,transparent_1px),linear-gradient(to_bottom,#312E81_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />
            <div className="relative z-10 flex items-center gap-2 sm:gap-3 px-3 py-2 flex-wrap justify-center">
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E2248] text-xs font-mono font-bold text-[#4338CA] dark:text-[#A5B4FC] shadow-sm border border-[#C7D2FE] dark:border-[#3730A3]">
                TypeScript
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E2248] text-xs font-mono font-bold text-[#4338CA] dark:text-[#A5B4FC] shadow-sm border border-[#C7D2FE] dark:border-[#3730A3]">
                Python
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white text-xs font-mono font-bold shadow-md shadow-indigo-500/20 scale-105">
                Go / Rust
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E2248] text-xs font-mono font-bold text-[#4338CA] dark:text-[#A5B4FC] shadow-sm border border-[#C7D2FE] dark:border-[#3730A3]">
                React
              </span>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1E2248] border border-[#C7D2FE] dark:border-[#3730A3] flex items-center justify-center text-[#4338CA] dark:text-[#A5B4FC] shadow-2xs shrink-0 font-mono font-black text-xs">
                01
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1E1B4B] dark:text-[#EEF2FF]">
                Pick Your Tech Stack
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#4338CA] dark:text-[#A5B4FC] uppercase tracking-wider">
              Focus on languages &amp; frameworks you enjoy
            </p>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed pt-1">
              Select 1–2 primary technologies where you feel comfortable. Whether web, systems, AI/ML, or tooling, choosing your stack early eliminates overwhelm and guides your organization search.
            </p>
          </div>
        </div>

        {/* ── CARD 02: Select the Right Org (Mint Green) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 rounded-2xl sm:rounded-3xl border border-[#A7F3D0] dark:border-[#065F46]/50 bg-[#E6F9EE] dark:bg-[#0A261B] p-5 sm:p-7 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
          {/* Top Visual Showcase: Signal Wave + Live Badge */}
          <div className="relative w-full h-28 sm:h-32 bg-white/70 dark:bg-black/20 rounded-xl sm:rounded-2xl border border-[#A7F3D0]/60 dark:border-[#065F46]/40 flex flex-col justify-between p-3.5 mb-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#047857] dark:text-[#6EE7B7] uppercase">
                Active Catalog
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#047857] dark:text-[#6EE7B7] text-[10px] font-bold border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> LIVE 2026
              </span>
            </div>

            {/* Simulated Activity Signal */}
            <div className="flex items-center justify-center w-full">
              <svg className="w-full h-8 text-[#10B981]" viewBox="0 0 200 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 15 L40 15 L55 5 L70 25 L85 10 L100 20 L115 15 L200 15" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#065F46] dark:text-[#A7F3D0]">
              <span>GSoC &bull; LFX &bull; ESoC</span>
              <span>1,250+ Orgs</span>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0E3827] border border-[#A7F3D0] dark:border-[#065F46] flex items-center justify-center text-[#047857] dark:text-[#6EE7B7] shadow-2xs shrink-0 font-mono font-black text-xs">
                02
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Select the Right Org
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#047857] dark:text-[#6EE7B7] uppercase tracking-wider">
              Filter by activity, track record &amp; difficulty
            </p>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed pt-1">
              Use Contribo to filter organizations with consistent participation, welcoming maintainers, and project ideas tailored to your skill level.
            </p>
          </div>
        </div>

        {/* ── CARD 03: Communicate with Mentors (Ice Blue / Cyan) ── */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 rounded-2xl sm:rounded-3xl border border-[#A5F3FC] dark:border-[#155E75]/50 bg-[#E0F7FA] dark:bg-[#08232F] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
          {/* Top Visual Showcase: Chat Bubble Snippet */}
          <div className="relative w-full h-28 bg-white/70 dark:bg-black/20 rounded-xl border border-[#A5F3FC]/60 dark:border-[#155E75]/40 p-3 flex flex-col justify-between mb-5 overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#0891B2] text-white text-[9px] font-bold flex items-center justify-center">
                M
              </div>
              <span className="text-[11px] font-bold text-[#0E7490] dark:text-[#67E8F9]">
                Mentor Channel
              </span>
              <span className="ml-auto text-[9px] font-mono text-[#0891B2]">#dev-chat</span>
            </div>

            <div className="p-2 bg-[#CFFAFE]/60 dark:bg-[#0D3B4C]/60 rounded-lg border border-[#A5F3FC] dark:border-[#155E75] text-[11px] text-[#155E75] dark:text-[#E0F2FE] leading-snug">
              &ldquo;Great start on issue #104! Check the architecture guide.&rdquo;
            </div>
          </div>

          {/* Bottom Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0B3344] border border-[#A5F3FC] dark:border-[#155E75] flex items-center justify-center text-[#0891B2] dark:text-[#67E8F9] shadow-2xs shrink-0 font-mono font-black text-xs">
                03
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#164E63] dark:text-[#ECFEFF]">
                Connect with Mentors
              </h3>
            </div>
            <p className="text-[11px] font-semibold text-[#0891B2] dark:text-[#67E8F9] uppercase tracking-wider">
              Engage openly on Slack &amp; Discord
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed pt-1">
              Join public communication channels. Introduce your background, ask thoughtful clarifying questions, and show genuine interest in the codebase.
            </p>
          </div>
        </div>

        {/* ── CARD 04: Fix Issues & Merge PRs (Warm Honey / Amber) ── */}
        <div className="col-span-1 md:col-span-6 lg:col-span-4 rounded-2xl sm:rounded-3xl border border-[#FDE68A] dark:border-[#78350F]/50 bg-[#FEF3C7] dark:bg-[#281C09] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
          {/* Top Visual Showcase: Workflow Pills */}
          <div className="relative w-full h-28 bg-white/70 dark:bg-black/20 rounded-xl border border-[#FDE68A]/60 dark:border-[#78350F]/40 p-3 flex flex-col justify-between mb-5 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#B45309] dark:text-[#FCD34D] font-bold">
              <span>CONTRIBUTION PIPELINE</span>
              <span className="text-emerald-600 dark:text-emerald-400">MERGED ✓</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono justify-center">
              <span className="px-2 py-1 rounded bg-[#FEF3C7] dark:bg-[#3D290A] border border-[#FDE68A] dark:border-[#78350F] text-[#92400E] dark:text-[#FDE68A] font-bold">
                Good First Issue
              </span>
              <span className="text-[#B45309] font-bold">&rarr;</span>
              <span className="px-2 py-1 rounded bg-[#D97706] text-white font-bold shadow-xs">
                PR #42
              </span>
            </div>

            <div className="text-[10px] font-mono text-[#92400E] dark:text-[#FDE68A]/80 text-center">
              Diff: +64 / -12 lines
            </div>
          </div>

          {/* Bottom Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#3D290A] border border-[#FDE68A] dark:border-[#78350F] flex items-center justify-center text-[#D97706] dark:text-[#FCD34D] shadow-2xs shrink-0 font-mono font-black text-xs">
                04
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#78350F] dark:text-[#FFFBEB]">
                Fix Issues &amp; Merge PRs
              </h3>
            </div>
            <p className="text-[11px] font-semibold text-[#D97706] dark:text-[#FCD34D] uppercase tracking-wider">
              Build your code track record
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed pt-1">
              Start by tackling starter bugs, docs, and test coverage. Early merged pull requests prove your reliability and code quality to mentors.
            </p>
          </div>
        </div>

        {/* ── CARD 05: Submit Winning Proposal (Soft Lavender / Violet) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 rounded-2xl sm:rounded-3xl border border-[#E9D5FF] dark:border-[#581C87]/50 bg-[#F3E8FF] dark:bg-[#201033] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
          {/* Top Visual Showcase: Approval Badge Box */}
          <div className="relative w-full h-28 bg-white/70 dark:bg-black/20 rounded-xl border border-[#E9D5FF]/60 dark:border-[#581C87]/40 p-3 flex flex-col justify-between mb-5 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-[#7E22CE] dark:text-[#D8B4FE]">PROPOSAL STATUS</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#047857] dark:text-[#6EE7B7] border border-[#10B981]/30 text-[9px] font-bold">
                ✓ SELECTED
              </span>
            </div>

            <div className="p-2 bg-white/90 dark:bg-[#2B1445] rounded-lg border border-[#E9D5FF] dark:border-[#581C87] text-[10px] text-[#6B21A8] dark:text-[#E9D5FF]">
              &ldquo;Milestones, timeline &amp; tech specs thoroughly reviewed.&rdquo;
            </div>
          </div>

          {/* Bottom Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#341654] border border-[#E9D5FF] dark:border-[#581C87] flex items-center justify-center text-[#7E22CE] dark:text-[#D8B4FE] shadow-2xs shrink-0 font-mono font-black text-xs">
                05
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#581C87] dark:text-[#FAF5FF]">
                Submit Winning Proposal
              </h3>
            </div>
            <p className="text-[11px] font-semibold text-[#7E22CE] dark:text-[#D8B4FE] uppercase tracking-wider">
              Structure realistic project milestones
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed pt-1">
              Draft comprehensive architecture, timelines, and deliverables. Incorporate early mentor feedback into Proposal Studio to secure your spot.
            </p>
          </div>
        </div>

        {/* ── CARD 06: Execute & Maintain (Wide Warm Coral / Terracotta) ── */}
        <div className="col-span-1 md:col-span-12 rounded-2xl sm:rounded-3xl border border-[#FED7AA] dark:border-[#7C2D12]/50 bg-[#FFF7ED] dark:bg-[#2A140B] p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#431B0E] border border-[#FED7AA] dark:border-[#7C2D12] flex items-center justify-center text-[#C2410C] dark:text-[#FDBA74] shadow-2xs shrink-0 font-mono font-black text-xs">
                06
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#7C2D12] dark:text-[#FFF7ED]">
                Execute Fellowship &amp; Become Maintainer
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#C2410C] dark:text-[#FDBA74] uppercase tracking-wider">
              Graduate with real impact, stipend awards &amp; leadership
            </p>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed pt-1">
              Complete your summer mentorship successfully, collect your stipend, and step into long-term project stewardship — reviewing PRs and mentoring new contributors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/matcher"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Start Step 1: Orbit AI Matcher <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
