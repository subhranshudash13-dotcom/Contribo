import { cache } from 'react';
import type { Program } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDoc, serializeDocs } from '@/lib/serialize';

// In-memory cache for programs catalog (programs rarely change)
let inMemoryPrograms: { at: number; data: Record<string, unknown>[] } | null = null;
const PROGRAMS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const listPrograms = cache(async (options?: { tier?: number }) => {
  const query: Record<string, unknown> = {};
  if (options?.tier !== undefined && !Number.isNaN(options.tier)) {
    query.tier = options.tier;
  }

  // Fast path: use in-memory catalog when no tier filter
  if (options?.tier === undefined && inMemoryPrograms && Date.now() - inMemoryPrograms.at < PROGRAMS_CACHE_TTL) {
    return inMemoryPrograms.data;
  }

  const collection = await getCollection<Program>(COLLECTIONS.programs);
  const programs = await collection.find(query).sort({ tier: 1, name: 1 }).toArray();
  const serialized = serializeDocs(programs as unknown as Record<string, unknown>[]);

  if (options?.tier === undefined) {
    inMemoryPrograms = { at: Date.now(), data: serialized };
  }

  return serialized;
});

export const getProgramBySlug = cache(async (slug: string) => {
  if (!slug) return null;

  // Check in-memory list first if available
  if (inMemoryPrograms && Date.now() - inMemoryPrograms.at < PROGRAMS_CACHE_TTL) {
    const found = inMemoryPrograms.data.find(
      (p) => typeof p.slug === 'string' && p.slug.toLowerCase() === slug.toLowerCase()
    );
    if (found) return found;
  }

  const collection = await getCollection<Program>(COLLECTIONS.programs);
  const program = await collection.findOne({ slug });
  return serializeDoc(program as unknown as Record<string, unknown> | null);
});

export const getProgramById = cache(async (id: string) => {
  if (!id) return null;

  // Check in-memory list first if available
  if (inMemoryPrograms && Date.now() - inMemoryPrograms.at < PROGRAMS_CACHE_TTL) {
    const found = inMemoryPrograms.data.find((p) => String(p._id) === id);
    if (found) return found;
  }

  const { toObjectId } = await import('@/lib/serialize');
  const oid = toObjectId(id);
  if (!oid) return null;
  const collection = await getCollection<Program>(COLLECTIONS.programs);
  const program = await collection.findOne({ _id: oid } as never);
  return serializeDoc(program as unknown as Record<string, unknown> | null);
});

/** Resolve a program filter from id or slug query params. Returns null if slug not found. */
export const resolveProgramFilter = cache(async (params: {
  programId?: string | null;
  programSlug?: string | null;
}): Promise<{ programId?: unknown; notFound?: boolean }> => {
  const { programIdFilter, toObjectId } = await import('@/lib/serialize');

  const slug = params.programSlug?.trim();
  // Treat empty / "all" as no program filter (UI select value).
  if (slug && slug.toLowerCase() !== 'all') {
    const program = await getProgramBySlug(slug);
    if (!program?._id) {
      return { notFound: true };
    }
    return { programId: programIdFilter(program._id as never) };
  }

  const rawId = params.programId?.trim();
  if (rawId && rawId.toLowerCase() !== 'all') {
    const oid = toObjectId(rawId);
    if (oid) {
      return { programId: programIdFilter(oid) };
    }
    // Non-ObjectId string ids (legacy) — only pass through safe-looking slugs/ids
    if (/^[a-zA-Z0-9_-]{1,64}$/.test(rawId)) {
      return { programId: rawId };
    }
    return { notFound: true };
  }

  return {};
});
