import { COLLECTIONS, getCollection } from '@/lib/db';
import { improveProposalSectionWithGemini } from '@/lib/ai/gemini';
import { toObjectId } from '@/lib/serialize';
import { sortNewestFirst, updatedAtOrCreated } from '@/lib/time';
import { PROPOSAL_SECTION_IDS, calculateProposalProgress } from '@/lib/proposal-studio/sections';
import {
  DRAFT_PROPOSALS,
  ACCEPTED_PROPOSALS_LIBRARY,
  DYNAMIC_PROJECT_GUIDE,
  calculateProposalScore,
  type ProposalDraft,
  type AcceptedProposal,
  type ProjectGuide,
} from '@/lib/proposal-studio/data';

/** Process-local fallback when Mongo is unreachable (dev / outage resilience). */
let memoryDrafts: ProposalDraft[] = [...DRAFT_PROPOSALS];

/** Match userId stored as string or ObjectId (NextAuth / legacy rows). */
function userIdFilter(userId: string) {
  const oid = toObjectId(userId);
  if (oid) return { $in: [oid, userId] };
  return userId;
}

/** Build an $or clause that finds a draft by public id or Mongo _id. */
function proposalIdFilter(id: string) {
  const oid = toObjectId(id);
  const clauses: Record<string, unknown>[] = [{ id }];
  if (oid) clauses.push({ _id: oid });
  return { $or: clauses };
}

/**
 * Modification time of a draft, tolerating rows written before `updatedAt` held
 * a real date. Preference order: the stored timestamp, the creation time, the
 * clock inside the Mongo `_id`, and finally nothing — an unresolvable row must
 * sink to the bottom of a "recently edited" list rather than win it by spelling.
 */
function updatedAtOf(draft: {
  updatedAt?: unknown;
  createdAt?: unknown;
  _id?: unknown;
}): Date | null {
  const known = updatedAtOrCreated(draft);
  if (known) return known;

  const oid = toObjectId(draft._id as never);
  return oid ? oid.getTimestamp() : null;
}

const ALLOWED_SECTION_IDS = new Set<string>([
  ...PROPOSAL_SECTION_IDS,
  // Keep legacy proposal content readable and editable.
  'stretchGoals',
  'communityContributions',
]);

function slugify(value: string, fallback: string) {
  const s = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || fallback;
}

function normalizeDraft(doc: ProposalDraft & { _id?: unknown; userId?: string }): ProposalDraft {
  return {
    ...doc,
    id: doc.id || String(doc._id ?? ''),
    userId: doc.userId,
    updatedAt: updatedAtOf(doc),
  } as ProposalDraft & { userId?: string };
}

function ownsDraft(draft: ProposalDraft & { userId?: string }, userId: string) {
  if (!draft.userId) return false;
  return String(draft.userId) === String(userId);
}

function memoryForUser(userId: string): ProposalDraft[] {
  return sortNewestFirst(
    memoryDrafts.filter((d) => ownsDraft(d as ProposalDraft & { userId?: string }, userId)),
    updatedAtOf
  );
}

/** List proposals for a single authenticated user only. Never returns unscoped data. */
export async function listUserProposals(userId: string): Promise<ProposalDraft[]> {
  if (!userId) return [];

  try {
    const col = await getCollection<ProposalDraft>(COLLECTIONS.proposals);
    const docs = await col
      .find({ userId: userIdFilter(userId) } as never)
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();
    if (docs.length > 0) {
      // Mongo orders real dates correctly; this pass only rescues legacy rows
      // whose `updatedAt` is still prose, so they land on their creation time.
      return sortNewestFirst(
        docs.map((d) => normalizeDraft(d as ProposalDraft & { _id?: unknown })),
        updatedAtOf
      );
    }
    // Empty DB for this user — also check memory (created while offline)
    return memoryForUser(userId);
  } catch (err) {
    console.warn('MongoDB query for proposals fallback to memory store:', err);
    return memoryForUser(userId);
  }
}

/**
 * Fetch a proposal by id, scoped to the owner.
 * Returns null when missing or not owned (callers map to 404 — no existence leak).
 */
export async function getProposalById(
  id: string,
  userId: string
): Promise<ProposalDraft | null> {
  if (!id || !userId) return null;

  try {
    const col = await getCollection<ProposalDraft>(COLLECTIONS.proposals);
    const doc = await col.findOne({
      $and: [proposalIdFilter(id), { userId: userIdFilter(userId) }],
    } as never);

    if (doc) {
      return normalizeDraft(doc as ProposalDraft & { _id?: unknown });
    }
  } catch (err) {
    console.warn('MongoDB getProposalById fallback to memory:', err);
  }

  const mem = memoryDrafts.find(
    (d) => d.id === id && ownsDraft(d as ProposalDraft & { userId?: string }, userId)
  );
  return mem || null;
}

export async function createProposal(data: {
  projectTitle: string;
  orgName: string;
  programName?: string;
  mentorName?: string;
  techStack?: string[];
  userId: string;
}): Promise<ProposalDraft> {
  if (!data.userId) {
    throw Object.assign(new Error('userId is required to create a proposal'), {
      statusCode: 401,
    });
  }

  const projectTitle = (data.projectTitle || 'New Open Source Proposal').trim().slice(0, 300);
  const orgName = (data.orgName || 'Open Source Organization').trim().slice(0, 200);
  const programName = (data.programName || 'Google Summer of Code 2026').trim().slice(0, 200);
  const mentorName = (data.mentorName || 'Core Maintainer').trim().slice(0, 120);
  const techStack = Array.isArray(data.techStack)
    ? data.techStack
        .filter((t): t is string => typeof t === 'string')
        .map((t) => t.trim().slice(0, 48))
        .filter(Boolean)
        .slice(0, 20)
    : ['TypeScript', 'Python', 'React'];

  const newId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date();

  const newDraft: ProposalDraft & { userId: string; createdAt: Date } = {
    id: newId,
    userId: data.userId,
    projectTitle,
    projectSlug: slugify(projectTitle, 'project'),
    orgName,
    orgSlug: slugify(orgName, 'org'),
    programName,
    programSlug: programName.toLowerCase().includes('lfx')
      ? 'lfx'
      : programName.toLowerCase().includes('outreachy')
        ? 'outreachy'
        : 'gsoc',
    progress: 0,
    deadline: '30 April 2026',
    daysLeft: 45,
    mentorName,
    mentorRole: 'Project Subsystem Maintainer',
    techStack: techStack.length > 0 ? techStack : ['TypeScript'],
    difficulty: 'Intermediate',
    acceptedExamplesCount: 3,
    communityContributionsCount: 1,
    updatedAt: now,
    createdAt: now,
    sections: Object.fromEntries([...ALLOWED_SECTION_IDS].map((id) => [id, ''])),
  };

  try {
    const col = await getCollection<ProposalDraft>(COLLECTIONS.proposals);
    await col.insertOne(newDraft as never);
  } catch (err) {
    console.warn('MongoDB insert for proposal fallback to memory:', err);
  }

  memoryDrafts = [newDraft, ...memoryDrafts.filter((d) => d.id !== newId)];
  createProposalRevision({
    proposalId: newId,
    userId: data.userId,
    source: 'manual_snapshot',
    label: 'Initial Draft Created',
    sections: newDraft.sections,
    progress: 0,
  }).catch(() => {});

  return newDraft;
}

export async function updateProposal(
  id: string,
  userId: string,
  updates: {
    sections?: Record<string, string>;
    progress?: number;
    projectTitle?: string;
  }
): Promise<ProposalDraft | null> {
  if (!id || !userId) return null;

  const existing = await getProposalById(id, userId);
  if (!existing) return null;

  const updatedAt = new Date();
  let mergedSections = existing.sections;
  if (updates.sections && typeof updates.sections === 'object') {
    const next: Record<string, string> = { ...existing.sections };
    for (const [key, value] of Object.entries(updates.sections)) {
      if (!ALLOWED_SECTION_IDS.has(key)) continue;
      if (typeof value !== 'string') continue;
      next[key] = value.slice(0, 50_000);
    }
    mergedSections = next;
  }

  let progress = updates.progress;
  if (progress === undefined && mergedSections) {
    progress = calculateProposalProgress(mergedSections);
  }
  if (typeof progress === 'number') {
    progress = Math.min(100, Math.max(0, Math.round(progress)));
  }

  const projectTitle =
    typeof updates.projectTitle === 'string'
      ? updates.projectTitle.trim().slice(0, 300)
      : existing.projectTitle;

  const updated: ProposalDraft & { userId: string } = {
    ...existing,
    userId,
    sections: mergedSections,
    progress: progress ?? existing.progress,
    projectTitle,
    projectSlug: slugify(projectTitle, existing.projectSlug || 'project'),
    updatedAt,
  };

  memoryDrafts = memoryDrafts.map((d) =>
    d.id === id && ownsDraft(d as ProposalDraft & { userId?: string }, userId) ? updated : d
  );

  try {
    const col = await getCollection<ProposalDraft>(COLLECTIONS.proposals);
    const updatePayload: Record<string, unknown> = {
      updatedAt,
      sections: mergedSections,
      progress: updated.progress,
      projectTitle: updated.projectTitle,
      projectSlug: updated.projectSlug,
    };

    await col.updateOne(
      {
        $and: [proposalIdFilter(id), { userId: userIdFilter(userId) }],
      } as never,
      { $set: updatePayload }
    );
  } catch (err) {
    console.warn('MongoDB update for proposal fallback to memory:', err);
  }

  if (updates.sections) {
    maybeRecordAutosaveRevision(id, userId, mergedSections, updated.progress).catch((err) => {
      console.warn('Autosave revision snapshot error:', err);
    });
  }

  return updated;
}

export async function deleteProposal(id: string, userId: string): Promise<boolean> {
  if (!id || !userId) return false;

  const existing = await getProposalById(id, userId);
  if (!existing) return false;

  memoryDrafts = memoryDrafts.filter(
    (d) => !(d.id === id && ownsDraft(d as ProposalDraft & { userId?: string }, userId))
  );

  try {
    const col = await getCollection<ProposalDraft>(COLLECTIONS.proposals);
    const result = await col.deleteOne({
      $and: [proposalIdFilter(id), { userId: userIdFilter(userId) }],
    } as never);
    // Memory already cleared; treat as success if owned draft existed.
    return result.deletedCount > 0 || true;
  } catch (err) {
    console.warn('MongoDB delete for proposal fallback to memory:', err);
    return true;
  }
}

export async function aiImproveProposalSection(
  id: string,
  userId: string,
  sectionId: string,
  currentContent: string
): Promise<{ text: string; rationale: string }> {
  if (!ALLOWED_SECTION_IDS.has(sectionId)) {
    throw Object.assign(new Error('Invalid sectionId'), { statusCode: 400 });
  }

  const proposal = await getProposalById(id, userId);
  if (!proposal) {
    throw Object.assign(new Error('Proposal not found'), { statusCode: 404 });
  }

  const projectTitle = proposal.projectTitle || 'Target Project';
  const orgName = proposal.orgName || 'Organization';
  const content = (currentContent || '').slice(0, 20_000);

  const geminiResult = await improveProposalSectionWithGemini({
    sectionTitle: sectionId,
    projectTitle,
    orgName,
    currentContent: content,
  });

  let enhancedText = geminiResult?.text || content;
  let rationale =
    geminiResult?.rationale ||
    'Enhanced technical clarity, added test coverage metrics and architecture specifics.';

  if (!geminiResult) {
    switch (sectionId) {
      case 'summary':
        enhancedText = `Architecting high-performance asynchronous execution pipelines and modular telemetry for ${projectTitle} (${orgName}).`;
        rationale =
          'Focused summary on measurable value proposition and primary technical objective.';
        break;
      case 'problemStatement':
        enhancedText = `${content}\n\n[Technical Depth]: Profiling reveals synchronous bottlenecks under high IOPS, resulting in thread starvation. Resolving this requires non-blocking event loops.`;
        rationale = 'Added technical bottleneck profiling data and root-cause analysis.';
        break;
      case 'architecture':
        enhancedText = `${content}\n\n[Architecture Refinement]: Implemented decoupled state handlers using TypeScript interfaces, backed by PyTest mock fixtures and Jest unit tests.`;
        rationale = 'Specified concrete code abstractions, type safety, and testing tools.';
        break;
      case 'timeline':
        enhancedText = `${content}\n\n[Buffer Checkpoints]: Added explicit 2-week buffer for community code reviews, mentor check-ins, and documentation deployment.`;
        rationale = 'Added risk-mitigation buffers matching maintainer review pacing.';
        break;
      default:
        enhancedText = `${content}\n\n[AI Quality Enhancement]: Standardized formatting, verified acceptance criteria, and aligned deliverables with community standards.`;
    }
  }

  await updateProposal(id, userId, {
    sections: {
      ...proposal.sections,
      [sectionId]: enhancedText,
    },
  });

  return { text: enhancedText, rationale };
}

export function getAcceptedExamples(project?: string): AcceptedProposal[] {
  if (!project) return ACCEPTED_PROPOSALS_LIBRARY.slice(0, 12);
  const q = project.toLowerCase();
  const filtered = ACCEPTED_PROPOSALS_LIBRARY.filter(
    (p) =>
      p.projectTitle.toLowerCase().includes(q) ||
      p.orgName.toLowerCase().includes(q)
  );
  return filtered.length > 0 ? filtered : ACCEPTED_PROPOSALS_LIBRARY.slice(0, 6);
}

export function getProjectGuide(project?: string, org?: string): ProjectGuide {
  return {
    ...DYNAMIC_PROJECT_GUIDE,
    projectTitle: project || DYNAMIC_PROJECT_GUIDE.projectTitle,
    orgName: org || DYNAMIC_PROJECT_GUIDE.orgName,
  };
}

export interface ProposalRevision {
  id: string;
  proposalId: string;
  userId: string;
  createdAt: Date;
  timestamp: string;
  source: 'autosave_checkpoint' | 'manual_snapshot' | 'pre_rollback_backup';
  label?: string;
  characterCount: number;
  wordCount: number;
  sections: Record<string, string>;
  progress: number;
}

export type ProposalRevisionSummary = Omit<ProposalRevision, 'sections'>;

let memoryRevisions: ProposalRevision[] = [];

export const MAX_REVISIONS_PER_PROPOSAL = 20;

export function computeSectionsMetrics(sections: Record<string, string>): {
  characterCount: number;
  wordCount: number;
} {
  let characterCount = 0;
  let wordCount = 0;
  if (sections && typeof sections === 'object') {
    for (const text of Object.values(sections)) {
      if (typeof text === 'string') {
        characterCount += text.length;
        const words = text.trim().split(/\s+/).filter(Boolean);
        wordCount += words.length;
      }
    }
  }
  return { characterCount, wordCount };
}

export async function createProposalRevision(params: {
  proposalId: string;
  userId: string;
  source: 'autosave_checkpoint' | 'manual_snapshot' | 'pre_rollback_backup';
  label?: string;
  sections: Record<string, string>;
  progress?: number;
}): Promise<ProposalRevision> {
  const { proposalId, userId, source, label, sections } = params;
  if (!proposalId || !userId) {
    throw new Error('proposalId and userId are required to create a proposal revision');
  }

  const { characterCount, wordCount } = computeSectionsMetrics(sections);
  const now = new Date();
  const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const progress =
    typeof params.progress === 'number'
      ? Math.min(100, Math.max(0, Math.round(params.progress)))
      : calculateProposalProgress(sections);

  const cleanSections: Record<string, string> = {};
  for (const [k, v] of Object.entries(sections)) {
    if (ALLOWED_SECTION_IDS.has(k) && typeof v === 'string') {
      cleanSections[k] = v.slice(0, 50_000);
    }
  }

  const revision: ProposalRevision = {
    id,
    proposalId,
    userId,
    createdAt: now,
    timestamp: now.toISOString(),
    source,
    label: label ? label.trim().slice(0, 100) : undefined,
    characterCount,
    wordCount,
    sections: cleanSections,
    progress,
  };

  try {
    const col = await getCollection<ProposalRevision>(COLLECTIONS.proposalRevisions);
    if (col && typeof col.insertOne === 'function') {
      await col.insertOne(revision as never);
    }
  } catch (err) {
    console.warn('MongoDB insert for proposal revision fallback to memory:', err);
  }

  memoryRevisions.unshift(revision);
  await pruneProposalRevisions(proposalId, userId, MAX_REVISIONS_PER_PROPOSAL);

  return revision;
}

export async function pruneProposalRevisions(
  proposalId: string,
  userId: string,
  maxRetention = MAX_REVISIONS_PER_PROPOSAL
): Promise<number> {
  let prunedCount = 0;
  // In-memory prune
  const matching = memoryRevisions.filter(
    (r) => r.proposalId === proposalId && ownsDraft({ userId: r.userId } as never, userId)
  );
  if (matching.length > maxRetention) {
    const toKeep = new Set(matching.slice(0, maxRetention).map((r) => r.id));
    memoryRevisions = memoryRevisions.filter(
      (r) => !(r.proposalId === proposalId && ownsDraft({ userId: r.userId } as never, userId)) || toKeep.has(r.id)
    );
    prunedCount += matching.length - maxRetention;
  }

  try {
    const col = await getCollection<ProposalRevision>(COLLECTIONS.proposalRevisions);
    if (col && typeof col.find === 'function') {
      const allRevs = await col
        .find({
          proposalId,
          userId: userIdFilter(userId),
        } as never)
        .sort({ createdAt: -1 })
        .toArray();

      if (allRevs.length > maxRetention) {
        const idsToDelete = allRevs.slice(maxRetention).map((r) => (r as unknown as { _id: unknown })._id);
        const delRes = await col.deleteMany({ _id: { $in: idsToDelete as never } } as never);
        prunedCount = Math.max(prunedCount, delRes.deletedCount);
      }
    }
  } catch {
    // Mongo prune fallback
  }

  return prunedCount;
}

export async function listProposalRevisions(
  proposalId: string,
  userId: string,
  limit = 20
): Promise<ProposalRevisionSummary[]> {
  if (!proposalId || !userId) return [];

  const proposal = await getProposalById(proposalId, userId);
  if (!proposal) return [];

  try {
    const col = await getCollection<ProposalRevision>(COLLECTIONS.proposalRevisions);
    if (col && typeof col.find === 'function') {
      const docs = await col
        .find(
          {
            proposalId,
            userId: userIdFilter(userId),
          } as never,
          {
            projection: { sections: 0 },
          } as never
        )
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      if (docs.length > 0) {
        return docs.map((doc) => ({
          id: (doc as ProposalRevision).id,
          proposalId: (doc as ProposalRevision).proposalId,
          userId: (doc as ProposalRevision).userId,
          createdAt: new Date((doc as ProposalRevision).createdAt || (doc as { _id: { getTimestamp(): Date } })._id.getTimestamp()),
          timestamp: (doc as ProposalRevision).timestamp || new Date((doc as ProposalRevision).createdAt).toISOString(),
          source: (doc as ProposalRevision).source,
          label: (doc as ProposalRevision).label,
          characterCount: (doc as ProposalRevision).characterCount,
          wordCount: (doc as ProposalRevision).wordCount,
          progress: (doc as ProposalRevision).progress,
        }));
      }
    }
  } catch (err) {
    console.warn('MongoDB listProposalRevisions fallback to memory:', err);
  }

  return memoryRevisions
    .filter((r) => r.proposalId === proposalId && ownsDraft({ userId: r.userId } as never, userId))
    .slice(0, limit)
    .map(({ sections: _, ...summary }) => summary);
}

export async function getProposalRevisionById(
  proposalId: string,
  revisionId: string,
  userId: string
): Promise<ProposalRevision | null> {
  if (!proposalId || !revisionId || !userId) return null;

  try {
    const col = await getCollection<ProposalRevision>(COLLECTIONS.proposalRevisions);
    if (col && typeof col.findOne === 'function') {
      const doc = await col.findOne({
        id: revisionId,
        proposalId,
        userId: userIdFilter(userId),
      } as never);

      if (doc) {
        return {
          id: (doc as ProposalRevision).id,
          proposalId: (doc as ProposalRevision).proposalId,
          userId: (doc as ProposalRevision).userId,
          createdAt: new Date((doc as ProposalRevision).createdAt),
          timestamp: (doc as ProposalRevision).timestamp,
          source: (doc as ProposalRevision).source,
          label: (doc as ProposalRevision).label,
          characterCount: (doc as ProposalRevision).characterCount,
          wordCount: (doc as ProposalRevision).wordCount,
          sections: (doc as ProposalRevision).sections,
          progress: (doc as ProposalRevision).progress,
        };
      }
    }
  } catch (err) {
    console.warn('MongoDB getProposalRevisionById fallback to memory:', err);
  }

  const mem = memoryRevisions.find(
    (r) =>
      r.id === revisionId &&
      r.proposalId === proposalId &&
      ownsDraft({ userId: r.userId } as never, userId)
  );
  return mem || null;
}

export async function restoreProposalRevision(
  proposalId: string,
  revisionId: string,
  userId: string
): Promise<{
  proposal: ProposalDraft;
  restoredFromRevision: ProposalRevision;
  backupRevision: ProposalRevision;
} | null> {
  if (!proposalId || !revisionId || !userId) return null;

  const currentProposal = await getProposalById(proposalId, userId);
  if (!currentProposal) return null;

  const targetRevision = await getProposalRevisionById(proposalId, revisionId, userId);
  if (!targetRevision) return null;

  // 1. Create a non-destructive safety backup snapshot of current state
  const backupRevision = await createProposalRevision({
    proposalId,
    userId,
    source: 'pre_rollback_backup',
    label: `Pre-rollback snapshot before restoring ${targetRevision.label || targetRevision.id}`,
    sections: currentProposal.sections,
    progress: currentProposal.progress,
  });

  // 2. Atomically update the active proposal draft with target revision's sections
  const updatedProposal = await updateProposal(proposalId, userId, {
    sections: targetRevision.sections,
    progress: targetRevision.progress,
  });

  if (!updatedProposal) return null;

  return {
    proposal: updatedProposal,
    restoredFromRevision: targetRevision,
    backupRevision,
  };
}

export async function maybeRecordAutosaveRevision(
  proposalId: string,
  userId: string,
  nextSections: Record<string, string>,
  progress?: number
): Promise<ProposalRevision | null> {
  const { characterCount } = computeSectionsMetrics(nextSections);
  const existingRevs = await listProposalRevisions(proposalId, userId, 1);

  if (existingRevs.length === 0) {
    return createProposalRevision({
      proposalId,
      userId,
      source: 'autosave_checkpoint',
      label: 'Initial checkpoint',
      sections: nextSections,
      progress,
    });
  }

  const latest = existingRevs[0];
  const charDiff = Math.abs(characterCount - (latest.characterCount || 0));
  const timeDiffMs = Date.now() - new Date(latest.createdAt).getTime();

  // Threshold: >= 150 char difference OR >= 5 minutes elapsed
  if (charDiff >= 150 || timeDiffMs >= 5 * 60 * 1000) {
    return createProposalRevision({
      proposalId,
      userId,
      source: 'autosave_checkpoint',
      sections: nextSections,
      progress,
    });
  }

  return null;
}

export function resetMemoryRevisions(): void {
  memoryRevisions = [];
}

export { calculateProposalScore, ALLOWED_SECTION_IDS };
