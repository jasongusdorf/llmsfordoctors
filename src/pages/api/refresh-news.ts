import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { refreshNews } from '../../utils/refresh-news.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const items = await refreshNews();

    if (items.length > 0) {
      await env.NEWS_CACHE.put('latest', JSON.stringify(items));
    }

    return new Response(
      JSON.stringify({
        count: items.length,
        timestamp: new Date().toISOString(),
        written: items.length > 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refresh failed';
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
