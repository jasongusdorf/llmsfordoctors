import { describe, it, expect } from 'vitest';
import { generateToken } from '../src/services/session.js';

describe('Session token generation', () => {
  it('generates a 64-character hex token', () => {
    const token = generateToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });
});
