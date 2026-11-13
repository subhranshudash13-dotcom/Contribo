// Page maths for paginated list pages (page count, item range, page links).
// Plain JS so the node test runner can import it directly. parsePage lives in
// pagination.ts.

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
