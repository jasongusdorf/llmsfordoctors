import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { verifyPassword, createSession, recordLoginFailure, isRateLimited } from '../../../lib/admin-auth';
import { SESSION_COOKIE, clientIp } from '../../../lib/admin-session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const kv = (env as any).ADMIN_STORE;
  const ip = clientIp(request);
  if (await isRateLimited(kv, ip)) return json({ error: 'Too many attempts. Try again later.' }, 429);

  const stored = (env as any).ADMIN_PASSWORD_HASH as string | undefined;
  if (!stored) return json({ error: 'Login is not configured' }, 500);

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  if (!password || !(await verifyPassword(password, stored))) {
    await recordLoginFailure(kv, ip);
    return json({ error: 'Invalid password' }, 401);
  }

  const token = await createSession(kv);
  cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 7 * 24 * 60 * 60 });
  return json({ ok: true }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
