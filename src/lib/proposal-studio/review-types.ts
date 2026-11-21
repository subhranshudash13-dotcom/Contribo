export type ReviewerRole = 'mentor' | 'alumnus' | 'peer';

export type AnnotationStatus = 'open' | 'addressed' | 'resolved';

export interface AnnotationReply {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ProposalAnnotation {
  id: string;
  proposalId: string;
  sectionId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: ReviewerRole;
  selectedText?: string;
  startOffset?: number;
  endOffset?: number;
  content: string;
  status: AnnotationStatus;
  createdAt: string;
  replies: AnnotationReply[];
}

export type RecommendationType =
  | 'strong_accept'
  | 'accept'
  | 'needs_revision'
  | 'reject';

export interface RubricEvaluation {
  id: string;
  proposalId: string;
  evaluatorName: string;
  evaluatorRole: ReviewerRole;
  technicalArchitecture: number; // 1 - 5
  deliverablesTimeline: number;  // 1 - 5
  communityBonding: number;      // 1 - 5
  longTermImpact: number;        // 1 - 5
  weightedScore: number;         // 0 - 100
  recommendation: RecommendationType;
  strengths?: string;
  improvements?: string;
  submittedAt: string;
}

export type ReviewTokenPermission = 'can_comment' | 'can_score' | 'read_only';

export interface ReviewToken {
  token: string;
  proposalId: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  permission: ReviewTokenPermission;
  restrictedEmail?: string;
  revoked: boolean;
}

export interface ProposalReviewData {
  proposal: {
    id: string;
    projectTitle: string;
    orgName: string;
    programName: string;
    year: number;
    sections: Record<string, string>;
    status?: 'draft' | 'in_review' | 'reviewed' | 'final';
  };
  annotations: ProposalAnnotation[];
  rubricEvaluations: RubricEvaluation[];
  averageRubricScore?: number;
  userPermission: ReviewTokenPermission;
  isOwner: boolean;
}
