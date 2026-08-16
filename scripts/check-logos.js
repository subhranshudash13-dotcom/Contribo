require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env');
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('gsoc-hub');
  const orgs = await db.collection('organizations').find({
    name: { $regex: 'AFL|52|AI', $options: 'i' }
  }).limit(20).toArray();

  for (const o of orgs) {
    console.log(o.name, '=> logoUrl:', JSON.stringify(o.logoUrl));
  }
  await client.close();
}
run();
