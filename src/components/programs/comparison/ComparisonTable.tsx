'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Banknote,
  GraduationCap,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { ProgramComparisonRecord, CountryData } from '@/lib/programs/comparison-data';
import { RegionalStipendEstimate } from '@/lib/programs/comparison';

interface ComparisonTableProps {
  programs: ProgramComparisonRecord[];
  stipends: Record<string, RegionalStipendEstimate>;
  country: CountryData;
  onRemoveProgram: (slug: string) => void;
  className?: string;
}

export function ComparisonTable({
  programs,
  stipends,
  country,
  onRemoveProgram,
  className = '',
}: ComparisonTableProps) {
  if (programs.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-muted/20 border border-border rounded-2xl">
        Please select at least 2 programs above to view the comparison matrix.
      </div>
    );
  }

  const renderBoolBadge = (val: boolean, trueLabel = 'Yes', falseLabel = 'No', reverseColor = false) => {
    const isGood = reverseColor ? !val : val;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isGood
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            : 'bg-muted text-muted-foreground border border-border'
        }`}
      >
        {isGood ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {val ? trueLabel : falseLabel}
      </span>
    );
  };

  return (
    <div className={`border border-border rounded-2xl bg-card overflow-hidden shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[720px]">
          {/* Table Header: Program identity cards */}
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="p-4 w-64 min-w-[220px] font-semibold text-foreground sticky left-0 bg-muted/90 backdrop-blur-md z-20 border-r border-border shadow-xs">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  Comparison Matrix
                </span>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  Calibrated for {country.name} ({country.currencySymbol})
                </p>
              </th>

              {programs.map((p) => (
                <th
                  key={p.slug}
                  className="p-4 min-w-[220px] font-semibold text-foreground align-top border-r border-border last:border-r-0 relative group"
                >
                  {/* Accent color bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t"
                    style={{ backgroundColor: p.accentColor }}
                  />

                  <div className="flex items-start justify-between gap-2 mt-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.accentColor }}
                        />
                        <span className="text-sm font-bold text-foreground leading-tight">{p.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.organizer}</p>
                    </div>

                    {programs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => onRemoveProgram(p.slug)}
                        className="text-muted-foreground/60 hover:text-destructive p-1 rounded-md transition-colors"
                        title="Remove program from matrix"
                        aria-label={`Remove ${p.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={p.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      Official Website
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      href={`/programs/${p.slug}`}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Guide →
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {/* SECTION 1: FINANCIAL COMPENSATION */}
            <tr className="bg-primary/5">
              <td
                colSpan={programs.length + 1}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 sticky left-0"
              >
                <Banknote className="w-3.5 h-3.5" />
                Financial Compensation & Regional PPP Stipends
              </td>
            </tr>

            {/* Estimated Total Local Payout */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-semibold text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Estimated Net Payout ({country.currency})
                <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">
                  Based on {country.name} PPP ({Math.round(country.pppMultiplier * 100)}%)
                </span>
              </td>
              {programs.map((p) => {
                const s = stipends[p.slug];
                return (
                  <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0">
                    <div className="text-sm font-bold text-foreground">
                      {s.formattedRangeLocal}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      {s.formattedRangeUsd}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Hourly Rate Estimate */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Est. Hourly Compensation
              </td>
              {programs.map((p) => {
                const s = stipends[p.slug];
                if (s.isUnpaid) {
                  return (
                    <td key={p.slug} className="p-3.5 text-xs text-muted-foreground border-r border-border last:border-r-0">
                      Unpaid
                    </td>
                  );
                }
                return (
                  <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                    <span className="font-semibold text-foreground">
                      {country.currencySymbol}{s.hourlyRateEstimateLocal.toLocaleString('en-US')}/hr
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1 font-mono">
                      (~${s.hourlyRateEstimateUsd}/hr)
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Stipend Model & Policy */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Stipend Model
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground capitalize mb-1">
                    {p.stipend.type.replace('-', ' ')}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{p.stipend.payoutModel}</p>
                </td>
              ))}
            </tr>

            {/* SECTION 2: ELIGIBILITY & PREREQUISITES */}
            <tr className="bg-primary/5">
              <td
                colSpan={programs.length + 1}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 sticky left-0"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Eligibility Criteria & Requirements
              </td>
            </tr>

            {/* Student Status Required */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                University Student Required?
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  {renderBoolBadge(p.eligibility.studentStatusRequired, 'Must be enrolled student', 'Open to non-students', true)}
                </td>
              ))}
            </tr>

            {/* Full-time Employment Allowed */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Full-Time Job Allowed?
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  {p.eligibility.fullTimeEmployedAllowed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Allowed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      Disqualified / Prohibited
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Minimum Age */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Minimum Age
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs font-medium text-foreground">
                  {p.eligibility.minAge}+ years old
                </td>
              ))}
            </tr>

            {/* Geographic Scope */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Geographic Scope
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs text-muted-foreground leading-relaxed">
                  {p.eligibility.geographicScope}
                </td>
              ))}
            </tr>

            {/* Experience Level */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Target Experience Level
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground capitalize">
                    {p.eligibility.experienceLevel}
                  </span>
                </td>
              ))}
            </tr>

            {/* SECTION 3: TIME COMMITMENT & WORKLOAD */}
            <tr className="bg-primary/5">
              <td
                colSpan={programs.length + 1}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 sticky left-0"
              >
                <Clock className="w-3.5 h-3.5" />
                Workload & Timeline Commitment
              </td>
            </tr>

            {/* Weekly Hours */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Weekly Time Commitment
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  <span className="font-bold text-foreground">{p.commitment.weeklyHours} hrs/week</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">
                    {p.commitment.durationWeeks} weeks ({p.commitment.totalEstimatedHours}h total)
                  </span>
                </td>
              ))}
            </tr>

            {/* Coding Period */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Coding Window
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs font-medium text-foreground">
                  {p.commitment.codingStartDate} → {p.commitment.codingEndDate}
                </td>
              ))}
            </tr>

            {/* Mentorship Ratio */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Mentorship Support
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  <span className="font-semibold text-foreground">{p.mentorship.ratio}</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{p.mentorship.format}</p>
                </td>
              ))}
            </tr>

            {/* SECTION 4: APPLICATION PROCESS */}
            <tr className="bg-primary/5">
              <td
                colSpan={programs.length + 1}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 sticky left-0"
              >
                <Calendar className="w-3.5 h-3.5" />
                Application & Proposal Requirements
              </td>
            </tr>

            {/* Written Proposal */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Written Proposal Required?
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  {renderBoolBadge(p.application.requiresWrittenProposal, 'Proposal Mandatory', 'No Proposal Required')}
                </td>
              ))}
            </tr>

            {/* Prior Pull Requests Evaluated */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Prior Contributions Screened?
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  {renderBoolBadge(p.application.priorContributionsEvaluated, 'PRs / Commits Inspected', 'Clean Slate / Resume')}
                </td>
              ))}
            </tr>

            {/* Application Window */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3.5 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border">
                Application Window
              </td>
              {programs.map((p) => (
                <td key={p.slug} className="p-3.5 border-r border-border last:border-r-0 text-xs">
                  <div className="font-medium text-foreground">
                    {p.application.applicationStartDate} → {p.application.applicationEndDate}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Results: {p.application.acceptanceAnnouncementDate}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-muted/20 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Calculations include 2026 guidelines and verified official purchasing power parity tiers.</span>
        </div>
        <div className="font-mono text-[11px]">
          Showing {programs.length} programs • {country.name} ({country.currency})
        </div>
      </div>
    </div>
  );
}
