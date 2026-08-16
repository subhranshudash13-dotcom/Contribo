'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Play,
  ShieldCheck,
  Sparkles,
  Lightbulb,
  Rocket,
} from 'lucide-react';

const ACCEPTED_PROPOSALS = [
  {
    id: 1,
    title: 'OWASP Security Audit Toolkit',
    desc: 'A toolkit to automate security audit processes and improve vulnerability detection in web applications.',
    author: 'Deepshikha Sinha',
    org: 'OWASP Foundation',
    year: '2022',
    program: 'GSOC',
    link: 'https://github.com/COPS-IITBHU/GSoC-Accepted-Proposals/blob/master/2022/OWASP%20Foundation%20-%202022%20-%20Deepshikha%20Sinha.pdf',
  },
  {
    id: 2,
    title: 'Fabric Smart Contracts',
    desc: 'Smart contract solutions for managing digital assets and agreements on the Hyperledger Fabric blockchain.',
    author: 'Shashank Kumar',
    org: 'Hyperledger',
    year: '2024',
    program: 'LFX',
    link: 'https://github.com/COPS-IITBHU/GSoC-Accepted-Proposals/blob/master/Other%20Fellowships/LFX%20-%202024%20-%20Hyperledger%20-%20Shashank%20Kumar.pdf',
  },
  {
    id: 3,
    title: 'Documentation Website Redesign',
    desc: 'Redesigning the official documentation website to improve usability, navigation, and contributor experience.',
    author: 'Aditya Sharma',
    org: 'Google Summer of Code',
    year: '2023',
    program: 'GSOC',
    link: '#', // Placeholder
  },
  {
    id: 4,
    title: 'Community Moderation Dashboard',
    desc: 'Building a dashboard to help communities monitor activity, manage reports, and ensure healthy interactions.',
    author: 'Nandini Verma',
    org: 'Outreachy',
    year: '2023',
    program: 'OUTREACHY',
    link: '#', // Placeholder
  }
];

export function ProposalStudioSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-background">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 dark:bg-[#f18359]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 dark:bg-[#f18359]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Stretched full width with minimal margins/padding to spread out content */}
      <div className="w-full px-2 sm:px-4 lg:px-6 relative z-10 mx-auto max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/10 text-accent text-xs font-semibold w-fit mb-6">
              <Sparkles size={14} />
              <span>Interactive Proposal Studio</span>
            </div>

            {/* Headline (Reduced by ~3px from standard sizes) */}
            <h2 className="text-[27px] sm:text-[33px] lg:text-[45px] font-heading font-semibold text-primary leading-[1.2] mb-6 tracking-tight">
              Learn from <br className="hidden sm:block" /> Real. Build <br className="hidden sm:block" />
              <span className="text-accent relative inline-block">
                Proposals
                <svg className="absolute w-full h-2 -bottom-1 left-0 text-accent/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span> That <br className="hidden sm:block" /> Get Accepted.
            </h2>

            {/* Description (Reduced by ~3px) */}
            <p className="text-secondary text-[13px] sm:text-[15px] leading-relaxed mb-10 max-w-lg">
              Explore a collection of actual accepted proposals from top open-source programs. Learn how successful contributors planned, structured, and wrote proposals that made the cut.
            </p>

            {/* Mini Features */}
            <div className="grid grid-cols-3 gap-4 mb-10 border-t border-hairline pt-8">
              <div className="flex flex-col gap-2">
                <FileText className="text-accent" size={18} />
                <div>
                  <h4 className="text-xs font-semibold text-primary">Real Proposals</h4>
                  <p className="text-[10px] text-tertiary">Verified & Accepted</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Lightbulb className="text-accent" size={18} />
                <div>
                  <h4 className="text-xs font-semibold text-primary">Learn & Analyze</h4>
                  <p className="text-[10px] text-tertiary">Understand what</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Rocket className="text-accent" size={18} />
                <div>
                  <h4 className="text-xs font-semibold text-primary">Build Better</h4>
                  <p className="text-[10px] text-tertiary">Create proposals that stand out</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/proposal-studio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-medium text-sm hover:scale-105 transition-transform shadow-md hover:shadow-accent/20"
              >
                <span>Browse Proposals</span>
                <ArrowRight size={16} />
              </Link>
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-hairline bg-surface text-primary font-medium text-sm hover:bg-surface-hover transition-colors"
              >
                <span>How It Works</span>
                <Play size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Cards Grid */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Top Stats Card */}
            <div className="rounded-2xl border border-hairline bg-surface-raised p-6 flex items-center justify-between shadow-sm">
              <div className="max-w-xl">
                <h3 className="text-accent text-lg font-semibold mb-2">
                  100% Real <span className="text-tertiary mx-2">•</span> 100% Accepted <span className="text-tertiary mx-2">•</span> 100% Learning
                </h3>
                <p className="text-secondary text-sm leading-relaxed">
                  All proposals in this studio are from real contributors whose proposals were successfully accepted in their respective programs.
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-center gap-1 shrink-0 ml-6 pl-6 border-l border-hairline">
                <ShieldCheck size={24} className="text-accent" />
                <div className="text-xs font-medium text-primary text-center leading-tight mt-1">
                  Verified <br /> & Curated
                </div>
              </div>
            </div>

            {/* 2x2 Proposals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {ACCEPTED_PROPOSALS.map((proposal) => (
                <div 
                  key={proposal.id}
                  className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6 flex flex-col h-full hover:border-accent/40 transition-colors shadow-sm hover:shadow-md relative overflow-hidden group"
                >
                  {/* Subtle top glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="text-primary text-base font-semibold mb-2 leading-snug group-hover:text-accent transition-colors">
                      {proposal.title}
                    </h4>
                    <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3">
                      {proposal.desc}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-end justify-between mb-5">
                    <div>
                      <div className="text-accent text-xs sm:text-sm font-medium">{proposal.author}</div>
                      <div className="text-tertiary text-[11px] sm:text-xs mt-0.5">{proposal.org}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-1 rounded-md border border-hairline bg-surface-raised text-[9px] sm:text-[10px] font-semibold tracking-wider text-secondary">
                        {proposal.program}
                      </span>
                      <span className="px-2 py-1 rounded-md border border-hairline bg-surface-raised text-[9px] sm:text-[10px] font-mono text-secondary">
                        {proposal.year}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <a
                      href={proposal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center py-2 rounded-lg bg-surface-raised text-primary text-[11px] font-medium hover:bg-surface-hover transition-colors border border-hairline"
                    >
                      View Proposal
                    </a>
                    <Link
                      href="/proposal-studio"
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent/5 text-accent text-[11px] font-medium hover:bg-accent/10 transition-colors group/link"
                    >
                      <span>Learn from this</span>
                      <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
