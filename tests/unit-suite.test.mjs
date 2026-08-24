import test from 'node:test';
import assert from 'node:assert/strict';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { ObjectId } from 'mongodb';

// ==========================================
// 1. Password Hashing & Verification Logic
// ==========================================
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash || !/^[0-9a-fA-F]+$/.test(salt) || !/^[0-9a-fA-F]+$/.test(hash)) {
    return false;
  }
  try {
    const testHash = scryptSync(password, salt, 64);
    const originalHash = Buffer.from(hash, 'hex');
    if (testHash.length !== originalHash.length) return false;
    return timingSafeEqual(testHash, originalHash);
  } catch {
    return false;
  }
}

// ==========================================
// 2. Serialization Helpers
// ==========================================
function serializeDoc(doc) {
  if (!doc) return null;
  const out = { ...doc };

  if (out._id instanceof ObjectId) {
    out._id = out._id.toString();
  } else if (out._id != null) {
    out._id = String(out._id);
  }

  for (const key of Object.keys(out)) {
    const value = out[key];
    if (value instanceof ObjectId) {
      out[key] = value.toString();
    } else if (value instanceof Date) {
      out[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      out[key] = value.map((item) => {
        if (item instanceof ObjectId) return item.toString();
        if (item instanceof Date) return item.toISOString();
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return serializeDoc(item);
        }
        return item;
      });
    } else if (value && typeof value === 'object') {
      out[key] = serializeDoc(value);
    }
  }
  return out;
}

function toObjectId(id) {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return new ObjectId(id);
  }
  if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
    return new ObjectId(id);
  }
  return null;
}

// ==========================================
// 3. Security & Redaction Helpers
// ==========================================
const MAX_JSON_BODY_BYTES = 1_048_576;

function redactSecrets(input) {
  const s = typeof input === 'string' ? input : String(input ?? '');
  return s
    .replace(/mongodb(\+srv)?:\/\/[^\s"']+/gi, 'mongodb://[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer [REDACTED]')
    .replace(/sk-[A-Za-z0-9]{10,}/g, 'sk-[REDACTED]')
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/key=[A-Za-z0-9_\-]{10,}/gi, 'key=[REDACTED]')
    .replace(
      /(password|secret|token|api[_-]?key)\s*[:=]\s*["']?[^"'\s,}+]+/gi,
      '$1=[REDACTED]'
    );
}

function checkBodySize(contentLength, maxBytes = MAX_JSON_BODY_BYTES) {
  if (!contentLength) return { ok: true };
  const n = parseInt(contentLength, 10);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, message: 'Invalid Content-Length', status: 400, code: 'validation' };
  }
  if (n > maxBytes) {
    return { ok: false, message: `Request body too large`, status: 413, code: 'validation' };
  }
  return { ok: true };
}

function createRequestId() {
  return `req_${Math.random().toString(36).slice(2, 10)}`;
}

// ==========================================
// 4. Client Error & Status Helpers
// ==========================================
function codeFromStatus(status) {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 400 || status === 422) return 'validation';
  if (status === 429) return 'rate_limited';
  if (status === 503) return 'service_unavailable';
  if (status >= 500) return 'server';
  return 'unknown';
}

// ==========================================
// 5. Org Logo Resolution Logic
// ==========================================
const KNOWN_BRAND_LOGOS = {
  'apache': 'https://cdn.simpleicons.org/apache',
  'python': 'https://cdn.simpleicons.org/python',
  'kde': 'https://cdn.simpleicons.org/kde',
  'llvm': 'https://cdn.simpleicons.org/llvm',
  'gnome': 'https://cdn.simpleicons.org/gnome',
  'mozilla': 'https://cdn.simpleicons.org/mozilla',
  'wikimedia': 'https://cdn.simpleicons.org/wikimedia',
  'tor': 'https://cdn.simpleicons.org/torbrowser',
  'google': 'https://cdn.simpleicons.org/google',
  'redhat': 'https://cdn.simpleicons.org/redhat',
  'kubernetes': 'https://cdn.simpleicons.org/kubernetes',
  'rust': 'https://cdn.simpleicons.org/rust',
};

function resolveOrgLogo(slug, name, currentLogoUrl) {
  const s = (slug || '').toLowerCase().trim();
  const n = (name || '').toLowerCase().trim();
  if (KNOWN_BRAND_LOGOS[s]) return KNOWN_BRAND_LOGOS[s];
  for (const [key, url] of Object.entries(KNOWN_BRAND_LOGOS)) {
    if (s === key || s.startsWith(`${key}-`)) return url;
  }
  if (n.includes('tor project') || n.includes('tor')) return 'https://cdn.simpleicons.org/torbrowser';
  if (n.includes('rust')) return 'https://cdn.simpleicons.org/rust';
  if (n.includes('python')) return 'https://cdn.simpleicons.org/python';
  if (n.includes('apache') || n.includes('asf')) return 'https://cdn.simpleicons.org/apache';
  if (n.includes('google')) return 'https://cdn.simpleicons.org/google';
  if (currentLogoUrl && currentLogoUrl.trim().length > 0) return currentLogoUrl.trim();
  const cleanSlug = s.replace(/-(outreachy|gsoc|lfx|nsoc|gssoc|mlh)$/, '').replace(/[^a-z0-9]/g, '');
  if (cleanSlug.length > 2) return `https://cdn.simpleicons.org/${cleanSlug}`;
  return '';
}

// ==========================================
// TEST SUITES
// ==========================================

test('1. Password Hashing & Constant-time Verification', async (t) => {
  await t.test('hashes and correctly verifies passwords', () => {
    const pwd = 'CorrectHorseBatteryStaple123!';
    const hashed = hashPassword(pwd);
    assert.ok(hashed.includes(':'));
    assert.equal(verifyPassword(pwd, hashed), true);
    assert.equal(verifyPassword('WrongPassword123!', hashed), false);
  });

  await t.test('handles malformed hashes gracefully without throwing', () => {
    assert.equal(verifyPassword('test', ''), false);
    assert.equal(verifyPassword('test', 'nosalt'), false);
    assert.equal(verifyPassword('test', 'invalid_hex:also_invalid'), false);
    assert.equal(verifyPassword('', '1234:5678'), false);
  });
});

test('2. Mongo Serialization & ObjectId Parsing', async (t) => {
  await t.test('correctly serializes ObjectIds and Date instances', () => {
    const rawOid = new ObjectId('507f1f77bcf86cd799439011');
    const rawDate = new Date('2026-08-20T00:00:00.000Z');
    const doc = {
      _id: rawOid,
      title: 'Open Source Project',
      createdAt: rawDate,
      tags: ['ai', 'typescript'],
      nested: {
        authorId: rawOid,
        updatedAt: rawDate,
      },
      list: [rawOid, { childId: rawOid }],
    };

    const serialized = serializeDoc(doc);
    assert.equal(serialized._id, '507f1f77bcf86cd799439011');
    assert.equal(serialized.createdAt, '2026-08-20T00:00:00.000Z');
    assert.equal(serialized.nested.authorId, '507f1f77bcf86cd799439011');
    assert.equal(serialized.nested.updatedAt, '2026-08-20T00:00:00.000Z');
    assert.equal(serialized.list[0], '507f1f77bcf86cd799439011');
    assert.equal(serialized.list[1].childId, '507f1f77bcf86cd799439011');
  });

  await t.test('handles null, undefined and toObjectId validation', () => {
    assert.equal(serializeDoc(null), null);
    assert.equal(serializeDoc(undefined), null);
    assert.equal(toObjectId(null), null);
    assert.equal(toObjectId('invalid-hex-id'), null);
    assert.ok(toObjectId('507f1f77bcf86cd799439011') instanceof ObjectId);
  });
});

test('3. Security, Content-Length & Secret Redaction', async (t) => {
  await t.test('redacts mongo connection strings and API keys', () => {
    const log1 = 'Error connecting to mongodb+srv://user:pass@cluster.mongodb.net/contribo';
    assert.equal(redactSecrets(log1), 'Error connecting to mongodb://[REDACTED]');

    const log2 = 'Failed with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and sk-1234567890abcdef';
    assert.equal(redactSecrets(log2), 'Failed with Bearer [REDACTED] and sk-[REDACTED]');

    const log3 = 'Using key AIzaSyD98765432101234567890 for Gemini call';
    assert.equal(redactSecrets(log3), 'Using key [REDACTED_API_KEY] for Gemini call');
  });

  await t.test('enforces body size limits', () => {
    assert.equal(checkBodySize('500').ok, true);
    assert.equal(checkBodySize('2000000', 1048576).ok, false);
    assert.equal(checkBodySize('2000000', 1048576).status, 413);
    assert.equal(checkBodySize('invalid-number').ok, false);
  });

  await t.test('generates valid correlation request IDs', () => {
    const reqId = createRequestId();
    assert.ok(reqId.startsWith('req_'));
    assert.ok(reqId.length >= 8);
  });
});

test('4. Client Error Status Code Mapping', async (t) => {
  await t.test('maps HTTP status codes accurately', () => {
    assert.equal(codeFromStatus(401), 'unauthorized');
    assert.equal(codeFromStatus(403), 'forbidden');
    assert.equal(codeFromStatus(404), 'not_found');
    assert.equal(codeFromStatus(400), 'validation');
    assert.equal(codeFromStatus(429), 'rate_limited');
    assert.equal(codeFromStatus(500), 'server');
    assert.equal(codeFromStatus(503), 'service_unavailable');
    assert.equal(codeFromStatus(200), 'unknown');
  });
});

test('5. Brand & Organization Logo Resolver', async (t) => {
  await t.test('resolves known open-source brands', () => {
    assert.equal(resolveOrgLogo('apache', 'Apache Software Foundation', ''), 'https://cdn.simpleicons.org/apache');
    assert.equal(resolveOrgLogo('mozilla-outreachy', 'Mozilla', ''), 'https://cdn.simpleicons.org/mozilla');
    assert.equal(resolveOrgLogo('kubernetes', 'Kubernetes', ''), 'https://cdn.simpleicons.org/kubernetes');
    assert.equal(resolveOrgLogo('tor-project', 'The Tor Project', ''), 'https://cdn.simpleicons.org/torbrowser');
  });

  await t.test('preserves existing custom logoUrl or falls back to SimpleIcons', () => {
    assert.equal(resolveOrgLogo('custom-org', 'Custom Organization', 'https://example.com/logo.png'), 'https://example.com/logo.png');
    assert.equal(resolveOrgLogo('react-outreachy', 'React Organization', ''), 'https://cdn.simpleicons.org/react');
  });
});

// ==========================================
// 6. GSoC Project Size & Stipend Calculation
// ==========================================
function getProjectScopeAndStipend(project) {
  const t = (project.title || '').toLowerCase();
  const d = (project.description || '').toLowerCase();
  const diff = (project.difficulty || '').toLowerCase();
  const prog = (project.programSlug || project.programName || '').toLowerCase();

  const isGSoC = prog.includes('gsoc') || prog.includes('google summer of code') || (!prog && (t.includes('gsoc') || d.includes('gsoc') || true));
  const isOutreachy = prog.includes('outreachy');

  if (t.includes('90h') || d.includes('90h') || diff.includes('beginner') || diff.includes('easy')) {
    return {
      size: 'small',
      sizeLabel: '90h (Small)',
      hours: 90,
      stipendRange: '$1,500 – $3,300 USD',
      shortStipend: '$1.5k–$3.3k',
      isGSoC,
    };
  }

  if (t.includes('350h') || d.includes('350h') || diff.includes('advanced') || diff.includes('hard')) {
    return {
      size: 'large',
      sizeLabel: '350h (Large)',
      hours: 350,
      stipendRange: '$6,000 – $13,200 USD',
      shortStipend: '$6k–$13.2k',
      isGSoC,
    };
  }

  if (isOutreachy) {
    return {
      size: 'standard',
      sizeLabel: 'Full-Time (~350h)',
      hours: 350,
      stipendRange: '$7,000 USD + $500 Travel',
      shortStipend: '$7,000',
      isGSoC: false,
    };
  }

  return {
    size: 'medium',
    sizeLabel: '175h (Medium)',
    hours: 175,
    stipendRange: '$3,000 – $6,600 USD',
    shortStipend: '$3k–$6.6k',
    isGSoC: true,
  };
}

test('6. GSoC Project Size & Stipend Calculation', async (t) => {
  await t.test('calculates small 90h project stipend correctly', () => {
    const smallProj = getProjectScopeAndStipend({
      title: 'Documentation and Simple Bugfixes (90h)',
      difficulty: 'Beginner',
      programName: 'Google Summer of Code',
    });
    assert.equal(smallProj.size, 'small');
    assert.equal(smallProj.hours, 90);
    assert.equal(smallProj.shortStipend, '$1.5k–$3.3k');
  });

  await t.test('calculates medium 175h standard project stipend correctly', () => {
    const medProj = getProjectScopeAndStipend({
      title: 'React Server Component Profiler',
      difficulty: 'Intermediate',
      programName: 'Google Summer of Code',
    });
    assert.equal(medProj.size, 'medium');
    assert.equal(medProj.hours, 175);
    assert.equal(medProj.shortStipend, '$3k–$6.6k');
  });

  await t.test('calculates large 350h advanced project stipend correctly', () => {
    const largeProj = getProjectScopeAndStipend({
      title: 'Compiler Backend Optimization (350h)',
      difficulty: 'Advanced',
      programName: 'Google Summer of Code',
    });
    assert.equal(largeProj.size, 'large');
    assert.equal(largeProj.hours, 350);
    assert.equal(largeProj.shortStipend, '$6k–$13.2k');
  });
});

test('7. Python Proposal PDF Engine', async (t) => {
  const { spawnSync } = await import('child_process');
  const path = await import('path');

  await t.test('invokes Python ReportLab engine and returns valid PDF binary', () => {
    const samplePayload = JSON.stringify({
      title: 'Distributed Tracing Integration',
      program: 'Google Summer of Code 2026',
      targetOrg: 'OpenTelemetry',
      year: 2026,
      author: 'Test Contributor',
      status: 'Ready for Submission',
      sections: {
        summary: 'A high-throughput eBPF metric collector for distributed tracing.',
        problem: 'Standard user-space collectors introduce overhead on high-load clusters.',
        solution: 'Kernel-level probes with ring buffer batching.',
        deliverables: '1. eBPF C probes\n2. Go userspace daemon\n3. Integration tests',
        timeline: 'Weeks 1-4: Kernel probes\nWeeks 5-8: Daemon\nWeeks 9-12: Docs & Polish',
        testing: 'PyTest and Go test framework with 90%+ coverage.',
        risks: 'Kernel compatibility differences across distributions.',
        aboutMe: 'Computer Science undergrad with contributions to OpenTelemetry.',
      },
    });

    const scriptPath = path.resolve(process.cwd(), 'scripts', 'proposal_pdf_engine.py');
    const result = spawnSync('python', [scriptPath, '-'], {
      input: Buffer.from(samplePayload, 'utf-8'),
    });

    assert.equal(result.status, 0, `Python script failed: ${result.stderr?.toString()}`);
    assert.ok(result.stdout && result.stdout.length > 500, 'PDF output should be non-empty binary');
    const pdfHeader = result.stdout.slice(0, 5).toString('ascii');
    assert.equal(pdfHeader, '%PDF-', 'Output should have valid PDF magic header');
  });
});


