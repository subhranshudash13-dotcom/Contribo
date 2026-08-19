const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contribo';

const COMPREHENSIVE_MLH_ORGS_AND_PROJECTS = [
  {
    org: {
      name: 'Meta Open Source',
      slug: 'meta-mlh',
      description: 'Meta Open Source partners with MLH Fellowship across multiple cohorts on leading frameworks including React, PyTorch, React Native, and Docusaurus.',
      websiteUrl: 'https://opensource.fb.com',
      logoUrl: 'https://cdn.simpleicons.org/meta',
      category: 'Frameworks & Developer Tools',
      technologies: ['react', 'typescript', 'javascript', 'python', 'pytorch', 'rust'],
      topics: ['frontend', 'machine-learning', 'cross-platform', 'devtools'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 3,
    },
    projects: [
      {
        title: 'React Server Components Stream Profiler',
        description: 'Build an inspection module for debugging asynchronous streaming boundaries and streaming chunk latencies in modern React frameworks.',
        difficulty: 'Intermediate',
        techStack: ['react', 'typescript', 'javascript', 'node.js'],
        githubUrl: 'https://github.com/facebook/react',
        stars: 228000,
        mentors: ['Dan Abramov', 'Andrew Clark'],
        topics: ['react', 'devtools', 'profiling', 'performance'],
        year: 2026,
      },
      {
        title: 'PyTorch TorchScript Graph Optimization Passes',
        description: 'Implement custom compiler transformation passes to fuse tensor math kernels on ARM and AVX architectures.',
        difficulty: 'Advanced',
        techStack: ['python', 'c++', 'pytorch', 'cuda'],
        githubUrl: 'https://github.com/pytorch/pytorch',
        stars: 87000,
        mentors: ['Soumith Chintala', 'Edward Yang'],
        topics: ['deep-learning', 'compiler', 'gpu', 'optimization'],
        year: 2026,
      },
      {
        title: 'Docusaurus Internationalization & Search Engine v3',
        description: 'Upgrade the offline indexing and multi-lingual layout algorithms for high-throughput developer documentation portals.',
        difficulty: 'Beginner',
        techStack: ['react', 'typescript', 'javascript'],
        githubUrl: 'https://github.com/facebook/docusaurus',
        stars: 56000,
        mentors: ['Sébastien Lorber'],
        topics: ['documentation', 'ssg', 'jamstack'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Hugging Face',
      slug: 'huggingface-mlh',
      description: 'Hugging Face provides open-source libraries, datasets, and collaborative tools democratizing artificial intelligence and machine learning.',
      websiteUrl: 'https://huggingface.co',
      logoUrl: 'https://cdn.simpleicons.org/huggingface',
      category: 'Artificial Intelligence & Machine Learning',
      technologies: ['python', 'pytorch', 'transformers', 'rust', 'gradio'],
      topics: ['llm', 'nlp', 'computer-vision', 'machine-learning'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Transformers Quantization & FlashAttention Kernel Support',
        description: 'Integrate automated 4-bit and 8-bit model weight quantization with fused FlashAttention-2 operators for efficient inference.',
        difficulty: 'Advanced',
        techStack: ['python', 'pytorch', 'cuda', 'c++'],
        githubUrl: 'https://github.com/huggingface/transformers',
        stars: 135000,
        mentors: ['Sylvain Gugger', 'Arthur Zucker'],
        topics: ['transformers', 'llm', 'inference', 'quantization'],
        year: 2026,
      },
      {
        title: 'Gradio Multi-Modal Canvas & Streaming Chatbot Interface',
        description: 'Enhance interactive web canvas components for image inpainting, audio streaming, and low-latency token streaming.',
        difficulty: 'Intermediate',
        techStack: ['python', 'typescript', 'svelte', 'fastapi'],
        githubUrl: 'https://github.com/gradio-app/gradio',
        stars: 34000,
        mentors: ['Abubakar Abid', 'Freddy Boulton'],
        topics: ['gradio', 'ui', 'streaming', 'ai-apps'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Solana Foundation',
      slug: 'solana-mlh',
      description: 'Solana is a high-performance open-source blockchain supporting builders around the world in DeFi, NFTs, and Web3 infrastructure.',
      websiteUrl: 'https://solana.com',
      logoUrl: 'https://cdn.simpleicons.org/solana',
      category: 'Blockchain & Web3',
      technologies: ['rust', 'typescript', 'solana', 'anchor', 'web3.js'],
      topics: ['web3', 'blockchain', 'cryptography', 'distributed-systems'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Solana Web3.js v2 SDK Performance & RPC Subscription Overhaul',
        description: 'Refactor the client JavaScript/TypeScript RPC client to utilize zero-allocation binary parsing and WebSocket state cache.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'javascript', 'web3.js', 'solana'],
        githubUrl: 'https://github.com/solana-labs/solana-web3.js',
        stars: 4800,
        mentors: ['Steven Lu', 'Jordan Sexton'],
        topics: ['sdk', 'web3', 'cryptography', 'rpc'],
        year: 2026,
      },
      {
        title: 'Anchor Framework Smart Contract Verification CLI',
        description: 'Develop automated build verification tooling ensuring on-chain bytecodes match source Git repository releases deterministically.',
        difficulty: 'Advanced',
        techStack: ['rust', 'solana', 'docker'],
        githubUrl: 'https://github.com/coral-xyz/anchor',
        stars: 4200,
        mentors: ['Armani Ferrante'],
        topics: ['rust', 'smart-contracts', 'security'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'AWS Open Source',
      slug: 'aws-mlh',
      description: 'AWS Open Source sponsors developer fellows working on OpenSearch, AWS Amplify, and AWS Cloud Development Kit (CDK).',
      websiteUrl: 'https://aws.amazon.com/opensource',
      logoUrl: 'https://cdn.simpleicons.org/amazonwebservices',
      category: 'Cloud & Infrastructure',
      technologies: ['typescript', 'java', 'go', 'python', 'aws'],
      topics: ['cloud', 'infrastructure-as-code', 'search', 'devops'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'OpenSearch Vector Search Engine HNSW Index Optimization',
        description: 'Enhance high-dimensional vector search indexing throughput for retrieval-augmented generation (RAG) applications.',
        difficulty: 'Advanced',
        techStack: ['java', 'c++', 'opensearch'],
        githubUrl: 'https://github.com/opensearch-project/OpenSearch',
        stars: 9500,
        mentors: ['Charlotte Henkle', 'Navneet Verma'],
        topics: ['search', 'vector-search', 'ai-database'],
        year: 2026,
      },
      {
        title: 'AWS Amplify Next.js App Router Native Adapter',
        description: 'Add zero-config authentication and cookie handling support for Next.js App Router server actions and middleware.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'react', 'next.js', 'aws-amplify'],
        githubUrl: 'https://github.com/aws-amplify/amplify-js',
        stars: 6200,
        mentors: ['Ashneet Khurana', 'Nader Dabit'],
        topics: ['frontend', 'auth', 'cloud', 'serverless'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'GitHub',
      slug: 'github-mlh',
      description: 'GitHub sponsors MLH Fellowship cohorts contributing to the GitHub CLI, Octokit developer libraries, and Actions runner ecosystem.',
      websiteUrl: 'https://github.com',
      logoUrl: 'https://cdn.simpleicons.org/github',
      category: 'Developer Tools & Platforms',
      technologies: ['go', 'typescript', 'ruby', 'graphql'],
      topics: ['devtools', 'cli', 'automation', 'cicd'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'GitHub CLI Interactive Extension Ecosystem Tools',
        description: 'Implement enhanced terminal UI widgets and interactive prompts for gh extensions and repository management.',
        difficulty: 'Intermediate',
        techStack: ['go', 'terminal-ui', 'graphql'],
        githubUrl: 'https://github.com/cli/cli',
        stars: 38000,
        mentors: ['Nate Smith', 'Vilmantas Vaitkus'],
        topics: ['cli', 'golang', 'developer-experience'],
        year: 2026,
      },
      {
        title: 'Octokit Modern REST API Client Code Generator',
        description: 'Automate TypeScript typing generation directly from OpenAPI 3.1 specifications with end-to-end type safety.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'javascript', 'node.js'],
        githubUrl: 'https://github.com/octokit/octokit.js',
        stars: 5600,
        mentors: ['Gregor Martynus'],
        topics: ['sdk', 'typescript', 'openapi'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Red Hat',
      slug: 'redhat-mlh',
      description: 'Red Hat is the world leading provider of enterprise open source solutions, collaborating with fellows on containers, Kubernetes, and Linux tools.',
      websiteUrl: 'https://redhat.com',
      logoUrl: 'https://cdn.simpleicons.org/redhat',
      category: 'Operating Systems & Infrastructure',
      technologies: ['go', 'python', 'rust', 'c', 'kubernetes', 'podman'],
      topics: ['containers', 'linux', 'devops', 'virtualization'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Podman Desktop Multi-Cluster Kubernetes Bridge',
        description: 'Create an integrated cluster topology visualizer in Podman Desktop for Kind and Minikube local container clusters.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'electron', 'svelte', 'docker', 'kubernetes'],
        githubUrl: 'https://github.com/containers/podman-desktop',
        stars: 6400,
        mentors: ['Florent Benoit', 'Stevan Le Meur'],
        topics: ['containers', 'desktop-ui', 'kubernetes'],
        year: 2026,
      },
      {
        title: 'Ansible Core Execution Environment Telemetry Optimizer',
        description: 'Profile module startup times across containerized Ansible Runner environments and optimize playbook dispatching.',
        difficulty: 'Advanced',
        techStack: ['python', 'ansible', 'linux'],
        githubUrl: 'https://github.com/ansible/ansible',
        stars: 62000,
        mentors: ['Matt Davis', 'Gundalow'],
        topics: ['automation', 'python', 'configuration-management'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Shopify Open Source',
      slug: 'shopify-mlh',
      description: 'Shopify develops open-source tools powering commerce at global scale, including React Native Skia, Hydrogen, and Liquid template engines.',
      websiteUrl: 'https://shopify.engineering',
      logoUrl: 'https://cdn.simpleicons.org/shopify',
      category: 'Web Frameworks & Mobile',
      technologies: ['ruby', 'typescript', 'react', 'react-native', 'c++'],
      topics: ['mobile', 'graphics', 'e-commerce', 'web-development'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'React Native Skia High-Performance 2D Shader Animations',
        description: 'Build custom Skia GLSL shader primitives and reactive motion transitions for smooth 60fps mobile interfaces.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'c++', 'react-native', 'skia'],
        githubUrl: 'https://github.com/shopify/react-native-skia',
        stars: 12000,
        mentors: ['Christian Falch', 'William Candillon'],
        topics: ['mobile', 'graphics', 'shaders', 'react-native'],
        year: 2026,
      },
      {
        title: 'Hydrogen Headless Commerce Next-Gen Cache Engine',
        description: 'Develop distributed edge caching strategies using Web Standard Cache API for sub-50ms storefront responses.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'react', 'remix', 'graphql'],
        githubUrl: 'https://github.com/Shopify/hydrogen',
        stars: 5300,
        mentors: ['Bret Little', 'Scott Domes'],
        topics: ['e-commerce', 'edge-computing', 'graphql'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Adobe Open Source',
      slug: 'adobe-mlh',
      description: 'Adobe Open Source drives accessible design system libraries and web components including React Spectrum and Spectrum CSS.',
      websiteUrl: 'https://opensource.adobe.com',
      logoUrl: 'https://cdn.simpleicons.org/adobe',
      category: 'UI/UX & Design Systems',
      technologies: ['typescript', 'javascript', 'react', 'html', 'css'],
      topics: ['accessibility', 'design-system', 'ui-components'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'React Aria Multi-Modal Date & Range Picker Accessibility Overhaul',
        description: 'Implement full WAI-ARIA 1.2 screen-reader keyboard interaction models with localized calendar formatting.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'react', 'aria', 'accessibility'],
        githubUrl: 'https://github.com/adobe/react-spectrum',
        stars: 13000,
        mentors: ['Devon Govett', 'Robert Flack'],
        topics: ['accessibility', 'design-system', 'react'],
        year: 2026,
      },
      {
        title: 'Spectrum Web Components Color Picker & Contrast Analyzer',
        description: 'Create standalone Web Components for WCAG 2.1 AAA color contrast validation and palette generation.',
        difficulty: 'Beginner',
        techStack: ['typescript', 'lit-html', 'css'],
        githubUrl: 'https://github.com/adobe/spectrum-web-components',
        stars: 1400,
        mentors: ['Westbrook Johnson'],
        topics: ['web-components', 'ui', 'frontend'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Sentry',
      slug: 'sentry-mlh',
      description: 'Sentry is the open-source application monitoring platform that helps developers see what matters, solve what is broken, and learn continuously.',
      websiteUrl: 'https://sentry.io',
      logoUrl: 'https://cdn.simpleicons.org/sentry',
      category: 'Monitoring & Observability',
      technologies: ['python', 'typescript', 'rust', 'go', 'react'],
      topics: ['observability', 'debugging', 'performance', 'tracing'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Sentry JavaScript SDK Automatic Distributed Tracing for AI Endpoints',
        description: 'Auto-instrument OpenAI, Anthropic, and LangChain API requests to record token counts, latency breakdowns, and prompt metadata.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'javascript', 'node.js', 'opentelemetry'],
        githubUrl: 'https://github.com/getsentry/sentry-javascript',
        stars: 8400,
        mentors: ['Lukas Stracke', 'Abhijeet Prasad'],
        topics: ['observability', 'llm-tracing', 'sdk'],
        year: 2026,
      },
      {
        title: 'Sentry Python SDK Asynchronous Profiling Support',
        description: 'Integrate low-overhead wall-time profiling for FastAPI and AsyncIO task loops on Python 3.12+.',
        difficulty: 'Advanced',
        techStack: ['python', 'c', 'asyncio'],
        githubUrl: 'https://github.com/getsentry/sentry-python',
        stars: 2100,
        mentors: ['Anton Pirker', 'Armin Ronacher'],
        topics: ['profiling', 'python', 'performance'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Apollo GraphQL',
      slug: 'apollo-mlh',
      description: 'Apollo GraphQL builds the open-source supergraph platform connecting APIs, microservices, and apps seamlessly.',
      websiteUrl: 'https://apollographql.com',
      logoUrl: 'https://cdn.simpleicons.org/apollographql',
      category: 'API & GraphQL Infrastructure',
      technologies: ['rust', 'typescript', 'graphql', 'kotlin'],
      topics: ['graphql', 'apis', 'federation', 'supergraph'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Apollo Router Rust Plugin for Distributed Rate Limiting',
        description: 'Develop a high-throughput Rust plugin for Redis-backed token bucket rate limiting across federated GraphQL subgraphs.',
        difficulty: 'Advanced',
        techStack: ['rust', 'graphql', 'redis'],
        githubUrl: 'https://github.com/apollographql/router',
        stars: 3100,
        mentors: ['Benoit Lubek', 'Jesse Rosenberger'],
        topics: ['rust', 'graphql', 'networking', 'performance'],
        year: 2026,
      },
      {
        title: 'Apollo Client v4 DevTools Cache Visualizer',
        description: 'Re-engineer the browser extension interface to display real-time normalized cache entity graphs and invalidation cycles.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'react', 'graphql'],
        githubUrl: 'https://github.com/apollographql/apollo-client',
        stars: 19500,
        mentors: ['Alessia Bellisario', 'Jerel Miller'],
        topics: ['graphql', 'devtools', 'frontend'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Vercel Open Source',
      slug: 'vercel-mlh',
      description: 'Vercel develops open-source frameworks and tools empowering frontend developers, including Next.js, Turborepo, and the AI SDK.',
      websiteUrl: 'https://vercel.com/open-source',
      logoUrl: 'https://cdn.simpleicons.org/vercel',
      category: 'Web Frameworks & Tooling',
      technologies: ['rust', 'typescript', 'react', 'next.js', 'node.js'],
      topics: ['web-framework', 'turbopack', 'frontend', 'serverless'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Next.js Turbopack Module Federation Support',
        description: 'Develop Webpack-compatible module federation hooks inside the Rust-based Turbopack bundler core.',
        difficulty: 'Advanced',
        techStack: ['rust', 'typescript', 'next.js'],
        githubUrl: 'https://github.com/vercel/next.js',
        stars: 125000,
        mentors: ['Tim Neutkens', 'Lee Robinson'],
        topics: ['bundler', 'rust', 'nextjs', 'compiler'],
        year: 2026,
      },
      {
        title: 'Vercel AI SDK Multi-Provider Function Calling Visualizer',
        description: 'Build interactive React components for rendering streaming function calls and tool executions in real-time.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'react', 'tailwind'],
        githubUrl: 'https://github.com/vercel/ai',
        stars: 14000,
        mentors: ['Lars Karbo', 'Shu Ding'],
        topics: ['ai-sdk', 'streaming', 'react'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Supabase',
      slug: 'supabase-mlh',
      description: 'Supabase is the open-source Firebase alternative providing PostgreSQL databases, authentication, instant APIs, and vector storage.',
      websiteUrl: 'https://supabase.com',
      logoUrl: 'https://cdn.simpleicons.org/supabase',
      category: 'Databases & Backend as a Service',
      technologies: ['typescript', 'elixir', 'postgresql', 'rust', 'go'],
      topics: ['database', 'baas', 'postgres', 'realtime'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Supabase Realtime Elixir Engine Clustered Presence Enhancements',
        description: 'Optimize Phoenix channel broadcast fanout for millions of concurrent websocket connections across global edge nodes.',
        difficulty: 'Advanced',
        techStack: ['elixir', 'erlang', 'postgresql'],
        githubUrl: 'https://github.com/supabase/realtime',
        stars: 7200,
        mentors: ['Wen Bo Xie', 'Thor雷神'],
        topics: ['realtime', 'elixir', 'websockets', 'distributed'],
        year: 2026,
      },
      {
        title: 'Supabase AI pgvector TypeScript Query Builder',
        description: 'Create fluent type-safe query builders for hybrid keyword and cosine distance vector search in PostgreSQL.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'postgresql', 'node.js'],
        githubUrl: 'https://github.com/supabase/supabase-js',
        stars: 18000,
        mentors: ['Alaister Young', 'Oliver Rice'],
        topics: ['vector-search', 'postgres', 'typescript'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Cloudflare',
      slug: 'cloudflare-mlh',
      description: 'Cloudflare collaborates with MLH fellows on open-source edge computing tools, Wrangler CLI, and Web Standards runtime Workerd.',
      websiteUrl: 'https://cloudflare.com',
      logoUrl: 'https://cdn.simpleicons.org/cloudflare',
      category: 'Edge Computing & Networking',
      technologies: ['typescript', 'c++', 'rust', 'javascript'],
      topics: ['edge-computing', 'serverless', 'web-standards', 'cli'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Wrangler CLI Local Network Multi-Worker Service Simulator',
        description: 'Improve Miniflare service-to-service RPC bindings and local D1 database schema migration replays.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'node.js', 'sqlite'],
        githubUrl: 'https://github.com/cloudflare/workers-sdk',
        stars: 5800,
        mentors: ['Brendan Coll', 'Sunil Pai'],
        topics: ['cli', 'devtools', 'edge', 'serverless'],
        year: 2026,
      },
      {
        title: 'Workerd V8 Runtime Web Streams Spec Compliance',
        description: 'Implement TransformStream backpressure evaluations and compression stream polyfills in the C++ Workerd runtime.',
        difficulty: 'Advanced',
        techStack: ['c++', 'v8', 'capnp'],
        githubUrl: 'https://github.com/cloudflare/workerd',
        stars: 6200,
        mentors: ['Kenton Varda', 'Harris Miller'],
        topics: ['runtime', 'c++', 'v8', 'web-standards'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Stripe Open Source',
      slug: 'stripe-mlh',
      description: 'Stripe develops open source tools for payments, developer ergonomics, Sorbet Ruby typechecker, and Markdoc content engines.',
      websiteUrl: 'https://stripe.com/open-source',
      logoUrl: 'https://cdn.simpleicons.org/stripe',
      category: 'Developer Tooling & Compilers',
      technologies: ['c++', 'ruby', 'typescript', 'javascript'],
      topics: ['compiler', 'typechecker', 'documentation', 'payments'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 2,
    },
    projects: [
      {
        title: 'Sorbet Ruby Typechecker Fast Incremental Type Checking',
        description: 'Enhance the C++ LSP server to support parallel file re-indexing during live editor typing in large monorepos.',
        difficulty: 'Advanced',
        techStack: ['c++', 'ruby', 'lsp'],
        githubUrl: 'https://github.com/sorbet/sorbet',
        stars: 3500,
        mentors: ['Jake Zimmerman', 'Dmitry Petrashko'],
        topics: ['typechecker', 'compilers', 'developer-tools'],
        year: 2026,
      },
      {
        title: 'Markdoc Schema-Driven Interactive Component Extensibility',
        description: 'Extend the Markdoc abstract syntax tree engine with dynamic custom tags and AST validation hooks.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'react', 'javascript'],
        githubUrl: 'https://github.com/markdoc/markdoc',
        stars: 8400,
        mentors: ['Michael Shapiro'],
        topics: ['markdown', 'ast', 'frontend'],
        year: 2025,
      }
    ]
  },
  {
    org: {
      name: 'Polygon Labs',
      slug: 'polygon-mlh',
      description: 'Polygon Labs leads Ethereum scaling solutions with zero-knowledge rollups, modular blockchain architectures, and Web3 SDKs.',
      websiteUrl: 'https://polygon.technology',
      logoUrl: 'https://cdn.simpleicons.org/polygon',
      category: 'Blockchain & Zero-Knowledge',
      technologies: ['rust', 'go', 'solidity', 'typescript'],
      topics: ['zk-rollups', 'ethereum', 'web3', 'cryptography'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Polygon zkEVM Prover GPU Acceleration Pipeline',
        description: 'Benchmark and optimize CUDA/OpenCL polynomial multiplication kernels for zero-knowledge STARK proof generation.',
        difficulty: 'Advanced',
        techStack: ['c++', 'cuda', 'rust', 'zk-snarks'],
        githubUrl: 'https://github.com/0xPolygonHermez/zkevm-prover',
        stars: 2100,
        mentors: ['Jordi Baylina', 'Antoni Lichev'],
        topics: ['zk-proofs', 'cuda', 'cryptography'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Grafana Labs',
      slug: 'grafana-mlh',
      description: 'Grafana Labs creates open and composable observability software used by millions to query, visualize, and alert on metrics.',
      websiteUrl: 'https://grafana.com',
      logoUrl: 'https://cdn.simpleicons.org/grafana',
      category: 'Monitoring & Visualization',
      technologies: ['go', 'typescript', 'react', 'graphql'],
      topics: ['visualization', 'metrics', 'observability', 'dashboards'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Grafana Plugin Canvas 3D Spatial Geometry Visualizer',
        description: 'Build WebGL spatial telemetry panels in Grafana for visualizing physical data center rack thermal sensor metrics.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'react', 'three.js', 'webgl'],
        githubUrl: 'https://github.com/grafana/grafana',
        stars: 64000,
        mentors: ['Torkel Ödegaard', 'David Kaltschmidt'],
        topics: ['visualization', 'webgl', 'observability'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'DigitalOcean',
      slug: 'digitalocean-mlh',
      description: 'DigitalOcean simplifies cloud computing so developers and businesses can spend more time building software that changes the world.',
      websiteUrl: 'https://digitalocean.com',
      logoUrl: 'https://cdn.simpleicons.org/digitalocean',
      category: 'Cloud Infrastructure',
      technologies: ['go', 'python', 'terraform', 'kubernetes'],
      topics: ['cloud', 'devops', 'kubernetes', 'cli'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'doctl CLI Automated Kubernetes Cluster Blueprint Validator',
        description: 'Add validation routines to doctl to pre-check DOKS cluster worker pool quotas and load balancer configurations before deploy.',
        difficulty: 'Intermediate',
        techStack: ['go', 'kubernetes', 'cloud'],
        githubUrl: 'https://github.com/digitalocean/doctl',
        stars: 3800,
        mentors: ['Andrew Carpenter', 'Chris Duarte'],
        topics: ['cli', 'golang', 'cloud'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'HashiCorp',
      slug: 'hashicorp-mlh',
      description: 'HashiCorp provides infrastructure automation software enabling organizations to adopt consistent workflows for cloud management.',
      websiteUrl: 'https://hashicorp.com',
      logoUrl: 'https://cdn.simpleicons.org/hashicorp',
      category: 'Infrastructure as Code & Security',
      technologies: ['go', 'hcl', 'terraform', 'vault'],
      topics: ['infrastructure-as-code', 'security', 'devops', 'secrets-management'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Terraform Plugin Framework Static Type Inference Engine',
        description: 'Upgrade the Go reflection schemas in terraform-plugin-framework to detect schema misconfigurations at compile time.',
        difficulty: 'Advanced',
        techStack: ['go', 'terraform', 'hcl'],
        githubUrl: 'https://github.com/hashicorp/terraform-plugin-framework',
        stars: 1200,
        mentors: ['Austin Valente', 'Megan Heskett'],
        topics: ['golang', 'terraform', 'compilers'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Chainlink Labs',
      slug: 'chainlink-mlh',
      description: 'Chainlink is the industry-standard Web3 services platform enabling secure smart contracts across any blockchain.',
      websiteUrl: 'https://chain.link',
      logoUrl: 'https://cdn.simpleicons.org/chainlink',
      category: 'Web3 & Oracles',
      technologies: ['solidity', 'go', 'typescript', 'rust'],
      topics: ['web3', 'smart-contracts', 'oracles', 'defi'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Chainlink CCIP Cross-Chain Message Gas Estimator Simulator',
        description: 'Build local hardhat and foundry simulation plugins to calculate dynamic token bridge and gas cost bounds.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'solidity', 'ethereum'],
        githubUrl: 'https://github.com/smartcontractkit/chainlink',
        stars: 7100,
        mentors: ['Sergey Nazarov', 'Steve Ellis'],
        topics: ['smart-contracts', 'cross-chain', 'defi'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Twilio Open Source',
      slug: 'twilio-mlh',
      description: 'Twilio powers personalized communication APIs across voice, SMS, video, and email, partnering closely with MLH fellows.',
      websiteUrl: 'https://twilio.com',
      logoUrl: 'https://cdn.simpleicons.org/twilio',
      category: 'Communications & APIs',
      technologies: ['node.js', 'typescript', 'python', 'java', 'go'],
      topics: ['communications', 'apis', 'voice', 'messaging'],
      years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Twilio Node Helper Library Zero-Dependency Fetch Migration',
        description: 'Refactor HTTP transport layer to utilize native Node 18+ Web Standards Fetch API with automatic retry backoff.',
        difficulty: 'Beginner',
        techStack: ['typescript', 'javascript', 'node.js'],
        githubUrl: 'https://github.com/twilio/twilio-node',
        stars: 1900,
        mentors: ['ChildishGiant', 'Escherian'],
        topics: ['sdk', 'node.js', 'apis'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Datadog',
      slug: 'datadog-mlh',
      description: 'Datadog is the essential monitoring and security platform for cloud applications, collaborating with fellows on open tracing instrumentation.',
      websiteUrl: 'https://datadoghq.com',
      logoUrl: 'https://cdn.simpleicons.org/datadog',
      category: 'Observability & Cloud Security',
      technologies: ['go', 'rust', 'python', 'typescript'],
      topics: ['telemetry', 'tracing', 'metrics', 'cloud-native'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Vector Telemetry Pipeline Native WebAssembly Transform Engine',
        description: 'Embed Wasm runtime filters into Vector data routing topologies for custom metric transformations at line rate.',
        difficulty: 'Advanced',
        techStack: ['rust', 'wasm', 'vector'],
        githubUrl: 'https://github.com/vectordotdev/vector',
        stars: 17000,
        mentors: ['Luke Steensen', 'Jesse Szwedko'],
        topics: ['rust', 'telemetry', 'wasm'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Brave Software',
      slug: 'brave-mlh',
      description: 'Brave is a privacy-first open-source web browser that blocks trackers and intrusive ads by default.',
      websiteUrl: 'https://brave.com',
      logoUrl: 'https://cdn.simpleicons.org/brave',
      category: 'Privacy & Web Browsers',
      technologies: ['c++', 'rust', 'javascript', 'chromium'],
      topics: ['privacy', 'browser', 'security', 'adblocking'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Brave Ad-Block Rust Engine Sub-Resource Filter Acceleration',
        description: 'Optimize cosmetic filter rule evaluation routines using SIMD vector instructions for faster initial page load rendering.',
        difficulty: 'Advanced',
        techStack: ['rust', 'c++', 'simd'],
        githubUrl: 'https://github.com/brave/brave-browser',
        stars: 18000,
        mentors: ['Brian Clifton', 'Anton Lazarev'],
        topics: ['privacy', 'rust', 'adblocking'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Algolia',
      slug: 'algolia-mlh',
      description: 'Algolia is the AI search and discovery platform, open-sourcing frontend libraries including Autocomplete and InstantSearch.',
      websiteUrl: 'https://algolia.com',
      logoUrl: 'https://cdn.simpleicons.org/algolia',
      category: 'Search & Developer Libraries',
      technologies: ['javascript', 'typescript', 'react', 'vue'],
      topics: ['search', 'frontend', 'autocomplete', 'ui'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Autocomplete.js Voice & Multi-Modal Input Plugin',
        description: 'Implement a voice search speech-recognition plugin with natural query auto-correction and zero-latency debouncing.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'javascript', 'react'],
        githubUrl: 'https://github.com/algolia/autocomplete',
        stars: 2900,
        mentors: ['François Chalifour', 'Sarah Dayan'],
        topics: ['search', 'accessibility', 'frontend'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'MongoDB Open Source',
      slug: 'mongodb-mlh',
      description: 'MongoDB supports open source developers worldwide, collaborating with fellows on driver ecosystems and developer tools.',
      websiteUrl: 'https://mongodb.com',
      logoUrl: 'https://cdn.simpleicons.org/mongodb',
      category: 'Databases & Storage',
      technologies: ['javascript', 'typescript', 'python', 'go', 'rust'],
      topics: ['database', 'nosql', 'drivers', 'storage'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'MongoDB Node.js Driver Vector Search Index Helper Suite',
        description: 'Provide developer-friendly TypeScript fluent builders for defining Atlas Vector Search indexes and cosine similarity aggregations.',
        difficulty: 'Intermediate',
        techStack: ['typescript', 'node.js', 'mongodb'],
        githubUrl: 'https://github.com/mongodb/node-mongodb-native',
        stars: 12000,
        mentors: ['Neal Beeken', 'Daria Glodina'],
        topics: ['database', 'vector-search', 'typescript'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Postman Open Source',
      slug: 'postman-mlh',
      description: 'Postman is the leading API platform used by over 30 million developers, open-sourcing Newman, Collection SDK, and OpenAPI converters.',
      websiteUrl: 'https://postman.com',
      logoUrl: 'https://cdn.simpleicons.org/postman',
      category: 'API Testing & Developer Tools',
      technologies: ['javascript', 'typescript', 'node.js'],
      topics: ['apis', 'testing', 'cli', 'automation'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Newman CLI Streaming HTML5 Reporter with Interactive Network Waterfall',
        description: 'Build a standalone zero-dependency HTML test report generator showing request/response timing breakdowns.',
        difficulty: 'Beginner',
        techStack: ['javascript', 'node.js', 'html', 'css'],
        githubUrl: 'https://github.com/postmanlabs/newman',
        stars: 6500,
        mentors: ['Kunal Nagpal', 'Shamasis Bhattacharya'],
        topics: ['cli', 'testing', 'reporting'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'Automattic / WordPress',
      slug: 'wordpress-mlh',
      description: 'Automattic champions open source web publishing, partnering with MLH fellows on the block editor (Gutenberg) and Calypso.',
      websiteUrl: 'https://automattic.com',
      logoUrl: 'https://cdn.simpleicons.org/wordpress',
      category: 'Content Management & Web',
      technologies: ['php', 'javascript', 'react', 'typescript'],
      topics: ['cms', 'frontend', 'editor', 'publishing'],
      years: [2021, 2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Gutenberg Block Editor Collaborative Multi-Cursor Real-Time Engine',
        description: 'Implement conflict-free replicated data type (CRDT) synchronization for synchronous multi-author document drafting.',
        difficulty: 'Advanced',
        techStack: ['javascript', 'react', 'yjs', 'crdt'],
        githubUrl: 'https://github.com/WordPress/gutenberg',
        stars: 10500,
        mentors: ['Matias Ventura', 'Riad Benguella'],
        topics: ['crdt', 'collaboration', 'editor', 'react'],
        year: 2026,
      }
    ]
  },
  {
    org: {
      name: 'CockroachDB',
      slug: 'cockroachdb-mlh',
      description: 'CockroachDB is the cloud-native, distributed SQL database designed for resilience, global scale, and developer productivity.',
      websiteUrl: 'https://cockroachlabs.com',
      logoUrl: 'https://cdn.simpleicons.org/cockroachlabs',
      category: 'Distributed Databases',
      technologies: ['go', 'c++', 'sql', 'raft'],
      topics: ['distributed-systems', 'database', 'sql', 'raft'],
      years: [2022, 2023, 2024, 2025, 2026],
      is2026: true,
      projectCount: 1,
    },
    projects: [
      {
        title: 'Pebble Key-Value Store Range-Key Iterator Compression',
        description: 'Optimize prefix compression algorithms inside Pebble LSM-trees to reduce memory usage during massive range scans.',
        difficulty: 'Advanced',
        techStack: ['go', 'lsm-tree', 'database'],
        githubUrl: 'https://github.com/cockroachdb/pebble',
        stars: 3200,
        mentors: ['Peter Mattis', 'Bilal Akhtar'],
        topics: ['lsm-tree', 'golang', 'storage-engine'],
        year: 2026,
      }
    ]
  }
];

async function seedMlhOrgs() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB at', MONGODB_URI);
    const db = client.db();

    const programsCol = db.collection('programs');
    const orgsCol = db.collection('organizations');
    const projectsCol = db.collection('projects');

    let program = await programsCol.findOne({ slug: 'mlh-fellowship' });
    if (!program) {
      console.log('Creating mlh-fellowship program...');
      const insertRes = await programsCol.insertOne({
        name: 'MLH Fellowship',
        slug: 'mlh-fellowship',
        organizer: 'Major League Hacking',
        accentColor: '#0A2540',
        officialWebsite: 'https://fellowship.mlh.io',
        category: 'Fellowship',
        difficulty: 'Intermediate',
        eligibilitySummary: 'Global students and developers of all backgrounds',
        stipendSummary: 'Track-dependent educational stipend provided',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      program = await programsCol.findOne({ _id: insertRes.insertedId });
    }

    const programId = program._id;
    console.log('Using MLH Fellowship Program ID:', programId);

    let seededOrgs = 0;
    let seededProjects = 0;

    for (const item of COMPREHENSIVE_MLH_ORGS_AND_PROJECTS) {
      const orgData = {
        ...item.org,
        programId: programId,
        programSlug: 'mlh-fellowship',
        updatedAt: new Date(),
      };

      const existingOrg = await orgsCol.findOne({ slug: orgData.slug });
      let orgId;

      if (existingOrg) {
        await orgsCol.updateOne({ _id: existingOrg._id }, { $set: orgData });
        orgId = existingOrg._id;
        console.log(`Updated organization: ${orgData.name}`);
      } else {
        orgData.createdAt = new Date();
        const res = await orgsCol.insertOne(orgData);
        orgId = res.insertedId;
        console.log(`Inserted organization: ${orgData.name}`);
      }
      seededOrgs++;

      // Seed projects
      for (const proj of item.projects) {
        const projectData = {
          ...proj,
          org: orgData.name,
          orgSlug: orgData.slug,
          orgLogoUrl: orgData.logoUrl,
          orgWebsiteUrl: orgData.websiteUrl,
          programId: programId,
          programSlug: 'mlh-fellowship',
          programName: 'MLH Fellowship',
          programColor: '#0A2540',
          status: 'active',
          updatedAt: new Date(),
        };

        const existingProject = await projectsCol.findOne({
          title: projectData.title,
          orgSlug: orgData.slug,
        });

        if (existingProject) {
          await projectsCol.updateOne(
            { _id: existingProject._id },
            { $set: projectData }
          );
        } else {
          projectData.createdAt = new Date();
          await projectsCol.insertOne(projectData);
        }
        seededProjects++;
      }
    }

    console.log(`\n Successfully seeded ${seededOrgs} Comprehensive MLH Organizations and ${seededProjects} MLH Projects!`);
  } catch (err) {
    console.error('Error seeding MLH data:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedMlhOrgs();
