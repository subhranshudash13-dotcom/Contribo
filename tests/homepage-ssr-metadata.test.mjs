import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('1. Homepage Dynamic generateMetadata() & OG / Twitter Meta Tags', async () => {
  const pagePath = path.join(root, 'src/app/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');

  assert.ok(
    pageContent.includes('export async function generateMetadata(): Promise<Metadata>'),
    'page.tsx must export an async generateMetadata function'
  );

  assert.ok(
    pageContent.includes('getCachedHomeBundle()'),
    'generateMetadata must query cached bundle for live statistics'
  );

  assert.ok(
    pageContent.includes('getCachedFeaturedOrganizations()'),
    'generateMetadata must query featured orgs for live statistics'
  );

  assert.ok(
    pageContent.includes("type: 'website'"),
    'generateMetadata must specify openGraph type website'
  );

  assert.ok(
    pageContent.includes("card: 'summary_large_image'"),
    'generateMetadata must specify twitter summary_large_image card'
  );

  assert.ok(
    pageContent.includes("siteName: 'Contribo'"),
    'generateMetadata must define siteName'
  );

  assert.ok(
    pageContent.includes("canonical: '/'"),
    'generateMetadata must specify canonical path'
  );
});

test('2. Structured JSON-LD SEO Schemas (WebSite, Organization, FAQPage)', () => {
  const pagePath = path.join(root, 'src/app/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');

  assert.ok(
    pageContent.includes("type=\"application/ld+json\""),
    'page.tsx must render application/ld+json structured schema script tags'
  );

  assert.ok(
    pageContent.includes("'@type': 'WebSite'"),
    'JSON-LD must declare Schema.org WebSite'
  );

  assert.ok(
    pageContent.includes("'@type': 'SearchAction'"),
    'WebSite JSON-LD must declare SearchAction'
  );

  assert.ok(
    pageContent.includes("'@type': 'Organization'"),
    'JSON-LD must declare Schema.org Organization'
  );

  assert.ok(
    pageContent.includes("'@type': 'FAQPage'"),
    'JSON-LD must declare Schema.org FAQPage for rich search engine results'
  );

  assert.ok(
    pageContent.includes("'@type': 'Question'"),
    'FAQPage JSON-LD must include Question entities'
  );
});

test('3. Full SSR Hydration without { ssr: false } Blocking', () => {
  const deferredPath = path.join(root, 'src/components/home/HomeDeferredSections.tsx');
  const deferredContent = fs.readFileSync(deferredPath, 'utf8');

  // Verify ssr: false has been eliminated to ensure full SSR output
  assert.ok(
    !deferredContent.includes('ssr: false'),
    'HomeDeferredSections must not disable SSR with ssr: false'
  );

  // Verify React.Suspense is used for streaming
  assert.ok(
    deferredContent.includes('<Suspense'),
    'HomeDeferredSections must use Suspense boundaries for streaming hydration'
  );
});

test('4. Program Timeline Semantic <time> Elements', () => {
  const timelinePath = path.join(root, 'src/components/home/ProgramTimelineChart.tsx');
  const timelineContent = fs.readFileSync(timelinePath, 'utf8');

  assert.ok(
    timelineContent.includes('<time'),
    'ProgramTimelineChart must render semantic <time> elements'
  );

  assert.ok(
    timelineContent.includes('dateTime={`2026-'),
    'ProgramTimelineChart must provide standard ISO dateTime for months'
  );

  assert.ok(
    timelineContent.includes('dateTime={`${p.year}-'),
    'ProgramTimelineChart must provide machine-readable dateTime for program spans'
  );
});

test('5. Branded Homepage Streaming Skeleton (src/app/loading.tsx)', () => {
  const loadingPath = path.join(root, 'src/app/loading.tsx');
  const loadingContent = fs.readFileSync(loadingPath, 'utf8');

  assert.ok(
    loadingContent.includes('role="status"'),
    'loading.tsx must declare role="status" for accessibility'
  );

  assert.ok(
    loadingContent.includes('aria-live="polite"'),
    'loading.tsx must declare aria-live="polite"'
  );

  assert.ok(
    loadingContent.includes('SectionSkeleton'),
    'loading.tsx must use SectionSkeleton components matching homepage sections'
  );

  assert.ok(
    loadingContent.includes('variant="stats"'),
    'loading.tsx must include stats skeleton'
  );

  assert.ok(
    loadingContent.includes('variant="cards"'),
    'loading.tsx must include cards skeleton'
  );
});

test('6. Crawl Policy & Elimination of ssr:false Shell Barriers (#83)', () => {
  // 1. HomeDeferredSections does not have ssr: false
  const homeSectionsPath = path.join(root, 'src/components/home/HomeDeferredSections.tsx');
  const homeSectionsContent = fs.readFileSync(homeSectionsPath, 'utf8');
  assert.equal(
    homeSectionsContent.includes('ssr: false'),
    false,
    'HomeDeferredSections must not use ssr: false'
  );

  // 2. MatcherLoader does not have ssr: false
  const matcherLoaderPath = path.join(root, 'src/app/matcher/MatcherLoader.tsx');
  const matcherLoaderContent = fs.readFileSync(matcherLoaderPath, 'utf8');
  assert.equal(
    matcherLoaderContent.includes('ssr: false'),
    false,
    'MatcherLoader must not use ssr: false'
  );

  // 3. robots.ts disallows auth-only/shell routes
  const robotsPath = path.join(root, 'src/app/robots.ts');
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  assert.ok(robotsContent.includes("'/matcher'"), 'robots.ts must disallow /matcher');
  assert.ok(robotsContent.includes("'/dashboard'"), 'robots.ts must disallow /dashboard');
  assert.ok(robotsContent.includes("'/proposal-studio'"), 'robots.ts must disallow /proposal-studio');

  // 4. metadata robots: noindex on private shell pages
  const matcherPagePath = path.join(root, 'src/app/matcher/page.tsx');
  const matcherPageContent = fs.readFileSync(matcherPagePath, 'utf8');
  assert.ok(matcherPageContent.includes('index: false'), 'matcher page must specify robots index: false');

  const dashboardPagePath = path.join(root, 'src/app/dashboard/page.tsx');
  const dashboardPageContent = fs.readFileSync(dashboardPagePath, 'utf8');
  assert.ok(dashboardPageContent.includes('index: false'), 'dashboard page must specify robots index: false');

  const studioPagePath = path.join(root, 'src/app/proposal-studio/page.tsx');
  const studioPageContent = fs.readFileSync(studioPagePath, 'utf8');
  assert.ok(studioPageContent.includes('index: false'), 'proposal studio page must specify robots index: false');

  // 5. sitemap does not list private matcher page
  const sitemapPath = path.join(root, 'src/app/sitemap.ts');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  assert.equal(sitemapContent.includes("path: '/matcher'"), false, 'sitemap must not include /matcher');
});

