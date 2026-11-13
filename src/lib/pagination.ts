/**
 * Turn a raw `page` search param into a safe 1-based integer.
 * Falls back to 1 for missing, non-numeric, zero, negative, fractional,
 * non-finite or repeated (array) values.
 */
export function parsePage(value: string | string[] | undefined | null): number {
  if (typeof value !== 'string') return 1;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return 1;
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n) || n < 1) return 1;
  return n;
}
