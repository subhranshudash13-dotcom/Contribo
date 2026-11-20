import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getProposalById } from '@/lib/repositories/proposals';
import {
  getProposalAnnotations,
  getProposalRubricEvaluations,
  verifyReviewToken,
} from '@/lib/repositories/proposal-reviews';
import type {
  ProposalAnnotation,
  ProposalReviewData,
  ReviewTokenPermission,
  RubricEvaluation,
} from '@/lib/proposal-studio/review-types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const DEMO_PROPOSAL = {
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
  status: 'in_review' as const,
};

const DEMO_ANNOTATIONS: ProposalAnnotation[] = [
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
];

const DEMO_RUBRIC: RubricEvaluation[] = [
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
];

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const token = request.nextUrl.searchParams.get('token');
    const session = await auth();

    // Demo proposal mode for immediate preview and testing
    if (id === 'demo') {
      const data: ProposalReviewData = {
        proposal: DEMO_PROPOSAL,
        annotations: DEMO_ANNOTATIONS,
        rubricEvaluations: DEMO_RUBRIC,
        averageRubricScore: 91,
        userPermission: 'can_score',
        isOwner: true,
      };
      return NextResponse.json({ reviewData: data });
    }

    let isOwner = false;
    let userPermission: ReviewTokenPermission = 'read_only';
    let ownerUserId = '';

    // Verify token or session
    if (token) {
      const tokenVerification = await verifyReviewToken(id, token, session?.user?.email || undefined);
      if (!tokenVerification.valid) {
        return NextResponse.json(
          { error: tokenVerification.reason || 'Invalid review token' },
          { status: 403 }
        );
      }
      userPermission = tokenVerification.tokenDoc?.permission || 'can_comment';
      ownerUserId = tokenVerification.tokenDoc?.createdBy || '';
    } else if (session?.user?.id) {
      // Authenticated user checking their own proposal
      ownerUserId = session.user.id;
      const proposal = await getProposalById(id, ownerUserId);
      if (proposal) {
        isOwner = true;
        userPermission = 'can_score';
      } else {
        return NextResponse.json(
          { error: 'Review token is required to view this proposal' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Review token or authentication required' },
        { status: 401 }
      );
    }

    // Fetch proposal details
    const proposalDoc = await getProposalById(id, ownerUserId);
    if (!proposalDoc) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const annotations = await getProposalAnnotations(id);
    const rubricEvaluations = await getProposalRubricEvaluations(id);

    const averageRubricScore =
      rubricEvaluations.length > 0
        ? Math.round(
            rubricEvaluations.reduce((sum, r) => sum + r.weightedScore, 0) / rubricEvaluations.length
          )
        : undefined;

    const reviewData: ProposalReviewData = {
      proposal: {
        id: proposalDoc.id || id,
        projectTitle: proposalDoc.projectTitle || 'Proposal Draft',
        orgName: proposalDoc.orgName || 'Open Source Project',
        programName: proposalDoc.programName || 'Open Source Mentorship',
        year: 2026,
        sections: proposalDoc.sections || {},
        status: 'in_review',
      },
      annotations,
      rubricEvaluations,
      averageRubricScore,
      userPermission,
      isOwner,
    };

    return NextResponse.json({ reviewData });
  } catch (error) {
    console.error('Failed to get proposal review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
