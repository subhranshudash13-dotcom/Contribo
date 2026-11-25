export interface MentorProfile {
  id: string;
  name: string;
  handle: string;
  organization: string;
  program: 'GSoC' | 'LFX' | 'Outreachy';
  role: string;
  timezone: string;
  stacks: string[];
  domains: string[];
  pastProjects: string[];
  bio: string;
  preferredChannel: string;
}

export interface MentorMatchResult {
  mentor: MentorProfile;
  affinityScore: number;
  cosineSimilarity: number;
  sharedStackOverlap: string[];
  outreachStrategy: string;
}

export const MENTOR_CATALOG: MentorProfile[] = [
  {
    id: 'mentor_alex_rivera',
    name: 'Alex Rivera',
    handle: '@arivera-oss',
    organization: 'Async GraphQL & Contribo Core',
    program: 'GSoC',
    role: 'Staff Distributed Systems Maintainer',
    timezone: 'UTC-5',
    stacks: ['typescript', 'nextjs', 'redis', 'sse', 'websocket', 'nodejs', 'zod', 'graphql'],
    domains: ['real-time', 'event-streaming', 'collaborative', 'notifications', 'api'],
    pastProjects: [
      'Real-Time Event Streaming & Notification Infrastructure',
      'Edge WebSocket Presence & Collaborative Editing',
    ],
    bio: 'Maintains distributed event buses, SSE pipelines, and edge worker connection pools.',
    preferredChannel: 'GitHub Discussions & Discord #architecture',
  },
  {
    id: 'mentor_sarah_chen',
    name: 'Sarah Chen',
    handle: '@schen-cncf',
    organization: 'CNCF / Kubernetes SIG-Node',
    program: 'LFX',
    role: 'Principal Infrastructure Engineer',
    timezone: 'UTC-8',
    stacks: ['go', 'kubernetes', 'docker', 'prometheus', 'grpc', 'redis', 'opentelemetry'],
    domains: ['observability', 'scheduling', 'containers', 'cloud-native', 'resilience'],
    pastProjects: [
      'Pod Scheduling Telemetry & Health Probes',
      'Distributed Rate Limiting & Circuit Breakers',
    ],
    bio: 'Focuses on resilient microservices, telemetry pipelines, and zero-downtime rollouts.',
    preferredChannel: 'CNCF Slack #sig-node & weekly community sync',
  },
  {
    id: 'mentor_priya_nair',
    name: 'Priya Nair',
    handle: '@priyanair-dev',
    organization: 'Mozilla / Rust Tooling',
    program: 'Outreachy',
    role: 'Senior Frontend & Accessibility Architect',
    timezone: 'UTC+5:30',
    stacks: ['typescript', 'react', 'nextjs', 'tailwind', 'playwright', 'a11y', 'svg', 'wasm'],
    domains: ['accessibility', 'ui', 'testing', 'offline-first', 'developer-tools'],
    pastProjects: [
      'Offline-First Proposal Studio & Diff Inspector',
      'WCAG 2.2 Automated Accessibility Audit Suite',
    ],
    bio: 'Leads inclusive UI engineering, Playwright E2E reliability, and browser cryptography.',
    preferredChannel: 'Matrix #outreachy-mentors & PR review threads',
  },
  {
    id: 'mentor_marcus_vance',
    name: 'Marcus Vance',
    handle: '@mvance-data',
    organization: 'Apache Software Foundation',
    program: 'GSoC',
    role: 'Database & Storage Engine Committer',
    timezone: 'UTC+1',
    stacks: ['mongodb', 'postgresql', 'python', 'rust', 'indexing', 'caching', 'queues'],
    domains: ['databases', 'search', 'tf-idf', 'ranking', 'persistence', 'outbox'],
    pastProjects: [
      'Durable Scheduling Outbox & Idempotent Workers',
      'Hybrid TF-IDF & Semantic Search Ranking Engine',
    ],
    bio: 'Specializes in storage engines, transactional outbox patterns, and search indexing.',
    preferredChannel: 'Apache dev@ mailing list & Jira RFCs',
  },
  {
    id: 'mentor_elena_rostova',
    name: 'Elena Rostova',
    handle: '@erostova-sec',
    organization: 'OpenSSF / Sigstore',
    program: 'LFX',
    role: 'Security & Cryptography Maintainer',
    timezone: 'UTC+2',
    stacks: ['cryptography', 'sha256', 'jwt', 'oauth', 'typescript', 'nodejs', 'webcrypto'],
    domains: ['attestation', 'verification', 'authentication', 'rate-limiting', 'security'],
    pastProjects: [
      'Verifiable Contributor Attestation & Open Badges v3',
      'Zero-Trust API Gateway & Token Rotation',
    ],
    bio: 'Works on supply-chain attestations, W3C verifiable credentials, and API hardening.',
    preferredChannel: 'OpenSSF Slack #attestations & GitHub Security Advisories',
  },
  {
    id: 'mentor_kenji_takahashi',
    name: 'Kenji Takahashi',
    handle: '@ktakahashi-ai',
    organization: 'PyTorch & HuggingFace Ecosystem',
    program: 'GSoC',
    role: 'Applied ML & NLP Maintainer',
    timezone: 'UTC+9',
    stacks: ['python', 'pytorch', 'nlp', 'embeddings', 'tfidf', 'fastapi', 'numpy'],
    domains: ['machine-learning', 'recommendations', 'scoring', 'nlp', 'vector-search'],
    pastProjects: [
      'Offline Semantic Matching & Rubric Scoring',
      'Lightweight Embedding Reranker for Issue Triage',
    ],
    bio: 'Builds deterministic NLP scoring pipelines and low-latency recommendation engines.',
    preferredChannel: 'GitHub Issues RFC & bi-weekly office hours',
  },
  {
    id: 'mentor_david_okafor',
    name: 'David Okafor',
    handle: '@dokafor-ci',
    organization: 'GitLab & OpenTelemetry',
    program: 'Outreachy',
    role: 'DevOps & Testing Infrastructure Lead',
    timezone: 'UTC+0',
    stacks: ['github-actions', 'playwright', 'jest', 'docker', 'typescript', 'chaos-testing'],
    domains: ['ci-cd', 'testing', 'automation', 'benchmarks', 'monitoring'],
    pastProjects: [
      'Deterministic E2E Chaos Testing Harness',
      'Automated Benchmark Regression Gateways',
    ],
    bio: 'Focuses on reproducible test suites, CI pipelines, and performance benchmarking.',
    preferredChannel: 'Discord #testing-infra & RFC issues',
  },
];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
  'this', 'that', 'these', 'those', 'it', 'its', 'we', 'our', 'they', 'their', 'using',
  'used', 'use', 'via', 'into', 'over', 'under', 'all', 'each', 'more', 'most', 'such',
]);

/**
 * Tokenize text into normalized lowercase technical terms, preserving hyphenated & dot tokens.
 */
export function tokenizeTechnicalText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.+#_-]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[._-]+|[._-]+$/g, ''))
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function buildTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  if (tokens.length === 0) return tf;
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / tokens.length);
  }
  return tf;
}

/**
 * Compute TF-IDF vectors and cosine similarity between a query text and a corpus of documents.
 */
export function computeTfIdfCosineScores(
  queryText: string,
  documents: string[]
): number[] {
  const queryTokens = tokenizeTechnicalText(queryText);
  if (queryTokens.length === 0 || documents.length === 0) {
    return documents.map(() => 0);
  }

  const docTokenLists = documents.map((doc) => tokenizeTechnicalText(doc));
  const allDocs = [queryTokens, ...docTokenLists];
  const numDocs = allDocs.length;

  // Document frequency across corpus + query
  const df = new Map<string, number>();
  for (const tokens of allDocs) {
    const unique = new Set(tokens);
    for (const term of unique) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const idf = (term: string) => {
    const freq = df.get(term) ?? 0;
    return Math.log((numDocs + 1) / (freq + 1)) + 1;
  };

  const toTfIdfVector = (tokens: string[]): Map<string, number> => {
    const tf = buildTermFrequency(tokens);
    const vec = new Map<string, number>();
    for (const [term, tfVal] of tf.entries()) {
      vec.set(term, tfVal * idf(term));
    }
    return vec;
  };

  const queryVec = toTfIdfVector(queryTokens);

  return docTokenLists.map((docTokens) => {
    if (docTokens.length === 0) return 0;
    const docVec = toTfIdfVector(docTokens);

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const [term, valA] of queryVec.entries()) {
      normA += valA * valA;
      const valB = docVec.get(term);
      if (valB) {
        dot += valA * valB;
      }
    }
    for (const valB of docVec.values()) {
      normB += valB * valB;
    }

    if (normA === 0 || normB === 0) return 0;
    return Math.min(Math.max(dot / (Math.sqrt(normA) * Math.sqrt(normB)), 0), 1);
  });
}

function buildMentorDocument(mentor: MentorProfile): string {
  return [
    mentor.organization,
    mentor.role,
    mentor.program,
    ...mentor.stacks,
    ...mentor.domains,
    ...mentor.pastProjects,
    mentor.bio,
  ].join(' ');
}

function buildOutreachStrategy(
  mentor: MentorProfile,
  overlap: string[],
  proposalTitle: string
): string {
  const stackMention =
    overlap.length > 0
      ? `Lead with your concrete architecture choices around ${overlap.slice(0, 3).join(', ')}.`
      : `Reference ${mentor.pastProjects[0] ?? mentor.organization} and ask for feedback on your core data flow.`;

  return `Reach out via ${mentor.preferredChannel}. ${stackMention} Share a concise 3-bullet summary of "${proposalTitle || 'your proposal'}" and request a quick review of your midterm milestone scope.`;
}

/**
 * Match a proposal draft against the mentor catalog using offline TF-IDF + stack overlap,
 * returning the top N (default 5) matched mentors with bounded 0-100% affinity scores.
 */
export function matchMentorsToProposal(
  input: {
    projectTitle?: string;
    orgName?: string;
    programName?: string;
    sections?: Record<string, string>;
  },
  options?: {
    catalog?: MentorProfile[];
    limit?: number;
  }
): MentorMatchResult[] {
  const catalog = options?.catalog ?? MENTOR_CATALOG;
  const limit = Math.max(1, Math.min(options?.limit ?? 5, catalog.length));

  const sectionText = Object.values(input.sections ?? {}).join(' ');
  const proposalText = [
    input.projectTitle ?? '',
    input.orgName ?? '',
    input.programName ?? '',
    sectionText,
  ].join(' ');

  const proposalTokens = new Set(tokenizeTechnicalText(proposalText));
  const mentorDocs = catalog.map(buildMentorDocument);
  const cosineScores = computeTfIdfCosineScores(proposalText, mentorDocs);

  const scored: MentorMatchResult[] = catalog.map((mentor, idx) => {
    const cosine = cosineScores[idx] ?? 0;
    const candidateTags = [...new Set([...mentor.stacks, ...mentor.domains])];
    const overlap = candidateTags.filter((tag) => {
      if (proposalTokens.has(tag)) return true;
      // Handle compound tags like "event-streaming" or "real-time"
      return tag.split('-').every((part) => proposalTokens.has(part));
    });

    const overlapRatio = Math.min(overlap.length / 4, 1);
    const orgBonus =
      input.orgName &&
      mentor.organization.toLowerCase().includes(input.orgName.toLowerCase().slice(0, 6))
        ? 0.12
        : 0;

    // Weighted blend of TF-IDF cosine similarity + direct stack overlap + org alignment
    const rawAffinity = cosine * 68 + overlapRatio * 24 + orgBonus * 100;
    const affinityScore = Math.round(Math.min(Math.max(rawAffinity, 12), 99));

    return {
      mentor,
      affinityScore,
      cosineSimilarity: Number(cosine.toFixed(4)),
      sharedStackOverlap: overlap.slice(0, 6),
      outreachStrategy: buildOutreachStrategy(
        mentor,
        overlap,
        input.projectTitle ?? 'your proposal'
      ),
    };
  });

  return scored
    .sort((a, b) => b.affinityScore - a.affinityScore || b.cosineSimilarity - a.cosineSimilarity)
    .slice(0, limit);
}
