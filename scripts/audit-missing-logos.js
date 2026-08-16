require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('gsoc-hub');
  const orgs = await db.collection('organizations').find({}).toArray();

  console.log(`Total Orgs: ${orgs.length}`);
  const missing = orgs.filter(o => !o.logoUrl || o.logoUrl.trim() === '');
  console.log(`Missing logoUrl count: ${missing.length}`);

  // Let's print unique categories & sample missing org names
  const sampleMissing = missing.slice(0, 35).map(o => ({ name: o.name, slug: o.slug, category: o.category }));
  console.log('Sample missing orgs:', JSON.stringify(sampleMissing, null, 2));

  await client.close();
}
run();
