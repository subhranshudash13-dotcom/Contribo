/**
 * One-off migration for proposal drafts whose `updatedAt` is prose.
 *
 * `src/lib/repositories/proposals.ts` used to store the literal string
 * 'Just now' (and the seeded demo rows stored 'Yesterday', '2 hours ago'),
 * so `{ updatedAt: -1 }` was an alphabetical sort rather than a recency one.
 * New writes store a real Date; this rewrites the rows that came before.
 *
 * A row's replacement time is chosen from the best evidence still on it:
 *   1. `updatedAt` when it is already an ISO-8601 string,
 *   2. `createdAt` (Date or ISO string),
 *   3. the 4-byte timestamp embedded in the Mongo `_id`, i.e. when the draft
 *      was first created — the honest lower bound, never "now", so an old
 *      draft cannot jump to the top of the list by being unmigrated.
 *
 * Usage:
 *   node scripts/migrate-proposal-updated-at.js --dry-run
 *   node scripts/migrate-proposal-updated-at.js
 *   node scripts/migrate-proposal-updated-at.js --collection=proposals_copy   (trial run)
 */
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const DRY_RUN = process.argv.includes('--dry-run');

/** Optional escape hatch so the rewrite can be rehearsed on a copy first. */
function collectionName() {
  const arg = process.argv.find((a) => a.startsWith('--collection='));
  return arg ? arg.slice('--collection='.length).trim() : 'proposals';
}

/** ISO-8601 only — mirrors `toDate()` in src/lib/time.ts. */
const ISO_LIKE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || !ISO_LIKE.test(trimmed)) return null;
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/** Best-known modification time for a draft, or null when nothing on it is a date. */
function resolveUpdatedAt(doc) {
  const stored = toDate(doc.updatedAt);
  if (stored) return stored;

  const created = toDate(doc.createdAt);
  if (created) return created;

  if (doc._id instanceof ObjectId) return doc._id.getTimestamp();
  if (typeof doc._id === 'string' && ObjectId.isValid(doc._id)) {
    return new ObjectId(doc._id).getTimestamp();
  }
  return null;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const name = collectionName();
    const proposals = db.collection(name);
    console.log(`Collection: ${db.databaseName}.${name}${DRY_RUN ? ' (dry run)' : ''}`);

    // Anything that is not already a BSON date: prose, ISO strings, numbers, missing.
    const cursor = proposals.find({ updatedAt: { $not: { $type: 'date' } } });
    const operations = [];
    let unresolvable = 0;

    for await (const doc of cursor) {
      const resolved = resolveUpdatedAt(doc);
      if (!resolved) {
        unresolvable += 1;
        continue;
      }
      operations.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { updatedAt: resolved } },
        },
      });
    }

    console.log(`Drafts to rewrite: ${operations.length}`);
    if (unresolvable > 0) {
      console.warn(
        `Left untouched (no usable timestamp anywhere on the row): ${unresolvable}`
      );
    }

    if (DRY_RUN) {
      console.log('Dry run — nothing written. Re-run without --dry-run to apply.');
      return;
    }

    if (operations.length > 0) {
      const result = await proposals.bulkWrite(operations, { ordered: false });
      console.log(
        `Updated ${result.modifiedCount || 0} draft(s) with a real updatedAt date.`
      );
    }

    const indexName = await proposals.createIndex({ userId: 1, updatedAt: -1 });
    console.log(`Ensured index { userId: 1, updatedAt: -1 } → ${indexName}`);
  } catch (err) {
    console.error('Migration failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
