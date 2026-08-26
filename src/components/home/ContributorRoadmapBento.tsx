'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ContributorRoadmapBento() {
  return (
    <section className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-hairline/80 pb-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-accent/10 border border-accent/30 text-[11px] font-mono font-bold text-accent uppercase tracking-wider mb-1.5">
            <span>6-Step Contributor Blueprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-heading font-bold text-primary tracking-tight">
            Contributor roadmap
          </h2>
          <p className="text-secondary text-xs sm:text-sm mt-0.5 max-w-xl font-normal leading-relaxed">
            The curriculum from choosing your stack to submitting winning proposals and stepping into open-source stewardship.
          </p>
        </div>

        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-none border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs font-mono font-bold transition-all hover:border-accent shadow-2xs shrink-0 self-start sm:self-auto uppercase tracking-wider group"
        >
          <span>All Roadmaps</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-accent" />
        </Link>
      </div>

      {/* Asymmetric Bento Grid (7/5, 5/7, 6/6) with Solid Colors & Sharp Edges */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
        
        {/* ── CARD 01: Pick Your Stack (Wide 7-Col Bento) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 rounded-none border border-[#C7D2FE] dark:border-[#4338CA]/70 bg-[#EEF2FF] dark:bg-[#151936] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs">
          {/* Top Visual Showcase */}
          <div className="relative w-full h-22 sm:h-24 rounded-none border border-[#C7D2FE]/70 dark:border-[#4338CA]/50 bg-white/85 dark:bg-[#0D1024]/90 flex items-center justify-center mb-4 px-3 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#C7D2FE_1px,transparent_1px),linear-gradient(to_bottom,#C7D2FE_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#312E81_1px,transparent_1px),linear-gradient(to_bottom,#312E81_1px,transparent_1px)] bg-[size:14px_14px] opacity-35" />
            <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center font-mono text-xs">
              <span className="px-2.5 py-1 rounded-none bg-white dark:bg-[#1C2248] text-[#4338CA] dark:text-[#C7D2FE] font-bold border border-[#C7D2FE] dark:border-[#4338CA]">
                TypeScript
              </span>
              <span className="px-2.5 py-1 rounded-none bg-white dark:bg-[#1C2248] text-[#4338CA] dark:text-[#C7D2FE] font-bold border border-[#C7D2FE] dark:border-[#4338CA]">
                Python
              </span>
              <span className="px-2.5 py-1 rounded-none bg-[#4F46E5] text-white font-bold shadow-xs">
                Rust / Go &bull; Primary
              </span>
              <span className="px-2.5 py-1 rounded-none bg-white dark:bg-[#1C2248] text-[#4338CA] dark:text-[#C7D2FE] font-bold border border-[#C7D2FE] dark:border-[#4338CA]">
                React
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-none bg-white dark:bg-[#202758] border border-[#C7D2FE] dark:border-[#4338CA] flex items-center justify-center text-[#4338CA] dark:text-[#A5B4FC] font-mono font-black text-xs shrink-0 shadow-2xs">
                01
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#1E1B4B] dark:text-[#F1F5F9]">
                Pick Your Tech Stack
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#4338CA] dark:text-[#A5B4FC] uppercase tracking-wider">
              Focus on languages &amp; frameworks you know best
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed pt-0.5">
              Select 1–2 core technologies to eliminate choice overload and narrow your focus across web, systems, AI/ML, and devtools ecosystems.
            </p>
          </div>
        </div>

        {/* ── CARD 02: Select the Right Org (5-Col Bento) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 rounded-none border border-[#A7F3D0] dark:border-[#059669]/70 bg-[#E6F9EE] dark:bg-[#0B251B] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs">
          {/* Top Visual Showcase */}
          <div className="relative w-full h-22 sm:h-24 rounded-none border border-[#A7F3D0]/70 dark:border-[#059669]/50 bg-white/85 dark:bg-[#061811]/90 flex flex-col justify-between p-2.5 mb-4 overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-[#047857] dark:text-[#6EE7B7] uppercase">
                GSoC &bull; LFX &bull; ESoC
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-[#10B981]/15 text-[#047857] dark:text-[#6EE7B7] font-bold border border-[#10B981]/30 text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> LIVE 2026
              </span>
            </div>

            <div className="flex items-center justify-center w-full my-auto">
              <svg className="w-full h-6 text-[#10B981]" viewBox="0 0 200 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 15 L35 15 L50 4 L65 26 L80 8 L95 20 L110 15 L200 15" />
              </svg>
            </div>

            <div className="text-[11px] font-mono text-[#065F46] dark:text-[#A7F3D0] text-right font-medium">
              1,250+ mentoring organizations
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-none bg-white dark:bg-[#123828] border border-[#A7F3D0] dark:border-[#059669] flex items-center justify-center text-[#047857] dark:text-[#6EE7B7] font-mono font-black text-xs shrink-0 shadow-2xs">
                02
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#064E3B] dark:text-[#F0FDF4]">
                Select the Right Org
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#047857] dark:text-[#6EE7B7] uppercase tracking-wider">
              Filter by track record &amp; project scope
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed pt-0.5">
              Filter organizations with consistent acceptance rates, active maintainers, and project ideas aligned with your skill level.
            </p>
          </div>
        </div>

        {/* ── CARD 03: Communicate with Mentors (5-Col Bento) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 rounded-none border border-[#A5F3FC] dark:border-[#0891B2]/70 bg-[#E0F7FA] dark:bg-[#0A242F] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs">
          {/* Top Visual Showcase */}
          <div className="relative w-full h-22 sm:h-24 rounded-none border border-[#A5F3FC]/70 dark:border-[#0891B2]/50 bg-white/85 dark:bg-[#06171E]/90 p-2.5 flex flex-col justify-between mb-4 overflow-hidden">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 rounded-none bg-[#0891B2] text-white text-[8px] font-bold flex items-center justify-center">
                M
              </span>
              <span className="font-bold text-[#0E7490] dark:text-[#67E8F9]">Mentor Channel</span>
              <span className="ml-auto text-[10px] font-mono text-[#0891B2]">#dev-community</span>
            </div>
            <div className="p-1.5 rounded-none bg-[#CFFAFE]/60 dark:bg-[#0E3544] border border-[#A5F3FC] dark:border-[#0891B2] text-xs text-[#155E75] dark:text-[#E0F2FE] truncate">
              &ldquo;Great progress on issue #104! Check the architecture guide.&rdquo;
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-none bg-white dark:bg-[#0F3545] border border-[#A5F3FC] dark:border-[#0891B2] flex items-center justify-center text-[#0891B2] dark:text-[#67E8F9] font-mono font-black text-xs shrink-0 shadow-2xs">
                03
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#164E63] dark:text-[#F0FDFA]">
                Connect with Mentors
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#0891B2] dark:text-[#67E8F9] uppercase tracking-wider">
              Engage openly on Slack &amp; Discord
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed pt-0.5">
              Introduce yourself early in community channels, ask specific technical questions, and show long-term commitment in project threads.
            </p>
          </div>
        </div>

        {/* ── CARD 04: Fix Issues & Merge PRs (Wide 7-Col Bento) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 rounded-none border border-[#FDE68A] dark:border-[#D97706]/70 bg-[#FEF3C7] dark:bg-[#281D0B] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs">
          {/* Top Visual Showcase */}
          <div className="relative w-full h-22 sm:h-24 rounded-none border border-[#FDE68A]/70 dark:border-[#D97706]/50 bg-white/85 dark:bg-[#181105]/90 p-2.5 flex flex-col justify-between mb-4 overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between text-[#B45309] dark:text-[#FCD34D] font-bold">
              <span>PATCH PIPELINE</span>
              <span className="text-emerald-600 dark:text-emerald-400">MERGED ✓</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="px-2.5 py-1 rounded-none bg-[#FEF3C7] dark:bg-[#38260B] border border-[#FDE68A] dark:border-[#D97706] text-[#92400E] dark:text-[#FDE68A] font-bold">
                Starter Issue
              </span>
              <span className="text-[#B45309] font-bold">&rarr;</span>
              <span className="px-2.5 py-1 rounded-none bg-[#D97706] text-white font-bold shadow-xs">
                PR #42
              </span>
            </div>
            <div className="text-[10px] text-center text-[#92400E] dark:text-[#FDE68A]/70">
              Diff: +48 / -12 lines &bull; Reviewed &amp; Approved
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-none bg-white dark:bg-[#3D2C0F] border border-[#FDE68A] dark:border-[#D97706] flex items-center justify-center text-[#D97706] dark:text-[#FCD34D] font-mono font-black text-xs shrink-0 shadow-2xs">
                04
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#78350F] dark:text-[#FFFBEB]">
                Fix Issues &amp; Merge PRs
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#D97706] dark:text-[#FCD34D] uppercase tracking-wider">
              Build your code track record
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed pt-0.5">
              Submit starter bugfixes, documentation polish, or tests. Merged PRs establish credibility with mentors and demonstrate review readiness.
            </p>
          </div>
        </div>

        {/* ── CARD 05: Submit Winning Proposal (6-Col Bento) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-6 rounded-none border border-[#E9D5FF] dark:border-[#9333EA]/70 bg-[#F3E8FF] dark:bg-[#201033] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs">
          {/* Top Visual Showcase */}
          <div className="relative w-full h-22 sm:h-24 rounded-none border border-[#E9D5FF]/70 dark:border-[#9333EA]/50 bg-white/85 dark:bg-[#130920]/90 p-2.5 flex flex-col justify-between mb-4 overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="text-[#7E22CE] dark:text-[#D8B4FE]">PROPOSAL STUDIO</span>
              <span className="px-2 py-0.5 bg-[#10B981]/15 text-[#047857] dark:text-[#6EE7B7] border border-[#10B981]/30 text-[9px] font-bold">
                ✓ SELECTED
              </span>
            </div>
            <div className="p-1.5 bg-white dark:bg-[#27133D] rounded-none border border-[#E9D5FF] dark:border-[#9333EA] text-xs text-[#6B21A8] dark:text-[#E9D5FF] font-sans truncate">
              &ldquo;Milestones, timeline &amp; tech specs accepted with full mentor consensus.&rdquo;
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-none bg-white dark:bg-[#341654] border border-[#E9D5FF] dark:border-[#9333EA] flex items-center justify-center text-[#7E22CE] dark:text-[#D8B4FE] font-mono font-black text-xs shrink-0 shadow-2xs">
                05
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#581C87] dark:text-[#FAF5FF]">
                Submit Winning Proposal
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#7E22CE] dark:text-[#D8B4FE] uppercase tracking-wider">
              Structure realistic project milestones
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed pt-0.5">
              Draft comprehensive architecture, timelines, and deliverables. Incorporate early maintainer feedback to secure your fellowship spot.
            </p>
          </div>
        </div>

        {/* ── CARD 06: Execute & Maintain (6-Col Bento Anchor) ── */}
        <div className="col-span-1 md:col-span-12 lg:col-span-6 rounded-none border border-[#FED7AA] dark:border-[#EA580C]/70 bg-[#FFF7ED] dark:bg-[#2C150C] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs">
          {/* Top Visual Showcase */}
          <div className="relative w-full h-22 sm:h-24 rounded-none border border-[#FED7AA]/70 dark:border-[#EA580C]/50 bg-white/85 dark:bg-[#1A0B05]/90 p-2.5 flex flex-col justify-between mb-4 overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#C2410C] dark:text-[#FDBA74]">
              <span>FELLOWSHIP GRADUATION</span>
              <span className="text-emerald-600 dark:text-emerald-400">STIPEND PAID ✓</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#7C2D12] dark:text-[#FFF7ED]">
                Step into Open-Source Stewardship
              </span>
              <Link
                href="/matcher"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-mono font-bold transition-all shadow-xs shrink-0 uppercase tracking-wider"
              >
                <span>Start Step 1</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-none bg-white dark:bg-[#461F12] border border-[#FED7AA] dark:border-[#EA580C] flex items-center justify-center text-[#C2410C] dark:text-[#FDBA74] font-mono font-black text-xs shrink-0 shadow-2xs">
                06
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#7C2D12] dark:text-[#FFF7ED]">
                Execute &amp; Become Maintainer
              </h3>
            </div>
            <p className="text-xs font-semibold text-[#C2410C] dark:text-[#FDBA74] uppercase tracking-wider">
              Graduate with impact, stipend awards &amp; leadership
            </p>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed pt-0.5">
              Complete your mentorship successfully, receive your stipend, and step into long-term project stewardship — reviewing PRs and mentoring new contributors.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
