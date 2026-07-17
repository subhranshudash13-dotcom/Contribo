require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    return;
  }
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB.");
    
    const db = client.db(); 
    
    const collections = await db.listCollections().toArray();
    console.log("\nCollections found:", collections.map(c => c.name).join(', '));
    
    for (const collInfo of collections) {
      const collName = collInfo.name;
      const count = await db.collection(collName).countDocuments();
      console.log(`\n--- Collection: ${collName} (${count} documents) ---`);
      
      const sample = await db.collection(collName).findOne();
      if (sample) {
        console.log("Fields:", Object.keys(sample).join(', '));
      } else {
        console.log("Fields: (collection is empty)");
      }
    }

  } catch (err) {
    console.error("Error connecting to DB:", err);
  } finally {
    await client.close();
  }
}
main();
