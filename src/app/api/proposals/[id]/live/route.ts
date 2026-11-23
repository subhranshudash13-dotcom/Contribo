import { NextRequest, NextResponse } from 'next/server';
import {
  createPing,
  getLiveState,
  recordHeartbeat,
  releaseLock,
  requestSectionLock,
  rollbackRevision,
  updatePingStatus,
  updateSectionContent,
} from '@/lib/repositories/proposal-live';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
    }

    const state = await getLiveState(id.trim());
    return NextResponse.json(
      { state },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get proposal live state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const action = body?.action;

    if (!action) {
      return NextResponse.json({ error: 'Missing action field' }, { status: 400 });
    }

    switch (action) {
      case 'heartbeat': {
        const { userId, name, avatar, role, status, activeSection } = body;
        if (!userId || !name || !status) {
          return NextResponse.json(
            { error: 'userId, name, and status are required for heartbeat' },
            { status: 400 }
          );
        }
        const participants = await recordHeartbeat({
          proposalId: id.trim(),
          userId,
          name,
          avatar,
          role,
          status,
          activeSection,
        });
        return NextResponse.json({ ok: true, participants });
      }

      case 'lock': {
        const { sectionId, userId, userName, durationMs } = body;
        if (!sectionId || !userId || !userName) {
          return NextResponse.json(
            { error: 'sectionId, userId, and userName are required for lock' },
            { status: 400 }
          );
        }
        const lockResult = await requestSectionLock({
          proposalId: id.trim(),
          sectionId,
          userId,
          userName,
          durationMs,
        });
        if (!lockResult.ok) {
          return NextResponse.json(lockResult, { status: 409 });
        }
        return NextResponse.json(lockResult);
      }

      case 'release': {
        const { sectionId, userId } = body;
        if (!sectionId || !userId) {
          return NextResponse.json(
            { error: 'sectionId and userId are required to release lock' },
            { status: 400 }
          );
        }
        const releaseResult = await releaseLock({
          proposalId: id.trim(),
          sectionId,
          userId,
        });
        if (!releaseResult.ok) {
          return NextResponse.json(releaseResult, { status: 403 });
        }
        return NextResponse.json(releaseResult);
      }

      case 'patch': {
        const { sectionId, content, authorId, authorName } = body;
        if (!sectionId || content === undefined || !authorId || !authorName) {
          return NextResponse.json(
            { error: 'sectionId, content, authorId, and authorName are required for patch' },
            { status: 400 }
          );
        }
        const patchResult = await updateSectionContent({
          proposalId: id.trim(),
          sectionId,
          content,
          authorId,
          authorName,
        });
        return NextResponse.json(patchResult);
      }

      case 'rollback': {
        const { revisionId, operatorId, operatorName } = body;
        if (!revisionId || !operatorId || !operatorName) {
          return NextResponse.json(
            { error: 'revisionId, operatorId, and operatorName are required for rollback' },
            { status: 400 }
          );
        }
        const rollbackResult = await rollbackRevision({
          proposalId: id.trim(),
          revisionId,
          operatorId,
          operatorName,
        });
        if (!rollbackResult.ok) {
          return NextResponse.json(rollbackResult, { status: 404 });
        }
        return NextResponse.json(rollbackResult);
      }

      case 'ping': {
        const { sectionId, authorId, authorName, authorRole, selectedText, message } = body;
        if (!sectionId || !authorId || !authorName || !message) {
          return NextResponse.json(
            { error: 'sectionId, authorId, authorName, and message are required for ping' },
            { status: 400 }
          );
        }
        const ping = await createPing({
          proposalId: id.trim(),
          sectionId,
          authorId,
          authorName,
          authorRole: authorRole || 'mentor',
          selectedText,
          message,
        });
        return NextResponse.json({ ok: true, ping });
      }

      case 'ping_status': {
        const { pingId, status } = body;
        if (!pingId || !status || !['open', 'resolved', 'dismissed'].includes(status)) {
          return NextResponse.json(
            { error: 'Valid pingId and status (open, resolved, dismissed) required' },
            { status: 400 }
          );
        }
        const statusResult = await updatePingStatus({
          proposalId: id.trim(),
          pingId,
          status,
        });
        if (!statusResult.ok) {
          return NextResponse.json(statusResult, { status: 404 });
        }
        return NextResponse.json(statusResult);
      }

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to handle proposal live action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
