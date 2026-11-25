import { NextResponse } from 'next/server';
import { analyzeProposalGaps } from '@/lib/proposals/gap-analyzer';
import { matchMentorsToProposal } from '@/lib/proposals/mentor-matcher';
import { DRAFT_PROPOSALS } from '@/lib/proposal-studio/data';

export const dynamic = 'force-dynamic';

export interface RadarProposalPayload {
  id: string;
  projectTitle: string;
  orgName: string;
  programName: string;
  sections: Record<string, string>;
}

const DEMO_RADAR_PROPOSAL: RadarProposalPayload = {
  id: 'demo',
  projectTitle: 'Real-Time Event Streaming & Notification Infrastructure for Contribo',
  orgName: 'Async GraphQL & Contribo Core',
  programName: 'Google Summer of Code 2026',
  sections: {
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
  },
};

function resolveProposalForRadar(id: string): RadarProposalPayload | null {
  const trimmed = id.trim();
  if (!trimmed) return null;
  if (trimmed === 'demo') return DEMO_RADAR_PROPOSAL;

  const found = DRAFT_PROPOSALS.find((d) => d.id === trimmed);
  if (found) {
    return {
      id: found.id,
      projectTitle: found.projectTitle,
      orgName: found.orgName,
      programName: found.programName,
      sections: found.sections ?? {},
    };
  }

  return null;
}

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const rawId = resolvedParams?.id ?? '';
    const id = rawId.trim();

    if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid or missing proposal id parameter' },
        { status: 400 }
      );
    }

    const proposal = resolveProposalForRadar(id);
    if (!proposal) {
      return NextResponse.json(
        { error: `Proposal "${id}" not found` },
        { status: 404 }
      );
    }

    const analysis = analyzeProposalGaps(proposal.sections);
    const mentors = matchMentorsToProposal(proposal, { limit: 5 });

    return NextResponse.json(
      {
        proposalId: proposal.id,
        projectTitle: proposal.projectTitle,
        orgName: proposal.orgName,
        programName: proposal.programName,
        analysis,
        mentors,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/proposals/[id]/radar failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const id = (resolvedParams?.id ?? '').trim();

    if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid or missing proposal id parameter' },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Body must be a JSON object' }, { status: 400 });
    }

    const input = body as {
      projectTitle?: string;
      orgName?: string;
      programName?: string;
      sections?: Record<string, string>;
    };

    const base = resolveProposalForRadar(id) ?? DEMO_RADAR_PROPOSAL;
    const merged: RadarProposalPayload = {
      id,
      projectTitle: typeof input.projectTitle === 'string' ? input.projectTitle : base.projectTitle,
      orgName: typeof input.orgName === 'string' ? input.orgName : base.orgName,
      programName: typeof input.programName === 'string' ? input.programName : base.programName,
      sections:
        input.sections && typeof input.sections === 'object' ? input.sections : base.sections,
    };

    const analysis = analyzeProposalGaps(merged.sections);
    const mentors = matchMentorsToProposal(merged, { limit: 5 });

    return NextResponse.json(
      {
        proposalId: merged.id,
        projectTitle: merged.projectTitle,
        orgName: merged.orgName,
        programName: merged.programName,
        analysis,
        mentors,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('POST /api/proposals/[id]/radar failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
