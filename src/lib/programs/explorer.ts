/**
 * Slugs of programs that have the organization explorer enabled.
 * This list must match the slugs used in scripts/seed-programs.js.
 * 
 * Keep this in sync with the seed script. When adding a new program
 * to seed-programs.js, add its slug here if it should have an explorer.
 */
export const EXPLORER_ENABLED_SLUGS = new Set([
  'gsoc',
  'lfx',
  'esoc',
  'outreachy',
  'summer-of-bitcoin',
  'mlh-fellowship',
  'hacktoberfest',
  'gssoc',
  'nsoc',
]);