import { createMiddleware } from 'hono/factory';

interface HitRecord {
  count: number;
  resetAt: number;
}

/**
 * rateLimit factory: returns middleware that limits requests per IP.
 * Uses x-forwarded-for header for IP detection. Resets counter every 60s.
 */
export function rateLimit(maxPerMinute: number) {
  const hits = new Map<string, HitRecord>();

  return createMiddleware(async (c, next) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const now = Date.now();

    let record = hits.get(ip);
    if (!record || now >= record.resetAt) {
      record = { count: 0, resetAt: now + 60_000 };
      hits.set(ip, record);
    }

    record.count++;
    if (record.count > maxPerMinute) {
      return c.text('Too many requests', 429);
    }

    await next();
  });
}
