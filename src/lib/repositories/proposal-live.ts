import {
  DEFAULT_HEARTBEAT_TIMEOUT_MS,
  DEFAULT_LOCK_DURATION_MS,
  acquireSectionLock,
  addFeedbackPing,
  applySectionPatch,
  releaseSectionLock,
  rollbackSectionRevision,
  updateFeedbackPingStatus,
  updatePresenceList,
} from '../proposal-live/engine';
import type {
  LiveCollabState,
  ParticipantPresence,
  ParticipantRole,
  ParticipantStatus,
  ProposalRevisionSnapshot,
  ReviewerFeedbackPing,
  SectionLock,
} from '../proposal-live/types';

// In-memory fallback state map for offline testing and dev execution
const memoryCollabStates = new Map<string, LiveCollabState>();

export function getInitialDemoState(proposalId: string): LiveCollabState {
  return {
    proposalId,
    projectTitle: 'Distributed Real-Time Collaboration & Mentor Presence Engine',
    orgName: 'Async GraphQL & Contribo Core',
    programName: 'Google Summer of Code 2026',
    sections: {
      summary:
        'This proposal implements a real-time collaborative editing workspace for open-source applicants and mentors, featuring soft section write-locks, presence radar heartbeats, and inline feedback chips.',
      problemStatement:
        'Currently, contributors and mentors exchange proposal drafts through asynchronous iterations, causing merge conflicts and delayed feedback loops.',
      architecture:
        'The architecture uses a lightweight heartbeat protocol and section-level leases to provide real-time presence indicators and race-free concurrent editing.',
      deliverables:
        '1. Presence Radar component (/proposals/[id]/live)\n2. Section write-lock manager\n3. Reviewer inline feedback tray\n4. Replay timeline and atomic rollback',
      timeline:
        'Weeks 1-2: Community bonding & architecture review\nWeeks 3-6: Presence radar & section lock leases\nWeeks 7-9: Split-pane editor & live markdown preview\nWeeks 10-12: Testing and documentation',
      testing:
        'Unit testing with 100% test coverage for heartbeat timeouts, lock collision, patch broadcast, and rollback mechanisms.',
      risks:
        'Network jitter during collaborative sessions mitigated by local optimistic cache and exponential backoff.',
      aboutMe:
        'Final year undergraduate with proven track record in full-stack open-source projects.',
    },
    participants: [
      {
        userId: 'mentor_sarah',
        name: 'Sarah Chen (Mentor)',
        role: 'mentor',
        status: 'viewing',
        activeSection: 'architecture',
        lastHeartbeat: new Date().toISOString(),
        color: '#10b981',
      },
    ],
    locks: {
      architecture: {
        sectionId: 'architecture',
        proposalId,
        lockedBy: 'mentor_sarah',
        lockedByName: 'Sarah Chen (Mentor)',
        lockedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 25000).toISOString(),
        leaseDurationMs: 30000,
      },
    },
    revisions: [
      {
        revisionId: `rev_init_${proposalId}`,
        proposalId,
        sectionId: 'summary',
        content:
          'This proposal implements a real-time collaborative editing workspace for open-source applicants and mentors, featuring soft section write-locks, presence radar heartbeats, and inline feedback chips.',
        authorId: 'user_initial',
        authorName: 'Proposal Author',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        charDelta: 0,
        summary: 'Initial draft import',
      },
    ],
    pings: [
      {
        id: `ping_init_1`,
        proposalId,
        sectionId: 'architecture',
        authorId: 'mentor_sarah',
        authorName: 'Sarah Chen (Mentor)',
        authorRole: 'mentor',
        selectedText: 'lightweight heartbeat protocol',
        message: 'Ensure heartbeat payload includes client wall-clock timestamp for skew compensation.',
        status: 'open',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  };
}

export function getOrCreateCollabState(proposalId: string): LiveCollabState {
  let state = memoryCollabStates.get(proposalId);
  if (!state) {
    state = getInitialDemoState(proposalId);
    memoryCollabStates.set(proposalId, state);
  }
  return state;
}

export async function getLiveState(proposalId: string, nowMs: number = Date.now()): Promise<LiveCollabState> {
  const state = getOrCreateCollabState(proposalId);
  // Filter stale participants
  const cutoff = nowMs - DEFAULT_HEARTBEAT_TIMEOUT_MS;
  state.participants = state.participants.filter((p) => {
    const last = Date.parse(p.lastHeartbeat);
    return !Number.isNaN(last) && last >= cutoff;
  });

  return { ...state };
}

export async function recordHeartbeat(params: {
  proposalId: string;
  userId: string;
  name: string;
  avatar?: string;
  role?: ParticipantRole;
  status: ParticipantStatus;
  activeSection?: string;
  nowMs?: number;
}): Promise<ParticipantPresence[]> {
  const now = params.nowMs ?? Date.now();
  const state = getOrCreateCollabState(params.proposalId);
  state.participants = updatePresenceList(
    state.participants,
    {
      userId: params.userId,
      name: params.name,
      avatar: params.avatar,
      role: params.role,
      status: params.status,
      activeSection: params.activeSection,
    },
    now
  );
  return state.participants;
}

export async function requestSectionLock(params: {
  proposalId: string;
  sectionId: string;
  userId: string;
  userName: string;
  durationMs?: number;
  nowMs?: number;
}): Promise<{ ok: true; lock: SectionLock } | { ok: false; error: string; activeLock?: SectionLock }> {
  const now = params.nowMs ?? Date.now();
  const duration = params.durationMs ?? DEFAULT_LOCK_DURATION_MS;
  const state = getOrCreateCollabState(params.proposalId);

  const result = acquireSectionLock(
    state.locks,
    {
      proposalId: params.proposalId,
      sectionId: params.sectionId,
      userId: params.userId,
      userName: params.userName,
    },
    now,
    duration
  );

  if (result.ok) {
    state.locks[params.sectionId] = result.lock;
  }
  return result;
}

export async function releaseLock(params: {
  proposalId: string;
  sectionId: string;
  userId: string;
  nowMs?: number;
}): Promise<{ ok: boolean; error?: string }> {
  const now = params.nowMs ?? Date.now();
  const state = getOrCreateCollabState(params.proposalId);
  return releaseSectionLock(state.locks, params.sectionId, params.userId, now);
}

export async function updateSectionContent(params: {
  proposalId: string;
  sectionId: string;
  content: string;
  authorId: string;
  authorName: string;
  nowMs?: number;
}): Promise<{ revision: ProposalRevisionSnapshot; delta: number }> {
  const now = params.nowMs ?? Date.now();
  const state = getOrCreateCollabState(params.proposalId);

  return applySectionPatch(
    state.sections,
    state.revisions,
    {
      proposalId: params.proposalId,
      sectionId: params.sectionId,
      content: params.content,
      authorId: params.authorId,
      authorName: params.authorName,
    },
    now
  );
}

export async function rollbackRevision(params: {
  proposalId: string;
  revisionId: string;
  operatorId: string;
  operatorName: string;
  nowMs?: number;
}): Promise<{ ok: true; restoredRevision: ProposalRevisionSnapshot } | { ok: false; error: string }> {
  const now = params.nowMs ?? Date.now();
  const state = getOrCreateCollabState(params.proposalId);

  return rollbackSectionRevision(
    state.sections,
    state.revisions,
    params.revisionId,
    params.operatorId,
    params.operatorName,
    now
  );
}

export async function createPing(params: {
  proposalId: string;
  sectionId: string;
  authorId: string;
  authorName: string;
  authorRole: ParticipantRole;
  selectedText?: string;
  message: string;
  nowMs?: number;
}): Promise<ReviewerFeedbackPing> {
  const now = params.nowMs ?? Date.now();
  const state = getOrCreateCollabState(params.proposalId);

  return addFeedbackPing(state.pings, params, now);
}

export async function updatePingStatus(params: {
  proposalId: string;
  pingId: string;
  status: 'open' | 'resolved' | 'dismissed';
}): Promise<{ ok: true; ping: ReviewerFeedbackPing } | { ok: false; error: string }> {
  const state = getOrCreateCollabState(params.proposalId);
  return updateFeedbackPingStatus(state.pings, params.pingId, params.status);
}

// Reset helper for isolated unit tests
export function _resetMemoryCollabState(): void {
  memoryCollabStates.clear();
}
