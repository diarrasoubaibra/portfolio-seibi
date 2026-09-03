/**
 * Session tokens are signed with the Web Crypto API (crypto.subtle) rather
 * than node:crypto's HMAC helpers, on purpose: this file is imported from
 * middleware.ts, which Next.js runs on the Edge runtime by default. The Edge
 * runtime does not expose node:crypto's createHmac/timingSafeEqual, but it
 * does expose the standard Web Crypto API — and so does the Node.js runtime
 * (globalThis.crypto), so the same code works in both places.
 */

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET manquant ou trop court. Défini une chaîne aléatoire d’au moins 32 caractères dans .env.local (voir .env.example).",
    );
  }
  return secret;
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signBase64Url(data: string): Promise<string> {
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bytesToBase64Url(sig);
}

/** Creates a signed, time-limited session token (not a cookie itself). */
export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const encodedPayload = bytesToBase64Url(new TextEncoder().encode(payload));
  const signature = await signBase64Url(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/** Verifies a session token's signature and expiry. Never throws. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encodedPayload, signature] = parts;

  let key: CryptoKey;
  try {
    key = await getHmacKey();
  } catch {
    return false;
  }

  let signatureIsValid = false;
  try {
    signatureIsValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(encodedPayload),
    );
  } catch {
    return false;
  }
  if (!signatureIsValid) return false;

  try {
    const payloadJson = new TextDecoder().decode(base64UrlToBytes(encodedPayload));
    const payload = JSON.parse(payloadJson) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
