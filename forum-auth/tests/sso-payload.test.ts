import { describe, it, expect } from 'vitest';
import { signPayload, validateSsoPayload, buildSsoReturn } from '../src/services/sso-payload.js';

const SECRET = 'test-sso-secret-abc123';

describe('SSO Payload', () => {
  describe('validateSsoPayload', () => {
    it('validates a correctly signed payload and extracts nonce', () => {
      const nonce = 'abc123nonce';
      const payload = Buffer.from(`nonce=${nonce}`).toString('base64');
      const sig = signPayload(payload, SECRET);

      const result = validateSsoPayload(payload, sig, SECRET);
      expect(result.valid).toBe(true);
      expect(result.nonce).toBe(nonce);
    });

    it('rejects a bad signature', () => {
      const payload = Buffer.from('nonce=abc123').toString('base64');
      const result = validateSsoPayload(payload, 'bad-signature', SECRET);
      expect(result.valid).toBe(false);
    });

    it('rejects if nonce is missing from payload', () => {
      const payload = Buffer.from('foo=bar').toString('base64');
      const sig = signPayload(payload, SECRET);
      const result = validateSsoPayload(payload, sig, SECRET);
      expect(result.valid).toBe(false);
    });
  });

  describe('buildSsoReturn', () => {
    const baseParams = {
      nonce: 'testnonce123',
      email: 'doc@example.com',
      externalId: '42',
      name: 'Dr. John Smith',
      username: 'drjohnsmith',
      role: 'user' as const,
    };

    it('builds return payload with correct fields', () => {
      const { payload, sig } = buildSsoReturn(baseParams, SECRET);

      // Decode payload
      const decoded = new URLSearchParams(Buffer.from(payload, 'base64').toString('utf8'));
      expect(decoded.get('nonce')).toBe('testnonce123');
      expect(decoded.get('email')).toBe('doc@example.com');
      expect(decoded.get('external_id')).toBe('42');
      expect(decoded.get('name')).toBe('Dr. John Smith');
      expect(decoded.get('username')).toBe('drjohnsmith');
      expect(decoded.get('require_activation')).toBe('false');

      // Signature should be valid
      expect(signPayload(payload, SECRET)).toBe(sig);
    });

    it('includes moderator=true for moderator role', () => {
      const { payload } = buildSsoReturn({ ...baseParams, role: 'moderator' }, SECRET);
      const decoded = new URLSearchParams(Buffer.from(payload, 'base64').toString('utf8'));
      expect(decoded.get('moderator')).toBe('true');
      expect(decoded.get('admin')).toBeNull();
    });

    it('includes admin=true for admin role', () => {
      const { payload } = buildSsoReturn({ ...baseParams, role: 'admin' }, SECRET);
      const decoded = new URLSearchParams(Buffer.from(payload, 'base64').toString('utf8'));
      expect(decoded.get('admin')).toBe('true');
      expect(decoded.get('moderator')).toBeNull();
    });

    it('excludes moderator and admin flags for regular user role', () => {
      const { payload } = buildSsoReturn(baseParams, SECRET);
      const decoded = new URLSearchParams(Buffer.from(payload, 'base64').toString('utf8'));
      expect(decoded.get('moderator')).toBeNull();
      expect(decoded.get('admin')).toBeNull();
    });
  });
});
