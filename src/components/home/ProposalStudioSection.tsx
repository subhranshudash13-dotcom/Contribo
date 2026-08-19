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

      {/* Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-12 lg:gap-16">
        
        {/* Top Header Group */}
        <div className="flex flex-col items-center text-center mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/10 text-accent text-xs font-semibold mb-6">
            <Sparkles size={14} />
            <span>Interactive Proposal Studio</span>
          </div>

          {/* Headline */}
          <h2 className="text-[27px] sm:text-[33px] lg:text-[45px] font-heading font-semibold text-primary leading-[1.2] tracking-tight mb-6">
            Learn from Real. Build <br className="hidden sm:block" />
            <span className="text-accent relative inline-block">
              Proposals
              <svg className="absolute w-full h-2 -bottom-1 left-0 text-accent/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span> That Get Accepted.
          </h2>

          {/* Description */}
          <p className="text-secondary text-[13px] sm:text-[15px] leading-relaxed mb-8 max-w-2xl mx-auto">
            Explore a collection of actual accepted proposals from top open-source programs. Learn how successful contributors planned, structured, and wrote proposals that made the cut.
          </p>

          {/* Mini Features */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 w-full max-w-2xl border-t border-hairline pt-8">
            <div className="flex flex-col items-center text-center gap-2">
              <FileText className="text-accent" size={20} />
              <div>
                <h4 className="text-xs font-semibold text-primary">Real Proposals</h4>
                <p className="text-[10px] text-tertiary">Verified & Accepted</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Lightbulb className="text-accent" size={20} />
              <div>
                <h4 className="text-xs font-semibold text-primary">Learn & Analyze</h4>
                <p className="text-[10px] text-tertiary">Understand what works</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Rocket className="text-accent" size={20} />
              <div>
                <h4 className="text-xs font-semibold text-primary">Build Better</h4>
                <p className="text-[10px] text-tertiary">Proposals that stand out</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Cards Grid & Stats */}
        <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">


          {/* 4-Column Proposals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
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
                  <p className="text-secondary text-xs leading-relaxed mb-5 line-clamp-3">
                    {proposal.desc}
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <div className="text-accent text-[11px] sm:text-xs font-medium">{proposal.author}</div>
                    <div className="text-tertiary text-[10px] sm:text-[11px] mt-0.5">{proposal.org}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2 py-0.5 rounded-md border border-hairline bg-surface-raised text-[8px] sm:text-[9px] font-semibold tracking-wider text-secondary">
                      {proposal.program}
                    </span>
                    <span className="px-2 py-0.5 rounded-md border border-hairline bg-surface-raised text-[8px] sm:text-[9px] font-mono text-secondary">
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
                    className="flex items-center justify-center py-2 rounded-lg bg-surface-raised text-primary text-[10px] font-medium hover:bg-surface-hover transition-colors border border-hairline"
                  >
                    View Proposal
                  </a>
                  <Link
                    href="/proposal-studio"
                    className="flex items-center justify-center gap-1 py-2 rounded-lg bg-accent/5 text-accent text-[10px] font-medium hover:bg-accent/10 transition-colors group/link"
                  >
                    <span>Learn</span>
                    <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        </div>



      </div>
    </section>
  );
}
