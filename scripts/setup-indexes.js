require('dotenv').config();
const { MongoClient } = require('mongodb');

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
    await ensureIndex(orgsCollection, { technologies: 1 });

    // 3. projects
    console.log("\nConfiguring indexes for 'projects'...");
    const projectsCollection = db.collection('projects');
    await ensureIndex(projectsCollection, { programId: 1 });
    await ensureIndex(projectsCollection, { orgSlug: 1 });
    await ensureIndex(projectsCollection, { difficulty: 1 });
    await ensureIndex(projectsCollection, { techStack: 1 });
    await ensureIndex(projectsCollection, { year: -1 });
    await ensureIndex(projectsCollection, { stars: -1 });
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
    await ensureIndex(usersCollection, { email: 1 }, { unique: true, sparse: true });

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
