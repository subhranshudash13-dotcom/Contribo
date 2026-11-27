'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Network,
  ShieldCheck,
  AlertTriangle,
  Clock,
  GitPullRequest,
  Users,
  GitMerge,
} from 'lucide-react';
import type {
  BusFactorHealth,
  OrganizationEcosystemReport,
} from '@/lib/organizations/ecosystem-analyzer';

interface EcosystemClientProps {
  report: OrganizationEcosystemReport;
}

function BusFactorBadge({ health }: { health: BusFactorHealth }) {
  const styles: Record<BusFactorHealth, string> = {
    Resilient:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    Moderate:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    Concentrated:
      'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[health]}`}
    >
      {health === 'Resilient' ? (
        <ShieldCheck className="w-4 h-4" />
      ) : (
        <AlertTriangle className="w-4 h-4" />
      )}
      Bus Factor: {health}
    </span>
  );
}

/**
 * Pure SVG bipartite dependency & stack cluster graph (Repositories -> Tech Stacks).
 */
function DependencyClusterSvg({
  report,
  selectedNodeId,
  onSelectNode,
}: {
  report: OrganizationEcosystemReport;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}) {
  const repoNodes = report.graph.nodes.filter((n) => n.kind === 'repo');
  const stackNodes = report.graph.nodes.filter((n) => n.kind === 'stack');

  const maxCount = Math.max(repoNodes.length, stackNodes.length, 3);
  const height = Math.max(260, maxCount * 58 + 40);
  const width = 640;

  const posMap = new Map<string, { x: number; y: number }>();
  repoNodes.forEach((n, idx) => {
    const y = ((idx + 1) / (repoNodes.length + 1)) * (height - 20) + 10;
    posMap.set(n.id, { x: 130, y });
  });
  stackNodes.forEach((n, idx) => {
    const y = ((idx + 1) / (stackNodes.length + 1)) * (height - 20) + 10;
    posMap.set(n.id, { x: 510, y });
  });

  const isHighlightedEdge = (src: string, dst: string) =>
    !selectedNodeId || selectedNodeId === src || selectedNodeId === dst;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Organization Tech-Stack Dependency Graph"
    >
      <title>{report.orgName} Cross-Repository Tech-Stack Graph</title>

      {report.graph.edges.map((edge) => {
        const p1 = posMap.get(edge.source);
        const p2 = posMap.get(edge.target);
        if (!p1 || !p2) return null;
        const active = isHighlightedEdge(edge.source, edge.target);
        const midX = (p1.x + p2.x) / 2;
        return (
          <path
            key={`${edge.source}->${edge.target}`}
            d={`M ${p1.x + 65} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x - 55} ${p2.y}`}
            fill="none"
            stroke={active ? '#10b981' : '#cbd5e1'}
            strokeOpacity={active ? 0.65 : 0.25}
            strokeWidth={active ? 2 : 1}
          />
        );
      })}

      {repoNodes.map((node) => {
        const pos = posMap.get(node.id);
        if (!pos) return null;
        const selected = selectedNodeId === node.id;
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x - 65}, ${pos.y - 16})`}
            onClick={() => onSelectNode(selected ? null : node.id)}
            className="cursor-pointer"
          >
            <rect
              width={130}
              height={32}
              rx={8}
              className={
                selected
                  ? 'fill-emerald-600 stroke-emerald-400'
                  : 'fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700'
              }
              strokeWidth={1.5}
            />
            <text
              x={65}
              y={20}
              textAnchor="middle"
              className={`text-[11px] font-semibold ${
                selected ? 'fill-white' : 'fill-slate-800 dark:fill-slate-200'
              }`}
            >
              {node.label}
            </text>
          </g>
        );
      })}

      {stackNodes.map((node) => {
        const pos = posMap.get(node.id);
        if (!pos) return null;
        const selected = selectedNodeId === node.id;
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x - 55}, ${pos.y - 15})`}
            onClick={() => onSelectNode(selected ? null : node.id)}
            className="cursor-pointer"
          >
            <rect
              width={110}
              height={30}
              rx={15}
              className={
                selected
                  ? 'fill-sky-600 stroke-sky-400'
                  : 'fill-sky-500/10 stroke-sky-500/40'
              }
              strokeWidth={1.5}
            />
            <text
              x={55}
              y={19}
              textAnchor="middle"
              className={`text-[11px] font-semibold ${
                selected ? 'fill-white' : 'fill-sky-700 dark:fill-sky-300'
              }`}
            >
              {node.label} ({node.weight})
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function EcosystemClient({ report }: EcosystemClientProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/organizations/${report.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {report.orgName}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Network className="w-7 h-7 text-emerald-500 shrink-0" />
            {report.orgName} Ecosystem &amp; Bus-Factor Explorer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Cross-repository tech-stack dependency graph, maintainer Nakamoto concentration, and
            first-time contributor PR merge velocity.
          </p>
        </div>

        <BusFactorBadge health={report.busFactor.health} />
      </div>

      {/* Telemetry KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Nakamoto Bus Factor</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {report.busFactor.nakamotoCoefficient}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gini concentration: {report.busFactor.giniConcentration}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>First-Review Latency</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {report.velocity.medianHoursToFirstReview}h
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Median time to maintainer triage
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Newcomer Merge Rate</span>
            <GitMerge className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {report.velocity.firstTimeMergeRatePct}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            First-time contributor PRs merged
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Weekly Merged PRs</span>
            <GitPullRequest className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {report.velocity.weeklyMergedPrs}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {report.repos.length} core repositories
          </p>
        </div>
      </section>

      {/* Dependency Graph */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Cross-Repository Tech-Stack Cluster Graph
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any repository or technology pill to isolate its dependency edges.
            </p>
          </div>
          {selectedNodeId && (
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Reset highlight
            </button>
          )}
        </div>

        <DependencyClusterSvg
          report={report}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </section>

      {/* Risk Notes */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Maintainer Sustainability &amp; Contributor Notes
        </h2>
        <div className="space-y-2">
          {report.busFactor.riskNotes.map((note) => (
            <p
              key={note}
              className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3"
            >
              {note}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
