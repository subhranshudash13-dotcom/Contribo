require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('gsoc-hub');
  const orgs = await db.collection('organizations').find({}).toArray();

  console.log(`Total organizations: ${orgs.length}`);

  let missingCount = 0;
  let hasLogoCount = 0;
  const domainCounts = {};
  const sampleMissing = [];

  for (const o of orgs) {
    if (!o.logoUrl || o.logoUrl.trim() === '') {
      missingCount++;
      sampleMissing.push({ name: o.name, slug: o.slug });
    } else {
      hasLogoCount++;
      try {
        const u = new URL(o.logoUrl);
        domainCounts[u.hostname] = (domainCounts[u.hostname] || 0) + 1;
      } catch {
        domainCounts['invalid_url'] = (domainCounts['invalid_url'] || 0) + 1;
      }
    }
  }

  console.log(`Has logoUrl: ${hasLogoCount}, Missing logoUrl: ${missingCount}`);
  console.log('Logo URL Domain Breakdown:', JSON.stringify(domainCounts, null, 2));
  console.log('Sample Orgs still missing logoUrl:', JSON.stringify(sampleMissing.slice(0, 20), null, 2));

  await client.close();
}

run().catch(console.error);
