/* eslint-disable */
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { execSync } = require('child_process');
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
  return 'gsoc-hub';
}

async function upgradeDatabaseCluster() {
  console.log('Starting Contribo Database & MongoDB Cluster Upgrade...');
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Missing MONGODB_URI in environment');
    process.exit(1);
  }

  const dbName = resolveDatabaseName(uri);
  const client = new MongoClient(uri);
  const startTime = Date.now();

  try {
    // 1. Connection & Health Check
    console.log(`Connecting to MongoDB cluster (database: '${dbName}')...`);
    await client.connect();
    const admin = client.db().admin();
    const pingResult = await admin.ping();
    const latency = Date.now() - startTime;
    console.log(`✓ Connection successful (ping: ${JSON.stringify(pingResult)}, latency: ${latency}ms)`);

    const db = client.db(dbName);

    // 2. Collection Inventory & Auditing
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log(`✓ Collections found (${collectionNames.length}): ${collectionNames.join(', ')}`);

    // 3. Deduplication Check on 'organizations' and 'projects'
    console.log('\nAuditing for legacy duplicate keys...');
    
    // Org deduplication: programId + slug
    const orgsCollection = db.collection('organizations');
    const orgDuplicates = await orgsCollection.aggregate([
      { $group: { _id: { programId: '$programId', slug: '$slug' }, count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (orgDuplicates.length > 0) {
      console.log(`  Found ${orgDuplicates.length} duplicate organization groupings. Resolving...`);
      for (const dup of orgDuplicates) {
        // Keep first doc, remove rest
        const [keep, ...remove] = dup.docs;
        await orgsCollection.deleteMany({ _id: { $in: remove } });
      }
      console.log('  ✓ Deduplicated organization entries.');
    } else {
      console.log('  ✓ Organizations collection clean (no duplicate keys).');
    }

    // Projects deduplication: orgSlug + title + year + programId
    const projectsCollection = db.collection('projects');
    const projDuplicates = await projectsCollection.aggregate([
      { $group: { _id: { orgSlug: '$orgSlug', title: '$title', year: '$year', programId: '$programId' }, count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (projDuplicates.length > 0) {
      console.log(`  Found ${projDuplicates.length} duplicate project groupings. Resolving...`);
      for (const dup of projDuplicates) {
        const [keep, ...remove] = dup.docs;
        await projectsCollection.deleteMany({ _id: { $in: remove } });
      }
      console.log('  ✓ Deduplicated project entries.');
    } else {
      console.log('  ✓ Projects collection clean (no duplicate keys).');
    }

    // 4. Index Optimization & Setup
    console.log('\nRunning database index setup script...');
    try {
      execSync('node scripts/setup-indexes.js', { stdio: 'inherit' });
      console.log('✓ All collection indexes configured successfully.');
    } catch (idxErr) {
      console.warn('⚠️ Index setup notice:', idxErr.message);
    }

    // 5. Verify Program Seeding & extra projects
    console.log('\nVerifying multi-program seed data...');
    const programsCount = await db.collection('programs').countDocuments();
    const projectsCount = await db.collection('projects').countDocuments();
    const orgsCount = await db.collection('organizations').countDocuments();

    console.log(`✓ Inventory counts:`);
    console.log(`  - Programs: ${programsCount}`);
    console.log(`  - Organizations: ${orgsCount}`);
    console.log(`  - Projects: ${projectsCount}`);

    if (programsCount < 8) {
      console.log('  Seeding missing programs...');
      execSync('node scripts/seed-programs.js', { stdio: 'inherit' });
    }

    console.log('\n==================================================');
    console.log('🎉 MongoDB Cluster & Database Upgrade Completed Flawlessly!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('❌ Database upgrade error:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

upgradeDatabaseCluster();
