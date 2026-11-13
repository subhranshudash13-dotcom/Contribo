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
const ical = load('src/lib/calendar/ical-generator.ts');
const { FALLBACK_PROGRAMS_CALENDAR } = load('src/lib/calendar/programs-data.ts');

const {
  foldLine,
  escapeText,
  slugifyText,
  parseDate,
  formatUtcDateTime,
  formatUtcDate,
  generateEventUid,
  serializeIcalendar,
  generateProgramIcal,
  generateConsolidatedIcal,
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  toWebcalUrl,
} = ical;

test('1. RFC 5545 Line-Folding Algorithm (75 octets)', async (t) => {
  await t.test('short lines under 75 octets are preserved without folding', () => {
    const short = 'SUMMARY:Google Summer of Code Application Deadline';
    assert.equal(foldLine(short), short);
  });

  await t.test('folds lines exceeding 75 octets with CRLF and single space continuation', () => {
    const long =
      'DESCRIPTION:This is an exceptionally long program description that explains all milestones, application steps, and proposal drafting tips for Google Summer of Code 2026.';
    const folded = foldLine(long);
    assert.ok(folded.includes('\r\n '));

    const parts = folded.split('\r\n');
    for (let i = 0; i < parts.length; i++) {
      const partBytes = Buffer.byteLength(parts[i], 'utf8');
      assert.ok(
        partBytes <= 75,
        `Folded line ${i} exceeds 75 octets: ${partBytes} bytes ("${parts[i]}")`
      );
    }
  });

  await t.test('multi-byte UTF-8 characters are counted by octets and not split in half', () => {
    // Each emoji / euro symbol is 3 or 4 octets
    const euroLine = 'SUMMARY:Stipend disbursed in €4800 installments — ' + '💶'.repeat(25);
    const folded = foldLine(euroLine);
    const parts = folded.split('\r\n');

    for (const part of parts) {
      assert.ok(Buffer.byteLength(part, 'utf8') <= 75);
    }
  });
});

test('2. RFC 5545 Text Escaping', async (t) => {
  await t.test('escapes backslashes, semicolons, commas, and newlines', () => {
    const input = 'Project; Title, with \\ backslash and\nnew\r\nline';
    const escaped = escapeText(input);
    assert.equal(escaped, 'Project\\; Title\\, with \\\\ backslash and\\nnew\\nline');
  });

  await t.test('handles empty and undefined text gracefully', () => {
    assert.equal(escapeText(undefined), '');
    assert.equal(escapeText(''), '');
  });
});

test('3. Deterministic UID Generation', async (t) => {
  await t.test('slugifyText formats strings to lowercase hyphenated slugs', () => {
    assert.equal(slugifyText('Google Summer of Code 2026!'), 'google-summer-of-code-2026');
  });

  await t.test('generates repeatable, unique UIDs based on program slug, year, and event name', () => {
    const event = {
      summary: 'Contributor Applications Open',
      startDate: '2026-03-24',
      programSlug: 'gsoc',
    };
    const uid1 = generateEventUid(event);
    const uid2 = generateEventUid(event);

    assert.equal(uid1, uid2);
    assert.equal(uid1, 'milestone_gsoc_2026_contributor-applications-open@contribo.org');
  });

  await t.test('preserves explicit UID if already supplied', () => {
    const custom = {
      uid: 'custom-uid-12345@domain.com',
      summary: 'Test',
      startDate: '2026-01-01',
    };
    assert.equal(generateEventUid(custom), 'custom-uid-12345@domain.com');
  });
});

test('4. Date Formatting & Normalization', async (t) => {
  await t.test('parses YYYY-MM-DD date strings into UTC 18:00 cutoff by default', () => {
    const d = parseDate('2026-04-13');
    assert.equal(d.getUTCFullYear(), 2026);
    assert.equal(d.getUTCMonth(), 3); // 0-indexed April
    assert.equal(d.getUTCDate(), 13);
    assert.equal(d.getUTCHours(), 18);
  });

  await t.test('formats UTC date-time string YYYYMMDDTHHMMSSZ', () => {
    const d = new Date(Date.UTC(2026, 3, 13, 18, 0, 0));
    assert.equal(formatUtcDateTime(d), '20260413T180000Z');
  });

  await t.test('formats UTC date-only string YYYYMMDD', () => {
    const d = new Date(Date.UTC(2026, 3, 13, 18, 0, 0));
    assert.equal(formatUtcDate(d), '20260413');
  });
});

test('5. RFC 5545 iCalendar Serialization & Reminder Alarms (VALARM)', async (t) => {
  await t.test('generates full VCALENDAR stream with 3-tier alarms (-P7D, -P2D, -PT2H)', () => {
    const event = {
      summary: 'GSoC Final Proposal Submission',
      startDate: '2026-04-13',
      programSlug: 'gsoc',
      programName: 'Google Summer of Code',
      organizer: 'Google',
      url: 'https://summerofcode.withgoogle.com',
      allDay: true,
      alarms: true,
    };

    const ics = serializeIcalendar({
      calName: 'GSoC 2026 Deadlines',
      events: [event],
    });

    // Check CRLF endings
    assert.ok(ics.includes('\r\n'));
    assert.ok(ics.endsWith('\r\n'));

    // Check Headers
    assert.ok(ics.includes('BEGIN:VCALENDAR'));
    assert.ok(ics.includes('VERSION:2.0'));
    assert.ok(ics.includes('PRODID:-//Contribo//Program Milestone Calendar//EN'));
    assert.ok(ics.includes('CALSCALE:GREGORIAN'));
    assert.ok(ics.includes('METHOD:PUBLISH'));
    assert.ok(ics.includes('X-WR-CALNAME:GSoC 2026 Deadlines'));
    assert.ok(ics.includes('X-WR-TIMEZONE:UTC'));

    // Check Event block
    assert.ok(ics.includes('BEGIN:VEVENT'));
    assert.ok(ics.includes('UID:milestone_gsoc_2026_gsoc-final-proposal-submission@contribo.org'));
    assert.ok(ics.includes('SUMMARY:GSoC Final Proposal Submission'));
    assert.ok(ics.includes('DTSTART;VALUE=DATE:20260413'));
    assert.ok(ics.includes('DTEND;VALUE=DATE:20260414'));
    assert.ok(ics.includes('STATUS:CONFIRMED'));
    assert.ok(ics.includes('TRANSP:TRANSPARENT'));

    // Check VALARM reminders
    assert.ok(ics.includes('BEGIN:VALARM'));
    assert.ok(ics.includes('TRIGGER:-P7D'));
    assert.ok(ics.includes('TRIGGER:-P2D'));
    assert.ok(ics.includes('TRIGGER:-PT2H'));
    assert.ok(ics.includes('END:VALARM'));

    assert.ok(ics.includes('END:VEVENT'));
    assert.ok(ics.includes('END:VCALENDAR'));
  });
});

test('6. Single Program Calendar Generator (generateProgramIcal)', async () => {
  const gsoc = FALLBACK_PROGRAMS_CALENDAR.find((p) => p.slug === 'gsoc');
  assert.ok(gsoc, 'GSoC program data must be present');

  const ics = generateProgramIcal(gsoc);
  assert.ok(ics.includes('X-WR-CALNAME:Google Summer of Code 2026 Timeline'));
  assert.ok(ics.includes('SUMMARY:Google Summer of Code: Contributor Applications Open'));
  assert.ok(ics.includes('SUMMARY:Google Summer of Code: Application Deadline'));

  // Ensure all events in gsoc.timeline are serialized
  for (const item of gsoc.timeline) {
    assert.ok(ics.includes(item.event), `Event "${item.event}" must be present in .ics output`);
  }
});

test('7. Consolidated Multi-Program Calendar Generator (generateConsolidatedIcal)', async () => {
  const ics = generateConsolidatedIcal(FALLBACK_PROGRAMS_CALENDAR);

  assert.ok(ics.includes('X-WR-CALNAME:Contribo Open Source Programs 2026'));
  assert.ok(ics.includes('Google Summer of Code: Application Deadline'));
  assert.ok(ics.includes('Outreachy: Initial Applications Open'));
  assert.ok(ics.includes('LFX Mentorship: Applications Open (Summer)'));
  assert.ok(ics.includes('Nexus Spring of Code (NSoC): Contribution Sprint Starts'));

  // Count total events
  const totalEventsInCatalog = FALLBACK_PROGRAMS_CALENDAR.reduce(
    (acc, p) => acc + p.timeline.length,
    0
  );
  const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
  assert.equal(veventCount, totalEventsInCatalog);
});

test('8. Web Intent URLs & Subscription Links', async (t) => {
  await t.test('buildGoogleCalendarUrl builds valid Google Calendar web intent', () => {
    const url = buildGoogleCalendarUrl({
      title: 'GSoC Deadline',
      startDate: '2026-04-13',
      details: 'Submit final draft proposal',
      location: 'Online',
    });

    assert.ok(url.startsWith('https://calendar.google.com/calendar/render?'));
    assert.ok(url.includes('action=TEMPLATE'));
    assert.ok(url.includes('text=GSoC+Deadline'));
    assert.ok(url.includes('details=Submit+final+draft+proposal'));
  });

  await t.test('buildOutlookCalendarUrl builds valid Outlook web intent', () => {
    const url = buildOutlookCalendarUrl({
      title: 'Outreachy Initial App Due',
      startDate: '2026-08-31',
      details: 'Check background and essay questions',
    });

    assert.ok(url.startsWith('https://outlook.live.com/calendar/0/deeplink/compose?'));
    assert.ok(url.includes('subject=Outreachy+Initial+App+Due'));
    assert.ok(url.includes('startdt='));
  });

  await t.test('toWebcalUrl converts http/https URLs to webcal:// feeds', () => {
    assert.equal(
      toWebcalUrl('https://contribo.org/api/programs/gsoc/calendar.ics'),
      'webcal://contribo.org/api/programs/gsoc/calendar.ics'
    );
    assert.equal(
      toWebcalUrl('http://localhost:3000/api/programs/calendar.ics'),
      'webcal://localhost:3000/api/programs/calendar.ics'
    );
  });
});

test('9. REST API Route Handlers Integration', async (t) => {
  const mockSecurity = { safeLogError: () => {} };
  const mockProgramsRepo = {
    getProgramBySlug: async (slug) => {
      return FALLBACK_PROGRAMS_CALENDAR.find((p) => p.slug === slug) || null;
    },
    listPrograms: async () => FALLBACK_PROGRAMS_CALENDAR,
  };

  const apiLoader = sourceLoader({
    '@/lib/repositories/programs': mockProgramsRepo,
    '@/lib/security': mockSecurity,
  });

  const singleProgramRoute = apiLoader('src/app/api/programs/[slug]/calendar.ics/route.ts');
  const consolidatedRoute = apiLoader('src/app/api/programs/calendar.ics/route.ts');

  await t.test('GET /api/programs/[slug]/calendar.ics returns 200 with text/calendar', async () => {
    const req = {
      headers: {
        get: (h) => (h === 'host' ? 'contribo.org' : 'https'),
      },
    };
    const res = await singleProgramRoute.GET(req, {
      params: Promise.resolve({ slug: 'gsoc' }),
    });

    assert.equal(res.status, 200);
    const contentType = typeof res.headers?.get === 'function' ? res.headers.get('content-type') : res.headers?.['Content-Type'];
    const contentDisposition = typeof res.headers?.get === 'function' ? res.headers.get('content-disposition') : res.headers?.['Content-Disposition'];
    const cacheControl = typeof res.headers?.get === 'function' ? res.headers.get('cache-control') : res.headers?.['Cache-Control'];

    assert.equal(contentType, 'text/calendar; charset=utf-8');
    assert.equal(contentDisposition, 'attachment; filename="contribo-gsoc-timeline.ics"');
    assert.ok(cacheControl);

    const body = await (typeof res.text === 'function' ? res.text() : res.body);
    assert.ok(body.includes('BEGIN:VCALENDAR'));
    assert.ok(body.includes('Google Summer of Code: Application Deadline'));
  });

  await t.test('GET /api/programs/[slug]/calendar.ics returns 404 for unknown program', async () => {
    const req = { headers: { get: () => 'localhost:3000' } };
    const res = await singleProgramRoute.GET(req, {
      params: Promise.resolve({ slug: 'non-existent-program' }),
    });
    assert.equal(res.status, 404);
  });

  await t.test('GET /api/programs/calendar.ics returns 200 consolidated stream', async () => {
    const req = { headers: { get: () => 'localhost:3000' } };
    const res = await consolidatedRoute.GET(req);

    assert.equal(res.status, 200);
    const contentType = typeof res.headers?.get === 'function' ? res.headers.get('content-type') : res.headers?.['Content-Type'];
    const contentDisposition = typeof res.headers?.get === 'function' ? res.headers.get('content-disposition') : res.headers?.['Content-Disposition'];

    assert.equal(contentType, 'text/calendar; charset=utf-8');
    assert.equal(
      contentDisposition,
      'attachment; filename="contribo-all-programs-2026.ics"'
    );

    const body = await (typeof res.text === 'function' ? res.text() : res.body);
    assert.ok(body.includes('Contribo Open Source Programs 2026'));
  });
});
