/**
 * skill-tree.ts
 *
 * Repository for Program Skill-Trees and Account-Scoped User Progression.
 * Supports MongoDB with in-memory fallback for local development and CI testing.
 */

import { getDb } from '../db';
import {
  SkillTreeGraph,
  UserSkillTreeProgress,
  NodeStatus,
} from '../skill-tree/types';
import {
  calculateSkillProgress,
  canUnlockNode,
} from '../skill-tree/engine';
import { getOrGenerateSkillTree } from '../skill-tree/default-trees';

// In-memory fallback stores
const memorySkillTrees = new Map<string, SkillTreeGraph>();
const memoryUserProgress = new Map<string, UserSkillTreeProgress>();

export function resetSkillTreeMemoryStore(): void {
  memorySkillTrees.clear();
  memoryUserProgress.clear();
}

/**
 * Retrieves the skill tree for a given program slug.
 */
export async function getProgramSkillTree(
  slug: string
): Promise<SkillTreeGraph> {
  const cleanSlug = (slug || 'gsoc').toLowerCase().trim();

  try {
    const db = await getDb();
    if (db) {
      const stored = await db
        .collection('skill_trees')
        .findOne({ programSlug: cleanSlug });
      if (stored) {
        return stored as unknown as SkillTreeGraph;
      }
    }
  } catch {
    // MongoDB unavailable, proceed to in-memory fallback
  }

  if (memorySkillTrees.has(cleanSlug)) {
    return memorySkillTrees.get(cleanSlug)!;
  }

  const generated = getOrGenerateSkillTree(cleanSlug);
  memorySkillTrees.set(cleanSlug, generated);
  return generated;
}

/**
 * Retrieves or initializes authenticated user's progress for a program skill tree.
 */
export async function getUserSkillProgress(
  userId: string,
  programSlug: string
): Promise<UserSkillTreeProgress> {
  const cleanSlug = (programSlug || 'gsoc').toLowerCase().trim();
  const cleanUser = (userId || 'anon').trim();
  const storageKey = `${cleanUser}:${cleanSlug}`;

  const graph = await getProgramSkillTree(cleanSlug);

  try {
    const db = await getDb();
    if (db) {
      const stored = await db
        .collection('user_skill_progress')
        .findOne({ userId: cleanUser, programSlug: cleanSlug });
      if (stored) {
        return stored as unknown as UserSkillTreeProgress;
      }
    }
  } catch {
    // MongoDB unavailable
  }

  if (memoryUserProgress.has(storageKey)) {
    return memoryUserProgress.get(storageKey)!;
  }

  // Initialize empty progress
  const initialMetrics = calculateSkillProgress(graph, {});
  const initialProgress: UserSkillTreeProgress = {
    userId: cleanUser,
    programSlug: cleanSlug,
    earnedXp: initialMetrics.earnedXp,
    totalXp: initialMetrics.totalXp,
    completionPercentage: initialMetrics.completionPercentage,
    nodes: {},
    completedNodeIds: initialMetrics.completedNodeIds,
    availableNodeIds: initialMetrics.availableNodeIds,
    lockedNodeIds: initialMetrics.lockedNodeIds,
    badgeUnlocked: initialMetrics.badgeUnlocked,
    updatedAt: new Date().toISOString(),
  };

  memoryUserProgress.set(storageKey, initialProgress);
  return initialProgress;
}

/**
 * Updates a user's node progress state (e.g. marking a node MASTERED).
 * Strictly guards prerequisites: cannot master a node whose prerequisites are not met!
 */
export async function updateUserNodeProgress(params: {
  userId: string;
  programSlug: string;
  nodeId: string;
  status: NodeStatus;
  evidenceUrl?: string | null;
  now?: Date;
}): Promise<{
  success: boolean;
  error?: string;
  progress?: UserSkillTreeProgress;
  newlyUnlockedBadge?: boolean;
}> {
  const { userId, programSlug, nodeId, status, evidenceUrl } = params;
  const now = params.now || new Date();
  const cleanSlug = (programSlug || 'gsoc').toLowerCase().trim();
  const cleanUser = (userId || 'anon').trim();
  const storageKey = `${cleanUser}:${cleanSlug}`;

  const graph = await getProgramSkillTree(cleanSlug);
  const targetNode = graph.nodes.find((n) => n.id === nodeId);
  if (!targetNode) {
    return { success: false, error: `Node "${nodeId}" not found in skill tree` };
  }

  const current = await getUserSkillProgress(cleanUser, cleanSlug);
  const masteredSet = new Set(current.completedNodeIds);

  // If attempting to master the node, check prerequisites!
  if (status === 'MASTERED') {
    if (!canUnlockNode(targetNode, masteredSet)) {
      return {
        success: false,
        error: `Cannot complete node "${targetNode.title}". Prerequisite skills are not yet mastered.`,
      };
    }
    // Validate evidence if required
    if (targetNode.verification.type === 'pr_link') {
      if (!evidenceUrl || !/^https?:\/\//i.test(evidenceUrl)) {
        return {
          success: false,
          error: 'A valid http(s) pull request or commit URL is required as completion evidence.',
        };
      }
    }
  }

  const updatedNodes = { ...current.nodes };

  updatedNodes[nodeId] = {
    nodeId,
    status,
    completedAt: status === 'MASTERED' ? now.toISOString() : null,
    evidenceUrl: evidenceUrl || null,
  };

  const newMetrics = calculateSkillProgress(graph, updatedNodes);
  const wasBadgeUnlockedBefore = current.badgeUnlocked;

  const updatedProgress: UserSkillTreeProgress = {
    userId: cleanUser,
    programSlug: cleanSlug,
    earnedXp: newMetrics.earnedXp,
    totalXp: newMetrics.totalXp,
    completionPercentage: newMetrics.completionPercentage,
    nodes: updatedNodes,
    completedNodeIds: newMetrics.completedNodeIds,
    availableNodeIds: newMetrics.availableNodeIds,
    lockedNodeIds: newMetrics.lockedNodeIds,
    badgeUnlocked: newMetrics.badgeUnlocked,
    updatedAt: now.toISOString(),
  };

  try {
    const db = await getDb();
    if (db) {
      await db.collection('user_skill_progress').updateOne(
        { userId: cleanUser, programSlug: cleanSlug },
        { $set: updatedProgress },
        { upsert: true }
      );
    }
  } catch {
    // MongoDB unavailable
  }

  memoryUserProgress.set(storageKey, updatedProgress);

  return {
    success: true,
    progress: updatedProgress,
    newlyUnlockedBadge: !wasBadgeUnlockedBefore && newMetrics.badgeUnlocked,
  };
}
