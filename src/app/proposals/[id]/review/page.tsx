import React from 'react';
import type { Metadata } from 'next';
import { ReviewWorkspace } from '@/components/proposal-studio/review/ReviewWorkspace';
import type { ProposalReviewData } from '@/lib/proposal-studio/review-types';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ token?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Mentor & Peer Proposal Review Workspace | Contribo',
    description:
      'Collaborative proposal review mode with inline section annotations, threaded discussion, and standardized 4-pillar evaluation rubric.',
  };
}

const DEMO_REVIEW_DATA: ProposalReviewData = {
  proposal: {
    id: 'demo',
    projectTitle: 'Real-Time Event Streaming & Notification Infrastructure for Contribo',
    orgName: 'Async GraphQL & Contribo Core',
    programName: 'Google Summer of Code 2026',
    year: 2026,
    sections: {
      summary:
        'This proposal details the implementation of a distributed real-time event streaming pipeline using Redis Streams and Server-Sent Events (SSE). It introduces live collaborative editing, mentor review annotations, and instant activity push feeds.',
      problemStatement:
        'Currently, open-source contributors must refresh the portal to see mentor feedback or proposal status changes. This leads to missed review rounds and lack of visibility on maintainer triage.',
      architecture:
        'We deploy a decoupled event bus where API route mutations publish Zod-validated payloads to Redis stream channels. Edge worker instances manage client subscriptions with automatic reconnect backoff and JWT security.',
      deliverables:
        '1. Redis Streams event ingest pipeline\n2. Real-time proposal review annotation engine\n3. Notification drawer with sound alerts\n4. Comprehensive Playwright E2E test suite',
      timeline:
        'Weeks 1-2: Community bonding & architecture sign-off\nWeeks 3-5: Redis stream engine\nWeeks 6-7: Midterm: Live annotation review demo\nWeeks 8-10: Frontend sync & offline queuing\nWeeks 11-12: Load testing, documentation & wrap up',
      testing:
        'Unit testing with 100% auth branch coverage, Redis integration tests, and Playwright chaos test scenarios.',
      risks:
        'Redis memory exhaustion under peak events (mitigated via capped streams) and mobile tab background throttling (mitigated via Service Worker).',
      aboutMe:
        'Final-year CS student with prior contributions to open-source developer tooling and distributed systems.',
    },
    status: 'in_review',
  },
  annotations: [
    {
      id: 'ann_demo_1',
      proposalId: 'demo',
      sectionId: 'architecture',
      authorName: 'Alex Rivera',
      authorRole: 'mentor',
      selectedText: 'Edge worker instances manage client subscriptions',
      content:
        'Great system design choice. Please specify whether you are planning to use Cloudflare Workers or Node.js edge instances for the connection pool.',
      status: 'open',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      replies: [
        {
          id: 'rep_demo_1',
          authorName: 'Proposal Author',
          content: 'Thanks Alex! I plan to use Node.js edge instances with a lightweight connection pool.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    },
    {
      id: 'ann_demo_2',
      proposalId: 'demo',
      sectionId: 'timeline',
      authorName: 'Sarah Chen',
      authorRole: 'alumnus',
      selectedText: 'Weeks 1-2: Community bonding & architecture sign-off',
      content:
        'Recommend adding 3-4 days of buffer before the midterm evaluation in case mentor review is delayed.',
      status: 'addressed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      replies: [],
    },
  ],
  rubricEvaluations: [
    {
      id: 'rub_demo_1',
      proposalId: 'demo',
      evaluatorName: 'Alex Rivera',
      evaluatorRole: 'mentor',
      technicalArchitecture: 5,
      deliverablesTimeline: 4,
      communityBonding: 5,
      longTermImpact: 4,
      weightedScore: 91,
      recommendation: 'strong_accept',
      strengths: 'Very clear technical diagrams and realistic Redis Streams architecture.',
      improvements: 'Elaborate on database schema migrations.',
      submittedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
  ],
  averageRubricScore: 91,
  userPermission: 'can_score',
  isOwner: true,
};

export default async function ProposalReviewPage({ params }: Props) {
  const { id } = await params;

  // If demo proposal or preview, render immediate rich workspace
  const reviewData: ProposalReviewData = {
    ...DEMO_REVIEW_DATA,
    proposal: {
      ...DEMO_REVIEW_DATA.proposal,
      id: id || 'demo',
    },
  };

  return (
    <main className="min-h-screen bg-page text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full mt-16">
      <ReviewWorkspace initialData={reviewData} />
    </main>
  );
}
