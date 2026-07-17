import type { UserProfile } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDoc, toObjectId } from '@/lib/serialize';

const PUBLIC_USER_PROJECTION = {
  password: 0,
} as const;

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const oid = toObjectId(userId);
  if (!oid) return null;

  const collection = await getCollection(COLLECTIONS.users);
  const user = await collection.findOne({ _id: oid } as never, {
    projection: PUBLIC_USER_PROJECTION,
  });

  if (!user) return null;

  const serialized = serializeDoc(user as Record<string, unknown>);
  if (!serialized) return null;

  // Explicitly strip password if present despite projection
  const { password: _pw, ...safe } = serialized as UserProfile & { password?: string };
  return safe as UserProfile;
}

export interface UserProfileUpdate {
  name?: string;
  skills?: string[];
  interests?: string[];
  experience?: string;
  availabilityHours?: number;
  location?: string;
  githubUsername?: string;
}

export async function updateUserProfile(
  userId: string,
  updates: UserProfileUpdate
): Promise<UserProfile | null> {
  const oid = toObjectId(userId);
  if (!oid) return null;

  const allowed: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof updates.name === 'string') {
    allowed.name = updates.name.trim().slice(0, 100);
  }
  if (Array.isArray(updates.skills)) {
    allowed.skills = updates.skills
      .filter((s): s is string => typeof s === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
  }
  if (Array.isArray(updates.interests)) {
    allowed.interests = updates.interests
      .filter((s): s is string => typeof s === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
  }
  if (typeof updates.experience === 'string') {
    allowed.experience = updates.experience.trim().slice(0, 80);
  }
  if (typeof updates.availabilityHours === 'number' && Number.isFinite(updates.availabilityHours)) {
    allowed.availabilityHours = Math.min(Math.max(updates.availabilityHours, 0), 168);
  }
  if (typeof updates.location === 'string') {
    allowed.location = updates.location.trim().slice(0, 120);
  }
  if (typeof updates.githubUsername === 'string') {
    allowed.githubUsername = updates.githubUsername.trim().replace(/^@/, '').slice(0, 39);
  }

  const collection = await getCollection(COLLECTIONS.users);
  await collection.updateOne({ _id: oid } as never, { $set: allowed });

  return getUserProfile(userId);
}

/** Purge a user and all related personal data (GDPR-style account deletion). */
export async function deleteUserAccount(userId: string): Promise<{ deleted: boolean }> {
  const oid = toObjectId(userId);
  if (!oid) {
    return { deleted: false };
  }

  const users = await getCollection(COLLECTIONS.users);
  const accounts = await getCollection(COLLECTIONS.accounts);
  const sessions = await getCollection(COLLECTIONS.sessions);
  const savedItems = await getCollection(COLLECTIONS.savedItems);
  const applications = await getCollection(COLLECTIONS.applications);

  const userDeleteResult = await users.deleteOne({ _id: oid } as never);

  // NextAuth may store userId as ObjectId or string depending on adapter version
  await Promise.all([
    accounts.deleteMany({ $or: [{ userId: oid }, { userId: userId }] } as never),
    sessions.deleteMany({ $or: [{ userId: oid }, { userId: userId }] } as never),
    savedItems.deleteMany({ $or: [{ userId: oid }, { userId: userId }] } as never),
    applications.deleteMany({ $or: [{ userId: oid }, { userId: userId }] } as never),
  ]);

  return { deleted: userDeleteResult.deletedCount > 0 };
}
