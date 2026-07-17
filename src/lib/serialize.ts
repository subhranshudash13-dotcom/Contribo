import { ObjectId } from 'mongodb';

/**
 * Convert MongoDB documents into JSON-safe plain objects
 * (ObjectId → string, Date → ISO string).
 */
export function serializeDoc<T extends Record<string, unknown>>(
  doc: T | null | undefined
): (Omit<T, '_id'> & { _id?: string }) | null {
  if (!doc) return null;

  const out: Record<string, unknown> = { ...doc };

  if (out._id instanceof ObjectId) {
    out._id = out._id.toString();
  } else if (out._id != null) {
    out._id = String(out._id);
  }

  for (const key of Object.keys(out)) {
    const value = out[key];
    if (value instanceof ObjectId) {
      out[key] = value.toString();
    } else if (value instanceof Date) {
      out[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      out[key] = value.map((item) => {
        if (item instanceof ObjectId) return item.toString();
        if (item instanceof Date) return item.toISOString();
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return serializeDoc(item as Record<string, unknown>);
        }
        return item;
      });
    } else if (value && typeof value === 'object') {
      // Nested plain objects (e.g. pastStats, timeline entries)
      out[key] = serializeDoc(value as Record<string, unknown>);
    }
  }

  return out as Omit<T, '_id'> & { _id?: string };
}

export function serializeDocs<T extends Record<string, unknown>>(
  docs: T[]
): Array<Omit<T, '_id'> & { _id?: string }> {
  return docs
    .map((d) => serializeDoc(d))
    .filter((d): d is Omit<T, '_id'> & { _id?: string } => d !== null);
}

/** Parse a string into ObjectId, or null if invalid. */
export function toObjectId(id: string | ObjectId | undefined | null): ObjectId | null {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return new ObjectId(id);
  }
  // Accept 24-hex that ObjectId.isValid accepts even when not strict
  if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
    return new ObjectId(id);
  }
  return null;
}

/**
 * Build a Mongo filter value for programId that matches either ObjectId or string storage.
 * Some legacy rows may store programId as a string.
 */
export function programIdFilter(programId: ObjectId | string) {
  const oid = typeof programId === 'string' ? toObjectId(programId) : programId;
  if (oid) {
    return { $in: [oid, oid.toString()] };
  }
  return programId;
}
