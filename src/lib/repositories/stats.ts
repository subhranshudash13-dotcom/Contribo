import { COLLECTIONS, getCollection } from '@/lib/db';
import type { PlatformStats } from '@/../types';

let cachedStats: { at: number; value: PlatformStats } | null = null;
const CACHE_MS = 30_000;

export async function getPlatformStats(options?: { bypassCache?: boolean }): Promise<PlatformStats> {
  if (!options?.bypassCache && cachedStats && Date.now() - cachedStats.at < CACHE_MS) {
    return cachedStats.value;
  }

  const [projects, organizations, programs, users, mentorValues] = await Promise.all([
    getCollection(COLLECTIONS.projects).then((c) => c.countDocuments()),
    getCollection(COLLECTIONS.organizations).then((c) => c.countDocuments()),
    getCollection(COLLECTIONS.programs).then((c) => c.countDocuments()),
    getCollection(COLLECTIONS.users).then((c) => c.countDocuments()),
    getCollection(COLLECTIONS.projects).then((c) => c.distinct('mentors')),
  ]);

  // Flatten mentor arrays / strings; count unique non-empty names
  const mentorSet = new Set<string>();
  for (const entry of mentorValues) {
    if (Array.isArray(entry)) {
      for (const m of entry) {
        if (typeof m === 'string' && m.trim()) mentorSet.add(m.trim().toLowerCase());
      }
    } else if (typeof entry === 'string' && entry.trim()) {
      mentorSet.add(entry.trim().toLowerCase());
    }
  }

  const value: PlatformStats = {
    projects,
    organizations,
    programs,
    // Contributors ≈ unique mentors named on projects + registered users
    contributors: mentorSet.size + users,
  };

  cachedStats = { at: Date.now(), value };
  return value;
}
