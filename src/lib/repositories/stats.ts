import { COLLECTIONS, getCollection } from '@/lib/db';
import type { PlatformStats } from '@/../types';

let cachedStats: { at: number; value: PlatformStats } | null = null;
let cachedMentors: { at: number; count: number } | null = null;
const CACHE_MS = 60_000;
const MENTOR_CACHE_MS = 300_000;

export async function getPlatformStats(options?: { bypassCache?: boolean }): Promise<PlatformStats> {
  if (!options?.bypassCache && cachedStats && Date.now() - cachedStats.at < CACHE_MS) {
    return cachedStats.value;
  }

  const [projectsCol, orgsCol, programsCol, usersCol] = await Promise.all([
    getCollection(COLLECTIONS.projects),
    getCollection(COLLECTIONS.organizations),
    getCollection(COLLECTIONS.programs),
    getCollection(COLLECTIONS.users),
  ]);

  const [projects, organizations, programs, users] = await Promise.all([
    projectsCol.estimatedDocumentCount().catch(() => projectsCol.countDocuments()),
    orgsCol.estimatedDocumentCount().catch(() => orgsCol.countDocuments()),
    programsCol.estimatedDocumentCount().catch(() => programsCol.countDocuments()),
    usersCol.estimatedDocumentCount().catch(() => usersCol.countDocuments()),
  ]);

  let mentorCount = cachedMentors?.count;
  if (mentorCount === undefined || Date.now() - (cachedMentors?.at ?? 0) > MENTOR_CACHE_MS) {
    try {
      const mentorValues = await projectsCol.distinct('mentors');
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
      mentorCount = mentorSet.size;
      cachedMentors = { at: Date.now(), count: mentorCount };
    } catch {
      mentorCount = cachedMentors?.count || 0;
    }
  }

  const value: PlatformStats = {
    projects,
    organizations,
    programs,
    contributors: mentorCount + users,
  };

  cachedStats = { at: Date.now(), value };
  return value;
}
