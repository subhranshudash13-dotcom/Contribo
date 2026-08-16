/* eslint-disable */
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

function toKebabCase(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-');
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
  } catch {}
  return 'gsoc-hub';
}

function extractYearFromSlug(slug) {
  const match = slug.match(/(202[0-9])/);
  return match ? parseInt(match[1], 10) : 2026;
}

function inferTechnologies(text) {
  const techs = new Set();
  const lower = text.toLowerCase();

  const techMap = {
    python: ['python', 'django', 'fastapi', 'flask', 'bioconductor'],
    javascript: ['javascript', 'js', 'react', 'vue', 'node', 'express'],
    typescript: ['typescript', 'ts'],
    rust: ['rust', 'cargo', 'wasm', 'webassembly'],
    go: ['go', 'golang', 'kubernetes', 'opentelemetry'],
    c: ['c', 'gcc', 'clang', 'kernel'],
    cpp: ['c++', 'cpp', 'qt', 'ros'],
    ruby: ['ruby', 'rails', 'homebrew'],
    r: ['r', 'shiny', 'bioconductor'],
    java: ['java', 'kotlin', 'android'],
    php: ['php', 'mediawiki', 'wordpress'],
    linux: ['linux', 'debian', 'fedora', 'bash', 'shell'],
  };

  for (const [tech, keywords] of Object.entries(techMap)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      techs.add(tech);
    }
  }

  if (techs.size === 0) techs.add('open-source');
  return Array.from(techs);
}

async function scrapeOutreachyRound(roundHref) {
  const url = `https://www.outreachy.org${roundHref}`;
  console.log(`\nFetching live Outreachy round: ${url}`);
  const year = extractYearFromSlug(roundHref);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      console.warn(`Round ${url} returned status ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Extract community links from round page
    const commMatches = [
      ...html.matchAll(
        /href=["'](\/[^"']*\/communities\/([^"']+)\/?)["']/g
      ),
    ];

    const comms = [];
    const seen = new Set();

    for (const match of commMatches) {
      const fullHref = match[1];
      const commSlug = match[2].replace(/\/$/, '');
      if (!seen.has(commSlug)) {
        seen.add(commSlug);
        comms.push({ href: fullHref, slug: commSlug });
      }
    }

    console.log(`Found ${comms.length} community landing pages for round ${year}.`);

    const roundData = [];

    // Scrape projects from each community landing page
    for (const comm of comms) {
      const commUrl = `https://www.outreachy.org${comm.href}`;
      try {
        const commRes = await fetch(commUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!commRes.ok) continue;

        const commHtml = await commRes.text();

        // Extract title & headings
        const titleMatch = commHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const orgName = titleMatch
          ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
          : comm.slug.toUpperCase();

        const headings = [
          ...commHtml.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi),
        ].map((m) => m[1].replace(/<[^>]+>/g, '').trim());

        // Extract paragraphs
        const paragraphs = [
          ...commHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi),
        ].map((m) => m[1].replace(/<[^>]+>/g, '').trim());

        const descSnippet = paragraphs.slice(0, 3).join(' ') || `${orgName} community project for Outreachy.`;

        // Projects are headings on community pages
        const projectTitles = headings.filter(
          (h) =>
            !['Timeline', 'Intern Payment Schedule', 'Past Projects', 'Community Info'].includes(h)
        );

        if (projectTitles.length > 0) {
          roundData.push({
            orgName,
            orgSlug: `${toKebabCase(orgName)}-outreachy`,
            year,
            websiteUrl: commUrl,
            description: descSnippet,
            projectTitles,
          });
        }
      } catch (err) {
        console.warn(`Failed to scrape community page ${commUrl}:`, err.message);
      }
    }

    return roundData;
  } catch (err) {
    console.error(`Error scraping round ${url}:`, err.message);
    return [];
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI missing in .env');
    process.exit(1);
  }

  const dbName = resolveDatabaseName(uri);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`Connected to MongoDB (database: ${dbName}) for dynamic Outreachy live scraping.`);
    const db = client.db(dbName);

    // Resolve or insert Outreachy program
    const programsCol = db.collection('programs');
    let outreachyProgram = await programsCol.findOne({ slug: 'outreachy' });

    if (!outreachyProgram) {
      const insertRes = await programsCol.insertOne({
        slug: 'outreachy',
        name: 'Outreachy',
        organizer: 'Software Freedom Conservancy',
        stipendRange: '$7000',
        durationWeeks: 13,
        tier: 1,
        accentColor: '#E37154',
        eligibilitySummary: 'Underrepresented groups subject to systemic bias in tech, 18+ globally, remote',
        officialWebsite: 'https://www.outreachy.org',
        lastVerifiedAt: new Date()
      });
      outreachyProgram = { _id: insertRes.insertedId, slug: 'outreachy', name: 'Outreachy' };
    }

    const outreachyProgramId = outreachyProgram._id;
    console.log(`Targeting Outreachy Program ID: ${outreachyProgramId}`);

    // Fetch past project round index page from outreachy.org
    console.log('\nFetching round index from https://www.outreachy.org/past-projects/ ...');
    const indexRes = await fetch('https://www.outreachy.org/past-projects/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const indexHtml = await indexRes.text();
    const roundHrefs = [
      ...indexHtml.matchAll(/href=["'](\/outreachy-[^"']+)["']/g),
    ].map((m) => m[1]);

    const uniqueRounds = Array.from(new Set(roundHrefs)).slice(0, 6); // Top 6 active/past cohorts
    console.log('Discovered live round cohorts:', uniqueRounds);

    const orgsCol = db.collection('organizations');
    const projectsCol = db.collection('projects');

    let totalOrgsIngested = 0;
    let totalProjectsIngested = 0;

    for (const roundHref of uniqueRounds) {
      const roundOrgs = await scrapeOutreachyRound(roundHref);

      for (const item of roundOrgs) {
        const technologies = inferTechnologies(
          `${item.orgName} ${item.description} ${item.projectTitles.join(' ')}`
        );

        // Upsert organization
        const existingOrg = await orgsCol.findOne({ slug: item.orgSlug });
        let orgId;

        const currentYears = existingOrg?.years || [];
        const updatedYears = Array.from(new Set([...currentYears, item.year])).sort((a, b) => b - a);

        if (!existingOrg) {
          const insertRes = await orgsCol.insertOne({
            name: item.orgName,
            slug: item.orgSlug,
            description: item.description,
            websiteUrl: item.websiteUrl,
            category: 'Open Source Community',
            technologies,
            topics: ['outreachy', 'open-source', ...technologies],
            years: updatedYears,
            is2026: updatedYears.includes(2026),
            projectCount: item.projectTitles.length,
            programId: outreachyProgramId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          orgId = insertRes.insertedId;
          totalOrgsIngested++;
          console.log(`  + Created Org: "${item.orgName}" (${item.orgSlug})`);
        } else {
          orgId = existingOrg._id;
          await orgsCol.updateOne(
            { _id: orgId },
            {
              $set: {
                name: item.orgName,
                description: item.description,
                technologies: Array.from(new Set([...(existingOrg.technologies || []), ...technologies])),
                years: updatedYears,
                is2026: updatedYears.includes(2026),
                projectCount: Math.max(existingOrg.projectCount || 0, item.projectTitles.length),
                programId: outreachyProgramId,
                updatedAt: new Date(),
              },
            }
          );
        }

        // Upsert projects for this organization
        for (const title of item.projectTitles) {
          const projectSlug = toKebabCase(`${item.orgName}-${title}`);
          const techStack = inferTechnologies(title);

          const projDoc = {
            title,
            org: item.orgName,
            orgSlug: item.orgSlug,
            orgId,
            programId: outreachyProgramId,
            programName: 'Outreachy',
            description: `<p><strong>${title}</strong></p><p>${item.description}</p><p><br></p><p><strong>Mentorship Cohort:</strong> ${item.year}</p>`,
            difficulty: 'Intermediate',
            techStack,
            githubUrl: item.websiteUrl,
            stars: 1200,
            mentors: ['Outreachy Mentor Team'],
            year: item.year,
            is2026: item.year === 2026,
            topics: techStack,
            updatedAt: new Date(),
          };

          const existingProj = await projectsCol.findOne({
            title,
            orgSlug: item.orgSlug,
          });

          if (!existingProj) {
            await projectsCol.insertOne({
              ...projDoc,
              createdAt: new Date(),
            });
            totalProjectsIngested++;
            console.log(`    + Ingested Project: "${title}"`);
          } else {
            await projectsCol.updateOne(
              { _id: existingProj._id },
              { $set: projDoc }
            );
          }
        }
      }
    }

    console.log('\n=============================================');
    console.log('  DYNAMIC OUTREACHY LIVE INGESTION COMPLETE');
    console.log(`  Total Organizations Ingested/Updated: ${totalOrgsIngested}`);
    console.log(`  Total Projects Ingested/Updated: ${totalProjectsIngested}`);
    console.log('=============================================\n');

  } catch (err) {
    console.error('Fatal error during dynamic Outreachy live scraping:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

main();
