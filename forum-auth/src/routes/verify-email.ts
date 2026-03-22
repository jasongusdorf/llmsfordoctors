import { Hono } from 'hono';
import type { DbInterface } from '../db.js';
import { verifyEmailView } from '../views/verify-email.js';

export function verifyEmailRoutes(db: DbInterface) {
  const app = new Hono();

  app.get('/', (c) => {
    const token = c.req.query('token') ?? '';

    if (!token) {
      return c.html(verifyEmailView(false, 'Invalid or missing verification token.'));
    }

    const emailToken = db.getEmailToken(token, 'verify');
    if (!emailToken) {
      return c.html(
        verifyEmailView(false, 'This verification link is invalid or has expired.')
      );
    }

    db.verifyEmail(emailToken.user_id);
    db.useEmailToken(token);

    return c.html(
      verifyEmailView(true, 'Your email has been verified. You can now log in.')
    );
  });

  return app;
}
