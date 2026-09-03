import { scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Verifies a plaintext password against the salted hash stored in env vars.
 * Uses node:crypto's scrypt, only available on the Node.js runtime. Kept in
 * its own file, separate from lib/auth.ts, so that middleware.ts (which
 * imports lib/auth.ts for session handling and runs on the Edge runtime)
 * never has an import path leading to node:crypto — the Edge bundler fails
 * the build if it does, even for code the Edge path never calls.
 */
export function verifyPassword(password: string): boolean {
  const salt = process.env.ADMIN_PASSWORD_SALT;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!salt || !hash) {
    throw new Error(
      "ADMIN_PASSWORD_SALT / ADMIN_PASSWORD_HASH manquants. Lance `npm run hash-password` puis reporte les valeurs dans .env.local.",
    );
  }
  if (!password) return false;

  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
