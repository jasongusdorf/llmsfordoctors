import Parser from 'rss-parser';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newsSources, type NewsSource } from './news-sources.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../data/news.json');
const FEED_TIMEOUT_MS = 10_000;
const MAX_AGE_DAYS = 3;
const MAX_ITEMS = 5;

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
  summary: string;
  imageUrl?: string;
}

// --- Fetching ---

async function fetchFeed(
  url: string,
  sourceName: string,
  priority: number
): Promise<{ items: NewsItem[]; priority: number }> {
  const parser = new Parser({
    timeout: FEED_TIMEOUT_MS,
    headers: { 'User-Agent': 'LLMsForDoctors-NewsFetcher/1.0' },
  });

  try {
    const feedPromise = parser.parseURL(url);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${FEED_TIMEOUT_MS}ms`)), FEED_TIMEOUT_MS)
    );
    const feed = await Promise.race([feedPromise, timeoutPromise]);
    const items: NewsItem[] = (feed.items || []).map((item) => ({
      title: (item.title || '').trim(),
      source: sourceName,
      url: item.link || '',
      date: item.isoDate || item.pubDate || new Date().toISOString(),
      summary: stripHtml(item.contentSnippet || item.content || '').slice(0, 200),
      imageUrl: extractImage(item),
    }));
    return { items, priority };
  } catch (err) {
    console.warn(`[fetch-news] Failed to fetch ${sourceName}: ${(err as Error).message}`);
    return { items: [], priority };
  }
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function extractImage(item: Record<string, unknown>): string | undefined {
  // rss-parser puts media content in enclosure or itunes image
  const enclosure = item.enclosure as { url?: string } | undefined;
  if (enclosure?.url) return enclosure.url;

  // Check for media:content or media:thumbnail in raw XML
  const content = (item['content:encoded'] || item.content || '') as string;
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch?.[1]) return imgMatch[1];

  return undefined;
}

// --- Deduplication ---

export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export function deduplicate(items: NewsItem[]): NewsItem[] {
  const seen = new Map<string, { tokens: Set<string>; item: NewsItem }>();

  for (const item of items) {
    // Exact URL match
    if (seen.has(item.url)) continue;

    // Fuzzy title match
    const tokens = tokenize(item.title);
    let isDuplicate = false;
    for (const [, existing] of seen) {
      if (jaccardSimilarity(tokens, existing.tokens) > 0.8) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      seen.set(item.url, { tokens, item });
    }
  }

  return [...seen.values()].map((v) => v.item);
}

// --- AI Relevance ---

const AI_KEYWORDS = [
  'artificial intelligence', 'machine learning', 'deep learning',
  'neural network', 'large language model', 'llm', 'chatgpt', 'gpt-4',
  'claude', 'gemini', 'clinical decision support', 'natural language processing',
  'nlp', 'computer vision', 'radiology ai', 'pathology ai', 'medical ai',
  'ai in medicine', 'ai in healthcare', 'ai-powered', 'ai-driven',
  'predictive model', 'diagnostic ai', 'generative ai', 'foundation model',
  'clinical ai', 'health ai', 'digital health', 'algorithm',
];

export function aiRelevanceScore(item: NewsItem): number {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  let score = 0;
  for (const keyword of AI_KEYWORDS) {
    if (text.includes(keyword)) score += 5;
  }
  return score;
}

// --- Scoring ---

export function scoreItem(item: NewsItem, sourcePriority: number, isAiOnly: boolean): number {
  const ageMs = Date.now() - new Date(item.date).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  // Recency score: 0-10 (newer = higher)
  const recencyScore = Math.max(0, 10 - ageDays * 3);
  // Priority score: 1=10pts, 2=7pts, 3=4pts, 4=1pt
  const priorityScore = Math.max(1, 11 - sourcePriority * 3);
  // AI relevance: sources marked aiOnly get automatic 10pts, others earn it from keywords
  const relevanceScore = isAiOnly ? 10 : aiRelevanceScore(item);
  return recencyScore + priorityScore + relevanceScore;
}

// --- Main ---

async function main() {
  console.log('[fetch-news] Starting news fetch...');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);

  // Fetch all feeds in parallel
  const results = await Promise.all(
    newsSources.map((source) => fetchFeed(source.url, source.name, source.priority))
  );

  // Flatten and attach priority + aiOnly flag
  const allItems: { item: NewsItem; priority: number; aiOnly: boolean }[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const source = newsSources[i];
    for (const item of result.items) {
      allItems.push({ item, priority: result.priority, aiOnly: source.aiOnly });
    }
  }

  // Filter to last 3 days
  const recent = allItems.filter(
    ({ item }) => new Date(item.date) >= cutoffDate && item.title && item.url
  );

  console.log(`[fetch-news] ${recent.length} items within last ${MAX_AGE_DAYS} days`);

  // Deduplicate
  const unique = deduplicate(recent.map((r) => r.item));

  // Build metadata map for scoring
  const metaMap = new Map<string, { priority: number; aiOnly: boolean }>();
  for (const { item, priority, aiOnly } of recent) {
    if (!metaMap.has(item.url)) {
      metaMap.set(item.url, { priority, aiOnly });
    }
  }

  // Score and sort
  const scored = unique
    .map((item) => {
      const meta = metaMap.get(item.url) || { priority: 4, aiOnly: false };
      return {
        item,
        score: scoreItem(item, meta.priority, meta.aiOnly),
      };
    })
    .sort((a, b) => b.score - a.score);

  // Pick top N
  const topItems = scored.slice(0, MAX_ITEMS).map((s) => s.item);

  if (topItems.length > 0) {
    writeFileSync(OUTPUT_PATH, JSON.stringify(topItems, null, 2) + '\n');
    console.log(`[fetch-news] Wrote ${topItems.length} items to ${OUTPUT_PATH}`);
  } else {
    console.log('[fetch-news] No new items found, preserving existing news.json');
  }
}

// Only run main when executed directly (not when imported for testing)
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    console.error('[fetch-news] Unexpected error:', err);
    process.exit(1);
  });
}
