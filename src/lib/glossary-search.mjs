/**
 * Pure filtering helpers for the open source glossary on /resources.
 * Kept framework-free so they can be unit tested with node:test.
 */

export function normalizeQuery(query) {
  return String(query ?? '').trim().toLowerCase();
}

/**
 * @template {{ term: string, category: string, shortDef: string, aliases?: string[] }} T
 * @param {T[]} items
 * @param {{ query?: string, category?: string }} [filters]
 * @returns {T[]}
 */
export function filterGlossary(items, { query = '', category = 'all' } = {}) {
  const q = normalizeQuery(query);

  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (!q) return true;

    return (
      item.term.toLowerCase().includes(q) ||
      item.shortDef.toLowerCase().includes(q) ||
      (item.aliases ?? []).some((alias) => alias.toLowerCase().includes(q))
    );
  });
}
