import { MongoClient, Db, Collection, Document } from 'mongodb';

/**
 * MongoDB connection module for Contribo.
 *
 * Configuration (env):
 * - MONGODB_URI  (required) — full connection string
 * - MONGODB_DB   (optional) — database name; falls back to URI path, then "contribo"
 */

const uri = process.env.MONGODB_URI ?? '';

if (!uri) {
  throw new Error(
    'Missing MONGODB_URI. Add it to your .env file (see .env.example).'
  );
}

/** Canonical collection names used across the app. */
export const COLLECTIONS = {
  programs: 'programs',
  organizations: 'organizations',
  projects: 'projects',
  users: 'users',
  accounts: 'accounts',
  sessions: 'sessions',
  verificationTokens: 'verification_tokens',
  /** User-saved projects and organizations */
  savedItems: 'saved_items',
  /** Application tracker entries */
  applications: 'applications',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

const options = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Preserve the client across HMR reloads in development.
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Resolve the database name from env or the URI path segment.
 * Example URI: mongodb+srv://user:pass@host/contribo-db → "contribo-db"
 */
export function resolveDatabaseName(): string {
  if (process.env.MONGODB_DB?.trim()) {
    return process.env.MONGODB_DB.trim();
  }

  try {
    const parsed = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
    const pathName = parsed.pathname?.replace(/^\//, '').split('?')[0];
    if (pathName && pathName.length > 0) {
      return pathName;
    }
  } catch {
    // Fall through to default
  }

  return 'contribo';
}

/** Connected MongoClient promise (used by NextAuth adapter). */
export default clientPromise;

/** Get a connected MongoClient. */
export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

/** Get the application database (explicit name, never implicit admin). */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(resolveDatabaseName());
}

/** Typed helper to open a named collection. */
export async function getCollection<T extends Document = Document>(
  name: CollectionName | string
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}
