import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { DbInterface } from '../db.js';
import { validateSsoPayload, buildSsoReturn } from '../services/sso-payload.js';
import { config } from '../config.js';

export function ssoRoutes(db: DbInterface) {
  const app = new Hono();

  app.get('/', (c) => {
    const sso = c.req.query('sso');
    const sig = c.req.query('sig');

    if (!sso || !sig) {
      return c.text('Missing sso or sig parameters', 400);
    }

    // Validate the SSO payload from Discourse
    const result = validateSsoPayload(sso, sig, config.ssoSecret);
    if (!result.valid || !result.nonce) {
      return c.text('Invalid SSO payload', 400);
    }

    // Store nonce in httpOnly cookie for 10 minutes
    setCookie(c, 'sso_nonce', result.nonce, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'Lax',
      maxAge: 600,
      path: '/',
    });

    // Check for existing session
    const sessionId = getCookie(c, 'session');
    if (!sessionId) {
      return c.redirect('/login?return=sso');
    }

    const session = db.getSession(sessionId);
    if (!session) {
      return c.redirect('/login?return=sso');
    }

    // Session valid — get full user and build SSO return
    const user = db.getUserById(session.user_id);
    if (!user || user.status !== 'active') {
      return c.redirect('/login?return=sso');
    }

    const nonce = getCookie(c, 'sso_nonce');
    if (!nonce) {
      return c.text('SSO nonce missing or expired', 400);
    }

    const username = user.email.split('@')[0] ?? user.email;
    const role = user.role as 'user' | 'moderator' | 'admin';

    const { payload, sig: returnSig } = buildSsoReturn(
      {
        nonce,
        email: user.email,
        externalId: String(user.id),
        name: user.name,
        username,
        role,
      },
      config.ssoSecret
    );

    // Clear the nonce cookie
    deleteCookie(c, 'sso_nonce', { path: '/' });

    return c.redirect(
      `${config.discourseUrl}/session/sso_login?sso=${encodeURIComponent(payload)}&sig=${returnSig}`
    );
  });

  return app;
}
