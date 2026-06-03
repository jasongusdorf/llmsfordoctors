import { describe, it, expect } from 'vitest';
import {
  hashPassword, verifyPassword,
  createSession, validateSession, deleteSession,
  recordLoginFailure, isRateLimited,
} from './admin-auth';
import { createMockKV } from './test-helpers';

describe('password hashing', () => {
  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct horse');
    expect(await verifyPassword('correct horse', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('produces the documented iterations:salt:hash format', async () => {
    const hash = await hashPassword('pw');
    const parts = hash.split(':');
    expect(parts.length).toBe(3);
    expect(parseInt(parts[0], 10)).toBeGreaterThan(0);
  });

  it('returns false for a malformed stored hash', async () => {
    expect(await verifyPassword('pw', 'garbage')).toBe(false);
  });
});

describe('sessions', () => {
  it('creates, validates, and deletes a session', async () => {
    const kv = createMockKV();
    const token = await createSession(kv as any);
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(await validateSession(kv as any, token)).toBe(true);
    await deleteSession(kv as any, token);
    expect(await validateSession(kv as any, token)).toBe(false);
  });

  it('rejects an unknown token', async () => {
    const kv = createMockKV();
    expect(await validateSession(kv as any, 'nope')).toBe(false);
  });

  it('rejects an expired session', async () => {
    const kv = createMockKV();
    await kv.put('session:expired', JSON.stringify({ createdAt: 0, expiresAt: 1 }));
    expect(await validateSession(kv as any, 'expired')).toBe(false);
  });
});

describe('rate limiting', () => {
  it('blocks after 5 failures for an ip', async () => {
    const kv = createMockKV();
    expect(await isRateLimited(kv as any, '1.2.3.4')).toBe(false);
    for (let i = 0; i < 5; i++) await recordLoginFailure(kv as any, '1.2.3.4');
    expect(await isRateLimited(kv as any, '1.2.3.4')).toBe(true);
    expect(await isRateLimited(kv as any, '9.9.9.9')).toBe(false);
  });
});
