import crypto from 'node:crypto';
import type {
  AnnotationReply,
  AnnotationStatus,
  ProposalAnnotation,
  RecommendationType,
  ReviewerRole,
  ReviewToken,
  ReviewTokenPermission,
  RubricEvaluation,
} from '../proposal-studio/review-types';

// In-memory fallback stores for test and dev environments
const memoryTokens = new Map<string, ReviewToken>();
const memoryAnnotations = new Map<string, ProposalAnnotation[]>();
const memoryRubrics = new Map<string, RubricEvaluation[]>();

/**
 * Calculates weighted proposal score (0-100) and recommendation based on 4-pillar rubric.
 * Weights:
 * - Technical Architecture: 35%
 * - Deliverables & Timeline: 30%
 * - Community Bonding: 20%
 * - Long-Term Impact: 15%
 */
export function calculateRubricScore(rubric: {
  technicalArchitecture: number;
  deliverablesTimeline: number;
  communityBonding: number;
  longTermImpact: number;
}): { weightedScore: number; recommendation: RecommendationType } {
  const tArch = Math.max(1, Math.min(5, rubric.technicalArchitecture));
  const dTime = Math.max(1, Math.min(5, rubric.deliverablesTimeline));
  const cBond = Math.max(1, Math.min(5, rubric.communityBonding));
  const lImpact = Math.max(1, Math.min(5, rubric.longTermImpact));

  const weightedSum = tArch * 0.35 + dTime * 0.30 + cBond * 0.20 + lImpact * 0.15;
  const weightedScore = Math.round((weightedSum / 5) * 100);

  let recommendation: RecommendationType;
  if (weightedScore >= 90) {
    recommendation = 'strong_accept';
  } else if (weightedScore >= 75) {
    recommendation = 'accept';
  } else if (weightedScore >= 55) {
    recommendation = 'needs_revision';
  } else {
    recommendation = 'reject';
  }

  return { weightedScore, recommendation };
}

/**
 * Generates a cryptographically secure review token.
 */
export async function generateReviewToken(params: {
  proposalId: string;
  userId: string;
  expiresInDays?: number;
  permission?: ReviewTokenPermission;
  restrictedEmail?: string;
}): Promise<ReviewToken> {
  const {
    proposalId,
    userId,
    expiresInDays = 14,
    permission = 'can_comment',
    restrictedEmail,
  } = params;

  const rawToken = crypto.randomBytes(20).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 86400000).toISOString();

  const tokenDoc: ReviewToken = {
    token: rawToken,
    proposalId,
    createdBy: userId,
    createdAt: now.toISOString(),
    expiresAt,
    permission,
    restrictedEmail: restrictedEmail?.toLowerCase().trim(),
    revoked: false,
  };

  memoryTokens.set(rawToken, tokenDoc);
  return tokenDoc;
}

/**
 * Verifies a review token.
 */
export async function verifyReviewToken(
  proposalId: string,
  token: string,
  userEmail?: string
): Promise<{ valid: boolean; reason?: string; tokenDoc?: ReviewToken }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Missing review token' };
  }

  const tokenDoc = memoryTokens.get(token);
  if (!tokenDoc) {
    return { valid: false, reason: 'Invalid or unknown review token' };
  }

  if (tokenDoc.proposalId !== proposalId) {
    return { valid: false, reason: 'Token does not match this proposal' };
  }

  if (tokenDoc.revoked) {
    return { valid: false, reason: 'This review link has been revoked by the author' };
  }

  if (new Date(tokenDoc.expiresAt).getTime() <= Date.now()) {
    return { valid: false, reason: 'This review link has expired' };
  }

  if (tokenDoc.restrictedEmail && userEmail) {
    if (tokenDoc.restrictedEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return { valid: false, reason: 'You are not authorized to view this review link' };
    }
  }

  return { valid: true, tokenDoc };
}

/**
 * Revokes an existing review token.
 */
export async function revokeReviewToken(
  proposalId: string,
  token: string,
  userId: string
): Promise<boolean> {
  const tokenDoc = memoryTokens.get(token);
  if (!tokenDoc || tokenDoc.proposalId !== proposalId) {
    return false;
  }
  if (tokenDoc.createdBy !== userId) {
    return false;
  }
  tokenDoc.revoked = true;
  memoryTokens.set(token, tokenDoc);
  return true;
}

/**
 * Adds an inline annotation to a proposal section.
 */
export async function addProposalAnnotation(
  proposalId: string,
  input: {
    sectionId: string;
    authorName: string;
    authorAvatar?: string;
    authorRole: ReviewerRole;
    selectedText?: string;
    startOffset?: number;
    endOffset?: number;
    content: string;
  }
): Promise<ProposalAnnotation> {
  const id = `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const annotation: ProposalAnnotation = {
    id,
    proposalId,
    sectionId: input.sectionId,
    authorName: input.authorName,
    authorAvatar: input.authorAvatar,
    authorRole: input.authorRole,
    selectedText: input.selectedText,
    startOffset: input.startOffset,
    endOffset: input.endOffset,
    content: input.content,
    status: 'open',
    createdAt: new Date().toISOString(),
    replies: [],
  };

  const list = memoryAnnotations.get(proposalId) || [];
  list.push(annotation);
  memoryAnnotations.set(proposalId, list);

  return annotation;
}

/**
 * Adds a reply to an existing annotation.
 */
export async function addAnnotationReply(
  proposalId: string,
  annotationId: string,
  replyInput: { authorName: string; content: string }
): Promise<ProposalAnnotation | null> {
  const list = memoryAnnotations.get(proposalId) || [];
  const target = list.find((a) => a.id === annotationId);
  if (!target) return null;

  const reply: AnnotationReply = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    authorName: replyInput.authorName,
    content: replyInput.content,
    createdAt: new Date().toISOString(),
  };

  target.replies.push(reply);
  memoryAnnotations.set(proposalId, list);
  return target;
}

/**
 * Updates annotation status (open, addressed, resolved).
 */
export async function updateAnnotationStatus(
  proposalId: string,
  annotationId: string,
  status: AnnotationStatus
): Promise<ProposalAnnotation | null> {
  const list = memoryAnnotations.get(proposalId) || [];
  const target = list.find((a) => a.id === annotationId);
  if (!target) return null;

  target.status = status;
  memoryAnnotations.set(proposalId, list);
  return target;
}

/**
 * Retrieves all annotations for a proposal.
 */
export async function getProposalAnnotations(proposalId: string): Promise<ProposalAnnotation[]> {
  return memoryAnnotations.get(proposalId) || [];
}

/**
 * Submits a standardized 4-pillar rubric evaluation.
 */
export async function submitRubricEvaluation(
  proposalId: string,
  input: {
    evaluatorName: string;
    evaluatorRole: ReviewerRole;
    technicalArchitecture: number;
    deliverablesTimeline: number;
    communityBonding: number;
    longTermImpact: number;
    strengths?: string;
    improvements?: string;
  }
): Promise<RubricEvaluation> {
  const { weightedScore, recommendation } = calculateRubricScore({
    technicalArchitecture: input.technicalArchitecture,
    deliverablesTimeline: input.deliverablesTimeline,
    communityBonding: input.communityBonding,
    longTermImpact: input.longTermImpact,
  });

  const evaluation: RubricEvaluation = {
    id: `rub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    proposalId,
    evaluatorName: input.evaluatorName,
    evaluatorRole: input.evaluatorRole,
    technicalArchitecture: input.technicalArchitecture,
    deliverablesTimeline: input.deliverablesTimeline,
    communityBonding: input.communityBonding,
    longTermImpact: input.longTermImpact,
    weightedScore,
    recommendation,
    strengths: input.strengths,
    improvements: input.improvements,
    submittedAt: new Date().toISOString(),
  };

  const list = memoryRubrics.get(proposalId) || [];
  list.push(evaluation);
  memoryRubrics.set(proposalId, list);

  return evaluation;
}

/**
 * Retrieves all rubric evaluations for a proposal.
 */
export async function getProposalRubricEvaluations(
  proposalId: string
): Promise<RubricEvaluation[]> {
  return memoryRubrics.get(proposalId) || [];
}
