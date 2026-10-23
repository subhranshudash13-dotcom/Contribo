require('dotenv').config();
const { MongoClient } = require('mongodb');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // ignore
}

function resolveDatabaseName(uri) {
  if (process.env.MONGODB_DB && process.env.MONGODB_DB.trim()) {
    return process.env.MONGODB_DB.trim();
  }
  try {
    const parsed = new URL(
      uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://')
    );
    const pathName = parsed.pathname?.replace(/^\//, '').split('?')[0];
    if (pathName) return pathName;
  } catch {
    // ignore
  }
  return 'contribo';
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env');
    process.exit(1);
  }

  const dbName = resolveDatabaseName(uri);
  const client = new MongoClient(uri);

  async function ensureIndex(collection, keys, options = {}) {
    const label = options.name || Object.keys(keys).join('_');
    try {
      const name = await collection.createIndex(keys, options);
      console.log(`- ${label}: ${name}`);
      return true;
    } catch (err) {
      // Duplicate data or existing conflicting index — keep going
      if (err && (err.code === 11000 || err.codeName === 'DuplicateKey' || err.code === 85 || err.code === 86)) {
        console.warn(`- ${label}: skipped (${err.codeName || err.code}) — ${err.message.split('\n')[0]}`);
        // Fall back to non-unique compound index for query performance
        if (options.unique) {
          try {
            const { unique: _u, ...rest } = options;
            const fallback = await collection.createIndex(keys, rest);
            console.log(`  → non-unique fallback: ${fallback}`);
          } catch (fallbackErr) {
            console.warn(`  → fallback also failed: ${fallbackErr.message}`);
          }
        }
        return false;
      }
      throw err;
    }
  }

  try {
    await client.connect();
    console.log(`Connected to MongoDB (database: ${dbName}) to configure indexes.`);

    const db = client.db(dbName);

    // 1. programs
    console.log("\nConfiguring indexes for 'programs'...");
    const programsCollection = db.collection('programs');
    await ensureIndex(programsCollection, { slug: 1 }, { unique: true });
    await ensureIndex(programsCollection, { tier: 1 });

    // 2. organizations
    console.log("\nConfiguring indexes for 'organizations'...");
    const orgsCollection = db.collection('organizations');
    await ensureIndex(orgsCollection, { programId: 1 });
    await ensureIndex(orgsCollection, { slug: 1 });
    // Prefer unique; if legacy duplicates exist, falls back to non-unique
    await ensureIndex(orgsCollection, { programId: 1, slug: 1 }, { unique: true });
    await ensureIndex(orgsCollection, { name: 1 });
    await ensureIndex(orgsCollection, { is2026: -1, name: 1 });
    await ensureIndex(orgsCollection, { programId: 1, is2026: -1, name: 1 });
    await ensureIndex(orgsCollection, { category: 1, is2026: -1 });
    await ensureIndex(orgsCollection, { technologies: 1 });
    await ensureIndex(orgsCollection, { years: 1 });
    await ensureIndex(orgsCollection, { projectCount: -1, is2026: -1, name: 1 });

    // 3. projects
    console.log("\nConfiguring indexes for 'projects'...");
    const projectsCollection = db.collection('projects');
    await ensureIndex(projectsCollection, { programId: 1 });
    await ensureIndex(projectsCollection, { orgSlug: 1 });
    await ensureIndex(projectsCollection, { difficulty: 1 });
    await ensureIndex(projectsCollection, { techStack: 1 });
    await ensureIndex(projectsCollection, { year: -1 });
    await ensureIndex(projectsCollection, { stars: -1 });
    await ensureIndex(projectsCollection, { year: -1, stars: -1 });
    await ensureIndex(projectsCollection, { stars: -1, year: -1 });
    await ensureIndex(projectsCollection, { programId: 1, year: -1, stars: -1 });
    await ensureIndex(projectsCollection, { orgSlug: 1, year: -1 });
    await ensureIndex(projectsCollection, { difficulty: 1, year: -1 });
    await ensureIndex(projectsCollection, { year: -1, stars: -1, createdAt: -1 });
    await ensureIndex(
      projectsCollection,
      { orgSlug: 1, title: 1, year: 1, programId: 1 },
      { unique: true }
    );

    console.log('\nCreating text index for projects...');
    try {
      const existingIndexes = await projectsCollection.indexes();
      const textIndex = existingIndexes.find(
        (idx) => idx.key && Object.values(idx.key).includes('text')
      );
      if (textIndex && textIndex.name !== 'ProjectTextSearchIndex') {
        console.log(`Dropping old text index: ${textIndex.name}`);
        await projectsCollection.dropIndex(textIndex.name);
      }
    } catch (e) {
      console.log('No existing text index to drop or drop failed:', e.message);
    }

    await ensureIndex(
      projectsCollection,
      {
        title: 'text',
        description: 'text',
        techStack: 'text',
        topics: 'text',
      },
      {
        weights: {
          title: 10,
          techStack: 5,
          topics: 3,
          description: 1,
        },
        name: 'ProjectTextSearchIndex',
      }
    );

    // 4. users (auth + profile)
    console.log("\nConfiguring indexes for 'users'...");
    const usersCollection = db.collection('users');
    // NOTE: `sparse: true` only omits documents where the email field is
    // *absent*. The NextAuth MongoDB adapter writes `email: null` for an OAuth
    // profile with no public email (a GitHub account may have none), so all of
    // those documents share one null key and the second such sign-in fails with
    // `E11000 dup key: { email: null }`, which Auth.js reports as an opaque
    // Configuration error. Uniqueness is therefore limited to real emails, and
    // a plain index keeps email lookups (credentials login) indexed.
    //
    // Migration order: the replacement partial unique index is built *first*,
    // while `email_1` is still enforcing uniqueness, so there is no window in
    // which concurrent sign-ups could claim the same email. Both steps fail
    // loudly — a build that cannot guarantee uniqueness, or a legacy index that
    // cannot be removed, aborts setup instead of reporting success.
    const EMAIL_UNIQUE_INDEX = 'email_unique_when_present';

    async function requireEmailUniqueIndex(collection) {
      const existing = (await collection.indexes()).find(
        (idx) => idx.name === EMAIL_UNIQUE_INDEX
      );
      if (existing) {
        if (existing.unique !== true) {
          throw new Error(
            `users.${EMAIL_UNIQUE_INDEX} exists but is not unique — ` +
              `drop it and re-run this script to rebuild it as a unique index.`
          );
        }
        console.log(`- ${EMAIL_UNIQUE_INDEX}: already present`);
        return;
      }
      try {
        await collection.createIndex(
          { email: 1 },
          {
            unique: true,
            name: EMAIL_UNIQUE_INDEX,
            partialFilterExpression: { email: { $type: 'string' } },
          }
        );
        console.log(`- ${EMAIL_UNIQUE_INDEX}: ${EMAIL_UNIQUE_INDEX}`);
      } catch (err) {
        const first = String(err.message || err).split('\n')[0];
        if (err.code === 11000 || err.codeName === 'DuplicateKey') {
          throw new Error(
            `Cannot create unique index users.${EMAIL_UNIQUE_INDEX}: existing users already ` +
              `share an email address. Locate them with db.users.aggregate([` +
              `{$match:{email:{$type:"string"}}},{$group:{_id:"$email",count:{$sum:1}}},` +
              `{$match:{count:{$gt:1}}}]), resolve the duplicates, then re-run this script. (${first})`
          );
        }
        throw new Error(`Cannot create unique index users.${EMAIL_UNIQUE_INDEX}: ${first}`);
      }
    }

    async function dropLegacyEmailIndex(collection) {
      const legacy = (await collection.indexes()).find(
        (idx) => idx.name === 'email_1' && (idx.sparse === true || idx.unique === true)
      );
      if (!legacy) return;
      console.log('Dropping legacy users.email index (unique on null blocks OAuth sign-ins)');
      try {
        await collection.dropIndex('email_1');
      } catch (err) {
        // Nothing to drop is fine; anything else leaves email-less accounts
        // blocked by the legacy index, so it must not pass as success.
        if (err.code === 27 || err.codeName === 'IndexNotFound' || err.codeName === 'NamespaceNotFound') {
          console.log('- email_1: already removed');
          return;
        }
        throw new Error(
          `Failed to drop the legacy users.email index (email_1) — GitHub accounts without a ` +
            `public email will keep failing with E11000 { email: null }. ${String(err.message || err).split('\n')[0]}`
        );
      }
    }

    await requireEmailUniqueIndex(usersCollection);
    await dropLegacyEmailIndex(usersCollection);
    await ensureIndex(usersCollection, { email: 1 }, { name: 'email_lookup' });

    // 5. saved_items (dashboard bookmarks)
    console.log("\nConfiguring indexes for 'saved_items'...");
    const savedCollection = db.collection('saved_items');
    await ensureIndex(savedCollection, { userId: 1 });
    await ensureIndex(
      savedCollection,
      { userId: 1, type: 1, targetId: 1 },
      { unique: true }
    );
    await ensureIndex(savedCollection, { createdAt: -1 });

    // 6. applications (tracker)
    console.log("\nConfiguring indexes for 'applications'...");
    const appsCollection = db.collection('applications');
    await ensureIndex(appsCollection, { userId: 1 });
    await ensureIndex(appsCollection, { status: 1 });
    await ensureIndex(appsCollection, { userId: 1, updatedAt: -1 });
    await ensureIndex(appsCollection, { deadline: 1 });
    // One active track per user+project when projectId is set
    await ensureIndex(
      appsCollection,
      { userId: 1, projectId: 1 },
      { unique: true, partialFilterExpression: { projectId: { $type: 'objectId' } } }
    );

    // 7. NextAuth collections
    console.log("\nConfiguring indexes for auth collections...");
    const accounts = db.collection('accounts');
    await ensureIndex(accounts, { userId: 1 });
    await ensureIndex(accounts, { provider: 1, providerAccountId: 1 }, { unique: true });
    const sessions = db.collection('sessions');
    await ensureIndex(sessions, { sessionToken: 1 }, { unique: true });
    await ensureIndex(sessions, { userId: 1 });

    console.log('\nDatabase index configuration completed successfully.');
  } catch (err) {
    console.error('Error setting up indexes:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
