require('dotenv').config();
const { MongoClient } = require('mongodb');

const GSOC_PROGRAM = {
  name: "Google Summer of Code",
  slug: "gsoc",
  organizer: "Google",
  stipendRange: "$1500 - $3300",
  durationWeeks: 12,
  tier: 1,
  accentColor: "#4285F4",
  eligibilitySummary: "University students and beginners 18+ to open source",
  timeline: [],
  lastVerifiedAt: new Date()
};

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
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }

  const dbName = resolveDatabaseName(uri);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`Connected to MongoDB for migration (database: ${dbName}).`);
    
    const db = client.db(dbName); 
    
    // 1. Insert GSoC Program
    const programsCollection = db.collection('programs');
    
    // Check if it already exists to be safe
    let gsocProgram = await programsCollection.findOne({ slug: "gsoc" });
    let gsocProgramId;
    
    if (!gsocProgram) {
      console.log("Inserting GSoC program into 'programs' collection...");
      const result = await programsCollection.insertOne(GSOC_PROGRAM);
      gsocProgramId = result.insertedId;
      console.log(`Inserted GSoC program with ID: ${gsocProgramId}`);
    } else {
      gsocProgramId = gsocProgram._id;
      console.log(`GSoC program already exists with ID: ${gsocProgramId}`);
    }
    
    // 2. Update Organizations
    const orgsCollection = db.collection('organizations');
    const orgsResult = await orgsCollection.updateMany(
      { programId: { $exists: false } },
      { $set: { programId: gsocProgramId } }
    );
    console.log(`\nOrganizations Migration:`);
    console.log(`- Matched: ${orgsResult.matchedCount}`);
    console.log(`- Modified: ${orgsResult.modifiedCount}`);
    
    // 3. Update Projects
    const projectsCollection = db.collection('projects');
    const projectsResult = await projectsCollection.updateMany(
      { programId: { $exists: false } },
      { $set: { programId: gsocProgramId } }
    );
    console.log(`\nProjects Migration:`);
    console.log(`- Matched: ${projectsResult.matchedCount}`);
    console.log(`- Modified: ${projectsResult.modifiedCount}`);
    
    console.log("\nMigration completed successfully.");

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.close();
  }
}

main();
