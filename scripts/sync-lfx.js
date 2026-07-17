require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

// Helper to convert organization name to slug
function toKebabCase(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-');
}

// Helper to resolve MongoDB Database Name
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
  } catch {}
  return 'contribo';
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: No MONGODB_URI found in .env');
    process.exit(1);
  }

  const dbName = resolveDatabaseName(uri);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`Connected to MongoDB (database: ${dbName})`);
    const db = client.db(dbName);

    // 1. Resolve LFX program
    const programsCollection = db.collection('programs');
    const lfxProgram = await programsCollection.findOne({ slug: 'lfx' });
    if (!lfxProgram) {
      console.error("Error: LFX program not found. Please run 'node scripts/seed-programs.js' first.");
      process.exit(1);
    }
    const lfxProgramId = lfxProgram._id;
    console.log(`Found LFX program: ${lfxProgram.name} (ID: ${lfxProgramId})`);

    // 2. Fetch projects from LFX API
    let nextPageKey = '';
    let fetchedCount = 0;
    let createdOrgs = 0;
    let updatedOrgs = 0;
    let createdProjects = 0;
    let updatedProjects = 0;

    const orgsCollection = db.collection('organizations');
    const projectsCollection = db.collection('projects');

    console.log('\nStarting LFX synchronization...');

    do {
      let url = 'https://api.mentorship.lfx.linuxfoundation.org/projects?status=active&limit=100';
      if (nextPageKey) {
        url += `&nextPageKey=${encodeURIComponent(nextPageKey)}`;
      }

      console.log(`Fetching from API: ${url.substring(0, 120)}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`LFX API returned status ${response.status}`);
      }

      const data = await response.json();
      const lfxProjects = data.projects || [];
      nextPageKey = data.nextPageKey || '';

      console.log(`Retrieved ${lfxProjects.length} projects from current page.`);
      fetchedCount += lfxProjects.length;

      // Process each project
      for (const lfxProj of lfxProjects) {
        // Normalization
        const name = lfxProj.name.trim();
        let orgName = '';
        let projectTitle = '';
        let parentFoundation = 'Linux Foundation';

        if (name.startsWith('CNCF - ')) {
          parentFoundation = 'Cloud Native Computing Foundation (CNCF)';
        } else if (name.startsWith('FINOS - ') || name.includes('FINOS')) {
          parentFoundation = 'FINOS';
        } else if (name.startsWith('RISC-V') || name.includes('RISC-V')) {
          parentFoundation = 'RISC-V';
        } else if (name.startsWith('Hyperledger') || name.includes('Hyperledger')) {
          parentFoundation = 'Hyperledger';
        } else if (name.startsWith('OpenJS') || name.includes('OpenJS')) {
          parentFoundation = 'OpenJS Foundation';
        }

        if (name.includes(':')) {
          const parts = name.split(':');
          const left = parts[0].trim();
          projectTitle = parts.slice(1).join(':').trim();

          orgName = left
            .replace(/^CNCF\s*-\s*/i, '')
            .replace(/^FINOS\s*-\s*/i, '')
            .replace(/^RISC-V Mentorship\s*-\s*/i, '')
            .replace(/^RISC-V\s*-\s*/i, '')
            .replace(/^RISC-V Mentorship\s*/i, '')
            .replace(/^Hyperledger\s*-\s*/i, '')
            .trim();
        } else {
          orgName = name
            .replace(/^CNCF\s*-\s*/i, '')
            .replace(/^FINOS\s*-\s*/i, '')
            .trim();
          projectTitle = `${orgName} Mentorship Project`;
        }

        if (!orgName) orgName = 'LFX Project';
        if (!projectTitle) projectTitle = name;

        const orgSlug = toKebabCase(orgName);
        const projectSlug = lfxProj.slug || toKebabCase(projectTitle);

        // Extract skills/technologies
        const skills = lfxProj.apprenticeNeeds?.skills || [];
        const industry = lfxProj.industry ? lfxProj.industry.split(',').map(s => s.trim()).filter(Boolean) : [];
        const technologies = Array.from(new Set([...skills, ...industry])).map(s => s.toLowerCase());

        // Extract years
        const years = lfxProj.programTerms
          ? lfxProj.programTerms
              .map(t => new Date(t.startDateTime * 1000).getFullYear())
              .filter(y => !isNaN(y) && y > 2000)
          : [];
        const finalYears = years.length > 0 ? Array.from(new Set(years)) : [2025];

        // 3. Upsert Organization
        const existingOrg = await orgsCollection.findOne({ slug: orgSlug, programId: lfxProgramId });
        let orgId;

        if (existingOrg) {
          orgId = existingOrg._id;
          const mergedTech = Array.from(new Set([...(existingOrg.technologies || []), ...technologies]));
          const mergedYears = Array.from(new Set([...(existingOrg.years || []), ...finalYears])).sort((a, b) => b - a);

          await orgsCollection.updateOne(
            { _id: orgId },
            {
              $set: {
                logoUrl: lfxProj.logoUrl || existingOrg.logoUrl || '',
                description: lfxProj.description || existingOrg.description || '',
                websiteUrl: lfxProj.websiteUrl || existingOrg.websiteUrl || '',
                category: parentFoundation,
                technologies: mergedTech,
                years: mergedYears,
                updatedAt: new Date()
              }
            }
          );
          updatedOrgs++;
        } else {
          const insertResult = await orgsCollection.insertOne({
            programId: lfxProgramId,
            name: orgName,
            slug: orgSlug,
            logoUrl: lfxProj.logoUrl || '',
            backgroundColor: '#ffffff',
            description: lfxProj.description || '',
            websiteUrl: lfxProj.websiteUrl || '',
            category: parentFoundation,
            technologies: technologies,
            topics: technologies,
            years: finalYears,
            is2026: finalYears.includes(2026),
            projectCount: 0,
            updatedAt: new Date()
          });
          orgId = insertResult.insertedId;
          createdOrgs++;
        }

        // 4. Upsert Project
        const existingProject = await projectsCollection.findOne({
          $or: [
            { slug: projectSlug, programId: lfxProgramId },
            { sourceId: lfxProj.projectId } // check by external LFX project ID
          ]
        });

        const projectData = {
          programId: lfxProgramId,
          orgId: orgId,
          orgName: orgName,
          orgSlug: orgSlug,
          title: projectTitle,
          slug: projectSlug,
          description: lfxProj.description || '',
          technologies: technologies,
          difficulty: 'Intermediate', // LFX default
          duration: `${lfxProj.durationWeeks || 12} weeks`,
          stipend: lfxProgram.stipendRange || '$3000 - $6000',
          repositoryUrl: lfxProj.repoLink || '',
          projectUrl: lfxProj.websiteUrl || '',
          sourceId: lfxProj.projectId,
          updatedAt: new Date()
        };

        if (existingProject) {
          await projectsCollection.updateOne({ _id: existingProject._id }, { $set: projectData });
          updatedProjects++;
        } else {
          await projectsCollection.insertOne({
            ...projectData,
            createdAt: new Date()
          });
          createdProjects++;
        }
      }

      // Respectful delay between paginated requests
      if (nextPageKey) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } while (nextPageKey);

    // 5. Update Project Counts on Organizations
    console.log('\nRecalculating project counts for LFX organizations...');
    const allLfxOrgs = await orgsCollection.find({ programId: lfxProgramId }).toArray();
    for (const org of allLfxOrgs) {
      const count = await projectsCollection.countDocuments({ orgId: org._id });
      await orgsCollection.updateOne({ _id: org._id }, { $set: { projectCount: count } });
    }

    console.log('\nLFX Synchronization Completed!');
    console.log('─'.repeat(40));
    console.log(`Total projects fetched: ${fetchedCount}`);
    console.log(`Organizations: Created: ${createdOrgs}, Updated: ${updatedOrgs}`);
    console.log(`Projects: Created: ${createdProjects}, Updated: ${updatedProjects}`);
    console.log('─'.repeat(40));

  } catch (err) {
    console.error('LFX Synchronization failed:', err);
  } finally {
    await client.close();
  }
}

main();
