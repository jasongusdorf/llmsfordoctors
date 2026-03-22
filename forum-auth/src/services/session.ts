import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically random 64-character hex session token.
 */
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}
