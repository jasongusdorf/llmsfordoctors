import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { env } from 'cloudflare:workers';
import {
  selectContent,
  buildTweetText,
  postTweet,
  shouldResetCollection,
  resetCollectionFromLog,
  type ContentItem,
  type PostedEntry,
} from '../../utils/social.js';

export const prerender = false;

const SITE_URL = 'https://llmsfordoctors.com';
const COLLECTIONS = ['trials', 'tools', 'editorials', 'guides', 'workflows', 'templates', 'videos'] as const;

async function loadContentItems(): Promise<ContentItem[]> {
  const items: ContentItem[] = [];
  for (const name of COLLECTIONS) {
    const entries = await getCollection(name);
    for (const entry of entries) {
      const socialPost = (entry.data as Record<string, unknown>).socialPost as string | undefined;
      if (socialPost) {
        items.push({
          id: entry.id,
          collection: name,
          socialPost,
          url: `/${name}/${entry.id}`,
        });
      }
    }
  }
  return items;
}

async function getPostedLog(): Promise<PostedEntry[]> {
  const raw = await env.SOCIAL_STORE.get('posted_log');
  if (!raw) return [];
  return JSON.parse(raw) as PostedEntry[];
}

async function savePostedLog(log: PostedEntry[]): Promise<void> {
  await env.SOCIAL_STORE.put('posted_log', JSON.stringify(log));
}

async function getQueue(): Promise<Array<{ slug: string; collection: string }>> {
  const raw = await env.SOCIAL_STORE.get('queue');
  if (!raw) return [];
  return JSON.parse(raw) as Array<{ slug: string; collection: string }>;
}

async function saveQueue(queue: Array<{ slug: string; collection: string }>): Promise<void> {
  await env.SOCIAL_STORE.put('queue', JSON.stringify(queue));
}

export const POST: APIRoute = async ({ request }) => {
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const allItems = await loadContentItems();
    let postedLog = await getPostedLog();

    // Reset any collections where all items have been posted
    for (const name of COLLECTIONS) {
      if (shouldResetCollection(allItems, name, postedLog)) {
        postedLog = resetCollectionFromLog(postedLog, name);
      }
    }

    // Check priority queue first
    let selected: ContentItem | null = null;
    const queue = await getQueue();
    if (queue.length > 0) {
      const next = queue.shift()!;
      await saveQueue(queue);
      const match = allItems.find(
        (item) => item.id === next.slug && item.collection === next.collection,
      );
      if (match) selected = match;
    }

    // Fall back to weighted random
    if (!selected) {
      selected = selectContent(allItems, postedLog);
    }

    if (!selected) {
      return new Response(
        JSON.stringify({ error: 'No eligible content to post', timestamp: new Date().toISOString() }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const tweetText = buildTweetText(selected, SITE_URL);

    const result = await postTweet(tweetText, {
      apiKey: env.X_API_KEY,
      apiSecret: env.X_API_SECRET,
      accessToken: env.X_ACCESS_TOKEN,
      accessSecret: env.X_ACCESS_SECRET,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error, item: selected.id, timestamp: new Date().toISOString() }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Log the successful post
    postedLog.push({
      slug: selected.id,
      collection: selected.collection,
      postedAt: new Date().toISOString(),
    });
    await savePostedLog(postedLog);

    return new Response(
      JSON.stringify({
        posted: true,
        tweetId: result.tweetId,
        item: selected.id,
        collection: selected.collection,
        text: tweetText,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Post failed';
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
