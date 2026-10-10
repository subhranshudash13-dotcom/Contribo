import { MongoClient, Db, Collection, Document } from 'mongodb';
import dns from 'node:dns';

// Ensure DNS SRV record queries for MongoDB Atlas resolve reliably across OS/DNS setups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Fallback if environment restricts custom DNS servers
}

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
  /** Proposal Studio drafts */
  proposals: 'proposals',
  /** Product feedback submissions */
  userFeedback: 'user_feedback',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

const options = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 45_000,
  serverSelectionTimeoutMS: 5_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 30_000,
  waitQueueTimeoutMS: 5_000,
  retryWrites: true,
  retryReads: true,
};

declare global {
  var _mongoClientPromise_v2: Promise<MongoClient> | undefined;
}

// Cache the connection promise on globalThis across both development (HMR)
// and production (container/serverless warm starts) to prevent connection churn under high concurrency.
if (!global._mongoClientPromise_v2) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise_v2 = client.connect();
}
const clientPromise: Promise<MongoClient> = global._mongoClientPromise_v2;

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
