'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Radar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import {
  analyzeProposalGaps,
  type PillarScore,
  type ProposalGapAnalysis,
  type ReadinessRating,
} from '@/lib/proposals/gap-analyzer';
import {
  matchMentorsToProposal,
  type MentorMatchResult,
} from '@/lib/proposals/mentor-matcher';

interface RadarClientProps {
  proposalId: string;
  projectTitle: string;
  orgName: string;
  programName: string;
  initialSections: Record<string, string>;
  initialAnalysis: ProposalGapAnalysis;
  initialMentors: MentorMatchResult[];
}

function ReadinessBadge({ rating, score }: { rating: ReadinessRating; score: number }) {
  const styles: Record<ReadinessRating, string> = {
    'Submission Ready':
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    Competitive:
      'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    Developing:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Needs Work':
      'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${styles[rating]}`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      {rating} ({score}/100)
    </span>
  );
}

/**
 * Pure SVG 4-axis radar chart comparing proposal strength vs. target benchmark.
 */
function FourAxisRadarSvg({ pillars }: { pillars: PillarScore[] }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 112;

  // 4 axes: Top (-90deg), Right (0deg), Bottom (90deg), Left (180deg)
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

  const pointAt = (score: number, angleIdx: number) => {
    const r = (Math.max(0, Math.min(score, 100)) / 100) * radius;
    const angle = angles[angleIdx] ?? 0;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const toPolygonPoints = (scores: number[]) =>
    scores
      .map((s, idx) => {
        const pt = pointAt(s, idx);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');

  const currentPoints = toPolygonPoints(pillars.map((p) => p.score));
  const targetPoints = toPolygonPoints(pillars.map((p) => p.targetBenchmark));
  const rings = [25, 50, 75, 100];

  const shortLabels = ['Architecture (35%)', 'Timeline (30%)', 'Community (20%)', 'Risks (15%)'];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[340px] mx-auto overflow-visible"
      role="img"
      aria-label="4-Pillar Proposal Rubric Radar Chart"
    >
      <title>Proposal 4-Pillar Rubric Radar vs Target Benchmark</title>

      {/* Concentric diamond/octagon rings */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={toPolygonPoints([ring, ring, ring, ring])}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={1}
        />
      ))}

      {/* Axis spokes */}
      {angles.map((_, idx) => {
        const outer = pointAt(100, idx);
        return (
          <line
            key={idx}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth={1}
          />
        );
      })}

      {/* Target Benchmark Polygon */}
      <polygon
        points={targetPoints}
        fill="rgba(148, 163, 184, 0.12)"
        stroke="#94a3b8"
        strokeWidth={1.75}
        strokeDasharray="5 4"
      />

      {/* Current Proposal Polygon */}
      <polygon
        points={currentPoints}
        fill="rgba(16, 185, 129, 0.22)"
        stroke="#10b981"
        strokeWidth={2.5}
      />

      {/* Score Dots */}
      {pillars.map((p, idx) => {
        const pt = pointAt(p.score, idx);
        return (
          <circle
            key={p.key}
            cx={pt.x}
            cy={pt.y}
            r={4.5}
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Axis Labels */}
      {pillars.map((p, idx) => {
        const labelPt = pointAt(118, idx);
        const anchor =
          idx === 1 ? 'start' : idx === 3 ? 'end' : 'middle';
        const dy = idx === 0 ? -4 : idx === 2 ? 12 : 4;
        return (
          <text
            key={p.key}
            x={labelPt.x}
            y={labelPt.y + dy}
            textAnchor={anchor}
            className="fill-slate-700 dark:fill-slate-300 text-[11px] font-semibold"
          >
            {shortLabels[idx]}
          </text>
        );
      })}
    </svg>
  );
}

export function RadarClient({
  proposalId,
  projectTitle,
  orgName,
  programName,
  initialSections,
  initialAnalysis,
  initialMentors,
}: RadarClientProps) {
  const [sections, setSections] = useState<Record<string, string>>(initialSections);
  const [analysis, setAnalysis] = useState<ProposalGapAnalysis>(initialAnalysis);
  const [mentors, setMentors] = useState<MentorMatchResult[]>(initialMentors);
  const [copiedMentorId, setCopiedMentorId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  function handleReanalyze() {
    const nextAnalysis = analyzeProposalGaps(sections);
    const nextMentors = matchMentorsToProposal(
      { projectTitle, orgName, programName, sections },
      { limit: 5 }
    );
    setAnalysis(nextAnalysis);
    setMentors(nextMentors);
  }

  async function handleCopyOutreach(mentorId: string, strategy: string) {
    try {
      await navigator.clipboard.writeText(strategy);
      setCopiedMentorId(mentorId);
      setTimeout(() => setCopiedMentorId(null), 2000);
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/proposals/${proposalId}/review`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Proposal Review
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Radar className="w-7 h-7 text-emerald-500 shrink-0" />
            AI Mentor Matching &amp; Rubric Gap Radar
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {projectTitle} &middot; <span className="font-medium">{orgName}</span> ({programName})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ReadinessBadge
            rating={analysis.readinessRating}
            score={analysis.overallScore}
          />
          <button
            type="button"
            onClick={() => setShowEditor((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            {showEditor ? 'Hide Draft Simulator' : 'Edit & Re-Analyze'}
          </button>
        </div>
      </div>

      {/* Interactive Draft Re-Analysis Panel */}
      {showEditor && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Live Proposal Draft Simulator
            </h2>
            <button
              type="button"
              onClick={handleReanalyze}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-Score Radar &amp; Mentors
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['architecture', 'timeline', 'risks', 'aboutMe'] as const).map((key) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {key}
                </label>
                <textarea
                  rows={4}
                  value={sections[key] ?? ''}
                  onChange={(e) =>
                    setSections((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Radar Chart + 4-Pillar Score Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 flex flex-col items-center justify-center">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white self-start mb-4">
            4-Pillar Strength vs. Target Benchmark
          </h2>
          <FourAxisRadarSvg pillars={analysis.pillars} />
          <div className="flex items-center gap-6 mt-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-emerald-500" />
              Current Draft
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-400/20 border border-dashed border-slate-400" />
              Target Benchmark
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analysis.pillars.map((pillar) => (
            <div
              key={pillar.key}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Weight {Math.round(pillar.weight * 100)}%
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Target: {pillar.targetBenchmark}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                  {pillar.label}
                </h3>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {pillar.score}
                    <span className="text-sm font-normal text-slate-400">/100</span>
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    +{pillar.weightedContribution} pts
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actionable Gap Checklist */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Actionable Rubric Gap Checklist
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.gapChecklist.map((item) => {
            const isPassed = item.severity === 'passed';
            const isCritical = item.severity === 'critical';
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 space-y-1.5 ${
                  isPassed
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : isCritical
                    ? 'border-rose-500/30 bg-rose-500/10'
                    : 'border-amber-500/30 bg-amber-500/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 ${
                          isCritical ? 'text-rose-500' : 'text-amber-500'
                        }`}
                      />
                    )}
                    {item.title}
                  </span>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300">
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {item.recommendation}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top 5 Matched Mentors */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" />
            Top {mentors.length} Semantic &amp; Stack-Matched Mentors (TF-IDF)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ranked by offline cosine similarity &amp; stack overlap
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map((match) => (
            <div
              key={match.mentor.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {match.mentor.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {match.mentor.role} &middot; {match.mentor.organization}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    {match.affinityScore}% match
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {match.mentor.bio}
                </p>

                {match.sharedStackOverlap.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {match.sharedStackOverlap.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    Outreach Strategy
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void handleCopyOutreach(match.mentor.id, match.outreachStrategy)
                    }
                    className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    {copiedMentorId === match.mentor.id ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {match.outreachStrategy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
