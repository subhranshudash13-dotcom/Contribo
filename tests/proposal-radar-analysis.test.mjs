import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

function sourceLoader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    const resolved = path.resolve(root, filename);
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const mod = { exports: {} };
    cache.set(resolved, mod);
    const compiled = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (!id.startsWith('@/') && !id.startsWith('.')) return require(id);
      const base = id.startsWith('@/')
        ? path.join(root, 'src', id.slice(2))
        : path.resolve(path.dirname(resolved), id);
      const target = ['.ts', '.tsx'].map((ext) => base + ext).find(fs.existsSync);
      assert.ok(target, `Cannot resolve production module ${id}`);
      return load(target);
    };
    vm.runInThisContext(`(function(require, module, exports) {\n${compiled}\n})`, {
      filename: resolved,
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}

const load = sourceLoader();
const mentorMatcher = load('src/lib/proposals/mentor-matcher.ts');
const gapAnalyzer = load('src/lib/proposals/gap-analyzer.ts');

const {
  tokenizeTechnicalText,
  computeTfIdfCosineScores,
  matchMentorsToProposal,
  MENTOR_CATALOG,
} = mentorMatcher;

const { analyzeProposalGaps, PILLAR_WEIGHTS } = gapAnalyzer;

const strongSections = {
  summary:
    'Distributed real-time event streaming pipeline using Redis Streams, TypeScript, Next.js, and Server-Sent Events (SSE) for collaborative proposal editing.',
  problemStatement:
    'Contributors currently lack live mentor review feedback and real-time notification streams.',
  architecture:
    'We deploy a decoupled event bus service where API route components publish Zod-validated payloads to Redis stream channels. Edge Node.js worker instances manage client subscriptions with automatic reconnect backoff, JWT security, and persistent MongoDB storage.',
  deliverables:
    '1. Redis Streams event ingest pipeline\n2. Real-time annotation engine\n3. Notification drawer\n4. Playwright E2E test suite for midterm and final evaluation',
  timeline:
    'Weeks 1-2: Community bonding & architecture sign-off via GitHub Discussions\nWeeks 3-5: Redis stream engine\nWeeks 6-7: Midterm evaluation demo\nWeeks 8-10: Frontend sync & offline queuing\nWeeks 11-12: Load testing & final documentation',
  testing:
    'Unit testing with 100% branch coverage, Redis integration tests, and Playwright E2E tests in CI.',
  risks:
    'Redis memory exhaustion under peak load (mitigated via capped streams) and API rate limit spikes (mitigated via exponential backoff and circuit breaker fallback).',
  aboutMe:
    'Open-source contributor with merged pull requests in TypeScript developer tooling and distributed systems.',
};

test('tokenizeTechnicalText removes stopwords and normalizes technical tokens', () => {
  const tokens = tokenizeTechnicalText('The Real-Time Redis & TypeScript pipeline for Next.js!');
  assert.ok(tokens.includes('real-time'));
  assert.ok(tokens.includes('redis'));
  assert.ok(tokens.includes('typescript'));
  assert.ok(tokens.includes('next.js'));
  assert.ok(!tokens.includes('the'));
  assert.ok(!tokens.includes('for'));
});

test('computeTfIdfCosineScores ranks semantically closer documents higher within [0, 1]', () => {
  const scores = computeTfIdfCosineScores('redis websocket sse typescript event streaming', [
    'redis websocket sse typescript nodejs event-streaming',
    'pytorch nlp embeddings fastapi numpy',
  ]);
  assert.equal(scores.length, 2);
  assert.ok(scores[0] > scores[1]);
  assert.ok(scores[0] > 0 && scores[0] <= 1);
  assert.ok(scores[1] >= 0 && scores[1] <= 1);
});

test('matchMentorsToProposal returns top 5 mentors with bounded 0-100 affinity scores and stack overlap', () => {
  const matches = matchMentorsToProposal({
    projectTitle: 'Real-Time Event Streaming with Redis & TypeScript',
    orgName: 'Async GraphQL & Contribo Core',
    programName: 'Google Summer of Code 2026',
    sections: strongSections,
  });

  assert.equal(matches.length, 5);
  assert.ok(MENTOR_CATALOG.length >= 5);

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    assert.ok(m.affinityScore >= 0 && m.affinityScore <= 100);
    assert.ok(Array.isArray(m.sharedStackOverlap));
    assert.ok(m.outreachStrategy.length > 20);
    if (i > 0) {
      assert.ok(matches[i - 1].affinityScore >= m.affinityScore);
    }
  }

  assert.equal(matches[0].mentor.id, 'mentor_alex_rivera');
  assert.ok(matches[0].sharedStackOverlap.includes('redis'));
});

test('analyzeProposalGaps enforces exact 4-pillar weights summing to 1.0 and high score for complete draft', () => {
  const weightSum = Object.values(PILLAR_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(weightSum - 1.0) < 1e-9);
  assert.equal(PILLAR_WEIGHTS.technicalArchitecture, 0.35);
  assert.equal(PILLAR_WEIGHTS.deliverablesTimeline, 0.3);
  assert.equal(PILLAR_WEIGHTS.communityBonding, 0.2);
  assert.equal(PILLAR_WEIGHTS.riskMitigation, 0.15);

  const result = analyzeProposalGaps(strongSections);
  assert.equal(result.pillars.length, 4);
  assert.ok(result.overallScore >= 85 && result.overallScore <= 100);
  assert.equal(result.readinessRating, 'Submission Ready');
  assert.equal(result.gapChecklist[0].severity, 'passed');
});

test('analyzeProposalGaps flags missing weeks 8-10, community bonding, and risk mitigation on weak drafts', () => {
  const emptyResult = analyzeProposalGaps({});
  assert.equal(emptyResult.overallScore, 0);
  assert.equal(emptyResult.readinessRating, 'Needs Work');
  assert.ok(emptyResult.gapChecklist.some((g) => g.severity === 'critical'));

  const partialResult = analyzeProposalGaps({
    architecture: 'Basic service',
    timeline: 'Weeks 1-4: Build prototype',
  });
  assert.ok(
    partialResult.gapChecklist.some((g) => g.id === 'gap-timeline-late-weeks'),
    'Should flag missing weeks 8-10 breakdown'
  );
  assert.ok(
    partialResult.gapChecklist.some((g) => g.id === 'gap-comm-channels'),
    'Should flag missing community communication channels'
  );
  assert.ok(
    partialResult.gapChecklist.some((g) => g.id === 'gap-risk-section'),
    'Should flag missing risk mitigation plan'
  );
});

test('REST endpoint GET and POST /api/proposals/[id]/radar return expected status codes and payloads', async () => {
  const apiLoader = sourceLoader({
    'next/server': {
      NextResponse: {
        json(data, init = {}) {
          return new Response(JSON.stringify(data), {
            status: init.status ?? 200,
            headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
          });
        },
      },
    },
    '@/lib/proposals/gap-analyzer': gapAnalyzer,
    '@/lib/proposals/mentor-matcher': mentorMatcher,
    '@/lib/proposal-studio/data': {
      DRAFT_PROPOSALS: [
        {
          id: 'draft-1',
          projectTitle: 'Kubernetes Telemetry Exporter',
          orgName: 'CNCF',
          programName: 'LFX Mentorship',
          sections: strongSections,
        },
      ],
    },
  });

  const route = apiLoader('src/app/api/proposals/[id]/radar/route.ts');

  // 400 invalid id
  const badRes = await route.GET(new Request('http://localhost/api/proposals/!@$/radar'), {
    params: Promise.resolve({ id: '!@$' }),
  });
  assert.equal(badRes.status, 400);

  // 404 unknown id
  const missingRes = await route.GET(new Request('http://localhost/api/proposals/unknown_999/radar'), {
    params: Promise.resolve({ id: 'unknown_999' }),
  });
  assert.equal(missingRes.status, 404);

  // 200 demo
  const demoRes = await route.GET(new Request('http://localhost/api/proposals/demo/radar'), {
    params: Promise.resolve({ id: 'demo' }),
  });
  assert.equal(demoRes.status, 200);
  const demoJson = await demoRes.json();
  assert.equal(demoJson.proposalId, 'demo');
  assert.equal(demoJson.mentors.length, 5);
  assert.equal(demoJson.analysis.pillars.length, 4);

  // 200 POST live re-analysis
  const postRes = await route.POST(
    new Request('http://localhost/api/proposals/demo/radar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectTitle: 'PyTorch NLP Scoring Engine',
        sections: {
          summary: 'NLP scoring with python pytorch embeddings tfidf',
        },
      }),
    }),
    { params: Promise.resolve({ id: 'demo' }) }
  );
  assert.equal(postRes.status, 200);
  const postJson = await postRes.json();
  assert.equal(postJson.mentors[0].mentor.id, 'mentor_kenji_takahashi');
});
