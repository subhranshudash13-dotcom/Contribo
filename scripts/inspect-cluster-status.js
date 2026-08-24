const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkCluster() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB cluster...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas successfully!');
    const db = client.db();
    console.log('Active Database:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('\n--- Collections & Document Counts ---');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      const indexes = await db.collection(col.name).indexes();
      const sample = await db.collection(col.name).findOne({}, { projection: { _id: 1, name: 1, title: 1, email: 1, slug: 1 } });
      console.log(`• Collection: ${col.name}`);
      console.log(`  - Total Documents: ${count}`);
      console.log(`  - Total Indexes: ${indexes.length} (${indexes.map(i => i.name).join(', ')})`);
      console.log(`  - Sample Keys: ${sample ? Object.keys(sample).join(', ') : 'Empty'}`);
    }
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
  } finally {
    await client.close();
  }
}

checkCluster();
