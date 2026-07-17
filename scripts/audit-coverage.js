require('dotenv').config();
const { MongoClient } = require('mongodb');

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
  if (!uri) throw new Error('No MONGODB_URI');
  const dbName = resolveDatabaseName(uri);
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const programs = await db
    .collection('programs')
    .find({})
    .project({ slug: 1, name: 1, tier: 1 })
    .toArray();

  console.log('DB:', dbName);
  console.log(
    'PROGRAMS:',
    programs.map((p) => `${p.slug} (${p.name})`).join(' | ')
  );

  const projectsByProgram = await db
    .collection('projects')
    .aggregate([{ $group: { _id: '$programId', n: { $sum: 1 } } }, { $sort: { n: -1 } }])
    .toArray();

  const programMap = new Map(programs.map((p) => [String(p._id), p.slug]));
  console.log(
    'PROJECTS_BY_PROGRAM:',
    projectsByProgram.map((r) => ({
      program: programMap.get(String(r._id)) || String(r._id),
      count: r.n,
    }))
  );

  const orgsByProgram = await db
    .collection('organizations')
    .aggregate([{ $group: { _id: '$programId', n: { $sum: 1 } } }, { $sort: { n: -1 } }])
    .toArray();
  console.log(
    'ORGS_BY_PROGRAM:',
    orgsByProgram.map((r) => ({
      program: programMap.get(String(r._id)) || String(r._id),
      count: r.n,
    }))
  );

  const years = await db
    .collection('projects')
    .aggregate([{ $group: { _id: '$year', n: { $sum: 1 } } }, { $sort: { _id: -1 } }])
    .toArray();
  console.log('YEARS:', years);

  const total = await db.collection('projects').countDocuments();
  const noTech = await db.collection('projects').countDocuments({
    $or: [{ techStack: { $exists: false } }, { techStack: { $size: 0 } }],
  });
  const noDesc = await db.collection('projects').countDocuments({
    $or: [{ description: { $exists: false } }, { description: '' }],
  });
  const withStars = await db.collection('projects').countDocuments({ stars: { $gt: 0 } });
  const year2025plus = await db.collection('projects').countDocuments({ year: { $gte: 2025 } });
  const year2026 = await db.collection('projects').countDocuments({ year: 2026 });

  console.log({
    total,
    noTech,
    noDesc,
    withStars,
    year2025plus,
    year2026,
    pctWithTech: ((1 - noTech / total) * 100).toFixed(1) + '%',
  });

  const topTech = await db
    .collection('projects')
    .aggregate([
      { $unwind: '$techStack' },
      { $group: { _id: '$techStack', n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 15 },
    ])
    .toArray();
  console.log('TOP_TECH:', topTech);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
