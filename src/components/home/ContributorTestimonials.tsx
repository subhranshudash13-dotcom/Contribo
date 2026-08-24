'use client';

import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  initials: string;
  program: string;
  organization: string;
  quote: string;
  accentColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Yash Rekhani',
    initials: 'YR',
    program: "GSoC '25",
    organization: 'CNCF / Kubernetes',
    quote:
      "Finding GSoC projects used to be overwhelming. Contribo's AI Matcher instantly pointed me to CNCF repositories that matched my exact skill set. I got accepted on my first try!",
    accentColor: '#326CE5',
  },
  {
    name: 'Manan Jalewa',
    initials: 'MJ',
    program: "LFX '25",
    organization: 'Linux Foundation',
    quote:
      "The structured project filters and proposal rubric gave me the exact blueprint needed for LFX. Being able to compare past accepted proposals gave me complete confidence.",
    accentColor: '#008BB8',
  },
  {
    name: 'Dipak Raj',
    initials: 'DR',
    program: "SOB '25",
    organization: 'Summer of Bitcoin',
    quote:
      "The deadline countdowns and real-time stipend metrics kept my application on track while balancing university exams. Contribo eliminated all the guesswork.",
    accentColor: '#F7931A',
  },
  {
    name: 'Sarthak Allawadhi',
    initials: 'SA',
    program: "GSoC '25",
    organization: 'Apache Software Foundation',
    quote:
      "The Proposal Studio AI review caught structural gaps in my timeline and architecture diagram before I submitted to the Apache maintainers. A total game-changer for applicants.",
    accentColor: '#D22128',
  },
  {
    name: 'Heet Kakaria',
    initials: 'HK',
    program: "ESoC '26",
    organization: 'European Open Source & AI Hub',
    quote:
      "Tracking multiple proposals and deadlines across different program portals was a headache. With Contribo's unified dashboard, I had all my tasks synced in one place.",
    accentColor: '#10B981',
  },
];

export function ContributorTestimonials() {
  // Triple the items for a seamless, glitch-free continuous loop
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="space-y-8 py-6 overflow-hidden relative" aria-label="Accepted Contributor Testimonials">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary tracking-tight">
          Accepted Contributors
        </h2>
        <p className="text-secondary text-sm sm:text-base leading-relaxed">
          Read how developers used Contribo to land their dream open-source internships.
        </p>
      </div>

      {/* Marquee Wrapper with Edge Fade Gradients */}
      <div className="relative w-full overflow-hidden group">
        {/* Left Gradient Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-page via-page/80 to-transparent z-10 pointer-events-none" />

        {/* Right Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-page via-page/80 to-transparent z-10 pointer-events-none" />

        {/* Moving Ticker (Right to Left) with Pause-on-Hover */}
        <div className="flex gap-6 animate-marquee-left pause-on-hover py-4 select-none">
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="w-[340px] sm:w-[400px] shrink-0 bg-surface border border-hairline rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-accent/50 hover:shadow-lg transition-all duration-300 relative group/card"
            >
              {/* Top Quote Icon & 5-Star Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote size={18} className="text-muted/40 group-hover/card:text-accent/60 transition-colors" />
              </div>

              {/* Quote Body */}
              <p className="text-secondary text-sm leading-relaxed mb-6 font-normal">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Contributor Profile */}
              <div className="flex items-center gap-3.5 border-t border-hairline/70 pt-4 mt-auto">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
                  style={{
                    backgroundColor: item.accentColor,
                  }}
                >
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-bold text-sm text-primary truncate">
                      {item.name}
                    </h4>
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" title="Verified Contributor" />
                  </div>
                  <p className="text-xs text-muted font-mono truncate mt-0.5">
                    {item.program} @ {item.organization}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
