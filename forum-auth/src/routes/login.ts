import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import type { DbInterface } from '../db.js';
import { generateToken } from '../services/session.js';
import { loginView } from '../views/login.js';
import { config } from '../config.js';
import type { MiddlewareHandler } from 'hono';
import type { AppVariables } from '../types.js';

export function loginRoutes(db: DbInterface, rateLimiter: MiddlewareHandler) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.get('/', (c) => {
    const csrfToken = c.get('csrfToken') as string;
    const returnTo = c.req.query('return');
    return c.html(loginView(csrfToken, undefined, returnTo));
  });

  app.post('/', rateLimiter, async (c) => {
    const csrfToken = c.get('csrfToken') as string;
    const body = await c.req.parseBody();

    const email = (body['email'] as string | undefined)?.trim().toLowerCase() ?? '';
    const password = (body['password'] as string | undefined) ?? '';
    const returnTo = (body['return'] as string | undefined) ?? '';

    const renderError = (msg: string) =>
      c.html(loginView(csrfToken, msg, returnTo || undefined), 400);

    if (!email || !password) {
      return renderError('Email and password are required.');
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      // Timing-safe: still run bcrypt compare
      await bcrypt.compare(password, '$2b$12$invalidhashfortimingsafety..........');
      return renderError('Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return renderError('Invalid email or password.');
    }

    if (user.status === 'pending') {
      return renderError('Please verify your email address before logging in.');
    }

    if (user.status === 'disabled') {
      return renderError('Your account has been disabled. Please contact support.');
    }

    if (user.status !== 'active') {
      return renderError('Your account is not active.');
    }

    // Create session (30-day expiry)
    const sessionId = generateToken();
    const expiresAt = new Date(
      Date.now() + config.sessionMaxAgeDays * 24 * 60 * 60 * 1000
    ).toISOString();
    db.createSession({ id: sessionId, userId: user.id, expiresAt });

    setCookie(c, 'session', sessionId, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'Lax',
      maxAge: config.sessionMaxAgeDays * 24 * 60 * 60,
      path: '/',
    });

    if (returnTo === 'sso') {
      return c.redirect('/sso');
    }

    return c.redirect(config.discourseUrl);
  });

  return app;
}
