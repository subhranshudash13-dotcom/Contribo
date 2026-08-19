'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  GitPullRequest,
  Award,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface CampaignPreview {
  id: string;
  slug: string;
  badge: string;
  name: string;
  organizer: string;
  stipend: string;
  duration: string;
  focus: string;
  phase: string;
  mentor: string;
  milestone: string;
  metrics: {
    seats: string;
    stipendCap: string;
    acceptance: string;
  };
}

export function ProgramsHeroVisualizer() {
  const CAMPAIGNS: CampaignPreview[] = [
    {
      id: 'gsoc',
      slug: 'gsoc',
      badge: 'GSoC 2026',
      name: 'Google Summer of Code',
      organizer: 'Google / CNCF / Apache',
      stipend: '$1,500 – $7,000',
      duration: '12 – 22 Weeks (175h / 350h)',
      focus: 'Cloud Native, Machine Learning, Systems',
      phase: 'Community Bonding & Proposal Selection',
      mentor: '@alex_k8s (Kubernetes Core Maintainer)',
      milestone: 'Midterm Evaluation Approved ($3,500 Escrow Disbursed)',
      metrics: {
        seats: '1,200+ Mentees',
        stipendCap: '$7,000 Max',
        acceptance: 'Global Open',
      },
    },
    {
      id: 'lfx',
      slug: 'lfx',
      badge: 'LFX Mentorship',
      name: 'Linux Foundation Mentorship',
      organizer: 'Linux Foundation',
      stipend: '$3,000 – $6,600',
      duration: '12 Weeks Full-time Sprints',
      focus: 'Linux Kernel, Cilium, eBPF Infrastructure',
      phase: 'Application Phase & Mentor Match',
      mentor: '@sarah_ebpf (Cilium Staff Engineer)',
      milestone: 'Final Milestone Approved ($6,600 Disbursed)',
      metrics: {
        seats: '3 Terms / Year',
        stipendCap: '$6,600 Max',
        acceptance: 'Universal Access',
      },
    },
    {
      id: 'outreachy',
      slug: 'outreachy',
      badge: 'Outreachy',
      name: 'Outreachy Fellowship',
      organizer: 'Software Freedom Conservancy',
      stipend: '$7,000 Fixed Direct Stipend',
      duration: '13 Weeks (30 hours/week)',
      focus: 'Accessibility, UX Design, Core Infrastructure',
      phase: 'Contribution Phase & Proposal Review',
      mentor: '@maria_gnome (Gnome Accessibility WG)',
      milestone: 'Initial Stipend Paid ($2,000 Escrow Disbursed)',
      metrics: {
        seats: 'Winter & Summer',
        stipendCap: '$7,000 Fixed',
        acceptance: 'Underrepresented',
      },
    },
    {
      id: 'esoc',
      slug: 'esoc',
      badge: 'ESoC 2026',
      name: 'European Summer of Code',
      organizer: 'European Space Agency & EU',
      stipend: '€4,000 – €6,000',
      duration: '3 Months Direct Internship',
      focus: 'Satellite Telemetry, Open Hardware, GIS',
      phase: 'Organization Application Window',
      mentor: '@dr_hansen (ESA Open Data Lead)',
      milestone: 'Project Proposal Verified (€4,000 Initial)',
      metrics: {
        seats: 'Annual Cohort',
        stipendCap: '€6,000 Max',
        acceptance: 'EU & Partners',
      },
    },
  ];

  const [activeTab, setActiveTab] = useState<number>(0);
  const current = CAMPAIGNS[activeTab];

  return (
    <div className="w-full select-none">
      {/* Contribo Platform Console Container */}
      <div className="rounded-[20px] border border-hairline bg-surface p-5 sm:p-6 shadow-sm space-y-5">
        
        {/* Top Header & Tab Pill Switcher */}
        <div className="flex items-center justify-between border-b border-hairline/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              Live Campaign Console
            </span>
          </div>

          <span className="text-[11px] font-mono text-muted">2026 Verified</span>
        </div>

        {/* Campaign Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CAMPAIGNS.map((camp, idx) => {
            const isActive = idx === activeTab;
            return (
              <button
                key={camp.id}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-surface shadow-xs'
                    : 'bg-page text-muted hover:text-primary hover:bg-surface-raised border border-hairline'
                }`}
              >
                {camp.badge}
              </button>
            );
          })}
        </div>

        {/* Selected Campaign Header Info */}
        <div className="p-4 rounded-xl bg-page/60 border border-hairline/80 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold">
                {current.organizer}
              </span>
              <h4 className="font-heading font-bold text-lg text-primary mt-0.5">
                {current.name}
              </h4>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {current.stipend}
            </span>
          </div>

          <p className="text-xs text-secondary leading-relaxed">
            <strong className="text-primary">Target Domains:</strong> {current.focus}
          </p>
        </div>

        {/* Realistic Contributor Journey Milestones */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
            <span className="uppercase text-[10px] tracking-wider font-bold">Contributor Lifecycle</span>
            <span className="text-accent font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Active Track
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-surface border border-hairline space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted font-bold">
                <span>01. PROPOSAL</span>
                <CheckCircle2 size={13} className="text-emerald-500" />
              </div>
              <div className="font-bold text-primary text-xs truncate">Verified</div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-surface border border-hairline space-y-1">
              <div className="flex items-center justify-between text-[10px] text-accent font-bold">
                <span>02. MENTOR</span>
                <Users size={13} />
              </div>
              <div className="font-bold text-primary text-xs truncate">{current.mentor.split(' ')[0]}</div>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-surface border border-hairline space-y-1">
              <div className="flex items-center justify-between text-[10px] text-brass font-bold">
                <span>03. STIPEND</span>
                <DollarSign size={13} />
              </div>
              <div className="font-bold text-primary text-xs truncate">Escrow Active</div>
            </div>
          </div>
        </div>

        {/* Selected Campaign Metrics Footer */}
        <div className="pt-3 border-t border-hairline/80 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-muted">
            <ShieldCheck size={14} className="text-accent" />
            <span className="truncate">{current.milestone}</span>
          </div>

          <Link
            href={`/programs/${current.slug}`}
            className="text-accent font-bold hover:underline shrink-0 flex items-center gap-1"
          >
            <span>Explore Guide</span>
            <ChevronRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
