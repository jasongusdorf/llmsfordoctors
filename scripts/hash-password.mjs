// Generate the value to store in the ADMIN_PASSWORD_HASH secret.
// Usage: node scripts/hash-password.mjs "your password"
// Output format matches hashPassword() in src/lib/admin-auth.ts: iterations:saltHex:hashHex
import { webcrypto as crypto } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "password"');
  process.exit(1);
}

const ITER = 100_000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, key, 256);
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
console.log(`${ITER}:${hex(salt)}:${hex(bits)}`);
