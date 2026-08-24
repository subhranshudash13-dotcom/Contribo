'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Award, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  GitPullRequest,
  TrendingUp,
  ShieldCheck,
  Zap,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export function OpenSourceExplainer({ className = '', showCta = true }: { className?: string; showCta?: boolean }) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [stipendHours, setStipendHours] = useState<number>(175);

  const STIPEND_CALC = Math.round((stipendHours / 350) * 7000);

  const PILLARS = [
    {
      id: 'stipends',
      num: '01',
      title: 'Vetted Financial Stipends',
      subtitle: 'Backed by Google, CNCF & Linux Foundation',
      shortTag: '$1,500 – $7,000 Paid',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      summary:
        'Global tech giants sponsor structured developer sprints. You receive guaranteed milestone payouts directly via foundation escrow.',
      details: [
        '100% Escrow-backed by official foundations',
        'Milestone 1: 40% upon midterm review',
        'Milestone 2: 60% upon final PR merge',
      ],
      type: 'calculator',
    },
    {
      id: 'mentorship',
      num: '02',
      title: '1-on-1 Direct Mentorship',
      subtitle: 'Paired with Senior Infrastructure Maintainers',
      shortTag: '1-on-1 Code Reviews',
      icon: Users,
      color: 'text-accent bg-accent/10 border-accent/20',
      summary:
        'You don’t code in isolation. Core maintainers host weekly check-ins, review your pull requests, and guide your system architecture.',
      details: [
        'Weekly 1-on-1 technical syncs & PR feedback',
        'Direct slack/discord access to maintainers',
        'Architectural guidance on production repos',
      ],
      type: 'chat-sim',
    },
    {
      id: 'career',
      num: '03',
      title: 'Verified Recruiter Proof',
      subtitle: 'Public Commit History on Core Projects',
      shortTag: 'Global Recruiter Passport',
      icon: Award,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      summary:
        'Contributing to top open-source projects proves your engineering capability to tech recruiters worldwide far better than any resume.',
      details: [
        'Permanent Git commit log on recognized repositories',
        'Vetted by recruiters at Stripe, Meta, and Google',
        'Direct track to become a paid core maintainer',
      ],
      type: 'git-proof',
    },
  ];

  const current = PILLARS[activeTab];

  return (
    <section className={`py-12 border-t border-hairline/80 ${className}`}>
      {/* Header Banner (No heavy card boxes) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary font-heading leading-tight">
            What is an <br className="hidden sm:block" />
            <span className="text-accent">Open Source Program?</span>
          </h2>

          <p className="text-secondary text-base sm:text-lg leading-relaxed font-normal">
            Click through the 3 core pillars below to discover how paid mentorship sprints, stipends, and maintainer reviews actually work.
          </p>
        </div>

        {showCta && (
          <div className="shrink-0 pb-1">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-surface font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span>Explore Active Programs</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Main Split Layout: Left Side Interactive Pillars List / Right Side Dynamic Proof Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Pillar Triggers (No standard rounded card boxes!) */}
        <div className="lg:col-span-6 space-y-3">
          {PILLARS.map((pillar, idx) => {
            const isActive = activeTab === idx;
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onClick={() => setActiveTab(idx)}
                className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer select-none border ${
                  isActive
                    ? 'bg-surface border-accent shadow-md translate-x-1'
                    : 'bg-transparent border-hairline/60 hover:border-hairline hover:bg-surface/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span className={`font-mono text-sm font-bold ${isActive ? 'text-accent' : 'text-muted'}`}>
                      {pillar.num}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-heading font-bold text-lg sm:text-xl ${
                          isActive ? 'text-primary' : 'text-secondary'
                        }`}>
                          {pillar.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted font-mono">{pillar.subtitle}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0 border ${pillar.color}`}>
                    {pillar.shortTag}
                  </span>
                </div>

                {/* Expanded details when active */}
                {isActive && (
                  <div className="mt-4 pt-4 border-t border-hairline/60 space-y-3 animate-fadeIn">
                    <p className="text-secondary text-sm leading-relaxed font-normal">
                      {pillar.summary}
                    </p>

                    <div className="space-y-2">
                      {pillar.details.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-primary font-medium">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Interactive Visualizer Widget */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-lg space-y-6 relative overflow-hidden">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-hairline/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Interactive Telemetry Proof
                </span>
              </div>
              <span className="text-xs font-mono text-muted">Pillar {current.num} / 03</span>
            </div>

            {/* DYNAMIC CONTENT WIDGET DEPENDING ON ACTIVE TAB */}
            {current.type === 'calculator' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-muted mb-2">
                    <span>Sprint Time Commitment</span>
                    <span className="font-bold text-primary">{stipendHours} Hours</span>
                  </div>

                  <input
                    type="range"
                    min="90"
                    max="350"
                    step="5"
                    value={stipendHours}
                    onChange={(e) => setStipendHours(Number(e.target.value))}
                    className="w-full h-2 bg-page rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted mt-1">
                    <span>90h (Short Sprint)</span>
                    <span>175h (Medium)</span>
                    <span>350h (Full Summer)</span>
                  </div>
                </div>

                {/* Calculated Stipend Display Box */}
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Estimated Foundation Stipend
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${STIPEND_CALC.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-muted font-mono pt-1">
                    Paid in 2 installments upon mentor evaluation approval
                  </p>
                </div>
              </div>
            )}

            {current.type === 'chat-sim' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5 border-b border-hairline/60 pb-2">
                  <MessageSquare size={14} className="text-accent" /> Live Maintainer Review Sync
                </div>

                {/* Simulated Chat Messages */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-page border border-hairline space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-accent font-bold">
                      <span>@k8s_maintainer (Senior Staff)</span>
                      <span>10:42 AM</span>
                    </div>
                    <p className="text-primary text-xs leading-relaxed">
                      &quot;PR #482 looks solid! The cache synchronization benchmark improved throughput by 34%. Let’s merge this into main.&quot;
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-accent font-bold">
                      <span>✔ Pull Request #482 Merged</span>
                      <span className="text-emerald-500 font-bold">Passed CI/CD</span>
                    </div>
                    <p className="text-primary text-xs font-bold">
                      kubernetes/kubernetes:main • +420 -115 lines
                    </p>
                  </div>
                </div>
              </div>
            )}

            {current.type === 'git-proof' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-muted">
                  <span>Public Contributor Passport</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <ShieldCheck size={13} /> Recruiter Verified
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-page border border-hairline space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">Git Commit History</span>
                    <span className="text-accent font-bold">Top 2% Contributor</span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded bg-surface border border-hairline/60">
                      <span className="text-primary font-bold">cncf/kubernetes</span>
                      <span className="text-emerald-500">12 Merged PRs</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface border border-hairline/60">
                      <span className="text-primary font-bold">linux/kernel-ebpf</span>
                      <span className="text-emerald-500">4 Merged PRs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Callout Banner */}
            <div className="pt-4 border-t border-hairline/80 flex items-center justify-between text-xs font-mono text-muted">
              <span>Verified 2026 Campaigns</span>
              <span className="text-accent font-bold">Ready to Apply →</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
