import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Sign a payload string with HMAC-SHA256.
 */
export function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

interface ValidateResult {
  valid: boolean;
  nonce?: string;
}

/**
 * Validate a DiscourseConnect SSO payload + signature.
 * Returns {valid: true, nonce} on success, {valid: false} on failure.
 */
export function validateSsoPayload(
  payload: string,
  sig: string,
  secret: string
): ValidateResult {
  // Compute expected signature
  const expected = signPayload(payload, secret);

  // Timing-safe comparison
  try {
    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false };
    }
  } catch {
    return { valid: false };
  }

  // Decode and extract nonce
  const decoded = Buffer.from(payload, 'base64').toString('utf8');
  const params = new URLSearchParams(decoded);
  const nonce = params.get('nonce');

  if (!nonce) {
    return { valid: false };
  }

  return { valid: true, nonce };
}

interface BuildSsoParams {
  nonce: string;
  email: string;
  externalId: string;
  name: string;
  username: string;
  role: 'user' | 'moderator' | 'admin';
}

interface SsoReturn {
  payload: string;
  sig: string;
}

/**
 * Build a DiscourseConnect SSO return payload.
 */
export function buildSsoReturn(params: BuildSsoParams, secret: string): SsoReturn {
  const urlParams = new URLSearchParams({
    nonce: params.nonce,
    email: params.email,
    external_id: params.externalId,
    name: params.name,
    username: params.username,
    require_activation: 'false',
  });

  if (params.role === 'moderator') {
    urlParams.set('moderator', 'true');
  } else if (params.role === 'admin') {
    urlParams.set('admin', 'true');
  }

  const payload = Buffer.from(urlParams.toString()).toString('base64');
  const sig = signPayload(payload, secret);

  return { payload, sig };
}
