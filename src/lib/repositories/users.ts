import type { UserProfile } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDoc, toObjectId } from '@/lib/serialize';

/** Never return credentials or session secrets to API clients. */
const PUBLIC_USER_PROJECTION = {
  password: 0,
  refreshToken: 0,
  accessToken: 0,
  emailVerificationToken: 0,
  resetPasswordToken: 0,
  resetPasswordExpires: 0,
} as const;

const SENSITIVE_KEYS = [
  'password',
  'refreshToken',
  'accessToken',
  'emailVerificationToken',
  'resetPasswordToken',
  'resetPasswordExpires',
] as const;

function stripSensitive(user: Record<string, unknown>): UserProfile {
  const safe = { ...user };
  for (const key of SENSITIVE_KEYS) {
    delete safe[key];
  }
  return safe as UserProfile;
}

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

  return stripSensitive(serialized as Record<string, unknown>);
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
    // GitHub usernames: alphanumeric and hyphens, max 39
    const cleaned = updates.githubUsername
      .trim()
      .replace(/^@/, '')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .slice(0, 39);
    allowed.githubUsername = cleaned;
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
  const proposals = await getCollection(COLLECTIONS.proposals);
  const feedback = await getCollection(COLLECTIONS.userFeedback);

  // Clear secrets first in case partial failure leaves the user row
  await users.updateOne(
    { _id: oid } as never,
    {
      $unset: {
        password: '',
        refreshToken: '',
        accessToken: '',
        emailVerificationToken: '',
        resetPasswordToken: '',
        resetPasswordExpires: '',
      },
    }
  );

  const userDeleteResult = await users.deleteOne({ _id: oid } as never);

  // NextAuth may store userId as ObjectId or string depending on adapter version
  const userIdMatch = { $or: [{ userId: oid }, { userId: userId }] } as never;
  await Promise.all([
    accounts.deleteMany(userIdMatch),
    sessions.deleteMany(userIdMatch),
    savedItems.deleteMany(userIdMatch),
    applications.deleteMany(userIdMatch),
    proposals.deleteMany(userIdMatch),
    feedback.deleteMany(userIdMatch),
  ]);

  // Related data cleaned even if user row was already gone
  const relatedPurged = userDeleteResult.deletedCount > 0;
  return { deleted: relatedPurged };
}
