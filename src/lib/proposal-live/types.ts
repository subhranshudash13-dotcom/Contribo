export type ParticipantRole = 'contributor' | 'mentor' | 'reviewer' | 'spectator';

export type ParticipantStatus = 'viewing' | 'typing' | 'commenting' | 'idle';

export interface ParticipantPresence {
  userId: string;
  name: string;
  avatar?: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  activeSection?: string;
  lastHeartbeat: string;
  color: string;
}

export interface SectionLock {
  sectionId: string;
  proposalId: string;
  lockedBy: string;
  lockedByName: string;
  lockedAt: string;
  expiresAt: string;
  leaseDurationMs: number;
}

export interface ProposalRevisionSnapshot {
  revisionId: string;
  proposalId: string;
  sectionId: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  charDelta: number;
  summary: string;
}

export interface ReviewerFeedbackPing {
  id: string;
  proposalId: string;
  sectionId: string;
  authorId: string;
  authorName: string;
  authorRole: ParticipantRole;
  selectedText?: string;
  message: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface LiveCollabState {
  proposalId: string;
  projectTitle: string;
  orgName: string;
  programName: string;
  sections: Record<string, string>;
  participants: ParticipantPresence[];
  locks: Record<string, SectionLock>;
  revisions: ProposalRevisionSnapshot[];
  pings: ReviewerFeedbackPing[];
}
