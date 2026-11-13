/* eslint-disable */
const { MongoClient } = require('mongodb');
const hacktoberfestTags = require('../src/lib/hacktoberfest-tags.json');

const PROGRAM_SLUG = 'hacktoberfest';
const YEAR = 2026;
// Partner identities: https://hacktoberfest.com/ (sponsor wall), verified 2026-10-24.
// Repository descriptions/stacks: each project's official repository.
// These are ecosystem learning resources, not guaranteed DEV Challenge submissions.
// Gauge is the sponsor at withgauge.com, not the unrelated Gauge test framework.
const HACKTOBERFEST_ORGS_DATA = [
  {
    "name": "DigitalOcean",
    "slug": "digitalocean",
    "role": "Presenting Partner",
    "websiteUrl": "https://www.digitalocean.com/",
    "description": "Cloud infrastructure and App Platform for deploying applications; presenting partner of Hacktoberfest 2026.",
    "category": "Cloud & Infrastructure",
    "topics": [
      "developer-tools"
    ],
    "projects": [
      {
        "title": "DigitalOcean CLI (doctl)",
        "description": "Official command-line interface for the DigitalOcean API.",
        "techStack": [
          "Go"
        ],
        "githubUrl": "https://github.com/digitalocean/doctl"
      },
      {
        "title": "App Platform Go Sample",
        "description": "Sample Go application for deployment on DigitalOcean App Platform.",
        "techStack": [
          "Go"
        ],
        "githubUrl": "https://github.com/digitalocean/sample-golang"
      }
    ]
  },
  {
    "name": "Major League Hacking (MLH)",
    "slug": "mlh",
    "role": "Organizer",
    "websiteUrl": "https://www.mlh.com/",
    "description": "Co-organizer of Hacktoberfest, community Hack Days, and Global Hack Week.",
    "category": "Community & Education",
    "topics": [
      "fests",
      "hack-days",
      "open-source-ai"
    ],
    "projects": [
      {
        "title": "MLH Node.js Hackathon Starter",
        "description": "MLH starter project for building Node.js applications at hackathons.",
        "techStack": [
          "Node.js",
          "JavaScript",
          "HTML/CSS"
        ],
        "githubUrl": "https://github.com/MLH/mlh-hackathon-nodejs-starter"
      }
    ]
  },
  {
    "name": "DEV (Forem)",
    "slug": "dev-forem",
    "role": "Organizer",
    "websiteUrl": "https://dev.to/",
    "description": "Hacktoberfest co-organizer hosting DEV Challenges; Forem is the open-source software powering DEV.",
    "category": "Community & Education",
    "topics": [
      "dev-challenges",
      "open-source-ai",
      "open-weights"
    ],
    "projects": [
      {
        "title": "Forem Open Community Engine",
        "description": "Open-source community software powering DEV and other independent communities.",
        "techStack": [
          "Ruby",
          "JavaScript",
          "PostgreSQL"
        ],
        "githubUrl": "https://github.com/forem/forem",
        "topics": [
          "dev-challenges",
          "developer-tools"
        ]
      }
    ]
  },
  {
    "name": "MongoDB",
    "slug": "mongodb",
    "websiteUrl": "https://www.mongodb.com/",
    "description": "Document database platform and official drivers for application development.",
    "category": "Databases & Data Engineering",
    "topics": [
      "developer-tools"
    ],
    "projects": [
      {
        "title": "PyMongo",
        "description": "Official Python driver for MongoDB.",
        "techStack": [
          "Python",
          "MongoDB"
        ],
        "githubUrl": "https://github.com/mongodb/mongo-python-driver"
      }
    ]
  },
  {
    "name": "Snowflake",
    "slug": "snowflake",
    "websiteUrl": "https://www.snowflake.com/",
    "description": "Data platform with a Python connector for developing applications against Snowflake.",
    "category": "Databases & Data Engineering",
    "topics": [
      "developer-tools"
    ],
    "projects": [
      {
        "title": "Snowflake Connector for Python",
        "description": "Official Python connector for accessing Snowflake.",
        "techStack": [
          "Python",
          "SQL"
        ],
        "githubUrl": "https://github.com/snowflakedb/snowflake-connector-python"
      }
    ]
  },
  {
    "name": "Solana",
    "slug": "solana",
    "websiteUrl": "https://solana.com/",
    "description": "Blockchain ecosystem with developer documentation and learning resources maintained by the Solana Foundation.",
    "category": "Security, Cryptography & Blockchain",
    "topics": [
      "developer-tools"
    ],
    "projects": [
      {
        "title": "Solana Developer Content",
        "description": "Solana Foundation developer content for exploring, learning, and building in the Solana ecosystem.",
        "techStack": [
          "TypeScript"
        ],
        "githubUrl": "https://github.com/solana-foundation/developer-content"
      }
    ]
  },
  {
    "name": "ElevenLabs",
    "slug": "elevenlabs",
    "websiteUrl": "https://elevenlabs.io/",
    "description": "Audio AI platform with an official Python SDK for its API.",
    "category": "AI & Machine Learning",
    "topics": [
      "agents",
      "developer-tools"
    ],
    "projects": [
      {
        "title": "ElevenLabs Python SDK",
        "description": "Official Python SDK for the ElevenLabs API; the SDK is public, while API access is provided by ElevenLabs.",
        "techStack": [
          "Python"
        ],
        "githubUrl": "https://github.com/elevenlabs/elevenlabs-python"
      }
    ]
  },
  {
    "name": "GitHub",
    "slug": "github",
    "websiteUrl": "https://github.com/",
    "description": "Developer collaboration platform providing an official MCP server for agent integrations.",
    "category": "Developer Tools & Compilers",
    "topics": [
      "agents",
      "developer-tools"
    ],
    "projects": [
      {
        "title": "GitHub MCP Server",
        "description": "Official GitHub Model Context Protocol server for integrating GitHub with AI tools.",
        "techStack": [
          "Go"
        ],
        "githubUrl": "https://github.com/github/github-mcp-server"
      }
    ]
  },
  {
    "name": "Sentry",
    "slug": "sentry",
    "websiteUrl": "https://sentry.io/",
    "description": "Developer error tracking and application performance monitoring platform.",
    "category": "Developer Tools & Compilers",
    "topics": [
      "developer-tools"
    ],
    "projects": [
      {
        "title": "Sentry",
        "description": "Developer-focused error tracking and performance monitoring.",
        "techStack": [
          "Python",
          "TypeScript"
        ],
        "githubUrl": "https://github.com/getsentry/sentry"
      }
    ]
  },
  {
    "name": "Render",
    "slug": "render",
    "websiteUrl": "https://render.com/",
    "description": "Cloud application hosting platform with deployment examples for developers.",
    "category": "Cloud & Infrastructure",
    "topics": [
      "developer-tools"
    ],
    "projects": [
      {
        "title": "Render FastAPI Example",
        "description": "Template for deploying a simple Python FastAPI application on Render.",
        "techStack": [
          "Python",
          "FastAPI"
        ],
        "githubUrl": "https://github.com/render-examples/fastapi"
      }
    ]
  },
  {
    "name": "IBM",
    "slug": "ibm",
    "websiteUrl": "https://www.ibm.com/us-en",
    "description": "Developer of Granite AI models and community recipes for building with them.",
    "category": "AI & Machine Learning",
    "topics": [
      "open-source-ai",
      "open-weights",
      "agents"
    ],
    "projects": [
      {
        "title": "Granite Snack Cookbook",
        "description": "Short Python notebook recipes demonstrating the capabilities of IBM Granite models.",
        "techStack": [
          "Python",
          "Jupyter"
        ],
        "githubUrl": "https://github.com/ibm-granite-community/granite-snack-cookbook"
      }
    ]
  },
  {
    "name": "Backboard.io",
    "slug": "backboard",
    "websiteUrl": "https://backboard.io/",
    "description": "AI infrastructure provider with memory and coding-agent integrations.",
    "category": "AI & Machine Learning",
    "topics": [
      "agents",
      "developer-tools"
    ],
    "projects": [
      {
        "title": "Backboard OpenClaw Plugin",
        "description": "Backboard.io integration plugin for OpenClaw.",
        "techStack": [
          "TypeScript"
        ],
        "githubUrl": "https://github.com/Backboard-io/openclaw_plugin"
      }
    ]
  },
  {
    "name": "Tiger Data",
    "slug": "tiger-data",
    "websiteUrl": "https://www.tigerdata.com/",
    "description": "PostgreSQL data platform and tools for building AI applications.",
    "category": "Databases & Data Engineering",
    "topics": [
      "open-source-ai",
      "developer-tools"
    ],
    "projects": [
      {
        "title": "pgai",
        "description": "Tools for RAG, semantic search, and other AI applications with PostgreSQL.",
        "techStack": [
          "Python",
          "PostgreSQL"
        ],
        "githubUrl": "https://github.com/timescale/pgai"
      }
    ]
  },
  {
    "name": "Gauge",
    "slug": "gauge",
    "websiteUrl": "https://www.withgauge.com/",
    "description": "Agent-led growth platform measuring AI visibility, agent preference, and agent experience. No public project repository is verified for this catalog.",
    "category": "AI & Machine Learning",
    "topics": [
      "agents",
      "developer-tools"
    ],
    "projects": []
  }
];

function toKebabCase(value) {
  return value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
}

function resolveDatabaseName(uri, env = process.env) {
  if (env.MONGODB_DB?.trim()) return env.MONGODB_DB.trim();
  // MongoClient parses replica-set/SRV connection strings as well as local URIs.
  const name = new MongoClient(uri).options.dbName;
  if (name && name !== 'test') return name;
  throw new Error('Set MONGODB_DB or include an explicit database in MONGODB_URI.');
}

async function syncHacktoberfest(db) {
  const programs = db.collection('programs');
  const organizations = db.collection('organizations');
  const projects = db.collection('projects');

  await programs.updateOne({ slug: PROGRAM_SLUG }, {
    $set: {
      name: 'Hacktoberfest',
      organizer: 'MLH & DEV, presented by DigitalOcean',
      officialWebsite: 'https://hacktoberfest.com/',
      stipendRange: 'Sticker milestones and event rewards',
      eligibilitySummary: 'Ages 13+ subject to country eligibility; check each Fest and DEV Challenge for its rules',
      lastVerifiedAt: new Date('2026-10-24T00:00:00.000Z'),
    },
    $setOnInsert: { slug: PROGRAM_SLUG, durationWeeks: 4, tier: 3, accentColor: '#FF7A00', timeline: [] },
  }, { upsert: true });
  const program = await programs.findOne({ slug: PROGRAM_SLUG });
  const programFields = {
    programId: program._id,
    programSlug: PROGRAM_SLUG,
    programName: 'Hacktoberfest',
    programColor: program.accentColor || '#FF7A00',
  };
  const counts = { organizationsInserted: 0, organizationsModified: 0, projectsInserted: 0, projectsModified: 0 };

  for (const partner of HACKTOBERFEST_ORGS_DATA) {
    const topics = ['hacktoberfest', ...partner.topics];
    if (partner.topics.some(tag => !hacktoberfestTags.includes(tag))) {
      throw new Error('Unknown Hacktoberfest tag');
    }
    const orgFilter = { programId: program._id, slug: partner.slug };
    const orgResult = await organizations.updateOne(orgFilter, {
      $set: {
        ...programFields,
        name: partner.name,
        slug: partner.slug,
        description: partner.description,
        websiteUrl: partner.websiteUrl,
        category: partner.category,
        partnerRole: partner.role || 'Partner',
        technologies: [...new Set(partner.projects.flatMap(project => project.techStack))],
        topics,
        is2026: true,
        sourceUrl: 'https://hacktoberfest.com/',
      },
      $addToSet: { years: YEAR },
    }, { upsert: true });
    counts.organizationsInserted += orgResult.upsertedCount;
    counts.organizationsModified += orgResult.modifiedCount;
    const org = await organizations.findOne(orgFilter);

    for (const project of partner.projects) {
      // Match the repository's compound project identity; retain other years/programs.
      const filter = { programId: program._id, orgSlug: partner.slug, title: project.title, year: YEAR };
      const result = await projects.updateOne(filter, {
        $set: {
          ...programFields,
          org: partner.name,
          orgSlug: partner.slug,
          orgId: org._id,
          title: project.title,
          slug: toKebabCase(project.title),
          description: project.description,
          techStack: project.techStack,
          topics: ['hacktoberfest', ...(project.topics || partner.topics)],
          githubUrl: project.githubUrl,
          year: YEAR,
        },
        // Unknown stars/difficulty/mentors must not be fabricated or replace curated data.
        $setOnInsert: { mentors: [] },
      }, { upsert: true });
      counts.projectsInserted += result.upsertedCount;
      counts.projectsModified += result.modifiedCount;
    }
    const projectCount = await projects.countDocuments({ programId: program._id, orgSlug: partner.slug });
    await organizations.updateOne(orgFilter, { $set: { projectCount } });
  }
  return counts;
}

async function main() {
  require('dotenv').config();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI. Configure .env before syncing.');
  const dbName = resolveDatabaseName(uri);
  console.log('Hacktoberfest sync database: ' + dbName);
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log(await syncHacktoberfest(client.db(dbName)));
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch(() => {
    // Driver errors may contain connection details; never print credentials.
    console.error('Hacktoberfest sync failed. Check the database target, connectivity, and indexes.');
    process.exitCode = 1;
  });
}

module.exports = { HACKTOBERFEST_ORGS_DATA, resolveDatabaseName, syncHacktoberfest };
