require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Simple CSV parser supporting quotes, commas, and newlines within fields (RFC 4180 compliant)
function parseCSV(csvContent) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField);
        currentField = '';
      } else if (char === '\r' || char === '\n') {
        currentLine.push(currentField);
        currentField = '';
        if (currentLine.some(field => field.trim() !== '')) {
          lines.push(currentLine);
        }
        currentLine = [];
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n
        }
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField);
    if (currentLine.some(field => field.trim() !== '')) {
      lines.push(currentLine);
    }
  }

  return lines;
}

function toKebabCase(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-');
}

function parseSemicolonList(str) {
  if (!str) return [];
  return str.split(';').map(s => s.trim()).filter(Boolean);
}

async function main() {
  const args = process.argv.slice(2);
  
  const typeArg = args.find(a => a.startsWith('--type=') || a === '--type');
  const programArg = args.find(a => a.startsWith('--program=') || a === '--program');
  const fileArg = args.find(a => a.startsWith('--file=') || a === '--file');
  const dryRun = args.includes('--dry-run');

  let type = typeArg ? (typeArg.includes('=') ? typeArg.split('=')[1] : args[args.indexOf(typeArg) + 1]) : null;
  let programSlug = programArg ? (programArg.includes('=') ? programArg.split('=')[1] : args[args.indexOf(programArg) + 1]) : null;
  let filePath = fileArg ? (fileArg.includes('=') ? fileArg.split('=')[1] : args[args.indexOf(fileArg) + 1]) : null;

  if (!type || !programSlug || !filePath) {
    console.error("Usage: node scripts/ingest-csv.js --type <org|project> --program <slug> --file <csv-path> [--dry-run]");
    process.exit(1);
  }

  if (type !== 'org' && type !== 'project') {
    console.error("Error: --type must be either 'org' or 'project'");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    console.error("Error: No MONGODB_URI found in .env");
    process.exit(1);
  }

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

  const dbName = resolveDatabaseName(dbUri);
  const client = new MongoClient(dbUri);

  try {
    await client.connect();
    console.log(`Using database: ${dbName}`);
    const db = client.db(dbName);

    // 1. Fetch and validate program slug
    const program = await db.collection('programs').findOne({ slug: programSlug });
    if (!program) {
      console.error(`Error: Program with slug '${programSlug}' not found in database.`);
      console.error("Please seed programs first using: node scripts/seed-programs.js");
      process.exit(1);
    }
    const programId = program._id;
    console.log(`Linked to Program: ${program.name} (ID: ${programId})`);

    // 2. Parse CSV
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(csvContent);

    if (rows.length < 2) {
      console.error("Error: CSV must contain a header row and at least one data row.");
      process.exit(1);
    }

    const headers = rows[0].map(h => h.trim());
    const dataRows = rows.slice(1);

    console.log(`Found ${dataRows.length} data rows in CSV. Starting validation & normalization...`);

    const normalizedRecords = [];
    
    for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
      const row = dataRows[rIdx];
      const record = {};
      
      // Map header values to row indices
      headers.forEach((header, colIdx) => {
        record[header] = row[colIdx] || '';
      });

      if (type === 'org') {
        const name = record['name'];
        if (!name) {
          console.warn(`Row ${rIdx + 1}: Skipping because 'name' is missing.`);
          continue;
        }

        const slug = record['slug'] || toKebabCase(name);
        const technologies = parseSemicolonList(record['technologies']);
        const topics = parseSemicolonList(record['topics']);
        const years = parseSemicolonList(record['years']).map(y => parseInt(y, 10)).filter(y => !isNaN(y));
        
        normalizedRecords.push({
          programId: programId,
          name: name.trim(),
          slug: slug.trim(),
          logoUrl: record['logoUrl']?.trim() || '',
          backgroundColor: record['backgroundColor']?.trim() || '',
          description: record['description']?.trim() || '',
          websiteUrl: record['websiteUrl']?.trim() || '',
          category: record['category']?.trim() || '',
          ideasUrl: record['ideasUrl']?.trim() || '',
          projectsUrl: record['projectsUrl']?.trim() || '',
          technologies,
          topics,
          years: years.length > 0 ? years : [new Date().getFullYear()],
          is2026: record['is2026'] === 'true' || record['is2026'] === true,
          updatedAt: new Date()
        });

      } else if (type === 'project') {
        const title = record['title'];
        const orgName = record['orgName'] || record['org'];
        if (!title || !orgName) {
          console.warn(`Row ${rIdx + 1}: Skipping because 'title' or 'orgName' is missing.`);
          continue;
        }

        const orgSlug = record['orgSlug'] || toKebabCase(orgName);
        const techStack = parseSemicolonList(record['techStack']);
        const topics = parseSemicolonList(record['topics']);
        const mentors = parseSemicolonList(record['mentors']);
        const stars = parseInt(record['stars'], 10) || 0;
        const year = parseInt(record['year'], 10) || new Date().getFullYear();

        let deadline = null;
        if (record['applicationDeadline']) {
          const parsedDate = new Date(record['applicationDeadline']);
          if (!isNaN(parsedDate.getTime())) {
            deadline = parsedDate;
          }
        }

        normalizedRecords.push({
          programId: programId,
          org: orgName.trim(),
          orgSlug: orgSlug.trim(),
          title: title.trim(),
          description: record['description']?.trim() || '',
          difficulty: record['difficulty']?.trim() || 'Intermediate',
          techStack,
          githubUrl: record['githubUrl']?.trim() || '',
          applicationDeadline: deadline,
          thumbnail: record['thumbnail']?.trim() || '',
          stars: stars,
          location: record['location']?.trim() || 'Remote',
          orgSize: record['orgSize']?.trim() || 'Medium',
          mentors,
          topics,
          year: year,
          createdAt: new Date()
        });
      }
    }

    console.log(`\nNormalized ${normalizedRecords.length} records successfully.`);

    if (dryRun) {
      console.log("\n--- DRY RUN ---");
      console.log(`No records were written to the database.`);
      console.log("Sample of first 2 records:");
      console.dir(normalizedRecords.slice(0, 2), { depth: null });
      return;
    }

    // 3. Write to Database
    console.log(`\nWriting to database...`);
    const collectionName = type === 'org' ? 'organizations' : 'projects';
    const collection = db.collection(collectionName);
    
    let insertedCount = 0;
    let updatedCount = 0;

    for (const record of normalizedRecords) {
      let filter = {};
      if (type === 'org') {
        // Unique organizations by slug and programId
        filter = { slug: record.slug, programId: record.programId };
      } else {
        // Unique projects by orgSlug, title, year, and programId
        filter = { orgSlug: record.orgSlug, title: record.title, year: record.year, programId: record.programId };
      }

      const result = await collection.updateOne(
        filter,
        { 
          $set: record,
          ...(type === 'project' ? { $setOnInsert: { createdAt: new Date() } } : {}) 
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
      } else if (result.modifiedCount > 0 || result.matchedCount > 0) {
        updatedCount++;
      }
    }

    console.log(`\nIngestion completed!`);
    console.log(`- Collection: ${collectionName}`);
    console.log(`- Inserted (New): ${insertedCount}`);
    console.log(`- Updated (Existing): ${updatedCount}`);

  } catch (err) {
    console.error("Ingestion failed:", err);
  } finally {
    await client.close();
  }
}

main();
