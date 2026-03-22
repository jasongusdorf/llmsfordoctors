import { Hono } from 'hono';
import { getCookie, deleteCookie } from 'hono/cookie';
import type { DbInterface } from '../db.js';
import { config } from '../config.js';

export function logoutRoutes(db: DbInterface) {
  const app = new Hono();

  app.get('/', (c) => {
    const sessionId = getCookie(c, 'session');
    if (sessionId) {
      db.deleteSession(sessionId);
    }
    deleteCookie(c, 'session', { path: '/' });
    return c.redirect(config.mainSiteUrl);
  });

  return app;
}
