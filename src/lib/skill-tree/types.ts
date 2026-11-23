/**
 * types.ts
 *
 * Strongly-typed domain models for the Interactive Contributor Skill-Tree
 * and Directed Learning Pathway Engine (Issue #188).
 */

export type SkillTier = 'FOUNDATION' | 'TOOLCHAIN' | 'DOMAIN' | 'CAPSTONE';

export type NodeStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'MASTERED';

export type VerificationType = 'pr_link' | 'quiz' | 'self_attest';

export interface SkillResource {
  title: string;
  url: string;
  type: 'docs' | 'video' | 'exercise';
}

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  tier: SkillTier;
  xp: number;
  estimatedHours: number;
  prerequisites: string[]; // Node IDs that must be MASTERED before this unlocks
  resources: SkillResource[];
  verification: {
    type: VerificationType;
    description: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface SkillEdge {
  from: string;
  to: string;
}

export interface SkillTreeGraph {
  programSlug: string;
  programName: string;
  description: string;
  badgeName: string;
  totalXp: number;
  nodes: SkillNode[];
  edges: SkillEdge[];
}

export interface UserNodeProgress {
  nodeId: string;
  status: NodeStatus;
  completedAt: string | null;
  evidenceUrl: string | null;
}

export interface UserSkillTreeProgress {
  userId: string;
  programSlug: string;
  earnedXp: number;
  totalXp: number;
  completionPercentage: number;
  nodes: Record<string, UserNodeProgress>;
  completedNodeIds: string[];
  availableNodeIds: string[];
  lockedNodeIds: string[];
  badgeUnlocked: boolean;
  updatedAt: string;
}
