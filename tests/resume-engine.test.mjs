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
const synthesizer = load('src/lib/resume/synthesizer.ts');
const templates = load('src/lib/resume/templates.ts');

const {
  generateXyzBullet,
  polishXyzBullet,
  synthesizeResumeFromPassport,
  convertToJsonResume,
  resumeToMarkdown,
} = synthesizer;

const { RESUME_THEMES, PRINT_STYLES } = templates;

const mockPassport = {
  username: 'testdev',
  githubUsername: 'testdev-gh',
  name: 'Test Developer',
  avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
  bio: 'Open source enthusiast and systems engineer.',
  score: 88,
  completedSignals: 7,
  tier: {
    tier: 'Distinguished Fellow',
    label: 'Top 5% Contributor Readiness',
    color: '#10b981',
    bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  skills: ['TypeScript', 'React', 'Next.js', 'Go', 'Docker'],
  targetOrganizations: [
    { id: 'org-1', name: 'Apache Software Foundation', program: 'GSoC' },
    { id: 'org-2', name: 'Linux Foundation', program: 'LFX Mentorship' },
  ],
  applicationsCount: 3,
  isPrivate: false,
};

test('1. Google XYZ Impact Bullet Synthesizer', async (t) => {
  await t.test('generates strict Google XYZ formatted bullet string', () => {
    const bullet = generateXyzBullet(
      'Authored distributed API circuit breaker',
      'reducing downstream endpoint cascade failures by 45%',
      'implementing canary probe health checking and exponential backoff',
      'Systems'
    );

    assert.equal(bullet.category, 'Systems');
    assert.equal(
      bullet.fullText,
      'Authored distributed API circuit breaker, resulting in reducing downstream endpoint cascade failures by 45%, by implementing canary probe health checking and exponential backoff.'
    );
    assert.ok(bullet.id.startsWith('b-'));
  });

  await t.test('polishes raw PR or commit message into Google XYZ standard', () => {
    const raw = 'Added redis caching to user session endpoints';
    const polished = polishXyzBullet(raw);

    assert.ok(polished.fullText.includes('Engineered added redis caching to user session endpoints'));
    assert.ok(polished.fullText.includes('100% test coverage'));
    assert.equal(polished.category, 'Full-Stack');
  });

  await t.test('preserves existing XYZ format when polishing pre-formatted text', () => {
    const preformatted =
      'Engineered rate limiter, resulting in zero API abuse incidents, by implementing sliding-window algorithm.';
    const polished = polishXyzBullet(preformatted);

    assert.equal(polished.fullText, preformatted);
  });
});

test('2. Passport to Resume Synthesis', async (t) => {
  await t.test('synthesizes complete ResumeData from valid public passport', () => {
    const resume = synthesizeResumeFromPassport(mockPassport);

    assert.equal(resume.basics.name, 'Test Developer');
    assert.equal(resume.basics.username, 'testdev');
    assert.equal(resume.basics.readinessTier, 'Distinguished Fellow');
    assert.equal(resume.basics.readinessScore, 88);
    assert.equal(resume.theme, 'minimalist');
    assert.equal(resume.showQrCode, true);
    assert.equal(resume.showReadinessBadge, true);

    // Verify projects derived from target organizations
    assert.ok(resume.featuredProjects.length >= 2);
    assert.equal(
      resume.featuredProjects[0].title,
      'Apache Software Foundation Contributor Initiative'
    );
    assert.equal(
      resume.featuredProjects[1].title,
      'Linux Foundation Community Contributions'
    );

    // Verify skills categorized
    assert.ok(resume.skills.length >= 2);
    const languages = resume.skills.find((s) => s.category === 'Languages & Frameworks');
    assert.ok(languages);
    assert.ok(languages.skills.includes('TypeScript'));

    // Verify awards
    assert.ok(resume.awards.length >= 1);
    assert.ok(resume.awards[0].title.includes('Distinguished Fellow'));
  });

  await t.test('falls back to default skills when user skills list is empty', () => {
    const emptySkillsPassport = { ...mockPassport, skills: [] };
    const resume = synthesizeResumeFromPassport(emptySkillsPassport);

    assert.ok(resume.skills.length > 0);
    const languages = resume.skills.find((s) => s.category === 'Languages & Frameworks');
    assert.ok(languages && languages.skills.length > 0);
  });
});

test('3. Schema.org JSON-Resume Standard Compliance', async (t) => {
  await t.test('converts ResumeData to standard JSON-Resume schema format', () => {
    const resume = synthesizeResumeFromPassport(mockPassport);
    const jsonResume = convertToJsonResume(resume);

    assert.ok(jsonResume.$schema.includes('jsonresume/resume-schema'));
    assert.equal(jsonResume.basics.name, 'Test Developer');
    assert.equal(jsonResume.basics.url, 'https://contribo-one.vercel.app/passport/testdev');

    // Profiles check
    assert.equal(jsonResume.basics.profiles.length, 2);
    assert.equal(jsonResume.basics.profiles[0].network, 'GitHub');
    assert.equal(jsonResume.basics.profiles[1].network, 'Contribo Passport');

    // Projects highlights check
    assert.ok(jsonResume.projects.length >= 2);
    assert.ok(Array.isArray(jsonResume.projects[0].highlights));
    assert.ok(jsonResume.projects[0].highlights.length > 0);

    // Skills check
    assert.ok(jsonResume.skills.length > 0);
    assert.ok(Array.isArray(jsonResume.skills[0].keywords));

    // Metadata check
    assert.equal(jsonResume.meta.version, '1.0.0');
    assert.ok(jsonResume.meta.generator.includes('Contribo'));
  });
});

test('4. Markdown / Plain Text Export Generator', async (t) => {
  await t.test('generates comprehensive markdown representation', () => {
    const resume = synthesizeResumeFromPassport(mockPassport);
    const md = resumeToMarkdown(resume);

    assert.ok(md.includes('# Test Developer'));
    assert.ok(md.includes('Verified Contribo Passport'));
    assert.ok(md.includes('88% (Distinguished Fellow)'));
    assert.ok(md.includes('## Technical Skills'));
    assert.ok(md.includes('## Open-Source Contributions & Projects'));
    assert.ok(md.includes('## Experience'));
    assert.ok(md.includes('## Verified Credentials & Awards'));
    assert.ok(md.includes('Tamper-Proof Verification: https://contribo-one.vercel.app/passport/testdev'));
  });
});

test('5. ATS Resume Themes & Print Styles', async (t) => {
  await t.test('defines all 3 supported ATS themes with proper layout configs', () => {
    assert.ok(RESUME_THEMES.minimalist);
    assert.ok(RESUME_THEMES.modern);
    assert.ok(RESUME_THEMES.academic);

    assert.equal(RESUME_THEMES.minimalist.id, 'minimalist');
    assert.equal(RESUME_THEMES.modern.id, 'modern');
    assert.equal(RESUME_THEMES.academic.id, 'academic');

    // Check ATS print safe containers
    assert.ok(RESUME_THEMES.minimalist.containerClass.includes('print:shadow-none'));
    assert.ok(RESUME_THEMES.modern.containerClass.includes('print:p-0'));
    assert.ok(RESUME_THEMES.academic.containerClass.includes('print:border-none'));
  });

  await t.test('includes print stylesheet rules for page breaks and media queries', () => {
    assert.ok(PRINT_STYLES.includes('@media print'));
    assert.ok(PRINT_STYLES.includes('page-break-inside: avoid'));
    assert.ok(PRINT_STYLES.includes('no-print'));
  });
});
