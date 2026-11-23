'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  FileDiff,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { compareProposals } from '@/lib/proposal-studio/diff-engine';
import { generateProposalChangelog } from '@/lib/proposal-studio/changelog';
import type { ProposalDiffResult } from '@/lib/proposal-studio/diff-types';
import { DiffMetricsCard } from '@/components/proposal-studio/diff/DiffMetricsCard';
import {
  DiffSelectorBar,
  type RevisionOption,
} from '@/components/proposal-studio/diff/DiffSelectorBar';
import { DiffViewer } from '@/components/proposal-studio/diff/DiffViewer';
import { ChangelogExportModal } from '@/components/proposal-studio/diff/ChangelogExportModal';

interface ProposalRevisionData {
  id: string;
  label: string;
  timestamp: string;
  sections: Record<string, string>;
  wordCount?: number;
  progress?: number;
}

// Default demonstration revisions showcasing real GSoC proposal evolution
const DEMO_REVISIONS: ProposalRevisionData[] = [
  {
    id: 'demo-v1',
    label: 'v1.0 (Initial Draft)',
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
    sections: {
      summary:
        'This proposal outlines the implementation of a real-time event streaming layer for Contribo.\nIt aims to support user notifications and activity feeds using WebSockets.',
      problemStatement:
        'Currently, contributors must manually refresh the portal to see whether their proposals have received feedback from mentors.\nThis causes delays in communication and missed review cycles.',
      architecture:
        'We will set up a Node.js server that listens to database changes and broadcasts updates.\nA basic WebSocket connection will push events directly to the frontend clients.',
      deliverables:
        '1. WebSocket server setup\n2. Client-side listener hook\n3. Notification toaster component',
      timeline:
        'Weeks 1-4: Community bonding and environment setup\nWeeks 5-8: Build WebSocket server\nWeeks 9-12: Frontend integration and wrap up',
      testing:
        'Basic unit tests for message handlers.',
      risks:
        'Server disconnects under flaky network conditions.',
      aboutMe:
        'Undergraduate computer science student passionate about open-source developer tooling.',
    },
  },
  {
    id: 'demo-v2',
    label: 'v2.0 (Mentor Feedback Revision)',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    sections: {
      summary:
        'This proposal outlines the implementation of a resilient, distributed real-time event streaming pipeline for Contribo.\nIt provides instant bi-directional push notifications, live proposal collaboration, and verifiable activity feeds.',
      problemStatement:
        'Currently, contributors must manually refresh the portal to see whether their proposals have received feedback from mentors.\nThis causes communication delays, race conditions during collaborative editing, and missed review cycles.\nMentors need a proactive way to notify applicants about revision deadlines.',
      architecture:
        'We will deploy an event-driven architecture powered by Redis Streams and SSE (Server-Sent Events) fallback.\nThe Next.js API routes will publish mutation events to Redis pub/sub topics.\nAn edge worker layer handles connection pooling and JWT authentication.\nGraceful reconnection with exponential backoff prevents thundering herd issues.',
      deliverables:
        '1. Redis Streams event ingest pipeline with schema validation\n2. Resilient SSE / WebSocket connection manager with heartbeat ping/pong\n3. Notification bell HUD with unread count and audio chime\n4. E2E test suite covering network partition recovery',
      timeline:
        'Weeks 1-2: Community bonding, architecture review with mentor, Docker dev environment\nWeeks 3-5: Implement Redis event bus and edge authentication\nWeeks 6-7: Mid-term milestone: Live notification push demonstrated\nWeeks 8-10: Frontend state synchronization and offline queuing\nWeeks 11-12: Load testing (10k concurrent streams), documentation, and final submission',
      testing:
        'Comprehensive testing strategy:\n- Unit tests for event serialization and token verification\n- Integration tests for Redis stream consumer groups\n- Playwright E2E tests simulating intermittent disconnections',
      risks:
        '1. Redis memory limits during peak notification bursts -> Mitigated via capped streams (MAXLEN ~ 10,000).\n2. Mobile browser background tab throttling -> Mitigated via Service Worker background sync.',
      aboutMe:
        'Final-year CS student with prior contributions to Next.js open-source tooling and distributed messaging systems.',
    },
  },
  {
    id: 'demo-v3',
    label: 'v3.0 (Final Submission Draft)',
    timestamp: new Date().toISOString(),
    sections: {
      summary:
        'This proposal outlines the implementation of a resilient, distributed real-time event streaming pipeline for Contribo.\nIt provides instant bi-directional push notifications, live proposal collaboration, and verifiable activity feeds.\nFully compliant with GSoC 2026 milestone deliverables.',
      problemStatement:
        'Currently, contributors must manually refresh the portal to see whether their proposals have received feedback from mentors.\nThis causes communication delays, race conditions during collaborative editing, and missed review cycles.\nMentors need a proactive way to notify applicants about revision deadlines, review requests, and evaluation milestones.',
      architecture:
        'We will deploy a production-grade event-driven architecture powered by Redis Streams and SSE (Server-Sent Events) fallback.\nThe Next.js API routes will publish mutation events to partitioned Redis pub/sub channels.\nAn edge worker layer handles connection pooling, rate limiting, and JWT authentication.\nGraceful reconnection with exponential backoff and jitter prevents thundering herd issues.\nAll messages are strictly typed with Zod schemas and persisted in MongoDB for historical query replay.',
      deliverables:
        '1. Redis Streams event ingest pipeline with strict Zod schema validation\n2. Resilient SSE / WebSocket connection manager with heartbeat ping/pong\n3. Notification bell HUD with unread count, badge filters, and audio chime\n4. Proposal collaborative live preview and markdown diff inspector\n5. E2E test suite covering network partition recovery and chaos test scenarios',
      timeline:
        'Weeks 1-2: Community bonding, architecture review with mentor, Docker dev environment\nWeeks 3-5: Implement Redis event bus, Zod contracts, and edge authentication\nWeeks 6-7: Mid-term milestone: Live notification push demonstrated and merged\nWeeks 8-10: Frontend state synchronization, proposal diff inspector, and offline queuing\nWeeks 11-12: Load testing (10k concurrent streams), documentation, tutorial video, and final submission',
      testing:
        'Comprehensive testing strategy:\n- Unit tests for event serialization and token verification (100% branch coverage on auth)\n- Integration tests for Redis stream consumer groups and failover\n- Playwright E2E tests simulating intermittent disconnections and packet loss\n- k6 load testing verifying p99 latency < 45ms under 5,000 concurrent listeners',
      risks:
        '1. Redis memory limits during peak notification bursts -> Mitigated via capped streams (MAXLEN ~ 10,000) and TTL evictions.\n2. Mobile browser background tab throttling -> Mitigated via Service Worker background sync.\n3. Schema evolution across versions -> Handled via versioned protobuf/json envelopes.',
      aboutMe:
        'Final-year CS student with prior contributions to Next.js open-source tooling and distributed messaging systems. Author of two popular npm packages with 50k+ weekly downloads.',
    },
  },
];

export function DiffClient() {
  const searchParams = useSearchParams();
  const proposalId = searchParams.get('proposalId');
  const queryVA = searchParams.get('vA');
  const queryVB = searchParams.get('vB');

  const [revisions, setRevisions] = useState<ProposalRevisionData[]>(DEMO_REVISIONS);
  const [versionAId, setVersionAId] = useState<string>(queryVA || 'demo-v1');
  const [versionBId, setVersionBId] = useState<string>(queryVB || 'demo-v3');
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showOnlyChanges, setShowOnlyChanges] = useState<boolean>(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch revisions if a real proposalId was provided
  useEffect(() => {
    if (!proposalId) return;

    let isMounted = true;
    async function fetchRevisions() {
      if (!proposalId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/proposals/${encodeURIComponent(proposalId)}/revisions`);
        if (!res.ok) {
          throw new Error(`Failed to load proposal revisions (status: ${res.status})`);
        }
        const data = await res.json();
        const serverRevisions: Array<{
          id: string;
          label?: string;
          timestamp: string;
          sections?: Record<string, string>;
          wordCount?: number;
          progress?: number;
        }> = data.revisions || [];

        if (serverRevisions.length > 0 && isMounted) {
          const formatted: ProposalRevisionData[] = serverRevisions.map((r, idx) => ({
            id: r.id,
            label: r.label || `Snapshot ${idx + 1} (${new Date(r.timestamp).toLocaleDateString()})`,
            timestamp: r.timestamp,
            sections: r.sections || {},
            wordCount: r.wordCount,
            progress: r.progress,
          }));

          setRevisions(formatted);
          if (formatted.length >= 2) {
            setVersionAId(formatted[0].id);
            setVersionBId(formatted[formatted.length - 1].id);
          } else if (formatted.length === 1) {
            setVersionAId(formatted[0].id);
            setVersionBId(formatted[0].id);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          // If fetch fails (e.g. unauthenticated or network error), fallback to demo revisions gracefully
          setError(
            err instanceof Error ? err.message : 'Could not load proposal snapshots. Showing demo data.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRevisions();
    return () => {
      isMounted = false;
    };
  }, [proposalId]);

  const versionA = useMemo(
    () => revisions.find((r) => r.id === versionAId) || revisions[0] || DEMO_REVISIONS[0],
    [revisions, versionAId]
  );

  const versionB = useMemo(
    () =>
      revisions.find((r) => r.id === versionBId) ||
      revisions[revisions.length - 1] ||
      DEMO_REVISIONS[DEMO_REVISIONS.length - 1],
    [revisions, versionBId]
  );

  // Compute live diff
  const diffResult: ProposalDiffResult = useMemo(() => {
    return compareProposals({
      oldProposalTitle: 'Proposal Draft',
      newProposalTitle: 'Proposal Draft',
      oldVersionLabel: versionA.label,
      newVersionLabel: versionB.label,
      oldSections: versionA.sections || {},
      newSections: versionB.sections || {},
      contextSize: 3,
    });
  }, [versionA, versionB]);

  const changelogMarkdown = useMemo(() => {
    return generateProposalChangelog(diffResult);
  }, [diffResult]);

  const revisionOptions: RevisionOption[] = useMemo(() => {
    return revisions.map((r) => ({
      id: r.id,
      label: r.label,
      timestamp: r.timestamp,
      wordCount: r.wordCount,
      progress: r.progress,
    }));
  }, [revisions]);

  const handleSwapVersions = () => {
    const temp = versionAId;
    setVersionAId(versionBId);
    setVersionBId(temp);
  };

  return (
    <div className="min-h-screen bg-page text-primary pb-20">
      {/* Top Banner if demo mode is active */}
      {!proposalId && (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 text-center text-xs font-mono text-accent">
          <span className="font-semibold">Interactive Sandbox Mode</span>: Displaying real-world GSoC proposal snapshots. Connect your proposal from Proposal Studio to inspect custom revisions.
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-mono text-rose-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Sticky Control & Version Selector Bar */}
        <DiffSelectorBar
          revisions={revisionOptions}
          versionAId={versionAId}
          versionBId={versionBId}
          onSelectVersionA={setVersionAId}
          onSelectVersionB={setVersionBId}
          onSwapVersions={handleSwapVersions}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          showOnlyChanges={showOnlyChanges}
          onToggleShowOnlyChanges={() => setShowOnlyChanges((prev) => !prev)}
          onOpenChangelogModal={() => setIsChangelogModalOpen(true)}
          proposalTitle="Proposal Markdown Diff Inspector"
        />

        {/* Dashboard Metrics and Deltas */}
        <DiffMetricsCard
          diff={diffResult}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
        />

        {/* Diff Content Viewer */}
        <DiffViewer
          sections={diffResult.sections}
          viewMode={viewMode}
          showOnlyChanges={showOnlyChanges}
          selectedSectionId={selectedSectionId}
          oldVersionLabel={versionA.label}
          newVersionLabel={versionB.label}
        />
      </div>

      {/* Changelog Export Modal */}
      <ChangelogExportModal
        isOpen={isChangelogModalOpen}
        onClose={() => setIsChangelogModalOpen(false)}
        changelogMarkdown={changelogMarkdown}
        versionA={versionA.label}
        versionB={versionB.label}
      />
    </div>
  );
}
