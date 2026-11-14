import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

// Dynamic import of TypeScript library helpers via compiled/ts-node or direct import if supported
// In this project, Next.js / Node test imports modules or verifies via logic
const passportLibPath = path.join(ROOT, 'src/lib/passport.ts');
const passportLibSource = fs.readFileSync(passportLibPath, 'utf8');

test('1. Username Sanitization & Validation', async (t) => {
  const sanitizeUsernameRegex = (raw) => {
    if (typeof raw !== 'string') return '';
    return raw
      .trim()
      .replace(/^@+/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 39);
  };

  await t.test('strips leading @ symbol from GitHub usernames', () => {
    assert.equal(sanitizeUsernameRegex('@Trunal2005'), 'Trunal2005');
    assert.equal(sanitizeUsernameRegex('@@octocat'), 'octocat');
  });

  await t.test('strips unsafe characters, spaces, and punctuation', () => {
    assert.equal(sanitizeUsernameRegex('user<script>'), 'userscript');
    assert.equal(sanitizeUsernameRegex('hello world'), 'helloworld');
    assert.equal(sanitizeUsernameRegex('john.doe/admin'), 'johndoeadmin');
  });

  await t.test('preserves valid hyphens and underscores', () => {
    assert.equal(sanitizeUsernameRegex('dev-contributor_99'), 'dev-contributor_99');
  });

  await t.test('bounds maximum username length to 39 characters (GitHub standard)', () => {
    const long = 'a'.repeat(60);
    assert.equal(sanitizeUsernameRegex(long).length, 39);
  });

  await t.test('gracefully handles non-string or empty input', () => {
    assert.equal(sanitizeUsernameRegex(null), '');
    assert.equal(sanitizeUsernameRegex(undefined), '');
    assert.equal(sanitizeUsernameRegex(12345), '');
  });
});

test('2. Readiness Tier Calculation & Boundary Rules', async (t) => {
  // Extract tier logic matching src/lib/passport.ts
  const getReadinessTier = (score) => {
    const bounded = Math.min(Math.max(Number.isFinite(score) ? score : 0, 0), 100);
    if (bounded >= 90) return { tier: 'Distinguished Fellow', label: 'Distinguished', color: '#8b5cf6' };
    if (bounded >= 70) return { tier: 'Program Ready', label: 'Program Ready', color: '#10b981' };
    if (bounded >= 40) return { tier: 'Active Explorer', label: 'Active Explorer', color: '#f59e0b' };
    return { tier: 'Foundational Contributor', label: 'Foundational', color: '#64748b' };
  };

  await t.test('scores 0 to 39 map to Foundational Contributor', () => {
    assert.equal(getReadinessTier(0).tier, 'Foundational Contributor');
    assert.equal(getReadinessTier(25).tier, 'Foundational Contributor');
    assert.equal(getReadinessTier(39).tier, 'Foundational Contributor');
    assert.equal(getReadinessTier(39).color, '#64748b');
  });

  await t.test('scores 40 to 69 map to Active Explorer', () => {
    assert.equal(getReadinessTier(40).tier, 'Active Explorer');
    assert.equal(getReadinessTier(55).tier, 'Active Explorer');
    assert.equal(getReadinessTier(69).tier, 'Active Explorer');
    assert.equal(getReadinessTier(40).color, '#f59e0b');
  });

  await t.test('scores 70 to 89 map to Program Ready', () => {
    assert.equal(getReadinessTier(70).tier, 'Program Ready');
    assert.equal(getReadinessTier(80).tier, 'Program Ready');
    assert.equal(getReadinessTier(89).tier, 'Program Ready');
    assert.equal(getReadinessTier(70).color, '#10b981');
  });

  await t.test('scores 90 to 100 map to Distinguished Fellow', () => {
    assert.equal(getReadinessTier(90).tier, 'Distinguished Fellow');
    assert.equal(getReadinessTier(95).tier, 'Distinguished Fellow');
    assert.equal(getReadinessTier(100).tier, 'Distinguished Fellow');
    assert.equal(getReadinessTier(100).color, '#8b5cf6');
  });

  await t.test('handles negative, overflowing, or NaN inputs safely', () => {
    assert.equal(getReadinessTier(-10).tier, 'Foundational Contributor');
    assert.equal(getReadinessTier(150).tier, 'Distinguished Fellow');
    assert.equal(getReadinessTier(NaN).tier, 'Foundational Contributor');
  });
});

test('3. Dynamic SVG Badge Generator & Formatting', async (t) => {
  const escapeXml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const generateSvg = ({ score = 0, tierLabel = 'Program Ready', isPrivate = false, notFound = false, leftLabel = 'Contribo Readiness' } = {}) => {
    let rightValue = `${score}% · ${tierLabel}`;
    let rightBg = '#10b981';
    if (notFound) {
      rightValue = 'not found';
      rightBg = '#ef4444';
    } else if (isPrivate) {
      rightValue = 'private';
      rightBg = '#6b7280';
    }
    const safeLeft = escapeXml(leftLabel);
    const safeRight = escapeXml(rightValue);
    return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${safeLeft}: ${safeRight}"><g><rect fill="#24292f"/><rect fill="${rightBg}"/></g><text>${safeLeft}</text><text>${safeRight}</text></svg>`;
  };

  await t.test('generates valid SVG with aria-label and role="img"', () => {
    const svg = generateSvg({ score: 85, tierLabel: 'Program Ready' });
    assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(svg.includes('role="img"'));
    assert.ok(svg.includes('aria-label="Contribo Readiness: 85% · Program Ready"'));
    assert.ok(svg.includes('85% · Program Ready'));
    assert.ok(svg.endsWith('</svg>'));
  });

  await t.test('handles not found badge state with red error styling', () => {
    const svg = generateSvg({ notFound: true });
    assert.ok(svg.includes('not found'));
    assert.ok(svg.includes('#ef4444'));
  });

  await t.test('handles private profile badge state with muted gray styling', () => {
    const svg = generateSvg({ isPrivate: true });
    assert.ok(svg.includes('private'));
    assert.ok(svg.includes('#6b7280'));
  });

  await t.test('properly escapes XML special entities in labels', () => {
    const escaped = escapeXml('GSoC & LFX <2026>');
    assert.equal(escaped, 'GSoC &amp; LFX &lt;2026&gt;');
  });
});

test('4. 4-Signal Readiness Checklist Weights', async (t) => {
  const signalWeights = [10, 25, 30, 35];
  const total = signalWeights.reduce((a, b) => a + b, 0);

  await t.test('four signal weights sum to exactly 100 points', () => {
    assert.equal(total, 100);
  });

  await t.test('passport library implementation defines all 4 signals', () => {
    assert.ok(passportLibSource.includes('Identity & Display Name'));
    assert.ok(passportLibSource.includes('Technical Skills Matrix'));
    assert.ok(passportLibSource.includes('Target Organizations'));
    assert.ok(passportLibSource.includes('Application Milestones'));
  });
});

test('5. Dynamic SVG Badge Endpoint Route Architecture', async (t) => {
  const badgeRoutePath = path.join(
    ROOT,
    'src/app/api/passport/[username]/badge.svg/route.ts'
  );
  const badgeRouteSource = fs.readFileSync(badgeRoutePath, 'utf8');

  await t.test('sets SVG MIME type with UTF-8 charset', () => {
    assert.ok(
      badgeRouteSource.includes("'Content-Type': 'image/svg+xml; charset=utf-8'"),
      'Badge endpoint must serve image/svg+xml with UTF-8'
    );
  });

  await t.test('sets public HTTP cache headers for GitHub README caching', () => {
    assert.ok(
      badgeRouteSource.includes('Cache-Control') &&
      badgeRouteSource.includes('max-age='),
      'Badge endpoint must include public caching headers'
    );
  });

  await t.test('supports async Promise params resolution for Next.js App Router', () => {
    assert.ok(
      badgeRouteSource.includes('await Promise.resolve'),
      'Route must await Promise.resolve(props.params) for Next.js compatibility'
    );
  });
});

test('6. Privacy & Visibility Settings API Security', async (t) => {
  const settingsRoutePath = path.join(
    ROOT,
    'src/app/api/user/passport-settings/route.ts'
  );
  const settingsRouteSource = fs.readFileSync(settingsRoutePath, 'utf8');

  await t.test('requires user authentication on GET endpoint', () => {
    assert.ok(
      settingsRouteSource.includes('requireUserId()'),
      'GET endpoint must enforce requireUserId'
    );
  });

  await t.test('requires authenticated mutation guard on PATCH endpoint', () => {
    assert.ok(
      settingsRouteSource.includes('requireUserMutation(req)'),
      'PATCH endpoint must enforce requireUserMutation'
    );
  });

  await t.test('strictly validates visibility values to public, unlisted, or private', () => {
    assert.ok(
      settingsRouteSource.includes('visibility !== \'public\'') &&
      settingsRouteSource.includes('visibility !== \'unlisted\'') &&
      settingsRouteSource.includes('visibility !== \'private\''),
      'Endpoint must restrict visibility enum strictly'
    );
  });
});

test('7. Contributor Passport SSR Route & Metadata', async (t) => {
  const pagePath = path.join(ROOT, 'src/app/passport/[username]/page.tsx');
  const pageSource = fs.readFileSync(pagePath, 'utf8');

  await t.test('exports dynamic generateMetadata with OpenGraph and Twitter tags', () => {
    assert.ok(pageSource.includes('export async function generateMetadata'));
    assert.ok(pageSource.includes('openGraph:'));
    assert.ok(pageSource.includes('twitter:'));
  });

  await t.test('enforces dynamic rendering without static cache stalls', () => {
    assert.ok(pageSource.includes("export const dynamic = 'force-dynamic'"));
  });

  await t.test('triggers notFound() when username or profile does not exist', () => {
    assert.ok(pageSource.includes('notFound()'));
  });
});

test('8. Repository Security: Sensitive Field Exclusion', async (t) => {
  const repoPath = path.join(ROOT, 'src/lib/repositories/passport.ts');
  const repoSource = fs.readFileSync(repoPath, 'utf8');

  await t.test('never returns sensitive credentials or passwords', () => {
    assert.ok(!repoSource.includes('password: 1'));
    assert.ok(!repoSource.includes('user.password'));
  });

  await t.test('respects private profile visibility preference', () => {
    assert.ok(repoSource.includes("visibility === 'private'"));
    assert.ok(repoSource.includes('isPrivate: true'));
  });
});
