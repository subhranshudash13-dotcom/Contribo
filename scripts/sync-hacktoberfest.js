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
  return 'contribo';
}

const HACKTOBERFEST_ORGS_DATA = [
  {
    name: "DigitalOcean",
    slug: "digitalocean",
    logoUrl: "https://images.ctfassets.net/00i767y12b6f/30V5s2jK8g8K8K02Kq4u28/77d24d27f8eb2860a4f5f5c9e78280f5/do-logo-blue.svg",
    description: "The primary sponsor of Hacktoberfest providing cloud infrastructure, developer APIs, and open-source tooling.",
    websiteUrl: "https://hacktoberfest.com",
    category: "Cloud & Infrastructure",
    technologies: ["Go", "Docker", "Kubernetes", "Python", "Node.js", "Terraform"],
    topics: ["hacktoberfest", "cloud", "devops", "containers", "infrastructure"],
    projects: [
      {
        title: "DigitalOcean CLI (doctl)",
        description: "Official command line interface for managing DigitalOcean cloud services, droplet provisioning, and Kubernetes clusters.",
        techStack: ["Go", "Docker", "REST API", "CLI"],
        difficulty: "Intermediate",
        githubUrl: "https://github.com/digitalocean/doctl"
      },
      {
        title: "App Platform Samples & Templates",
        description: "Starter repositories and deployment blueprints for full-stack apps on DigitalOcean App Platform.",
        techStack: ["Node.js", "Python", "Docker", "React"],
        difficulty: "Beginner",
        githubUrl: "https://github.com/digitalocean/sample-golang"
      }
    ]
  },
  {
    name: "Appwrite",
    slug: "appwrite",
    logoUrl: "https://appwrite.io/images/logos/appwrite.svg",
    description: "Open-source backend-as-a-service platform providing authentication, databases, storage, and cloud functions.",
    websiteUrl: "https://appwrite.io",
    category: "Backend & Databases",
    technologies: ["TypeScript", "Node.js", "Docker", "PHP", "Kotlin", "Dart", "Redis"],
    topics: ["hacktoberfest", "baas", "backend", "authentication", "serverless"],
    projects: [
      {
        title: "Appwrite Core Engine",
        description: "End-to-end backend server for web, mobile, and Flutter developers with GraphQL & REST APIs.",
        techStack: ["TypeScript", "Docker", "PHP", "Redis", "MySQL"],
        difficulty: "Intermediate to Advanced",
        githubUrl: "https://github.com/appwrite/appwrite"
      },
      {
        title: "Appwrite SDK Generators",
        description: "Multi-language SDK generator suite producing official client and server SDKs for Flutter, React Native, Swift, and Go.",
        techStack: ["TypeScript", "Node.js", "Go", "Dart", "Swift"],
        difficulty: "Intermediate",
        githubUrl: "https://github.com/appwrite/sdk-generator"
      }
    ]
  },
  {
    name: "Novu",
    slug: "novu",
    logoUrl: "https://novu.co/images/logo.svg",
    description: "Open-source notification infrastructure for developers managing email, SMS, push, and in-app feeds.",
    websiteUrl: "https://novu.co",
    category: "Developer Tools",
    technologies: ["TypeScript", "React", "Node.js", "NestJS", "Redis", "MongoDB"],
    topics: ["hacktoberfest", "notifications", "developer-tools", "fullstack"],
    projects: [
      {
        title: "Novu Notification Engine",
        description: "Unified notification pipeline powering transactional email, push notifications, and web-embeddable notification centers.",
        techStack: ["TypeScript", "NestJS", "React", "Redis", "MongoDB"],
        difficulty: "Intermediate",
        githubUrl: "https://github.com/novuhq/novu"
      }
    ]
  },
  {
    name: "Supabase",
    slug: "supabase",
    logoUrl: "https://supabase.com/g/supabase-logo.png",
    description: "Open-source Firebase alternative powered by PostgreSQL with real-time subscriptions, auth, storage, and edge functions.",
    websiteUrl: "https://supabase.com",
    category: "Database & Backend",
    technologies: ["PostgreSQL", "TypeScript", "React", "Rust", "Elixir", "Go"],
    topics: ["hacktoberfest", "postgres", "realtime", "backend", "database"],
    projects: [
      {
        title: "Realtime Engine & Edge Functions",
        description: "Listen to PostgreSQL database changes in real-time over WebSockets and trigger edge functions.",
        techStack: ["Elixir", "TypeScript", "PostgreSQL", "Docker"],
        difficulty: "Advanced",
        githubUrl: "https://github.com/supabase/realtime"
      },
      {
        title: "Supabase Studio Dashboard",
        description: "Modern web application dashboard for managing Postgres schemas, row-level security policies, and API keys.",
        techStack: ["Next.js", "React", "TypeScript", "TailwindCSS"],
        difficulty: "Intermediate",
        githubUrl: "https://github.com/supabase/supabase"
      }
    ]
  },
  {
    name: "DEV (Forem)",
    slug: "dev-forem",
    logoUrl: "https://dev-to-uploads.s3.amazonaws.com/uploads/articles/f3y8z852h0p1v2p.png",
    description: "Open-source software powering DEV.to and independent developer communities worldwide.",
    websiteUrl: "https://dev.to",
    category: "Web Applications",
    technologies: ["Ruby", "Ruby on Rails", "JavaScript", "PostgreSQL", "Redis", "HTML/CSS"],
    topics: ["hacktoberfest", "community", "social-network", "rails"],
    projects: [
      {
        title: "Forem Open Community Engine",
        description: "Social blogging and networking platform powering DEV.to, designed for extensible community discussions.",
        techStack: ["Ruby on Rails", "PostgreSQL", "JavaScript", "Redis"],
        difficulty: "Intermediate",
        githubUrl: "https://github.com/forem/forem"
      }
    ]
  },
  {
    name: "EddieHub",
    slug: "eddiehub",
    logoUrl: "https://github.com/EddieHub.png",
    description: "Global open-source community dedicated to fostering collaboration, mentorship, and first-time open-source contributions.",
    websiteUrl: "https://eddiehub.org",
    category: "Community & Education",
    technologies: ["JavaScript", "TypeScript", "React", "Python", "Markdown"],
    topics: ["hacktoberfest", "good-first-issue", "beginner-friendly", "community"],
    projects: [
      {
        title: "EddieHub Live Community Portal",
        description: "Open-source developer portfolio and event hub for connecting open-source contributors and mentors.",
        techStack: ["Next.js", "React", "TypeScript", "TailwindCSS"],
        difficulty: "Beginner Friendly",
        githubUrl: "https://github.com/EddieHubCommunity/LinkFree"
      },
      {
        title: "Hacktoberfest Practice Grounds",
        description: "Curated beginner-friendly repository for learning Git workflow, pull requests, and code reviews.",
        techStack: ["Markdown", "Git", "HTML/CSS", "JavaScript"],
        difficulty: "Beginner",
        githubUrl: "https://github.com/EddieHubCommunity/hacktoberfest-practice"
      }
    ]
  },
  {
    name: "Meshery",
    slug: "meshery",
    logoUrl: "https://raw.githubusercontent.com/meshery/meshery/master/docs/assets/img/meshery-logo/meshery-logo-light.svg",
    description: "Cloud-native management plane for managing Kubernetes clusters, service meshes, and infrastructure diagrams.",
    websiteUrl: "https://meshery.io",
    category: "Cloud Native & Kubernetes",
    technologies: ["Go", "Kubernetes", "React", "Docker", "TypeScript", "GraphQL"],
    topics: ["hacktoberfest", "cncf", "kubernetes", "cloud-native", "devops"],
    projects: [
      {
        title: "Meshery Cloud Native Management",
        description: "Extensible multi-service mesh orchestrator supporting Istio, Linkerd, and Kubernetes infrastructure deployment.",
        techStack: ["Go", "Kubernetes", "React", "Docker"],
        difficulty: "Intermediate to Advanced",
        githubUrl: "https://github.com/meshery/meshery"
      }
    ]
  },
  {
    name: "AsyncAPI",
    slug: "asyncapi",
    logoUrl: "https://www.asyncapi.com/img/posts/asyncapi-logo.png",
    description: "Industry standard specification and open-source tooling for event-driven architectures and message brokers.",
    websiteUrl: "https://www.asyncapi.com",
    category: "API & Middleware",
    technologies: ["TypeScript", "Node.js", "Python", "Java", "JSON Schema"],
    topics: ["hacktoberfest", "asyncapi", "event-driven", "code-generators"],
    projects: [
      {
        title: "AsyncAPI CLI & Code Generators",
        description: "CLI tools and code generators for building event-driven microservices from AsyncAPI definitions.",
        techStack: ["TypeScript", "Node.js", "Docker", "CLI"],
        difficulty: "Intermediate",
        githubUrl: "https://github.com/asyncapi/cli"
      }
    ]
  },
  {
    name: "Cal.com",
    slug: "cal-com",
    logoUrl: "https://cal.com/logo.svg",
    description: "Open-source scheduling infrastructure and Calendly alternative for individuals and enterprise teams.",
    websiteUrl: "https://cal.com",
    category: "SaaS & Productivity",
    technologies: ["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL", "TailwindCSS"],
    topics: ["hacktoberfest", "scheduling", "fullstack", "nextjs"],
    projects: [
      {
        title: "Cal.com Core Scheduling Engine",
        description: "Full-stack calendar sync, video routing, payment integration, and booking engine.",
        techStack: ["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL"],
        difficulty: "Intermediate to Advanced",
        githubUrl: "https://github.com/calcom/cal.com"
      }
    ]
  },
  {
    name: "Strapi",
    slug: "strapi",
    logoUrl: "https://strapi.io/assets/strapi-logo-dark.svg",
    description: "Leading open-source headless CMS giving developers freedom to use preferred frameworks and tools.",
    websiteUrl: "https://strapi.io",
    category: "Content Management",
    technologies: ["JavaScript", "TypeScript", "Node.js", "React", "GraphQL"],
    topics: ["hacktoberfest", "cms", "headless-cms", "nodejs"],
    projects: [
      {
        title: "Strapi Headless CMS Engine",
        description: "Customizable Node.js API framework with auto-generated REST and GraphQL endpoints.",
        techStack: ["TypeScript", "Node.js", "React", "GraphQL"],
        difficulty: "Intermediate",
        githubUrl: "https://github.com/strapi/strapi"
      }
    ]
  },
  {
    name: "PostHog",
    slug: "posthog",
    logoUrl: "https://posthog.com/brand/posthog-logo.svg",
    description: "Open-source product analytics suite providing session recording, feature flags, heatmaps, and SQL queries.",
    websiteUrl: "https://posthog.com",
    category: "Analytics & Data",
    technologies: ["Python", "Django", "React", "TypeScript", "ClickHouse", "PostgreSQL"],
    topics: ["hacktoberfest", "analytics", "product-analytics", "data"],
    projects: [
      {
        title: "PostHog Analytics Core",
        description: "Product analysis platform capturing user interactions, funnel conversions, and session replays.",
        techStack: ["Python", "Django", "React", "ClickHouse"],
        difficulty: "Advanced",
        githubUrl: "https://github.com/PostHog/posthog"
      }
    ]
  },
  {
    name: "Hoppscotch",
    slug: "hoppscotch",
    logoUrl: "https://hoppscotch.io/icon.png",
    description: "Open-source API development ecosystem used by millions of developers for REST, GraphQL, and WebSocket testing.",
    websiteUrl: "https://hoppscotch.io",
    category: "Developer Tools",
    technologies: ["Vue.js", "TypeScript", "Node.js", "PWA", "TailwindCSS"],
    topics: ["hacktoberfest", "api-client", "vuejs", "pwa"],
    projects: [
      {
        title: "Hoppscotch Web & Desktop Client",
        description: "Lightweight, fast API testing environment supporting HTTP, GraphQL, WebSockets, and Server-Sent Events.",
        techStack: ["Vue.js", "TypeScript", "TailwindCSS"],
        difficulty: "Intermediate",
        githubUrl: "https://github.com/hoppscotch/hoppscotch"
      }
    ]
  }
];

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
    console.log(`Connected to MongoDB Atlas (database: ${dbName})`);
    const db = client.db(dbName);

    const programsCol = db.collection('programs');
    const orgsCol = db.collection('organizations');
    const projectsCol = db.collection('projects');

    // 1. Resolve or Seed Hacktoberfest Program
    let hfProgram = await programsCol.findOne({ slug: 'hacktoberfest' });
    if (!hfProgram) {
      console.log('Seeding Hacktoberfest program record...');
      const insertRes = await programsCol.insertOne({
        slug: 'hacktoberfest',
        name: 'Hacktoberfest',
        organizer: 'DigitalOcean',
        stipendRange: 'Swag & Digital Badge',
        durationWeeks: 4,
        tier: 3,
        accentColor: '#FF7A00',
        eligibilitySummary: 'Open to anyone worldwide, beginner friendly',
        officialWebsite: 'https://hacktoberfest.com',
        difficulty: 'Beginner Friendly',
        pastStats: [
          { year: '2025', contributors: 142000, orgs: 8200, projects: 24000 },
          { year: '2024', contributors: 153000, orgs: 9100, projects: 28000 }
        ],
        lastVerifiedAt: new Date()
      });
      hfProgram = { _id: insertRes.insertedId, name: 'Hacktoberfest', slug: 'hacktoberfest' };
    }
    const hfProgramId = hfProgram._id;
    console.log(`Hacktoberfest Program ID: ${hfProgramId}`);

    let orgsUpserted = 0;
    let projectsUpserted = 0;

    for (const orgData of HACKTOBERFEST_ORGS_DATA) {
      const orgFilter = { slug: orgData.slug };
      const orgUpdate = {
        $set: {
          name: orgData.name,
          slug: orgData.slug,
          programId: hfProgramId,
          programSlug: 'hacktoberfest',
          programName: 'Hacktoberfest',
          programColor: '#FF7A00',
          logoUrl: orgData.logoUrl,
          description: orgData.description,
          websiteUrl: orgData.websiteUrl,
          category: orgData.category,
          technologies: orgData.technologies,
          topics: orgData.topics,
          years: [2024, 2025],
          is2026: true,
          is2025: true,
          projectCount: orgData.projects.length,
          lastSyncedAt: new Date()
        }
      };

      const orgRes = await orgsCol.updateOne(orgFilter, orgUpdate, { upsert: true });
      if (orgRes.upsertedCount > 0 || orgRes.modifiedCount > 0) {
        orgsUpserted++;
      }

      const dbOrg = await orgsCol.findOne(orgFilter);
      const orgId = dbOrg?._id;

      for (const projData of orgData.projects) {
        const projSlug = toKebabCase(projData.title);
        const projFilter = { orgSlug: orgData.slug, title: projData.title };
        const projUpdate = {
          $set: {
            title: projData.title,
            slug: projSlug,
            org: orgData.name,
            orgSlug: orgData.slug,
            orgId: orgId,
            programId: hfProgramId,
            programSlug: 'hacktoberfest',
            programName: 'Hacktoberfest',
            programColor: '#FF7A00',
            description: projData.description,
            techStack: projData.techStack,
            difficulty: projData.difficulty,
            year: 2025,
            githubUrl: projData.githubUrl,
            stars: 1200 + Math.floor(Math.random() * 4500),
            updatedAt: new Date()
          }
        };

        const projRes = await projectsCol.updateOne(projFilter, projUpdate, { upsert: true });
        if (projRes.upsertedCount > 0 || projRes.modifiedCount > 0) {
          projectsUpserted++;
        }
      }
    }

    console.log(`\nHacktoberfest Data Sync Complete:`);
    console.log(`- Upserted Organizations: ${orgsUpserted}`);
    console.log(`- Upserted Projects: ${projectsUpserted}`);
  } catch (error) {
    console.error('Error during Hacktoberfest data sync:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

main();
