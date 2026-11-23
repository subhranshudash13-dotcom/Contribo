import type {
  ParticipantPresence,
  ParticipantRole,
  ParticipantStatus,
  ProposalRevisionSnapshot,
  ReviewerFeedbackPing,
  SectionLock,
} from './types';

export const DEFAULT_HEARTBEAT_TIMEOUT_MS = 15000; // 15s timeout
export const DEFAULT_LOCK_DURATION_MS = 30000; // 30s lock duration

const PRESENCE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
];

export function getParticipantColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PRESENCE_COLORS.length;
  return PRESENCE_COLORS[index];
}

export function updatePresenceList(
  current: ParticipantPresence[],
  update: {
    userId: string;
    name: string;
    avatar?: string;
    role?: ParticipantRole;
    status: ParticipantStatus;
    activeSection?: string;
  },
  nowMs: number = Date.now(),
  timeoutMs: number = DEFAULT_HEARTBEAT_TIMEOUT_MS
): ParticipantPresence[] {
  const cutoff = nowMs - timeoutMs;
  const filtered = current.filter((p) => {
    const last = Date.parse(p.lastHeartbeat);
    return !Number.isNaN(last) && last >= cutoff && p.userId !== update.userId;
  });

  const existing = current.find((p) => p.userId === update.userId);
  const color = existing?.color || getParticipantColor(update.userId);
  const role = update.role || existing?.role || 'contributor';

  const updated: ParticipantPresence = {
    userId: update.userId,
    name: update.name,
    avatar: update.avatar || existing?.avatar,
    role,
    status: update.status,
    activeSection: update.activeSection,
    lastHeartbeat: new Date(nowMs).toISOString(),
    color,
  };

  return [...filtered, updated];
}

export function isSectionLocked(
  lock: SectionLock | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!lock) return false;
  const expiresAt = Date.parse(lock.expiresAt);
  return !Number.isNaN(expiresAt) && expiresAt > nowMs;
}

export function acquireSectionLock(
  locks: Record<string, SectionLock>,
  params: {
    proposalId: string;
    sectionId: string;
    userId: string;
    userName: string;
  },
  nowMs: number = Date.now(),
  durationMs: number = DEFAULT_LOCK_DURATION_MS
): { ok: true; lock: SectionLock } | { ok: false; error: string; activeLock: SectionLock } {
  const activeLock = locks[params.sectionId];
  if (isSectionLocked(activeLock, nowMs) && activeLock.lockedBy !== params.userId) {
    return {
      ok: false,
      error: `Section is currently locked by ${activeLock.lockedByName}`,
      activeLock,
    };
  }

  const newLock: SectionLock = {
    sectionId: params.sectionId,
    proposalId: params.proposalId,
    lockedBy: params.userId,
    lockedByName: params.userName,
    lockedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(nowMs + durationMs).toISOString(),
    leaseDurationMs: durationMs,
  };

  return { ok: true, lock: newLock };
}

export function releaseSectionLock(
  locks: Record<string, SectionLock>,
  sectionId: string,
  userId: string,
  nowMs: number = Date.now()
): { ok: boolean; error?: string } {
  const activeLock = locks[sectionId];
  if (!activeLock) {
    return { ok: true };
  }

  // Allow release if expired or if current user is lock owner
  if (!isSectionLocked(activeLock, nowMs) || activeLock.lockedBy === userId) {
    delete locks[sectionId];
    return { ok: true };
  }

  return {
    ok: false,
    error: `Cannot release section locked by ${activeLock.lockedByName}`,
  };
}

export function applySectionPatch(
  sections: Record<string, string>,
  revisions: ProposalRevisionSnapshot[],
  params: {
    proposalId: string;
    sectionId: string;
    content: string;
    authorId: string;
    authorName: string;
  },
  nowMs: number = Date.now()
): { revision: ProposalRevisionSnapshot; delta: number } {
  const previousContent = sections[params.sectionId] || '';
  const newContent = params.content;
  const delta = newContent.length - previousContent.length;

  const sign = delta > 0 ? `+${delta}` : `${delta}`;
  const summary = `${sign} chars (${newContent.split(/\s+/).filter(Boolean).length} words)`;

  const revision: ProposalRevisionSnapshot = {
    revisionId: `rev_${params.sectionId}_${nowMs}_${Math.random().toString(36).substring(2, 7)}`,
    proposalId: params.proposalId,
    sectionId: params.sectionId,
    content: newContent,
    authorId: params.authorId,
    authorName: params.authorName,
    timestamp: new Date(nowMs).toISOString(),
    charDelta: delta,
    summary,
  };

  sections[params.sectionId] = newContent;
  revisions.unshift(revision);
  if (revisions.length > 50) {
    revisions.length = 50;
  }

  return { revision, delta };
}

export function rollbackSectionRevision(
  sections: Record<string, string>,
  revisions: ProposalRevisionSnapshot[],
  revisionId: string,
  operatorId: string,
  operatorName: string,
  nowMs: number = Date.now()
): { ok: true; restoredRevision: ProposalRevisionSnapshot } | { ok: false; error: string } {
  const targetSnapshot = revisions.find((r) => r.revisionId === revisionId);
  if (!targetSnapshot) {
    return { ok: false, error: `Revision ${revisionId} not found` };
  }

  const { revision } = applySectionPatch(
    sections,
    revisions,
    {
      proposalId: targetSnapshot.proposalId,
      sectionId: targetSnapshot.sectionId,
      content: targetSnapshot.content,
      authorId: operatorId,
      authorName: operatorName,
    },
    nowMs
  );

  revision.summary = `Rolled back to revision ${revisionId.slice(0, 10)}`;
  return { ok: true, restoredRevision: revision };
}

export function addFeedbackPing(
  pings: ReviewerFeedbackPing[],
  params: {
    proposalId: string;
    sectionId: string;
    authorId: string;
    authorName: string;
    authorRole: ParticipantRole;
    selectedText?: string;
    message: string;
  },
  nowMs: number = Date.now()
): ReviewerFeedbackPing {
  const ping: ReviewerFeedbackPing = {
    id: `ping_${params.sectionId}_${nowMs}_${Math.random().toString(36).substring(2, 6)}`,
    proposalId: params.proposalId,
    sectionId: params.sectionId,
    authorId: params.authorId,
    authorName: params.authorName,
    authorRole: params.authorRole,
    selectedText: params.selectedText,
    message: params.message.trim(),
    status: 'open',
    createdAt: new Date(nowMs).toISOString(),
  };

  pings.unshift(ping);
  return ping;
}

export function updateFeedbackPingStatus(
  pings: ReviewerFeedbackPing[],
  pingId: string,
  status: 'open' | 'resolved' | 'dismissed'
): { ok: true; ping: ReviewerFeedbackPing } | { ok: false; error: string } {
  const ping = pings.find((p) => p.id === pingId);
  if (!ping) {
    return { ok: false, error: `Feedback ping ${pingId} not found` };
  }

  ping.status = status;
  return { ok: true, ping };
}
