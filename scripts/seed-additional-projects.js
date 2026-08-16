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
  {
    programSlug: 'outreachy',
    org: {
      name: 'Mozilla',
      slug: 'mozilla-outreachy',
      description: 'Mozilla is a global non-profit dedicated to keeping the internet open, accessible, and safe for everyone.',
      websiteUrl: 'https://mozilla.org',
      category: 'Web Technology & Security',
      technologies: ['javascript', 'rust', 'python', 'cpp'],
      topics: ['web-browser', 'privacy', 'developer-tools'],
      years: [2026, 2025, 2024],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Firefox DevTools Inspector Performance Telemetry',
        description: 'Implement high-resolution DOM mutation profiling and memory footprint tracking inside Firefox Developer Tools.',
        difficulty: 'Intermediate',
        techStack: ['javascript', 'html', 'css'],
        githubUrl: 'https://github.com/mozilla/gecko-dev',
        stars: 7600,
        mentors: ['Victoria Wang', 'Harald Kirschner'],
        topics: ['devtools', 'firefox', 'performance'],
        year: 2026,
      },
      {
        title: 'Rust WebAssembly Security Sandbox Audit',
        description: 'Develop automated security assertion benchmarks for WebAssembly memory boundary checks in SpiderMonkey.',
        difficulty: 'Advanced',
        techStack: ['rust', 'webassembly', 'cpp'],
        githubUrl: 'https://github.com/mozilla/gecko-dev',
        stars: 7600,
        mentors: ['Yury Delendik'],
        topics: ['security', 'wasm', 'rust'],
        year: 2025,
      }
    ]
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'Fedora Project',
      slug: 'fedora-outreachy',
      description: 'The Fedora Project is an innovative open-source Linux distribution community sponsored by Red Hat.',
      websiteUrl: 'https://fedoraproject.org',
      category: 'Operating Systems',
      technologies: ['python', 'bash', 'ansible', 'containerd'],
      topics: ['linux', 'sysadmin', 'cloud'],
      years: [2026, 2025],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'Fedora Infrastructure Health Dashboard',
      description: 'Build a centralized React & Python dashboard tracking real-time mirror status, build farm telemetry, and release pipelines.',
      difficulty: 'Intermediate',
      techStack: ['python', 'react', 'typescript'],
      githubUrl: 'https://github.com/fedora-infra/fedora-hub',
      stars: 920,
      mentors: ['Sumantro Mukherjee', 'Marie Nordin'],
      topics: ['dashboard', 'devops', 'fedora'],
      year: 2026,
    }
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'Open Robotics (OSRF)',
      slug: 'osrf-outreachy',
      description: 'Open Robotics creates open-source software and hardware platforms for robotics research and education.',
      websiteUrl: 'https://www.openrobotics.org',
      category: 'Robotics & Hardware',
      technologies: ['python', 'cpp', 'ros', 'gazebo'],
      topics: ['robotics', 'simulation', 'autonomous-systems'],
      years: [2026, 2024],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'ROS 2 Web Visualizer Node Diagnostics',
      description: 'Create real-time WebSocket node telemetry tools for Gazebo robot simulations in modern web browsers.',
      difficulty: 'Intermediate',
      techStack: ['python', 'typescript', 'ros'],
      githubUrl: 'https://github.com/ros2/ros2',
      stars: 3400,
      mentors: ['Louise Poubel', 'Katherine Scott'],
      topics: ['robotics', 'ros2', 'visualization'],
      year: 2026,
    }
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'Tor Project',
      slug: 'tor-outreachy',
      description: 'The Tor Project develops free and open-source software for online anonymity and privacy protection.',
      websiteUrl: 'https://torproject.org',
      category: 'Privacy & Security',
      technologies: ['c', 'rust', 'python', 'android'],
      topics: ['privacy', 'anonymity', 'networking'],
      years: [2026, 2025, 2024],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'Tor Browser Android UX Accessibility Enhancement',
      description: 'Audit and rebuild mobile screen reader navigation flow for Tor Browser on Android devices.',
      difficulty: 'Intermediate',
      techStack: ['kotlin', 'java', 'android'],
      githubUrl: 'https://gitlab.torproject.org/tpo/applications/tor-browser',
      stars: 2100,
      mentors: ['Isabela Bagueros', 'GeckoSec'],
      topics: ['mobile', 'accessibility', 'privacy'],
      year: 2026,
    }
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'Homebrew',
      slug: 'homebrew-outreachy',
      description: 'Homebrew is the premier free and open-source package manager for macOS and Linux.',
      websiteUrl: 'https://brew.sh',
      category: 'Developer Tools',
      technologies: ['ruby', 'bash', 'go'],
      topics: ['package-manager', 'cli', 'macos'],
      years: [2026, 2025],
      is2026: true,
      projectCount: 1,
    },
    project: {
      title: 'Homebrew Bottle Ingestion & Security Verification',
      description: 'Automate SHA-256 binary bottle integrity checking and mirror fallback routing in Ruby.',
      difficulty: 'Intermediate',
      techStack: ['ruby', 'bash'],
      githubUrl: 'https://github.com/Homebrew/brew',
      stars: 41200,
      mentors: ['Mike McQuaid', 'Issy Long'],
      topics: ['homebrew', 'ruby', 'cli'],
      year: 2026,
    }
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'Bioconductor',
      slug: 'bioconductor-outreachy',
      description: 'Bioconductor provides tools for the analysis and comprehension of high-throughput genomic data using R and statistical computing.',
      websiteUrl: 'https://bioconductor.org',
      category: 'Bioinformatics & Science',
      technologies: ['r', 'python', 'bioconductor', 'shiny'],
      topics: ['genomics', 'bioinformatics', 'data-science'],
      years: [2026, 2025, 2024],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Single-Cell RNA Sequence Quality Metrics Visualizer',
        description: 'Build an interactive Shiny & R package for single-cell transcriptomics QC analysis and automated artifact reporting.',
        difficulty: 'Intermediate',
        techStack: ['r', 'shiny', 'python'],
        githubUrl: 'https://github.com/Bioconductor/BiocManager',
        stars: 1850,
        mentors: ['Lori Shepherd', 'Aedin Culhane'],
        topics: ['genomics', 'r-package', 'visualization'],
        year: 2026,
      },
      {
        title: 'Spatial Transcriptomics Pipeline Optimization',
        description: 'Accelerate genomic matrix transformations and multi-sample alignment routines for high-dimensional spatial datasets.',
        difficulty: 'Advanced',
        techStack: ['r', 'cpp', 'python'],
        githubUrl: 'https://github.com/Bioconductor/BiocParallel',
        stars: 1420,
        mentors: ['Martin Morgan', 'Vincent Carey'],
        topics: ['performance', 'bioinformatics', 'r'],
        year: 2025,
      }
    ]
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'Creative Commons',
      slug: 'creative-commons-outreachy',
      description: 'Creative Commons is a global non-profit enabling the sharing and reuse of creativity and knowledge through free legal tools.',
      websiteUrl: 'https://creativecommons.org',
      category: 'Open Knowledge & Licensing',
      technologies: ['python', 'vue', 'javascript', 'django'],
      topics: ['licensing', 'open-content', 'api'],
      years: [2026, 2025, 2024],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Creative Commons Catalog API Search Refinement',
        description: 'Implement faceted license filtering, image resolution metadata indexing, and ElasticSearch querying in CC Search API.',
        difficulty: 'Intermediate',
        techStack: ['python', 'django', 'vue'],
        githubUrl: 'https://github.com/creativecommons/cc-search-api',
        stars: 3200,
        mentors: ['Timid Robot Zehta', 'Hugo Solar'],
        topics: ['api', 'elasticsearch', 'django'],
        year: 2026,
      },
      {
        title: 'CC Chooser Interactive License Selector Modernization',
        description: 'Redesign the CC License Chooser web app with accessible WCAG 2.1 compliance and multi-language internationalization.',
        difficulty: 'Intermediate',
        techStack: ['vue', 'javascript', 'css'],
        githubUrl: 'https://github.com/creativecommons/chooser',
        stars: 890,
        mentors: ['Timid Robot Zehta'],
        topics: ['vue', 'accessibility', 'i18n'],
        year: 2025,
      }
    ]
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'Debian',
      slug: 'debian-outreachy',
      description: 'Debian is a universal open-source operating system created by a global community of volunteer developers.',
      websiteUrl: 'https://debian.org',
      category: 'Operating Systems',
      technologies: ['python', 'perl', 'bash', 'c'],
      topics: ['linux', 'packaging', 'security'],
      years: [2026, 2025, 2024],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Debian Package Reproducible Builds Telemetry',
        description: 'Enhance automated build validation tools to track binary package determinism across ARM64 and RISC-V targets.',
        difficulty: 'Advanced',
        techStack: ['python', 'bash', 'perl'],
        githubUrl: 'https://salsa.debian.org/reproducible-builds/reproducible-website',
        stars: 1650,
        mentors: ['Holger Levsen', 'Vagrant Cascadian'],
        topics: ['reproducible-builds', 'security', 'debian'],
        year: 2026,
      },
      {
        title: 'Debian Continuous Integration Auto-Pkgtest Suite',
        description: 'Expand automated integration test coverage for core Python library dependencies across unstable repositories.',
        difficulty: 'Intermediate',
        techStack: ['python', 'bash'],
        githubUrl: 'https://salsa.debian.org/ci-team/autopkgtest',
        stars: 940,
        mentors: ['Antonio Terceiro'],
        topics: ['ci-cd', 'testing', 'linux'],
        year: 2025,
      }
    ]
  },
  {
    programSlug: 'outreachy',
    org: {
      name: 'The Rust Project',
      slug: 'rust-outreachy',
      description: 'The Rust Project empowers developers to build reliable and efficient systems software with memory safety guarantees.',
      websiteUrl: 'https://www.rust-lang.org',
      category: 'Programming Languages & Compilers',
      technologies: ['rust', 'cargo', 'wasm', 'llvm'],
      topics: ['compiler', 'memory-safety', 'cli'],
      years: [2026, 2025],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Cargo Dependency Vulnerability Audit Tooling',
        description: 'Build automated advisory database resolution and cargo audit warning highlights directly in Cargo CLI.',
        difficulty: 'Intermediate',
        techStack: ['rust', 'cargo'],
        githubUrl: 'https://github.com/rust-lang/cargo',
        stars: 13500,
        mentors: ['Eric Huss', 'Weihang Lo'],
        topics: ['rust', 'cargo', 'cli'],
        year: 2026,
      },
      {
        title: 'Rustc Error Message Diagnostics Polish',
        description: 'Improve compiler diagnostic suggestions and span formatting for async/await closure type mismatches.',
        difficulty: 'Advanced',
        techStack: ['rust', 'llvm'],
        githubUrl: 'https://github.com/rust-lang/rust',
        stars: 98000,
        mentors: ['Esteban Küber', 'David Wood'],
        topics: ['compiler', 'rust', 'diagnostics'],
        year: 2025,
      }
    ]
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
