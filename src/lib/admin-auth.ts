// Auth primitives over a Cloudflare KV namespace. KV is passed in so this is unit-testable.

interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const RATE_WINDOW_SECONDS = 15 * 60;
const RATE_MAX_FAILURES = 5;
const PBKDF2_ITERATIONS = 100_000;

function toHex(bytes: Uint8Array): string {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function constantTimeEqual(a: string, b: string): boolean {
  // Inputs are equal-length hex strings (both 256-bit PBKDF2 outputs);
  // the length comparison is not secret. Do not reuse this to compare raw secrets of varying length.
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256,
  );
  return toHex(new Uint8Array(bits));
}

/** Returns "iterations:saltHex:hashHex". */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${PBKDF2_ITERATIONS}:${toHex(salt)}:${await pbkdf2(password, salt, PBKDF2_ITERATIONS)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [iterStr, saltHex, hashHex] = stored.split(':');
  const iterations = parseInt(iterStr, 10);
  if (!iterations || !saltHex || !hashHex) return false;
  return constantTimeEqual(await pbkdf2(password, fromHex(saltHex), iterations), hashHex);
}

export async function createSession(kv: KV): Promise<string> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const now = Date.now();
  await kv.put(`session:${token}`, JSON.stringify({ createdAt: now, expiresAt: now + SESSION_TTL_SECONDS * 1000 }),
    { expirationTtl: SESSION_TTL_SECONDS });
  return token;
}

export async function validateSession(kv: KV, token: string): Promise<boolean> {
  if (!token) return false;
  const raw = await kv.get(`session:${token}`);
  if (!raw) return false;
  try {
    const { expiresAt } = JSON.parse(raw) as { expiresAt: number };
    return Date.now() < expiresAt;
  } catch { return false; }
}

export async function deleteSession(kv: KV, token: string): Promise<void> {
  await kv.delete(`session:${token}`);
}

export async function recordLoginFailure(kv: KV, ip: string): Promise<void> {
  // Note: KV has no atomic increment, so concurrent failures can undercount.
  // Acceptable for single-admin brute-force slowdown; not a hard security boundary.
  const key = `login_fail:${ip}`;
  const current = parseInt((await kv.get(key)) ?? '0', 10);
  await kv.put(key, String(current + 1), { expirationTtl: RATE_WINDOW_SECONDS });
}

export async function isRateLimited(kv: KV, ip: string): Promise<boolean> {
  return parseInt((await kv.get(`login_fail:${ip}`)) ?? '0', 10) >= RATE_MAX_FAILURES;
}
