import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("No URI");

async function run() {
  const client = new MongoClient(uri as string);
  try {
    await client.connect();
    const db = client.db('gsoc-hub');
    const program = await db.collection('programs').findOne({});
    console.log("Single program in gsoc-hub:");
    console.dir(program, { depth: null });
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
