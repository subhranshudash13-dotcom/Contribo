import type { Application, ApplicationStatus, SavedItem, SavedItemType } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDocs, serializeDoc, toObjectId } from '@/lib/serialize';

function userIdFilter(userId: string) {
  const oid = toObjectId(userId);
  if (oid) {
    return { $in: [oid, userId] };
  }
  return userId;
}

// ─── Saved items ────────────────────────────────────────────────────────────

export async function listSavedItems(userId: string, type?: SavedItemType) {
  const collection = await getCollection<SavedItem>(COLLECTIONS.savedItems);
  const filter: Record<string, unknown> = { userId: userIdFilter(userId) };
  if (type) filter.type = type;

  const items = await collection.find(filter).sort({ createdAt: -1 }).toArray();
  return serializeDocs(items as unknown as Record<string, unknown>[]);
}

export async function saveItem(
  userId: string,
  payload: {
    type: SavedItemType;
    targetId: string;
    title: string;
    subtitle?: string;
    slug?: string;
    programSlug?: string;
    techStack?: string[];
  }
) {
  const oid = toObjectId(userId);
  const targetOid = toObjectId(payload.targetId);
  if (!oid || !targetOid) {
    const err = new Error('Invalid user or target id');
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }

  const collection = await getCollection<SavedItem>(COLLECTIONS.savedItems);
  const existing = await collection.findOne({
    userId: userIdFilter(userId),
    type: payload.type,
    targetId: { $in: [targetOid, payload.targetId] },
  } as never);

  if (existing) {
    return serializeDoc(existing as unknown as Record<string, unknown>);
  }

  const doc: SavedItem = {
    userId: oid,
    type: payload.type,
    targetId: targetOid,
    title: payload.title.trim().slice(0, 200),
    subtitle: payload.subtitle?.trim().slice(0, 200),
    slug: payload.slug?.trim(),
    programSlug: payload.programSlug?.trim(),
    techStack: payload.techStack?.slice(0, 20),
    createdAt: new Date(),
  };

  const result = await collection.insertOne(doc as never);
  return serializeDoc({ ...doc, _id: result.insertedId } as unknown as Record<string, unknown>);
}

export async function unsaveItem(userId: string, savedItemId: string) {
  const oid = toObjectId(userId);
  const itemOid = toObjectId(savedItemId);
  if (!oid || !itemOid) return false;

  const collection = await getCollection(COLLECTIONS.savedItems);
  const result = await collection.deleteOne({
    _id: itemOid,
    userId: userIdFilter(userId),
  } as never);

  return result.deletedCount > 0;
}

export async function unsaveByTarget(userId: string, type: SavedItemType, targetId: string) {
  const targetOid = toObjectId(targetId);
  if (!targetOid) return false;

  const collection = await getCollection(COLLECTIONS.savedItems);
  const result = await collection.deleteOne({
    userId: userIdFilter(userId),
    type,
    targetId: { $in: [targetOid, targetId] },
  } as never);

  return result.deletedCount > 0;
}

// ─── Applications ───────────────────────────────────────────────────────────

const VALID_STATUSES: ApplicationStatus[] = [
  'saved',
  'researching',
  'drafting',
  'submitted',
  'accepted',
  'rejected',
  'withdrawn',
];

export function isValidApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as ApplicationStatus);
}

export async function listApplications(userId: string) {
  const collection = await getCollection<Application>(COLLECTIONS.applications);
  const items = await collection
    .find({ userId: userIdFilter(userId) } as never)
    .sort({ updatedAt: -1 })
    .toArray();
  return serializeDocs(items as unknown as Record<string, unknown>[]);
}

export async function findApplicationByProject(userId: string, projectId: string) {
  const projectOid = toObjectId(projectId);
  if (!projectOid && !projectId) return null;

  const collection = await getCollection<Application>(COLLECTIONS.applications);
  const filter: Record<string, unknown> = {
    userId: userIdFilter(userId),
  };
  if (projectOid) {
    filter.projectId = { $in: [projectOid, projectId] };
  } else {
    filter.projectId = projectId;
  }

  const existing = await collection.findOne(filter as never);
  return serializeDoc(existing as unknown as Record<string, unknown> | null);
}

export async function createApplication(
  userId: string,
  payload: {
    projectId?: string;
    projectTitle: string;
    orgName: string;
    orgSlug?: string;
    programId?: string;
    programSlug?: string;
    programName?: string;
    status?: ApplicationStatus;
    notes?: string;
    deadline?: string | null;
  }
): Promise<{ application: Record<string, unknown>; created: boolean }> {
  const oid = toObjectId(userId);
  if (!oid) throw new Error('Invalid user id');

  // Idempotent track: same user + projectId returns existing row
  if (payload.projectId) {
    const existing = await findApplicationByProject(userId, payload.projectId);
    if (existing) {
      return { application: existing as Record<string, unknown>, created: false };
    }
  }

  const now = new Date();
  const status: ApplicationStatus =
    payload.status && isValidApplicationStatus(payload.status) ? payload.status : 'drafting';

  let deadline: Date | null = null;
  if (payload.deadline) {
    const d = new Date(payload.deadline);
    if (!Number.isNaN(d.getTime())) deadline = d;
  }

  const doc: Application = {
    userId: oid,
    projectId: payload.projectId ? toObjectId(payload.projectId) || payload.projectId : undefined,
    projectTitle: payload.projectTitle.trim().slice(0, 300),
    orgName: payload.orgName.trim().slice(0, 200),
    orgSlug: payload.orgSlug?.trim(),
    programId: payload.programId ? toObjectId(payload.programId) || payload.programId : undefined,
    programSlug: payload.programSlug?.trim(),
    programName: payload.programName?.trim(),
    status,
    notes: payload.notes?.trim().slice(0, 5000) || '',
    deadline,
    createdAt: now,
    updatedAt: now,
  };

  const collection = await getCollection<Application>(COLLECTIONS.applications);
  try {
    const result = await collection.insertOne(doc as never);
    return {
      application: serializeDoc({
        ...doc,
        _id: result.insertedId,
      } as unknown as Record<string, unknown>) as Record<string, unknown>,
      created: true,
    };
  } catch (err: unknown) {
    // Race: unique index may exist; re-fetch
    if (payload.projectId && err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      const existing = await findApplicationByProject(userId, payload.projectId);
      if (existing) {
        return { application: existing as Record<string, unknown>, created: false };
      }
    }
    throw err;
  }
}

/**
 * Batch lookup: which of the given project/org ids are saved or tracked by the user.
 */
export async function getUserItemStatus(
  userId: string,
  options: {
    projectIds?: string[];
    organizationIds?: string[];
  }
) {
  const projectIds = (options.projectIds || []).filter(Boolean).slice(0, 100);
  const organizationIds = (options.organizationIds || []).filter(Boolean).slice(0, 100);

  const savedCol = await getCollection(COLLECTIONS.savedItems);
  const appsCol = await getCollection(COLLECTIONS.applications);

  const savedProjectIds = new Set<string>();
  const savedOrganizationIds = new Set<string>();
  const trackedProjectIds = new Set<string>();

  if (projectIds.length > 0 || organizationIds.length > 0) {
    const targetFilters: Record<string, unknown>[] = [];

    if (projectIds.length > 0) {
      const oids = projectIds.map((id) => toObjectId(id)).filter(Boolean);
      targetFilters.push({
        type: 'project',
        targetId: { $in: [...oids, ...projectIds] },
      });
    }
    if (organizationIds.length > 0) {
      const oids = organizationIds.map((id) => toObjectId(id)).filter(Boolean);
      targetFilters.push({
        type: 'organization',
        targetId: { $in: [...oids, ...organizationIds] },
      });
    }

    const saved = await savedCol
      .find({
        userId: userIdFilter(userId),
        $or: targetFilters,
      } as never)
      .toArray();

    for (const item of saved) {
      const tid = String(item.targetId);
      if (item.type === 'project') savedProjectIds.add(tid);
      if (item.type === 'organization') savedOrganizationIds.add(tid);
    }
  }

  if (projectIds.length > 0) {
    const oids = projectIds.map((id) => toObjectId(id)).filter(Boolean);
    const apps = await appsCol
      .find({
        userId: userIdFilter(userId),
        projectId: { $in: [...oids, ...projectIds] },
      } as never)
      .project({ projectId: 1 })
      .toArray();

    for (const app of apps) {
      if (app.projectId != null) trackedProjectIds.add(String(app.projectId));
    }
  }

  return {
    savedProjectIds: Array.from(savedProjectIds),
    savedOrganizationIds: Array.from(savedOrganizationIds),
    trackedProjectIds: Array.from(trackedProjectIds),
  };
}

export async function updateApplication(
  userId: string,
  applicationId: string,
  updates: {
    status?: ApplicationStatus;
    notes?: string;
    deadline?: string | null;
    projectTitle?: string;
  }
) {
  const itemOid = toObjectId(applicationId);
  if (!itemOid) return null;

  const $set: Record<string, unknown> = { updatedAt: new Date() };

  if (updates.status !== undefined) {
    if (!isValidApplicationStatus(updates.status)) {
      throw new Error('Invalid application status');
    }
    $set.status = updates.status;
  }
  if (typeof updates.notes === 'string') {
    $set.notes = updates.notes.trim().slice(0, 5000);
  }
  if (updates.deadline === null) {
    $set.deadline = null;
  } else if (typeof updates.deadline === 'string') {
    const d = new Date(updates.deadline);
    if (!Number.isNaN(d.getTime())) $set.deadline = d;
  }
  if (typeof updates.projectTitle === 'string') {
    $set.projectTitle = updates.projectTitle.trim().slice(0, 300);
  }

  const collection = await getCollection<Application>(COLLECTIONS.applications);
  const result = await collection.findOneAndUpdate(
    { _id: itemOid, userId: userIdFilter(userId) } as never,
    { $set },
    { returnDocument: 'after' }
  );

  // driver v6 may return the document directly or under .value
  const doc = (result as { value?: Application } | Application | null);
  const updated =
    doc && typeof doc === 'object' && 'value' in doc ? doc.value : (doc as Application | null);

  return serializeDoc(updated as unknown as Record<string, unknown> | null);
}

export async function deleteApplication(userId: string, applicationId: string) {
  const itemOid = toObjectId(applicationId);
  if (!itemOid) return false;

  const collection = await getCollection(COLLECTIONS.applications);
  const result = await collection.deleteOne({
    _id: itemOid,
    userId: userIdFilter(userId),
  } as never);

  return result.deletedCount > 0;
}

/** Aggregate counts for the dashboard summary cards. */
export async function getDashboardSummary(userId: string) {
  const [savedItems, applications] = await Promise.all([
    listSavedItems(userId),
    listApplications(userId),
  ]);

  const now = new Date();
  const activeDeadlines = applications.filter((app) => {
    const a = app as { deadline?: string | Date; status?: string };
    if (!a.deadline) return false;
    if (a.status === 'accepted' || a.status === 'rejected' || a.status === 'withdrawn') {
      return false;
    }
    const d = new Date(a.deadline);
    return !Number.isNaN(d.getTime()) && d >= now;
  });

  return {
    savedCount: savedItems.length,
    applicationCount: applications.length,
    activeDeadlineCount: activeDeadlines.length,
    applications,
    savedItems,
  };
}
