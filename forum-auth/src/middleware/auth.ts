import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import type { DbInterface } from '../db.js';

/**
 * requireAuth factory: returns middleware that validates session cookie.
 * Sets user in context. Redirects to /login if session is invalid or missing.
 */
export function requireAuth(db: DbInterface) {
  return createMiddleware(async (c, next) => {
    const sessionId = getCookie(c, 'session');

    if (!sessionId) {
      const path = new URL(c.req.url).pathname;
      return c.redirect(`/login?return=${encodeURIComponent(path)}`);
    }

    const session = db.getSession(sessionId);
    if (!session) {
      const path = new URL(c.req.url).pathname;
      return c.redirect(`/login?return=${encodeURIComponent(path)}`);
    }

    // getSession already filters out disabled users via the SQL query,
    // but we double-check here for clarity.
    if (session.status === 'disabled') {
      const path = new URL(c.req.url).pathname;
      return c.redirect(`/login?return=${encodeURIComponent(path)}`);
    }

    c.set('user', session);
    await next();
  });
}
