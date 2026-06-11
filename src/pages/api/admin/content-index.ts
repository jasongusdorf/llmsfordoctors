import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { isAuthed } from '../../../lib/admin-session';
import { COLLECTIONS } from '../../../lib/mdx-file';

export const prerender = false;

export interface ContentIndexItem {
  collection: string;
  slug: string;
  title: string;
  lastUpdated: string; // YYYY-MM-DD or ''
}

export const GET: APIRoute = async ({ request }) => {
  if (!(await isAuthed(request.headers.get('Cookie')))) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const items: ContentIndexItem[] = [];
  for (const collection of COLLECTIONS) {
    // Cast to 'guides' — TS needs a literal; runtime accepts any valid collection name
    const entries = await getCollection(collection as 'guides');
    for (const entry of entries) {
      const data = entry.data as Record<string, unknown>;
      const raw = data.lastUpdated ?? data.dateAdded;
      const date =
        raw instanceof Date ? raw.toISOString().slice(0, 10) :
        typeof raw === 'string' ? raw.slice(0, 10) : '';
      items.push({
        collection,
        slug: entry.id,
        title: typeof data.title === 'string' && data.title ? data.title : entry.id,
        lastUpdated: date,
      });
    }
  }
  return json({ items }, 200);
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
