import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

const RATE_WINDOW_SECONDS = 10 * 60;
const RATE_MAX_SUBMISSIONS = 5;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 10_000;

function json(body: unknown, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get('Origin');
  const allowed = ['https://llmsfordoctors.com', 'https://www.llmsfordoctors.com', 'http://localhost:4321'];
  if (!origin || !allowed.includes(origin)) {
    return json({ error: 'Forbidden' }, 403);
  }

  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > MAX_MESSAGE_LENGTH + 1_000) {
    return json({ error: 'Request body is too large' }, 413);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const rateKey = `contact_rate:${ip}`;
  const attempts = parseInt((await env.FORM_STORE.get(rateKey)) ?? '0', 10);
  if (attempts >= RATE_MAX_SUBMISSIONS) {
    return json({ error: 'Too many messages. Please try again later.' }, 429, {
      'Retry-After': String(RATE_WINDOW_SECONDS),
    });
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { name, email, message } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) {
    return json({ error: `Name is required and must be ${MAX_NAME_LENGTH} characters or fewer` }, 400);
  }
  if (!email || typeof email !== 'string' || !email.includes('@') || email.length > MAX_EMAIL_LENGTH) {
    return json({ error: 'Valid email required' }, 400);
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: `Message is required and must be ${MAX_MESSAGE_LENGTH} characters or fewer` }, 400);
  }

  try {
    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedMessage = message.trim();
    const submittedAt = new Date().toISOString();

    // Cloudflare KV increments are eventually consistent, but this is enough to
    // deter routine form spam; edge rate limiting remains the stronger boundary.
    await env.FORM_STORE.put(rateKey, String(attempts + 1), { expirationTtl: RATE_WINDOW_SECONDS });

    const key = `contact:${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    await env.FORM_STORE.put(key, JSON.stringify({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      submittedAt,
    }), { expirationTtl: 63072000 });

    // Send email notification via Resend
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LLMs for Doctors <noreply@llmsfordoctors.com>',
          to: 'jasongusdorfmd@gmail.com',
          reply_to: trimmedEmail,
          subject: `New message from ${trimmedName} via llmsfordoctors.com`,
          text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\nTime: ${submittedAt}\n\n${trimmedMessage}`,
        }),
      });
    } catch (emailErr) {
      console.error('Resend email failed:', emailErr);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Submission failed';
    return json({ error: msg }, 500);
  }
};

export const ALL: APIRoute = () => {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  });
};
