import test from 'node:test';
import assert from 'node:assert/strict';

const domains = [
  ['AI & Machine Learning', ['ai', 'machine learning', 'deep learning']],
  ['Cloud, DevOps & Infrastructure', ['cloud', 'kubernetes', 'devops']],
  ['Developer Tools & Compilers', ['developer tools', 'compilers', 'cli']],
  ['Databases & Data Engineering', ['database', 'sql', 'big data']],
  ['Web, Mobile & Fullstack', ['frontend', 'api', 'mobile']],
  ['Security, Cryptography & Blockchain', ['security', 'blockchain', 'web3']],
  ['Science, Aerospace & Simulation', ['science', 'astronomy', 'simulation']],
];

function normalizeCategory(category) {
  const value = category.toLowerCase();
  return domains.find(([, keywords]) => keywords.some((keyword) => value.includes(keyword)))?.[0] || 'Other';
}

function suggestionScore(query, name) {
  const normalizedQuery = query.toLowerCase();
  const normalizedName = name.toLowerCase();
  const words = normalizedName.split(/[^a-z0-9]+/).filter(Boolean);
  const acronym = words.map((word) => word[0]).join('');
  const overlap = [...new Set(normalizedQuery)].filter((character) => normalizedName.includes(character)).length;
  return (normalizedName.startsWith(normalizedQuery) ? 100 : 0)
    + (normalizedName.includes(normalizedQuery) ? 40 : 0)
    + (acronym.includes(normalizedQuery) ? 80 : 0)
    + overlap * 12;
}

test('organization domain labels collapse duplicate raw categories', () => {
  assert.equal(normalizeCategory('Blockchain & Web3'), 'Security, Cryptography & Blockchain');
  assert.equal(normalizeCategory('Developer Tooling & Compilers'), 'Developer Tools & Compilers');
  assert.equal(normalizeCategory('Astronomy and Space'), 'Science, Aerospace & Simulation');
  assert.equal(normalizeCategory('Community Programs'), 'Other');
});

test('organization suggestions prioritize prefixes and acronyms', () => {
  assert.ok(suggestionScore('post', 'PostgreSQL') > suggestionScore('post', 'Apache Software Foundation'));
  assert.ok(suggestionScore('cncf', 'Cloud Native Computing Foundation') > 0);
  assert.ok(suggestionScore('psoql', 'PostgreSQL') > 0);
});
