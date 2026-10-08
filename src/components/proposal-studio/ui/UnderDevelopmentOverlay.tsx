'use client';

import Link from 'next/link';
import { ArrowRight, LayoutDashboard, Compass } from 'lucide-react';

export function UnderDevelopmentOverlay() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
      {/* Subtle background overlay */}
      <div className="absolute inset-0 bg-page/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Modal / Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-hairline bg-surface/95 backdrop-blur-2xl p-8 sm:p-10 text-center shadow-2xl elevation-4 overflow-hidden transition-all">
        {/* Decorative background glow */}
        <div
          className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-accent/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-merge/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/20 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          Under Active Development
        </div>

        {/* Center Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-raised border border-hairline shadow-inner text-accent">
          <Compass className="h-8 w-8 animate-pulse text-accent" />
        </div>

        {/* Header and description */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary font-heading">
          Proposal Studio is in the Works
        </h2>
        <p className="mt-3 text-sm sm:text-base text-secondary leading-relaxed max-w-md mx-auto">
          We are currently crafting a dedicated workspace with structured guidance, AI refinement, and scoring to help you build standout open-source proposals. Stay tuned!
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/projects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-accent-hover transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Projects</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface-raised px-5 py-2.5 text-sm font-medium text-primary hover:bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
