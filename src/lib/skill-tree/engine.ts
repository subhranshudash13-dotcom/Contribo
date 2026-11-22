/**
 * engine.ts
 *
 * Directed Acyclic Graph (DAG) state machine, topological sorter (Kahn's algorithm),
 * cycle detector, and prerequisite evaluation engine for Contributor Skill-Trees.
 */

import {
  SkillTreeGraph,
  SkillNode,
  NodeStatus,
  UserNodeProgress,
} from './types';

/**
 * Validates whether a skill tree represents a valid Directed Acyclic Graph (DAG).
 * Detects cycles using Kahn's algorithm, validates prerequisite references, and checks duplicate IDs.
 */
export function validateSkillTreeGraph(graph: SkillTreeGraph): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!graph || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
    return { valid: false, errors: ['Graph must contain at least one node'] };
  }

  const nodeMap = new Map<string, SkillNode>();
  for (const node of graph.nodes) {
    if (!node.id || typeof node.id !== 'string') {
      errors.push(`Node has missing or invalid id: ${JSON.stringify(node)}`);
      continue;
    }
    if (nodeMap.has(node.id)) {
      errors.push(`Duplicate node id detected: "${node.id}"`);
    }
    nodeMap.set(node.id, node);
  }

  // Validate prerequisite references
  for (const node of graph.nodes) {
    if (!Array.isArray(node.prerequisites)) {
      errors.push(`Node "${node.id}" prerequisites must be an array`);
      continue;
    }
    for (const prereqId of node.prerequisites) {
      if (!nodeMap.has(prereqId)) {
        errors.push(
          `Node "${node.id}" specifies non-existent prerequisite: "${prereqId}"`
        );
      }
      if (prereqId === node.id) {
        errors.push(`Node "${node.id}" cannot depend on itself (self-cycle)`);
      }
    }
  }

  // Cycle detection via Kahn's algorithm
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  }

  // An edge exists from Prereq -> Dependent
  for (const node of graph.nodes) {
    for (const prereqId of node.prerequisites) {
      if (nodeMap.has(prereqId)) {
        adjList.get(prereqId)?.push(node.id);
        inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
      }
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedCount++;

    const neighbors = adjList.get(current) || [];
    for (const neighbor of neighbors) {
      const updatedDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, updatedDeg);
      if (updatedDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (visitedCount < graph.nodes.length) {
    errors.push(
      'Circular dependency (cycle) detected in skill tree prerequisites graph'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Computes topological ordering of nodes in the graph using Kahn's algorithm.
 * Throws an Error if the graph contains a cycle.
 */
export function topologicalSort(graph: SkillTreeGraph): string[] {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  }

  for (const node of graph.nodes) {
    for (const prereqId of node.prerequisites) {
      adjList.get(prereqId)?.push(node.id);
      inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    const neighbors = adjList.get(current) || [];
    for (const neighbor of neighbors) {
      const updatedDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, updatedDeg);
      if (updatedDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (order.length < graph.nodes.length) {
    throw new Error('Graph contains a cycle and cannot be topologically sorted');
  }

  return order;
}

/**
 * Checks whether a specific node is eligible to be unlocked based on mastered prerequisites.
 */
export function canUnlockNode(
  node: SkillNode,
  masteredNodeIds: Set<string>
): boolean {
  if (!node.prerequisites || node.prerequisites.length === 0) {
    return true;
  }
  return node.prerequisites.every((prereqId) => masteredNodeIds.has(prereqId));
}

/**
 * Evaluates the current state (LOCKED, AVAILABLE, MASTERED) for every node in the graph.
 */
export function evaluateNodeStatuses(
  graph: SkillTreeGraph,
  masteredNodeIds: Set<string>
): Record<string, NodeStatus> {
  const statuses: Record<string, NodeStatus> = {};

  for (const node of graph.nodes) {
    if (masteredNodeIds.has(node.id)) {
      statuses[node.id] = 'MASTERED';
    } else if (canUnlockNode(node, masteredNodeIds)) {
      statuses[node.id] = 'AVAILABLE';
    } else {
      statuses[node.id] = 'LOCKED';
    }
  }

  return statuses;
}

/**
 * Aggregates user progress metrics: earned XP, completion percentage, node buckets, and badges.
 */
export function calculateSkillProgress(
  graph: SkillTreeGraph,
  userProgressMap: Record<string, UserNodeProgress>
): {
  earnedXp: number;
  totalXp: number;
  completionPercentage: number;
  completedNodeIds: string[];
  availableNodeIds: string[];
  lockedNodeIds: string[];
  badgeUnlocked: boolean;
} {
  const masteredIds = new Set<string>();

  for (const [id, prog] of Object.entries(userProgressMap || {})) {
    if (prog?.status === 'MASTERED') {
      masteredIds.add(id);
    }
  }

  const statuses = evaluateNodeStatuses(graph, masteredIds);
  let totalXp = 0;
  let earnedXp = 0;

  const completedNodeIds: string[] = [];
  const availableNodeIds: string[] = [];
  const lockedNodeIds: string[] = [];

  for (const node of graph.nodes) {
    totalXp += node.xp || 0;
    const status = statuses[node.id];

    if (status === 'MASTERED') {
      earnedXp += node.xp || 0;
      completedNodeIds.push(node.id);
    } else if (status === 'AVAILABLE') {
      availableNodeIds.push(node.id);
    } else {
      lockedNodeIds.push(node.id);
    }
  }

  const completionPercentage =
    totalXp > 0 ? Math.min(100, Math.round((earnedXp / totalXp) * 100)) : 0;

  // Badge unlocks if completion is at least 75% or all CAPSTONE nodes are mastered
  const capstoneNodes = graph.nodes.filter((n) => n.tier === 'CAPSTONE');
  const allCapstonesDone =
    capstoneNodes.length > 0 &&
    capstoneNodes.every((n) => completedNodeIds.includes(n.id));

  const badgeUnlocked = completionPercentage >= 75 || allCapstonesDone;

  return {
    earnedXp,
    totalXp,
    completionPercentage,
    completedNodeIds,
    availableNodeIds,
    lockedNodeIds,
    badgeUnlocked,
  };
}
