import type { Program } from '@/../types';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { serializeDoc, serializeDocs } from '@/lib/serialize';

export async function listPrograms(options?: { tier?: number }) {
  const collection = await getCollection<Program>(COLLECTIONS.programs);
  const query: Record<string, unknown> = {};

  if (options?.tier !== undefined && !Number.isNaN(options.tier)) {
    query.tier = options.tier;
  }

  const programs = await collection.find(query).sort({ tier: 1, name: 1 }).toArray();
  return serializeDocs(programs as unknown as Record<string, unknown>[]);
}

export async function getProgramBySlug(slug: string) {
  if (!slug) return null;
  const collection = await getCollection<Program>(COLLECTIONS.programs);
  const program = await collection.findOne({ slug });
  return serializeDoc(program as unknown as Record<string, unknown> | null);
}

export async function getProgramById(id: string) {
  const { toObjectId } = await import('@/lib/serialize');
  const oid = toObjectId(id);
  if (!oid) return null;
  const collection = await getCollection<Program>(COLLECTIONS.programs);
  const program = await collection.findOne({ _id: oid } as never);
  return serializeDoc(program as unknown as Record<string, unknown> | null);
}

/** Resolve a program filter from id or slug query params. Returns null if slug not found. */
export async function resolveProgramFilter(params: {
  programId?: string | null;
  programSlug?: string | null;
}): Promise<{ programId?: unknown; notFound?: boolean }> {
  const { programIdFilter, toObjectId } = await import('@/lib/serialize');

  if (params.programSlug) {
    const collection = await getCollection<Program>(COLLECTIONS.programs);
    const program = await collection.findOne({ slug: params.programSlug });
    if (!program?._id) {
      return { notFound: true };
    }
    return { programId: programIdFilter(program._id as never) };
  }

  if (params.programId) {
    const oid = toObjectId(params.programId);
    if (oid) {
      return { programId: programIdFilter(oid) };
    }
    return { programId: params.programId };
  }

  return {};
}
