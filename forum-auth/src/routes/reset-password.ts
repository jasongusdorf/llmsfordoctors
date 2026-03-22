import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import type { DbInterface } from '../db.js';
import { resetPasswordView } from '../views/reset-password.js';
import { verifyEmailView } from '../views/verify-email.js';
import type { AppVariables } from '../types.js';

export function resetPasswordRoutes(db: DbInterface) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.get('/', (c) => {
    const csrfToken = c.get('csrfToken') as string;
    const token = c.req.query('token') ?? '';

    if (!token) {
      return c.html(verifyEmailView(false, 'Invalid or missing reset token.'));
    }

    const emailToken = db.getEmailToken(token, 'reset');
    if (!emailToken) {
      return c.html(verifyEmailView(false, 'This reset link is invalid or has expired.'));
    }

    return c.html(resetPasswordView(csrfToken, token));
  });

  app.post('/', async (c) => {
    const csrfToken = c.get('csrfToken') as string;
    const body = await c.req.parseBody();

    const token = (body['token'] as string | undefined) ?? '';
    const password = (body['password'] as string | undefined) ?? '';
    const confirmPassword = (body['confirmPassword'] as string | undefined) ?? '';

    const renderError = (msg: string) =>
      c.html(resetPasswordView(csrfToken, token, msg), 400);

    if (!token) {
      return c.html(verifyEmailView(false, 'Invalid or missing reset token.'));
    }

    const emailToken = db.getEmailToken(token, 'reset');
    if (!emailToken) {
      return c.html(verifyEmailView(false, 'This reset link is invalid or has expired.'));
    }

    if (password.length < 8) {
      return renderError('Password must be at least 8 characters.');
    }

    if (password !== confirmPassword) {
      return renderError('Passwords do not match.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    db.updatePassword(emailToken.user_id, passwordHash);
    db.useEmailToken(token);
    db.deleteUserSessions(emailToken.user_id);

    return c.redirect('/login');
  });

  return app;
}
