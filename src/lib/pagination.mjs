// Page maths for paginated list pages. Plain JS so the node test runner can
// import it directly, like application-milestones.mjs.

/**
 * Reads a 1-based page number from a search param. Anything that isn't a whole
 * number of at least 1 (missing, "0", "-3", "abc", "1.5") becomes 1, so it can
 * never turn into a negative or NaN skip.
 *
 * @param {string | string[] | undefined} raw
 * @returns {number}
 */
export function parsePage(raw) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return 1;
  const page = Number.parseInt(value.trim(), 10);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

/**
 * Number of pages for `total` items. Always at least 1, so an empty list
 * still has a page 1.
 *
 * @param {number} total
 * @param {number} pageSize
 * @returns {number}
 */
export function pageCount(total, pageSize) {
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Up to `size` page numbers around `page`, kept inside 1..totalPages, for the
 * numbered page links.
 *
 * @param {number} page
 * @param {number} totalPages
 * @param {number} [size]
 * @returns {number[]}
 */
export function pageWindow(page, totalPages, size = 5) {
  const start = Math.max(1, Math.min(page - Math.floor(size / 2), totalPages - size + 1));
  const end = Math.min(totalPages, start + size - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * 1-based first and last item shown on `page`, e.g. { start: 121, end: 240 }.
 *
 * @param {number} page
 * @param {number} pageSize
 * @param {number} total
 * @returns {{ start: number, end: number }}
 */
export function pageRange(page, pageSize, total) {
  if (total <= 0) return { start: 0, end: 0 };
  return { start: (page - 1) * pageSize + 1, end: Math.min(total, page * pageSize) };
}
