import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

test('1. Guidelines Category Slugs and Route Integrity', async (t) => {
  const guidelinesDetailSource = fs.readFileSync(
    path.join(ROOT, 'src/app/guidelines/[slug]/page.tsx'),
    'utf8'
  );

  const hubSource = fs.readFileSync(
    path.join(ROOT, 'src/app/guidelines/page.tsx'),
    'utf8'
  );

  await t.test('all 4 guideline category slugs exist and are defined', () => {
    const requiredSlugs = ['eligibility', 'proposal-writing', 'code-of-conduct', 'stipends'];

    for (const slug of requiredSlugs) {
      assert.ok(
        guidelinesDetailSource.includes(`slug: '${slug}'`),
        `Missing slug definition for ${slug} in [slug]/page.tsx`
      );
      assert.ok(
        hubSource.includes(`slug: '${slug}'`),
        `Missing slug in GuidelinesHub categories for ${slug}`
      );
    }
  });

  await t.test('guideline detail page exports generateStaticParams for all categories', () => {
    assert.ok(
      guidelinesDetailSource.includes('export async function generateStaticParams'),
      'Missing generateStaticParams export in [slug]/page.tsx'
    );
  });
});

test('2. Resource Center Deep-Link Anchor Coverage', async (t) => {
  const resourcesClientSource = fs.readFileSync(
    path.join(ROOT, 'src/app/resources/ResourcesClient.tsx'),
    'utf8'
  );

  const roadmapsSource = fs.readFileSync(
    path.join(ROOT, 'src/app/roadmaps/data.ts'),
    'utf8'
  );

  const homeSource = fs.readFileSync(
    path.join(ROOT, 'src/app/page.tsx'),
    'utf8'
  );

  const seedSource = fs.readFileSync(
    path.join(ROOT, 'scripts/seed-programs.js'),
    'utf8'
  );

  // Extract all /resources#<hash> patterns across the codebase
  const extractResourceHashes = (source) => {
    const matches = source.match(/\/resources#([a-zA-Z0-9_-]+)/g) || [];
    return matches.map((m) => m.replace('/resources#', ''));
  };

  const roadmapsHashes = extractResourceHashes(roadmapsSource);
  const homeHashes = extractResourceHashes(homeSource);
  const seedHashes = extractResourceHashes(seedSource);

  const allTargetHashes = [...new Set([...roadmapsHashes, ...homeHashes, ...seedHashes])];

  await t.test('finds verified /resources# links across the codebase', () => {
    assert.ok(allTargetHashes.length >= 10, 'Expected at least 10 distinct resource hashes');
  });

  await t.test('every /resources# hash is rendered as an id or alias in ResourcesClient.tsx', () => {
    for (const hash of allTargetHashes) {
      // Must match either id: "hash" or within aliases: [...] or id="hash"
      const hasId =
        resourcesClientSource.includes(`id: "${hash}"`) ||
        resourcesClientSource.includes(`id: '${hash}'`) ||
        resourcesClientSource.includes(`"${hash}"`) ||
        resourcesClientSource.includes(`'${hash}'`) ||
        resourcesClientSource.includes(`id="${hash}"`);

      assert.ok(
        hasId,
        `Hash target #${hash} does not exist in ResourcesClient.tsx`
      );
    }
  });

  await t.test('ResourceCard renders article with scroll-mt-24 and id attribute', () => {
    assert.ok(
      resourcesClientSource.includes('<article'),
      'ResourceCard must render an <article> element for semantic structure'
    );
    assert.ok(
      resourcesClientSource.includes('id={guide.id}'),
      'ResourceCard must bind id={guide.id}'
    );
    assert.ok(
      resourcesClientSource.includes('scroll-mt-24'),
      'ResourceCard must include scroll-mt-24 to prevent navbar overlap'
    );
  });
});
