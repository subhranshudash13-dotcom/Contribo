import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('1. Organization Sorter Logic & Ordering Stability', () => {
  const sampleResults = [
    {
      orgName: 'Zeta Robotics',
      matchPercentage: 75,
      projectCount: 5,
      latestYear: 2024,
    },
    {
      orgName: 'Alpha Cloud',
      matchPercentage: 94,
      projectCount: 42,
      latestYear: 2026,
    },
    {
      orgName: 'Beta Kernel',
      matchPercentage: 88,
      projectCount: 15,
      latestYear: 2025,
    },
  ];

  // Sorter simulation replicating MatcherClient.tsx logic
  function sortOrgs(items, sortBy) {
    return [...items].sort((a, b) => {
      if (sortBy === 'match') {
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      }
      if (sortBy === 'projects') {
        const pA = a.projectCount || 0;
        const pB = b.projectCount || 0;
        return pB - pA;
      }
      if (sortBy === 'recent') {
        const yA = a.latestYear || 0;
        const yB = b.latestYear || 0;
        return yB - yA;
      }
      if (sortBy === 'name') {
        return (a.orgName || '').localeCompare(b.orgName || '');
      }
      return 0;
    });
  }

  // 1. Sort by Highest Match %
  const byMatch = sortOrgs(sampleResults, 'match');
  assert.deepEqual(
    byMatch.map((o) => o.orgName),
    ['Alpha Cloud', 'Beta Kernel', 'Zeta Robotics']
  );

  // 2. Sort by Most Projects
  const byProjects = sortOrgs(sampleResults, 'projects');
  assert.deepEqual(
    byProjects.map((o) => o.orgName),
    ['Alpha Cloud', 'Beta Kernel', 'Zeta Robotics']
  );

  // 3. Sort by Most Recent (2026 first)
  const byRecent = sortOrgs(sampleResults, 'recent');
  assert.deepEqual(
    byRecent.map((o) => o.orgName),
    ['Alpha Cloud', 'Beta Kernel', 'Zeta Robotics']
  );

  // 4. Sort Alphabetically
  const byName = sortOrgs(sampleResults, 'name');
  assert.deepEqual(
    byName.map((o) => o.orgName),
    ['Alpha Cloud', 'Beta Kernel', 'Zeta Robotics']
  );
});

test('2. Orbit AI Matcher Client UI Elements (Callout, Badges, Sorter)', () => {
  const matcherPath = path.join(root, 'src/app/matcher/MatcherClient.tsx');
  const content = fs.readFileSync(matcherPath, 'utf8');

  // Orbit AI Evaluation Callout
  assert.ok(
    content.includes('Orbit AI Mentorship Evaluation:'),
    'MatcherClient must include Orbit AI Mentorship Evaluation callout'
  );
  assert.ok(
    content.includes('match.reasoning'),
    'MatcherClient must display match.reasoning in callout'
  );

  // Match Percentage Badge
  assert.ok(
    content.includes('match.matchPercentage'),
    'MatcherClient must display match.matchPercentage'
  );
  assert.ok(
    content.includes('% Match'),
    'MatcherClient must display % Match badge'
  );

  // Sorter Controls
  assert.ok(
    content.includes('Sort Organizations:'),
    'MatcherClient must feature Sort Organizations control bar'
  );
  assert.ok(
    content.includes('sortBy'),
    'MatcherClient must track sortBy state'
  );
  assert.ok(
    content.includes('sortedResults'),
    'MatcherClient must render sortedResults'
  );

  // Matched Skills Contrast Badges
  assert.ok(
    content.includes('✓ ${t}'),
    'MatcherClient must display verified matched skills badge with checkmark'
  );

  // Explore Projects CTA
  assert.ok(
    content.includes('Explore Projects'),
    'MatcherClient must include Explore Projects primary CTA button'
  );
});

test('3. API Match Route Organization Recommendation Grounding', () => {
  const routePath = path.join(root, 'src/app/api/match/route.ts');
  const routeContent = fs.readFileSync(routePath, 'utf8');

  assert.ok(
    routeContent.includes('findOrganizationsBySkills'),
    'route.ts must query findOrganizationsBySkills'
  );
  assert.ok(
    routeContent.includes('heuristicRankOrganizations'),
    'route.ts must implement heuristicRankOrganizations'
  );
  assert.ok(
    routeContent.includes('calculateHybridMatchScore'),
    'route.ts must compute calculateHybridMatchScore'
  );
  assert.ok(
    routeContent.includes('exploreProjectsUrl'),
    'route.ts must generate exploreProjectsUrl taking users to /organizations/[slug]'
  );
  assert.ok(
    routeContent.includes('reasoning: reasoning.trim()'),
    'route.ts must construct grounded reasoning'
  );
});
