import { Hono } from 'hono';
import type { DbInterface } from '../db.js';
import { generateToken } from '../services/session.js';
import { sendPasswordResetEmail } from '../services/email.js';
import { forgotPasswordView } from '../views/forgot-password.js';
import type { MiddlewareHandler } from 'hono';
import type { AppVariables } from '../types.js';

const ALWAYS_SHOWN_MESSAGE =
  "If an account with that email exists, we've sent a password reset link. Please check your inbox.";

export function forgotPasswordRoutes(db: DbInterface, rateLimiter: MiddlewareHandler) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.get('/', (c) => {
    const csrfToken = c.get('csrfToken') as string;
    return c.html(forgotPasswordView(csrfToken));
  });

  app.post('/', rateLimiter, async (c) => {
    const csrfToken = c.get('csrfToken') as string;
    const body = await c.req.parseBody();
    const email = (body['email'] as string | undefined)?.trim().toLowerCase() ?? '';

    if (email) {
      const user = db.getUserByEmail(email);
      if (user && user.status === 'active') {
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        db.createEmailToken({ userId: user.id, token, type: 'reset', expiresAt });
        // Fire-and-forget; don't leak timing info
        sendPasswordResetEmail(email, token).catch(() => {/* ignore */});
      }
    }

    // Always show the same message to prevent email enumeration
    return c.html(forgotPasswordView(csrfToken, ALWAYS_SHOWN_MESSAGE));
  });

  return app;
}
