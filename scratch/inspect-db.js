const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in environment.");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db();
    
    // Check total count
    const total = await db.collection('projects').countDocuments();
    console.log("Total projects count:", total);
    
    // Inspect distinct difficulties
    const difficulties = await db.collection('projects').distinct('difficulty');
    console.log("Distinct difficulties:", difficulties);
    
    // Inspect one project
    const sample = await db.collection('projects').findOne();
    console.log("Sample project:", sample);
    
    // Inspect some techStack values
    const distinctTech = await db.collection('projects').distinct('techStack');
    console.log("Distinct tech stacks (first 20):", distinctTech.slice(0, 20));
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
