import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Hashes a plaintext password using scrypt key derivation.
 * Stored format: saltHex:hashHex
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored salt:hash string using
 * constant-time comparison. Never throws on malformed input.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || !storedHash.includes(':')) return false;

  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash || !/^[0-9a-fA-F]+$/.test(salt) || !/^[0-9a-fA-F]+$/.test(hash)) {
    return false;
  }

  try {
    const testHash = scryptSync(password, salt, 64);
    const originalHash = Buffer.from(hash, 'hex');

    // timingSafeEqual throws if lengths differ — treat as invalid instead.
    if (testHash.length !== originalHash.length) return false;

    return timingSafeEqual(testHash, originalHash);
  } catch {
    return false;
  }
}
