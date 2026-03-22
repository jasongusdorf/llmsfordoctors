import { createMiddleware } from 'hono/factory';
import { getCookie, setCookie } from 'hono/cookie';
import { randomBytes } from 'crypto';

/**
 * csrfToken middleware: ensures a CSRF token cookie exists on every request.
 * Sets ctx csrfToken var and sets non-httpOnly cookie so forms can read it.
 */
export const csrfToken = createMiddleware(async (c, next) => {
  let token = getCookie(c, 'csrf');
  if (!token) {
    token = randomBytes(32).toString('hex');
    setCookie(c, 'csrf', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
      secure: process.env['NODE_ENV'] === 'production',
    });
  }
  c.set('csrfToken', token);
  await next();
});

/**
 * csrfValidate middleware: on POST requests, validates that the _csrf body
 * field matches the csrf cookie. Returns 403 on mismatch.
 */
export const csrfValidate = createMiddleware(async (c, next) => {
  if (c.req.method === 'POST') {
    const cookieToken = getCookie(c, 'csrf');
    let bodyToken: string | undefined;

    try {
      const contentType = c.req.header('content-type') ?? '';
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const body = await c.req.parseBody();
        bodyToken = body['_csrf'] as string | undefined;
      } else if (contentType.includes('application/json')) {
        const body = await c.req.json() as Record<string, unknown>;
        bodyToken = body['_csrf'] as string | undefined;
      }
    } catch {
      return c.text('Invalid request body', 400);
    }

    if (!cookieToken || !bodyToken || cookieToken !== bodyToken) {
      return c.text('Invalid CSRF token', 403);
    }
  }
  await next();
});
