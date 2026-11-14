'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  Lock,
  Code2,
  Bookmark,
  Sparkles,
  Flame,
} from 'lucide-react';
import type { PublicPassportData } from '@/lib/passport';
import { getReadinessSignals } from '@/lib/passport';
import { OrgLogo } from '@/components/ui/OrgLogo';

interface PassportCardProps {
  passport: PublicPassportData;
  origin?: string;
}

export function PassportCard({ passport, origin }: PassportCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [showEmbedOptions, setShowEmbedOptions] = useState(false);

  const baseOrigin =
    origin || (typeof window !== 'undefined' ? window.location.origin : 'https://contribo.org');

  const passportUrl = `${baseOrigin}/passport/${passport.username}`;
  const badgeUrl = `${baseOrigin}/api/passport/${passport.username}/badge.svg`;
  const markdownSnippet = `[![Contribo Readiness](${badgeUrl})](${passportUrl})`;
  const htmlSnippet = `<a href="${passportUrl}"><img src="${badgeUrl}" alt="Contribo Readiness" /></a>`;

  const copyToClipboard = async (text: string, type: 'link' | 'badge') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedBadge(true);
        setTimeout(() => setCopiedBadge(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  if (passport.isPrivate) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl border border-hairline/80 bg-surface/80 backdrop-blur-md shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-500/10 text-slate-500 flex items-center justify-center mx-auto border border-slate-500/20">
          <Lock size={28} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-extrabold text-primary">
            This Contributor Passport is Private
          </h2>
          <p className="text-sm text-secondary leading-relaxed">
            The owner of <span className="font-mono text-primary font-bold">@{passport.username}</span> has set their open-source readiness passport to private.
          </p>
        </div>
        <div className="pt-4 border-t border-hairline flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-page text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Explore Contribo Programs
          </Link>
        </div>
      </div>
    );
  }

  const signals = getReadinessSignals(
    passport.name,
    passport.skills,
    passport.targetOrganizations.length,
    passport.applicationsCount
  );

  // Radial progress calculations for 120px circular meter
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (passport.score / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* 1. PASSPORT HERO BADGE & PROFILE CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-hairline/90 bg-surface/90 backdrop-blur-xl shadow-2xl p-6 sm:p-10 transition-all">
        {/* Subtle decorative glow */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: passport.tier.color }}
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-hairline">
          {/* Contributor Profile Identity */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-hairline bg-surface-raised shadow-md shrink-0">
              <Image
                src={passport.avatarUrl}
                alt={passport.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                unoptimized
              />
              <div className="absolute bottom-1 right-1 bg-surface/90 rounded-full p-1 border border-hairline shadow-xs">
                <ShieldCheck size={14} className="text-accent" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20">
                  <ShieldCheck size={11} /> Verified Passport
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${passport.tier.bgClass}`}
                >
                  {passport.tier.tier}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-primary">
                {passport.name}
              </h1>

              <div className="flex items-center gap-3 text-xs text-secondary">
                <Link
                  href={`https://github.com/${passport.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:text-accent flex items-center gap-1 transition-colors"
                >
                  @{passport.githubUsername}
                  <ExternalLink size={11} />
                </Link>
                <span>•</span>
                <span className="line-clamp-1">{passport.bio}</span>
              </div>
            </div>
          </div>

          {/* Radial Circular Readiness Gauge */}
          <div className="flex items-center gap-5 bg-surface-raised/80 border border-hairline/80 rounded-2xl p-4 sm:p-5 shadow-sm shrink-0 self-stretch md:self-auto justify-between md:justify-start">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-hairline/40 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="transition-all duration-1000 ease-out fill-none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  stroke={passport.tier.color}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-heading font-extrabold text-primary">
                  {passport.score}%
                </span>
                <span className="text-[9px] font-mono text-tertiary uppercase tracking-wider">
                  Readiness
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles size={13} style={{ color: passport.tier.color }} />
                <span>{passport.tier.label}</span>
              </div>
              <p className="text-[11px] text-secondary max-w-[160px] leading-snug">
                {passport.hint}
              </p>
              <div className="text-[10px] font-mono text-tertiary pt-1">
                {passport.completedSignals} of {passport.totalSignals} signals ready
              </div>
            </div>
          </div>
        </div>

        {/* 2. FOUR EVALUATION SIGNALS CHECKLIST */}
        <div className="py-8 border-b border-hairline">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Flame size={15} className="text-amber-500" />
              Verified Readiness Evaluation Breakdown
            </h2>
            <span className="text-xs font-mono text-tertiary font-medium">
              Weight: 100 Points Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                  signal.completed
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-hairline/70 bg-surface-raised/40 opacity-75'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {signal.completed ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <Circle size={16} className="text-tertiary" />
                  )}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold ${
                        signal.completed ? 'text-primary' : 'text-secondary'
                      }`}
                    >
                      {signal.title}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-tertiary">
                      +{signal.weight} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary leading-snug">
                    {signal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. TECHNICAL SKILLS MATRIX */}
        {passport.skills && passport.skills.length > 0 && (
          <div className="py-8 border-b border-hairline space-y-3">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Code2 size={15} className="text-blue-500" />
              Technical Skill Stack ({passport.skills.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {passport.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-raised border border-hairline/80 text-primary hover:border-accent/40 transition-colors shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. TARGET ORGANIZATIONS PREPARATION */}
        {passport.targetOrganizations && passport.targetOrganizations.length > 0 && (
          <div className="py-8 border-b border-hairline space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                <Bookmark size={15} className="text-accent" />
                Target Organizations ({passport.targetOrganizations.length})
              </h2>
              <span className="text-[11px] text-tertiary">
                {passport.applicationsCount} active proposal tracks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {passport.targetOrganizations.map((org) => (
                <Link
                  key={org.slug}
                  href={`/organizations/${org.slug}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-hairline/80 bg-surface-raised/60 hover:bg-surface-raised hover:border-accent/40 transition-all group shadow-2xs"
                >
                  <OrgLogo name={org.name} slug={org.slug} className="w-8 h-8 rounded-lg" size={16} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-primary group-hover:text-accent line-clamp-1 transition-colors">
                      {org.name}
                    </span>
                    {org.programSlug && (
                      <span className="text-[10px] font-mono text-tertiary uppercase">
                        {org.programSlug}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 5. SHARE & EMBED BADGE SECTION */}
        <div className="pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-heading font-bold text-primary">
                Share Verified Passport & GitHub Badge
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Embed your live readiness badge into your GitHub profile README or proposal submissions.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(passportUrl, 'link')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-hairline bg-surface-raised hover:bg-surface text-xs font-bold text-primary hover:text-accent transition-all shadow-2xs"
              >
                {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmbedOptions((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-page text-xs font-bold hover:opacity-90 transition-opacity shadow-2xs"
              >
                <Code2 size={13} />
                <span>{showEmbedOptions ? 'Hide Snippets' : 'Get Badges'}</span>
              </button>
            </div>
          </div>

          {/* Embedded badge preview & snippet options */}
          {showEmbedOptions && (
            <div className="p-4 sm:p-5 rounded-2xl border border-hairline/80 bg-surface-raised/70 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <span className="text-xs font-bold text-secondary">Live Badge Preview:</span>
                <div className="inline-block p-1 bg-surface rounded-lg border border-hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={badgeUrl}
                    alt="Contribo Readiness Badge Preview"
                    className="h-5"
                  />
                </div>
              </div>

              {/* Markdown snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-tertiary">Markdown (GitHub Profile README.md)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(markdownSnippet, 'badge')}
                    className="text-xs font-bold text-accent hover:text-accent/80 flex items-center gap-1"
                  >
                    {copiedBadge ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedBadge ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-page font-mono text-xs text-primary/80 border border-hairline overflow-x-auto whitespace-nowrap">
                  {markdownSnippet}
                </div>
              </div>

              {/* HTML snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-tertiary">HTML Snippet (Personal Website)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(htmlSnippet, 'badge')}
                    className="text-xs font-bold text-accent hover:text-accent/80 flex items-center gap-1"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-page font-mono text-xs text-primary/80 border border-hairline overflow-x-auto whitespace-nowrap">
                  {htmlSnippet}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. CONTRIIBO ECOSYSTEM CALLOUT */}
      <div className="p-6 rounded-2xl border border-hairline/70 bg-surface/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="text-xs font-bold text-primary">
            Want your own verified Contributor Passport?
          </div>
          <p className="text-[11px] text-secondary">
            Track GSoC, LFX, and NSoC application milestones and evaluate your readiness for free.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          Open Your Dashboard
        </Link>
      </div>
    </div>
  );
}
