import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { analyzeProposalGaps } from '@/lib/proposals/gap-analyzer';
import { matchMentorsToProposal } from '@/lib/proposals/mentor-matcher';
import { DRAFT_PROPOSALS } from '@/lib/proposal-studio/data';
import { RadarClient } from './RadarClient';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'AI Mentor Matching & Proposal Rubric Gap Radar | Contribo',
    description:
      'Offline TF-IDF mentor affinity matching and 4-pillar rubric gap analysis radar for open-source proposals.',
  };
}

const DEMO_SECTIONS: Record<string, string> = {
  summary:
    'This proposal details the implementation of a distributed real-time event streaming pipeline using Redis Streams, TypeScript, Next.js, and Server-Sent Events (SSE). It introduces live collaborative editing, mentor review annotations, and instant activity push feeds.',
  problemStatement:
    'Currently, open-source contributors must refresh the portal to see mentor feedback or proposal status changes. This leads to missed review rounds and lack of visibility on maintainer triage.',
  architecture:
    'We deploy a decoupled event bus where API route mutations publish Zod-validated payloads to Redis stream channels. Edge Node.js worker instances manage client subscriptions with automatic reconnect backoff and JWT security.',
  deliverables:
    '1. Redis Streams event ingest pipeline\n2. Real-time proposal review annotation engine\n3. Notification drawer with sound alerts\n4. Comprehensive Playwright E2E test suite',
  timeline:
    'Weeks 1-2: Community bonding & architecture sign-off via GitHub Discussions\nWeeks 3-5: Redis stream engine\nWeeks 6-7: Midterm: Live annotation review demo\nWeeks 8-10: Frontend sync & offline queuing\nWeeks 11-12: Load testing, documentation & final wrap up',
  testing:
    'Unit testing with 100% auth branch coverage, Redis integration tests, and Playwright chaos test scenarios.',
  risks:
    'Redis memory exhaustion under peak events (mitigated via capped streams) and mobile tab background throttling (mitigated via Service Worker backoff).',
  aboutMe:
    'Final-year CS student with prior open-source pull requests to TypeScript developer tooling and distributed systems.',
};

export default async function ProposalRadarPage(props: Props) {
  const resolvedParams = await Promise.resolve(props.params);
  const id = (resolvedParams?.id ?? '').trim();

  if (!id) {
    notFound();
  }

  const matchedDraft = DRAFT_PROPOSALS.find((d) => d.id === id);

  const proposalData =
    id === 'demo'
      ? {
          id: 'demo',
          projectTitle:
            'Real-Time Event Streaming & Notification Infrastructure for Contribo',
          orgName: 'Async GraphQL & Contribo Core',
          programName: 'Google Summer of Code 2026',
          sections: DEMO_SECTIONS,
        }
      : matchedDraft
      ? {
          id: matchedDraft.id,
          projectTitle: matchedDraft.projectTitle,
          orgName: matchedDraft.orgName,
          programName: matchedDraft.programName,
          sections: matchedDraft.sections ?? {},
        }
      : null;

  if (!proposalData) {
    notFound();
  }

  const initialAnalysis = analyzeProposalGaps(proposalData.sections);
  const initialMentors = matchMentorsToProposal(proposalData, { limit: 5 });

  return (
    <main className="min-h-screen w-full px-4 sm:px-8 lg:px-12 pt-[140px] pb-24">
      <RadarClient
        proposalId={proposalData.id}
        projectTitle={proposalData.projectTitle}
        orgName={proposalData.orgName}
        programName={proposalData.programName}
        initialSections={proposalData.sections}
        initialAnalysis={initialAnalysis}
        initialMentors={initialMentors}
      />
    </main>
  );
}
