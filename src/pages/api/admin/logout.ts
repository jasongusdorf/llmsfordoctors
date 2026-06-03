import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteSession } from '../../../lib/admin-auth';
import { SESSION_COOKIE, readCookie } from '../../../lib/admin-session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = readCookie(request.headers.get('Cookie'), SESSION_COOKIE);
  if (token) await deleteSession((env as any).ADMIN_STORE, token);
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
