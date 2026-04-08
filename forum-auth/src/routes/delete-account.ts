import { Hono } from 'hono';
import { getCookie, deleteCookie } from 'hono/cookie';
import type { DbInterface } from '../db.js';
import { deleteAccountView } from '../views/delete-account.js';
import { messageView } from '../views/message.js';
import { config } from '../config.js';
import type { AppVariables } from '../types.js';

export function deleteAccountRoutes(db: DbInterface) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.get('/', (c) => {
    const sessionId = getCookie(c, 'session');
    if (!sessionId) return c.redirect('/login');

    const session = db.getSession(sessionId);
    if (!session) return c.redirect('/login');

    const csrfToken = c.get('csrfToken') as string;
    return c.html(deleteAccountView(csrfToken));
  });

  app.post('/', async (c) => {
    const sessionId = getCookie(c, 'session');
    if (!sessionId) return c.redirect('/login');

    const session = db.getSession(sessionId);
    if (!session) return c.redirect('/login');

    const csrfToken = c.get('csrfToken') as string;
    const body = await c.req.parseBody();
    const confirmation = (body['confirmation'] as string | undefined)?.trim() ?? '';

    if (confirmation !== 'DELETE') {
      return c.html(deleteAccountView(csrfToken, 'Please type DELETE to confirm.'), 400);
    }

    // Delete user (FK cascades handle sessions and email_tokens)
    db.deleteUser(session.user_id);

    // Clear session cookie
    deleteCookie(c, 'session', { path: '/' });

    return c.html(
      messageView(
        'Account Deleted',
        'Your account and all associated data have been permanently deleted.'
      )
    );
  });

  return app;
}
