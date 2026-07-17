const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI ?? '';
if (!uri) {
  console.error('Missing MONGODB_URI. Exiting.');
  process.exit(1);
}

function resolveDatabaseName() {
  if (process.env.MONGODB_DB && process.env.MONGODB_DB.trim()) {
    return process.env.MONGODB_DB.trim();
  }
  try {
    const url = new URL(uri);
    const path = url.pathname.replace(/^\//, '');
    if (path) return path;
  } catch (e) {
    // Ignore invalid url parse
  }
  return 'gsoc-hub';
}

const dbName = resolveDatabaseName();

const additionalOrgs = [
  // Outreachy Orgs
  {
    programSlug: 'outreachy',
    org: {
      name: 'Wikimedia Foundation',
      slug: 'wikimedia-outreachy',
      description: 'The Wikimedia Foundation is a non-profit organization that hosts Wikipedia and other free-knowledge projects.',
      websiteUrl: 'https://wikimediafoundation.org',
      category: 'Media & Knowledge',
      technologies: ['python', 'javascript', 'php', 'react'],
      topics: ['wiki', 'localization', 'open-knowledge'],
      years: [2026],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'MediaWiki Translation Workflow Improvements',
      description: 'Enhance the translation interface in MediaWiki to offer real-time translation previews and structured translation statistics.',
      difficulty: 'Intermediate',
      techStack: ['javascript', 'php', 'react'],
      githubUrl: 'https://github.com/wikimedia/mediawiki',
      stars: 4800,
      mentors: ['Amir Aharoni', 'Niklas Laxström'],
      topics: ['localization', 'ui-design', 'mediawiki'],
      year: 2026,
    }
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'GNOME Foundation',
      slug: 'gnome-outreachy',
      description: 'GNOME is a free and open-source desktop environment and application framework for Unix-like operating systems.',
      websiteUrl: 'https://gnome.org',
      category: 'Desktop Environment',
      technologies: ['c', 'rust', 'gtk', 'python'],
      topics: ['desktop', 'accessibility', 'linux'],
      years: [2026],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'Enhance GNOME Settings Accessibility Control Panel',
      description: 'Rebuild accessibility controls in GNOME Settings with modernized UX and custom screen reader toggle parameters.',
      difficulty: 'Advanced',
      techStack: ['c', 'rust', 'gtk'],
      githubUrl: 'https://gitlab.gnome.org/GNOME/gnome-control-center',
      stars: 1200,
      mentors: ['Georges Basile Stavracas Neto'],
      topics: ['accessibility', 'desktop', 'ui-ux'],
      year: 2026,
    }
  },
  // LFX Orgs
  {
    programSlug: 'lfx',
    org: {
      name: 'Cloud Native Computing Foundation',
      slug: 'cncf-lfx',
      description: 'The Cloud Native Computing Foundation (CNCF) hosts critical components of global cloud infrastructure, including Kubernetes and Prometheus.',
      websiteUrl: 'https://cncf.io',
      category: 'Cloud Infrastructure',
      technologies: ['go', 'golang', 'kubernetes', 'prometheus', 'docker'],
      topics: ['cloud-native', 'microservices', 'kubernetes'],
      years: [2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Prometheus Web UI Alerting Improvements',
        description: 'Modernize the Prometheus alerts visualizer layout with HSL colors, active search filtering, and silences detail overlays.',
        difficulty: 'Intermediate',
        techStack: ['go', 'react', 'typescript'],
        githubUrl: 'https://github.com/prometheus/prometheus',
        stars: 10400,
        mentors: ['Julien Pivotto', 'Richard Hartmann'],
        topics: ['monitoring', 'metrics', 'ui-ux'],
        year: 2026,
      },
      {
        title: 'KubeEdge Edge-Cloud Communication Gateway',
        description: 'Implement secure MQTT message validation and client heartbeat protocols inside KubeEdge edge node gateways.',
        difficulty: 'Advanced',
        techStack: ['go', 'golang', 'kubernetes'],
        githubUrl: 'https://github.com/kubeedge/kubeedge',
        stars: 6200,
        mentors: ['Kevin Wang', 'Fisher Xu'],
        topics: ['iot', 'edge-computing', 'gateways'],
        year: 2026,
      }
    ]
  },
  {
    programSlug: 'lfx',
    org: {
      name: 'Hyperledger Foundation',
      slug: 'hyperledger-lfx',
      description: 'Hyperledger Foundation is a global enterprise-grade blockchain consortium hosted by the Linux Foundation.',
      websiteUrl: 'https://hyperledger.org',
      category: 'Blockchain & Ledgers',
      technologies: ['go', 'rust', 'typescript', 'docker'],
      topics: ['blockchain', 'distributed-systems', 'cryptography'],
      years: [2026],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'Hyperledger Fabric Node.js Smart Contract SDK v3',
      description: 'Refactor client connection states and transaction submission handlers for the Node.js smart contract SDK.',
      difficulty: 'Advanced',
      techStack: ['typescript', 'javascript', 'docker'],
      githubUrl: 'https://github.com/hyperledger/fabric-sdk-node',
      stars: 3500,
      mentors: ['David Enyeart', 'Jim Zhang'],
      topics: ['blockchain', 'sdk', 'smart-contracts'],
      year: 2026,
    }
  },
  // MLH Orgs
  {
    programSlug: 'mlh-fellowship',
    org: {
      name: 'Meta Open Source',
      slug: 'meta-mlh',
      description: 'Meta Open Source maintains leading libraries and platforms like React, PyTorch, React Native, and Docusaurus.',
      websiteUrl: 'https://opensource.fb.com',
      category: 'Frameworks & Tools',
      technologies: ['react', 'react-native', 'typescript', 'javascript'],
      topics: ['frontend', 'cross-platform', 'devtools'],
      years: [2026],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'React Server Components DevTools Inspector',
      description: 'Build a browser extension panel to trace React Server Component payload streams and component render times.',
      difficulty: 'Intermediate',
      techStack: ['react', 'typescript', 'javascript'],
      githubUrl: 'https://github.com/facebook/react',
      stars: 224000,
      mentors: ['Dan Abramov', 'Andrew Clark'],
      topics: ['react', 'devtools', 'profiling'],
      year: 2026,
    }
  },
  {
    programSlug: 'mlh-fellowship',
    org: {
      name: 'Hugging Face',
      slug: 'huggingface-mlh',
      description: 'Hugging Face is the hub for AI and machine learning, hosting models, datasets, and open-source ML libraries.',
      websiteUrl: 'https://huggingface.co',
      category: 'Artificial Intelligence',
      technologies: ['python', 'pytorch', 'transformers', 'rust'],
      topics: ['llm', 'machine-learning', 'nlp'],
      years: [2026],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'Transformers Model Quantization Helper',
      description: 'Implement automated model quantization pipelines (GPTQ, AWQ) for faster edge-based model compilation.',
      difficulty: 'Advanced',
      techStack: ['python', 'pytorch'],
      githubUrl: 'https://github.com/huggingface/transformers',
      stars: 125000,
      mentors: ['Lysandre Debut', 'Sylvain Gugger'],
      topics: ['llm', 'optimization', 'quantization'],
      year: 2026,
    }
  },
  // GSSoC Orgs
  {
    programSlug: 'gssoc',
    org: {
      name: 'GirlScript Foundation',
      slug: 'girlscript-gssoc',
      description: 'GirlScript Foundation is an educational organization in India focused on tech diversity and open source learning.',
      websiteUrl: 'https://girlscript.tech',
      category: 'Education & Community',
      technologies: ['javascript', 'typescript', 'react', 'node.js'],
      topics: ['diversity', 'education', 'collaboration'],
      years: [2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Contribo Collaboration Hub',
        description: 'Design and build a real-time peer mentorship matching room using WebRTC and Node.js WebSockets.',
        difficulty: 'Beginner',
        techStack: ['javascript', 'react', 'node.js'],
        githubUrl: 'https://github.com/girlscript/contribo-hub',
        stars: 890,
        mentors: ['Anubha Maneshwar', 'Srijan Sharma'],
        topics: ['webrtc', 'websockets', 'collaboration'],
        year: 2026,
      },
      {
        title: 'Developer Resource Aggregator App',
        description: 'Build a mobile-first catalog of active scholarships, GSoC roadmaps, and interview preparation materials.',
        difficulty: 'Beginner',
        techStack: ['typescript', 'react', 'next.js'],
        githubUrl: 'https://github.com/girlscript/resource-aggregator',
        stars: 520,
        mentors: ['Piyush Mehta'],
        topics: ['react', 'nextjs', 'resource-hub'],
        year: 2026,
      }
    ]
  },
  // NSoC Orgs — Nexus Spring of Code
  {
    programSlug: 'nsoc',
    org: {
      name: 'Nexus Community Projects',
      slug: 'nexus-community',
      description: 'A curated collection of open-source projects maintained by the Nexus Spring of Code community, spanning web, mobile, and developer tooling.',
      websiteUrl: 'https://nsoc.in',
      category: 'Developer Tools',
      technologies: ['javascript', 'typescript', 'react', 'python', 'go'],
      topics: ['open-source', 'community', 'developer-tools'],
      years: [2025, 2026],
      is2026: true,
      projectCount: 3,
    },
    projects: [
      {
        title: 'Open Source Contribution Tracker',
        description: 'Build a dashboard that tracks contributor activity across GitHub repos — commits, PRs, issues — and gamifies the experience with badges and streaks.',
        difficulty: 'Beginner',
        techStack: ['typescript', 'react', 'next.js', 'tailwindcss'],
        githubUrl: 'https://github.com/nsoc/contrib-tracker',
        stars: 340,
        mentors: ['Arjun Sharma', 'Diya Kapoor'],
        topics: ['react', 'github-api', 'gamification'],
        year: 2026,
      },
      {
        title: 'CLI Scaffolding Tool for Hackathons',
        description: 'Create a fast CLI tool that scaffolds hackathon project boilerplates in multiple languages and frameworks with best-practice configs pre-wired.',
        difficulty: 'Intermediate',
        techStack: ['go', 'golang', 'cli'],
        githubUrl: 'https://github.com/nsoc/hackscaffold',
        stars: 210,
        mentors: ['Priya Nair'],
        topics: ['cli', 'scaffolding', 'developer-tools'],
        year: 2026,
      },
      {
        title: 'Mentorship Matchmaker Bot',
        description: 'An intelligent Discord/Slack bot that pairs mentors with mentees based on tech interests and availability using semantic skill matching.',
        difficulty: 'Intermediate',
        techStack: ['python', 'machine learning', 'nlp', 'discord.py'],
        githubUrl: 'https://github.com/nsoc/mentor-bot',
        stars: 180,
        mentors: ['Rohan Verma', 'Sneha Gupta'],
        topics: ['nlp', 'chatbot', 'mentorship'],
        year: 2025,
      }
    ]
  },
  // ESoC Orgs — European Summer of Code
  {
    programSlug: 'esoc',
    org: {
      name: 'Vertex Applied AI Hub',
      slug: 'vertex-ai',
      description: 'Vertex Applied AI Hub develops frameworks for open-science AI applications, emphasizing compliance with modern ethics standards and the EU AI Act.',
      websiteUrl: 'https://vertex.ai',
      category: 'Artificial Intelligence',
      technologies: ['python', 'typescript', 'rust', 'pytorch'],
      topics: ['artificial-intelligence', 'machine-learning', 'applied-ai'],
      years: [2026],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'Applied AI Ethics Sandbox',
      description: 'Create a diagnostic visualizer for testing LLM outputs against Bias and Fairness metrics defined by the EU AI Act.',
      difficulty: 'Intermediate',
      techStack: ['python', 'typescript', 'react'],
      githubUrl: 'https://github.com/vertex-ai/ethics-sandbox',
      stars: 1200,
      mentors: ['Dr. Sofia Rossi', 'Lars van der Meer'],
      topics: ['ai-ethics', 'bias-detection', 'eu-ai-act'],
      year: 2026,
    }
  },
  {
    programSlug: 'esoc',
    org: {
      name: 'EuroOSS Research',
      slug: 'eurooss',
      description: 'EuroOSS Research is a collaborative laboratory dedicated to compiling and accelerating foundational system tools inside European browser systems.',
      websiteUrl: 'https://eurooss.org',
      category: 'Developer Tools',
      technologies: ['rust', 'webassembly', 'javascript'],
      topics: ['rust', 'webassembly', 'systems'],
      years: [2026],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'Rust WebAssembly Audio Synthesizer',
      description: 'Build a low-latency collaborative audio editing and synthesizer tool compiled to WebAssembly for execution directly in modern web browsers.',
      difficulty: 'Advanced',
      techStack: ['rust', 'webassembly', 'javascript'],
      githubUrl: 'https://github.com/eurooss/wasm-synth',
      stars: 940,
      mentors: ['Jean-Pierre Cloutier'],
      topics: ['audio', 'webassembly', 'rust'],
      year: 2026,
    }
  }
];

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`Connected successfully to MongoDB for additional project seeding (database: ${dbName}).`);
    const db = client.db(dbName);
    
    const programsCol = db.collection('programs');
    const orgsCol = db.collection('organizations');
    const projectsCol = db.collection('projects');

    for (const item of additionalOrgs) {
      // Find the parent program
      const program = await programsCol.findOne({ slug: item.programSlug });
      if (!program) {
        console.warn(`Program with slug "${item.programSlug}" not found. Skipping.`);
        continue;
      }

      const programId = program._id;
      const programName = program.name;
      const programColor = program.accentColor || '#C9A24B';

      // Insert organization
      const orgDoc = {
        ...item.org,
        programId: programId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Upsert org to avoid duplicates
      await orgsCol.deleteOne({ slug: item.org.slug, programId: programId });
      const orgRes = await orgsCol.insertOne(orgDoc);
      console.log(`Seeded organization: "${item.org.name}" under ${programName}.`);

      // Prepare project inserts
      const projectsToInsert = item.projects || [item.project];
      for (const p of projectsToInsert) {
        const projectDoc = {
          ...p,
          programId: programId,
          org: item.org.name,
          orgSlug: item.org.slug,
          programName: programName,
          programColor: programColor,
          createdAt: new Date()
        };

        // Remove old project with same title under same org to prevent duplicates
        await projectsCol.deleteOne({ title: p.title, orgSlug: item.org.slug });
        await projectsCol.insertOne(projectDoc);
        console.log(`  Seeded project: "${p.title}"`);
      }
    }

    console.log('Additional project seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await client.close();
  }
}

main();
