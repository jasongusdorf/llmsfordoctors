import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // CSRF: validate Origin (allow localhost in dev)
  const origin = request.headers.get('Origin');
  const allowed = ['https://llmsfordoctors.com', 'https://www.llmsfordoctors.com', 'http://localhost:4321'];
  if (!origin || !allowed.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  let body: { amount?: number; currency?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { amount } = body;
  const currency = 'usd';

  if (typeof amount !== 'number' || amount < 100 || amount > 1000000) {
    return new Response(
      JSON.stringify({ error: 'Amount must be between 100 and 1000000 cents' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment failed';
    return new Response(JSON.stringify({ error: message }), {
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
