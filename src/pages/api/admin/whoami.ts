import type { APIRoute } from 'astro';
import { isAuthed } from '../../../lib/admin-session';

export const prerender = false;

export const GET: APIRoute = async ({ request }) =>
  new Response(JSON.stringify({ authed: await isAuthed(request.headers.get('Cookie')) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
