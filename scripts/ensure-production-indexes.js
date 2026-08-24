const { MongoClient } = require('mongodb');
require('dotenv').config();

async function optimizeUserIndexes() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to MongoDB Atlas:', db.databaseName);

    // 1. Proposals indexes
    console.log('Optimizing proposals collection indexes...');
    await db.collection('proposals').createIndex({ userId: 1, updatedAt: -1 });
    await db.collection('proposals').createIndex({ userId: 1, programSlug: 1 });
    await db.collection('proposals').createIndex({ isPublic: 1, score: -1 });

    // 2. User feedback indexes
    console.log('Optimizing user_feedback collection indexes...');
    await db.collection('user_feedback').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('user_feedback').createIndex({ createdAt: -1 });

    // 3. Saved items indexes
    console.log('Checking saved_items collection indexes...');
    await db.collection('saved_items').createIndex({ userId: 1, createdAt: -1 });

    console.log('All user and proposal collections are indexed for deployment!');
  } catch (err) {
    console.error('Error optimizing indexes:', err);
  } finally {
    await client.close();
  }
}

optimizeUserIndexes();
