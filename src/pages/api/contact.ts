import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get('Origin');
  const allowed = ['https://llmsfordoctors.com', 'https://www.llmsfordoctors.com', 'http://localhost:4321'];
  if (!origin || !allowed.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, message } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedMessage = message.trim();
    const submittedAt = new Date().toISOString();

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

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Submission failed';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const ALL: APIRoute = () => {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  });
};
