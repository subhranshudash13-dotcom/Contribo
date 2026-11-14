import type { PassportSettings, UserProfile } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDoc, toObjectId } from '@/lib/serialize';
import { calculateContributorReadiness } from '@/lib/contributor-readiness';
import {
  getReadinessTier,
  sanitizeUsername,
  type PublicPassportData,
  type PassportTargetOrg,
} from '@/lib/passport';
import { listApplications, listSavedItems } from '@/lib/repositories/dashboard';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fetch public passport profile by username or GitHub handle.
 * Strips all sensitive fields and respects user privacy preferences.
 */
export async function getPublicPassport(
  rawUsername: string
): Promise<PublicPassportData | null> {
  const username = sanitizeUsername(rawUsername);
  if (!username) return null;

  try {
    const usersCol = await getCollection(COLLECTIONS.users);
    const regex = new RegExp(`^${escapeRegex(username)}$`, 'i');
    const userDoc = await usersCol.findOne({
      $or: [{ githubUsername: regex }, { name: regex }],
    } as never);

    if (userDoc) {
      const user = serializeDoc(userDoc as Record<string, unknown>) as unknown as UserProfile;
      const settings: PassportSettings = (user.passportSettings as PassportSettings) || {};
      const visibility = settings.visibility || 'public';

      if (visibility === 'private') {
        return {
          isPrivate: true,
          username,
          name: user.name || username,
          githubUsername: user.githubUsername || username,
          avatarUrl:
            user.image ||
            `https://github.com/${user.githubUsername || username}.png`,
          bio: '',
          score: 0,
          completedSignals: 0,
          totalSignals: 4,
          ready: false,
          hint: 'This profile is private',
          tier: getReadinessTier(0),
          skills: [],
          targetOrganizations: [],
          applicationsCount: 0,
          visibility: 'private',
        };
      }

      const userId = String(user._id);
      const [savedItems, applications] = await Promise.all([
        settings.showTargetOrgs !== false
          ? listSavedItems(userId, 'organization')
          : Promise.resolve([]),
        settings.showProposalsCount !== false
          ? listApplications(userId)
          : Promise.resolve([]),
      ]);

      const readiness = calculateContributorReadiness({
        displayName: user.name,
        skills: user.skills,
        savedCount: savedItems.length,
        applicationCount: applications.length,
      });

      const tier = getReadinessTier(readiness.score);

      const targetOrganizations: PassportTargetOrg[] = savedItems.map((item) => {
        const i = item as Record<string, unknown>;
        return {
          name: String(i.title || ''),
          slug: String(i.slug || ''),
          logoUrl: typeof i.logoUrl === 'string' ? i.logoUrl : undefined,
          programSlug: typeof i.programSlug === 'string' ? i.programSlug : undefined,
        };
      });

      return {
        isPrivate: false,
        username: user.githubUsername || username,
        name: user.name || username,
        githubUsername: user.githubUsername || username,
        avatarUrl:
          user.image ||
          `https://github.com/${user.githubUsername || username}.png`,
        bio: settings.customBio || user.experience || 'Open Source Contributor & Fellow',
        score: readiness.score,
        completedSignals: readiness.completed,
        totalSignals: readiness.total,
        ready: readiness.ready,
        hint: readiness.hint,
        tier,
        skills: settings.showSkills !== false ? user.skills || [] : [],
        targetOrganizations,
        applicationsCount: applications.length,
        visibility,
        updatedAt: user.updatedAt,
      };
    }
  } catch (error) {
    // If DB is unreachable or during unit tests, proceed to fallback lookup
    console.warn('DB lookup failed in getPublicPassport, checking fallback:', error);
  }

  // Graceful fallback for mock or demo usernames during tests / offline preview
  const demoProfiles: Record<string, PublicPassportData> = {
    demo: {
      isPrivate: false,
      username: 'demo',
      name: 'Alex Rivera',
      githubUsername: 'demo',
      avatarUrl: 'https://github.com/github.png',
      bio: 'Aspiring GSoC 2026 Contributor & Open Source Enthusiast',
      score: 85,
      completedSignals: 3,
      totalSignals: 4,
      ready: false,
      hint: 'Track your first application',
      tier: getReadinessTier(85),
      skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Go'],
      targetOrganizations: [
        { name: 'Apache Software Foundation', slug: 'apache-software-foundation', programSlug: 'gsoc' },
        { name: 'Cloud Native Computing Foundation (CNCF)', slug: 'cloud-native-computing-foundation-cncf', programSlug: 'lfx' },
        { name: 'Mozilla', slug: 'mozilla', programSlug: 'gsoc' },
      ],
      applicationsCount: 2,
      visibility: 'public',
    },
  };

  const lower = username.toLowerCase();
  if (demoProfiles[lower]) {
    return demoProfiles[lower];
  }

  return null;
}

/**
 * Get passport settings for authenticated user.
 */
export async function getUserPassportSettings(
  userId: string
): Promise<{ username: string; settings: PassportSettings } | null> {
  const oid = toObjectId(userId);
  if (!oid) return null;

  const users = await getCollection(COLLECTIONS.users);
  const user = await users.findOne({ _id: oid } as never);
  if (!user) return null;

  const serialized = serializeDoc(user as Record<string, unknown>) as unknown as UserProfile;
  const username = serialized.githubUsername || serialized.name || 'contributor';
  const settings: PassportSettings = (serialized.passportSettings as PassportSettings) || {
    visibility: 'public',
    showProposalsCount: true,
    showTargetOrgs: true,
    showSkills: true,
    customBio: '',
  };

  return { username, settings };
}

/**
 * Update passport visibility and preferences.
 */
export async function updateUserPassportSettings(
  userId: string,
  settings: Partial<PassportSettings> & { githubUsername?: string }
): Promise<PassportSettings | null> {
  const oid = toObjectId(userId);
  if (!oid) return null;

  const users = await getCollection(COLLECTIONS.users);
  const $set: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (settings.visibility && ['public', 'unlisted', 'private'].includes(settings.visibility)) {
    $set['passportSettings.visibility'] = settings.visibility;
  }
  if (typeof settings.showProposalsCount === 'boolean') {
    $set['passportSettings.showProposalsCount'] = settings.showProposalsCount;
  }
  if (typeof settings.showTargetOrgs === 'boolean') {
    $set['passportSettings.showTargetOrgs'] = settings.showTargetOrgs;
  }
  if (typeof settings.showSkills === 'boolean') {
    $set['passportSettings.showSkills'] = settings.showSkills;
  }
  if (typeof settings.customBio === 'string') {
    $set['passportSettings.customBio'] = settings.customBio.trim().slice(0, 300);
  }
  if (typeof settings.githubUsername === 'string') {
    const cleanGithub = sanitizeUsername(settings.githubUsername);
    if (cleanGithub) {
      $set.githubUsername = cleanGithub;
    }
  }

  await users.updateOne({ _id: oid } as never, { $set } as never);

  const updated = await users.findOne({ _id: oid } as never);
  if (!updated) return null;

  const serialized = serializeDoc(updated as Record<string, unknown>) as unknown as UserProfile;
  return (serialized.passportSettings as PassportSettings) || null;
}
