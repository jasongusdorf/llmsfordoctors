# Daily News Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate the daily news feed on llmsfordoctors.com using a Cloudflare Cron Trigger + KV, replacing the manual local script.

**Architecture:** A Cloudflare Cron Trigger fires daily, invoking a `scheduled` handler that calls the refresh API endpoint via HTTP. The API route fetches RSS feeds (via a lightweight custom parser) and PubMed articles, scores and deduplicates them, and writes the results to a KV namespace. The homepage reads from KV at request time. The `scheduled` handler is added via a post-build script that wraps Astro's generated worker entry.

**Tech Stack:** Astro 6, Cloudflare Workers, Cloudflare KV, Vitest

**Spec:** `docs/superpowers/specs/2026-03-24-daily-news-refresh-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/utils/types.ts` | Shared `NewsItem` interface. Imported by both `parse-rss.ts` and `refresh-news.ts`. |
| `src/utils/parse-rss.ts` | Lightweight RSS XML parser. Takes XML string + source name, returns `NewsItem[]`. Zero dependencies. |
| `src/utils/parse-rss.test.ts` | Unit tests for RSS parser with sample XML payloads |
| `src/utils/refresh-news.ts` | Core refresh orchestrator. Fetches all feeds + PubMed, parses, deduplicates, scores, returns top N `NewsItem[]`. No Node.js APIs, no KV access. Pure async function. |
| `src/utils/refresh-news.test.ts` | Unit tests for scoring, dedup, relevance |
| `src/pages/api/refresh-news.ts` | Astro API route. Authenticates via `CRON_SECRET`, calls refresh module, writes result to KV. |
| `scripts/post-build.mjs` | Post-build script. Creates `dist/server/worker-entry.mjs` (wraps Astro's entry, adds `scheduled` handler). Patches generated wrangler config. |
| `wrangler.jsonc` | Modified: add `kv_namespaces` (for CLI tooling like `wrangler secret put`) |
| `src/pages/index.astro` | Modified: switch from static JSON import to KV read with fallback |
| `package.json` | Modified: remove `rss-parser`, update build/deploy scripts |

---

### Task 1: Shared Types and Lightweight RSS Parser

**Files:**
- Create: `src/utils/types.ts`
- Create: `src/utils/parse-rss.ts`
- Create: `src/utils/parse-rss.test.ts`

- [ ] **Step 1: Create the shared types file**

```ts
// src/utils/types.ts
export interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
  summary: string;
  imageUrl?: string;
}
```

- [ ] **Step 2: Write the test file with sample RSS payloads**

```ts
// src/utils/parse-rss.test.ts
import { describe, it, expect } from 'vitest';
import { parseRssFeed, extractTag, stripHtml } from './parse-rss';

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>AI in Radiology: A New Frontier</title>
      <link>https://example.com/article-1</link>
      <pubDate>Mon, 24 Mar 2026 10:00:00 GMT</pubDate>
      <description>&lt;p&gt;Deep learning models are transforming radiology.&lt;/p&gt;</description>
    </item>
    <item>
      <title>Second Article</title>
      <link>https://example.com/article-2</link>
      <pubDate>Sun, 23 Mar 2026 08:00:00 GMT</pubDate>
      <description>Plain text summary here</description>
      <enclosure url="https://example.com/image.jpg" type="image/jpeg" />
    </item>
  </channel>
</rss>`;

const EMPTY_RSS = `<?xml version="1.0"?><rss><channel></channel></rss>`;

const MALFORMED_RSS = `not xml at all`;

describe('parseRssFeed', () => {
  it('parses standard RSS items', () => {
    const items = parseRssFeed(SAMPLE_RSS, 'Test Source');
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('AI in Radiology: A New Frontier');
    expect(items[0].source).toBe('Test Source');
    expect(items[0].url).toBe('https://example.com/article-1');
    expect(items[0].date).toMatch(/2026-03-24/);
    expect(items[0].summary).toBe('Deep learning models are transforming radiology.');
  });

  it('extracts enclosure image URL', () => {
    const items = parseRssFeed(SAMPLE_RSS, 'Test Source');
    expect(items[1].imageUrl).toBe('https://example.com/image.jpg');
  });

  it('returns empty array for empty feed', () => {
    expect(parseRssFeed(EMPTY_RSS, 'Empty')).toEqual([]);
  });

  it('returns empty array for malformed input', () => {
    expect(parseRssFeed(MALFORMED_RSS, 'Bad')).toEqual([]);
  });
});

describe('extractTag', () => {
  it('extracts text content from XML tag', () => {
    expect(extractTag('<item><title>Hello World</title></item>', 'title')).toBe('Hello World');
  });

  it('returns empty string for missing tag', () => {
    expect(extractTag('<item></item>', 'title')).toBe('');
  });

  it('handles CDATA content', () => {
    expect(extractTag('<item><title><![CDATA[Test & Title]]></title></item>', 'title')).toBe('Test & Title');
  });
});

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('collapses whitespace', () => {
    expect(stripHtml('  hello   world  ')).toBe('hello world');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx vitest run src/utils/parse-rss.test.ts`
Expected: FAIL with "Cannot find module" or "is not a function"

- [ ] **Step 4: Implement the RSS parser**

```ts
// src/utils/parse-rss.ts
import type { NewsItem } from './types.js';

/**
 * Extract text content from an XML tag. Handles plain text and CDATA.
 */
export function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  return (match[1] ?? match[2] ?? '').trim();
}

/**
 * Strip HTML tags and collapse whitespace.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Extract enclosure URL from an RSS item block.
 */
function extractEnclosure(block: string): string | undefined {
  const match = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  return match?.[1];
}

/**
 * Parse an RSS XML string into NewsItem[]. Zero dependencies.
 */
export function parseRssFeed(xml: string, sourceName: string): NewsItem[] {
  const itemBlocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi);
  if (!itemBlocks) return [];

  return itemBlocks
    .map((block) => {
      const title = extractTag(block, 'title');
      const url = extractTag(block, 'link');
      if (!title || !url) return null;

      const pubDate = extractTag(block, 'pubDate');
      const description = extractTag(block, 'description');

      return {
        title: title.trim(),
        source: sourceName,
        url,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        summary: stripHtml(description).slice(0, 200),
        imageUrl: extractEnclosure(block),
      };
    })
    .filter((item): item is NewsItem => item !== null);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx vitest run src/utils/parse-rss.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/utils/types.ts src/utils/parse-rss.ts src/utils/parse-rss.test.ts
git commit -m "feat: add shared NewsItem type and lightweight RSS parser"
```

---

### Task 2: Refresh News Module

**Files:**
- Create: `src/utils/refresh-news.ts`
- Create: `src/utils/refresh-news.test.ts`
- Reference: `src/utils/fetch-news.ts` (source of scoring/dedup/PubMed logic)
- Reference: `src/utils/news-sources.ts` (unchanged, imported as-is)
- Reference: `src/utils/parse-rss.ts` (from Task 1)

- [ ] **Step 1: Write tests for scoring, dedup, and relevance functions**

These functions are migrated from `fetch-news.ts`. Write tests that pin their existing behavior.

```ts
// src/utils/refresh-news.test.ts
import { describe, it, expect } from 'vitest';
import {
  tokenize,
  jaccardSimilarity,
  deduplicate,
  aiRelevanceScore,
  scoreItem,
} from './refresh-news';
import type { NewsItem } from './types';

const makeItem = (overrides: Partial<NewsItem> = {}): NewsItem => ({
  title: 'Test Article',
  source: 'Test Source',
  url: 'https://example.com/test',
  date: new Date().toISOString(),
  summary: 'A test summary',
  ...overrides,
});

describe('tokenize', () => {
  it('lowercases and splits into words > 2 chars', () => {
    const tokens = tokenize('AI in Medicine Today');
    expect(tokens).toEqual(new Set(['medicine', 'today']));
  });

  it('strips punctuation', () => {
    const tokens = tokenize("It's a test!");
    expect(tokens).toEqual(new Set(['its', 'test']));
  });
});

describe('jaccardSimilarity', () => {
  it('returns 1 for identical sets', () => {
    const s = new Set(['a', 'b']);
    expect(jaccardSimilarity(s, s)).toBe(1);
  });

  it('returns 0 for disjoint sets', () => {
    expect(jaccardSimilarity(new Set(['a']), new Set(['b']))).toBe(0);
  });

  it('returns 0 for two empty sets', () => {
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0);
  });
});

describe('deduplicate', () => {
  it('removes exact URL duplicates', () => {
    const items = [
      makeItem({ url: 'https://example.com/1', title: 'Article A' }),
      makeItem({ url: 'https://example.com/1', title: 'Article A Copy' }),
    ];
    expect(deduplicate(items)).toHaveLength(1);
  });

  it('removes fuzzy title duplicates (Jaccard > 0.8)', () => {
    const items = [
      makeItem({ url: 'https://a.com/1', title: 'AI Transforms Clinical Decision Making in Emergency Medicine' }),
      makeItem({ url: 'https://b.com/2', title: 'AI Transforms Clinical Decision Making in Emergency Medicine Today' }),
    ];
    expect(deduplicate(items)).toHaveLength(1);
  });

  it('keeps dissimilar items', () => {
    const items = [
      makeItem({ url: 'https://a.com/1', title: 'AI in Radiology' }),
      makeItem({ url: 'https://b.com/2', title: 'New Drug for Diabetes' }),
    ];
    expect(deduplicate(items)).toHaveLength(2);
  });
});

describe('aiRelevanceScore', () => {
  it('scores higher for AI-related content', () => {
    const aiItem = makeItem({ title: 'Large language model clinical decision support' });
    const genericItem = makeItem({ title: 'Hospital cafeteria renovations complete' });
    expect(aiRelevanceScore(aiItem)).toBeGreaterThan(aiRelevanceScore(genericItem));
  });

  it('returns 0 for completely irrelevant content', () => {
    expect(aiRelevanceScore(makeItem({ title: 'Weather forecast', summary: 'Sunny today' }))).toBe(0);
  });
});

describe('scoreItem', () => {
  it('scores recent items higher than old items', () => {
    const recent = makeItem({ date: new Date().toISOString() });
    const old = makeItem({ date: new Date('2025-01-01').toISOString() });
    expect(scoreItem(recent, 1, true)).toBeGreaterThan(scoreItem(old, 1, true));
  });

  it('gives journal bonus to priority-0 items', () => {
    const item = makeItem();
    const withBonus = scoreItem(item, 0, true);
    const withoutBonus = scoreItem(item, 1, true);
    expect(withBonus - withoutBonus).toBeGreaterThanOrEqual(15);
  });

  it('gives automatic relevance to aiOnly sources', () => {
    const item = makeItem({ title: 'Hospital cafeteria renovations', summary: 'No AI here' });
    expect(scoreItem(item, 1, true)).toBeGreaterThan(scoreItem(item, 1, false));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx vitest run src/utils/refresh-news.test.ts`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement the refresh-news module**

Extract all logic from `fetch-news.ts`, replacing `rss-parser` with `parseRssFeed`, removing all Node.js APIs. Import `NewsItem` from the shared `types.ts` and re-export it for convenience.

```ts
// src/utils/refresh-news.ts
import { newsSources } from './news-sources.js';
import { parseRssFeed } from './parse-rss.js';
export type { NewsItem } from './types.js';
import type { NewsItem } from './types.js';

const FEED_TIMEOUT_MS = 10_000;
const MAX_AGE_DAYS = 90;
const MAX_AGE_DAYS_PUBMED = 90;
const MAX_ITEMS = 10;

// --- RSS Fetching ---

async function fetchFeed(
  url: string,
  sourceName: string,
  priority: number,
): Promise<{ items: NewsItem[]; priority: number }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: { 'User-Agent': 'LLMsForDoctors-NewsFetcher/1.0' },
    });
    const xml = await res.text();
    const items = parseRssFeed(xml, sourceName);
    return { items, priority };
  } catch (err) {
    console.warn(`[refresh-news] Failed to fetch ${sourceName}: ${(err as Error).message}`);
    return { items: [], priority };
  }
}

// --- PubMed E-utilities ---

const PUBMED_SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_FETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
const PUBMED_QUERY = '("artificial intelligence"[Title] OR "machine learning"[Title] OR "deep learning"[Title] OR "large language model"[Title] OR "LLM"[Title] OR "clinical decision support"[Title]) AND ("NEJM AI"[Journal] OR "Lancet Digit Health"[Journal] OR "npj Digit Med"[Journal] OR "JAMA Netw Open"[Journal] OR "Nat Med"[Journal] OR "Radiology"[Journal] OR "BMJ"[Journal])';

async function fetchPubMed(): Promise<{ items: NewsItem[]; priority: number }> {
  try {
    const searchParams = new URLSearchParams({
      db: 'pubmed',
      term: PUBMED_QUERY,
      retmax: '50',
      retmode: 'json',
      sort: 'date',
    });
    const searchRes = await fetch(`${PUBMED_SEARCH_URL}?${searchParams}`, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: { 'User-Agent': 'LLMsForDoctors-NewsFetcher/1.0' },
    });
    const searchData = (await searchRes.json()) as {
      esearchresult: { idlist: string[] };
    };
    const pmids = searchData.esearchresult?.idlist || [];
    if (pmids.length === 0) return { items: [], priority: 1 };

    const fetchParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'json',
    });
    const fetchRes = await fetch(`${PUBMED_FETCH_URL}?${fetchParams}`, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: { 'User-Agent': 'LLMsForDoctors-NewsFetcher/1.0' },
    });
    const fetchData = (await fetchRes.json()) as {
      result: Record<
        string,
        {
          uid: string;
          title: string;
          source: string;
          pubdate: string;
          sortfirstauthor: string;
        }
      >;
    };

    const items: NewsItem[] = pmids
      .filter((id) => fetchData.result?.[id]?.title)
      .map((id) => {
        const article = fetchData.result[id];
        return {
          title: article.title.replace(/\.$/, ''),
          source: article.source || 'PubMed',
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          date: new Date(article.pubdate || Date.now()).toISOString(),
          summary: `${article.sortfirstauthor} et al. Published in ${article.source}.`,
        };
      });

    console.log(`[refresh-news] PubMed: ${items.length} papers from top journals`);
    return { items, priority: 1 };
  } catch (err) {
    console.warn(`[refresh-news] Failed to fetch PubMed: ${(err as Error).message}`);
    return { items: [], priority: 1 };
  }
}

// --- Deduplication ---

export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2),
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
    if (seen.has(item.url)) continue;

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
  'artificial intelligence',
  'machine learning',
  'deep learning',
  'neural network',
  'large language model',
  'llm',
  'chatgpt',
  'gpt-4',
  'claude',
  'gemini',
  'clinical decision support',
  'natural language processing',
  'nlp',
  'computer vision',
  'radiology ai',
  'pathology ai',
  'medical ai',
  'ai in medicine',
  'ai in healthcare',
  'ai-powered',
  'ai-driven',
  'predictive model',
  'diagnostic ai',
  'generative ai',
  'foundation model',
  'clinical ai',
  'health ai',
  'digital health',
  'algorithm',
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
  const recencyScore = Math.max(0, 10 - ageDays / 9);
  const priorityScore = Math.max(1, 11 - sourcePriority * 3);
  const relevanceScore = isAiOnly ? 10 : aiRelevanceScore(item);
  const journalBonus = sourcePriority === 0 ? 15 : 0;
  return recencyScore + priorityScore + relevanceScore + journalBonus;
}

// --- Main Refresh ---

export async function refreshNews(): Promise<NewsItem[]> {
  console.log('[refresh-news] Starting news fetch...');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);

  const [rssResults, pubmedResult] = await Promise.all([
    Promise.all(newsSources.map((source) => fetchFeed(source.url, source.name, source.priority))),
    fetchPubMed(),
  ]);

  const allItems: { item: NewsItem; priority: number; aiOnly: boolean }[] = [];
  for (let i = 0; i < rssResults.length; i++) {
    const result = rssResults[i];
    const source = newsSources[i];
    for (const item of result.items) {
      allItems.push({ item, priority: result.priority, aiOnly: source.aiOnly });
    }
  }

  const recent = allItems.filter(
    ({ item }) => new Date(item.date) >= cutoffDate && item.title && item.url,
  );

  const pubmedCutoff = new Date();
  pubmedCutoff.setDate(pubmedCutoff.getDate() - MAX_AGE_DAYS_PUBMED);
  for (const item of pubmedResult.items) {
    if (new Date(item.date) >= pubmedCutoff && item.title && item.url) {
      recent.push({ item, priority: 0, aiOnly: true });
    }
  }

  console.log(`[refresh-news] ${recent.length} items within date range`);

  const unique = deduplicate(recent.map((r) => r.item));

  const metaMap = new Map<string, { priority: number; aiOnly: boolean }>();
  for (const { item, priority, aiOnly } of recent) {
    if (!metaMap.has(item.url)) {
      metaMap.set(item.url, { priority, aiOnly });
    }
  }

  const scored = unique
    .map((item) => {
      const meta = metaMap.get(item.url) || { priority: 4, aiOnly: false };
      return { item, score: scoreItem(item, meta.priority, meta.aiOnly) };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, MAX_ITEMS).map((s) => s.item);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx vitest run src/utils/refresh-news.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/utils/refresh-news.ts src/utils/refresh-news.test.ts
git commit -m "feat: add refresh-news module for Workers runtime"
```

---

### Task 3: Update Wrangler Config and Create KV Namespace

**Files:**
- Modify: `wrangler.jsonc`

- [ ] **Step 1: Create the KV namespace**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx wrangler kv namespace create NEWS_CACHE`

Copy the `id` from the output. It will look like:
```
{ binding = "NEWS_CACHE", id = "abc123..." }
```

- [ ] **Step 2: Also create a preview namespace for local dev**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx wrangler kv namespace create NEWS_CACHE --preview`

Copy the preview `id` from the output.

- [ ] **Step 3: Update wrangler.jsonc**

Add the KV namespace binding. The `main` and cron trigger will be handled by the post-build script (Task 5), since the Astro adapter manages its own generated wrangler config. The root `wrangler.jsonc` needs KV for CLI tooling (`wrangler secret put`, `wrangler kv key put`, etc.).

**Note:** The spec's wrangler config example includes `"main": "src/worker-entry.ts"`. This is superseded by the post-build approach: the root config has no `main` field; `main` is set to `worker-entry.mjs` in the generated `dist/server/wrangler.json` by the post-build script.

Replace the entire file with (substituting the real IDs from steps 1-2):

```jsonc
{
  "name": "llmsfordoctors",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "kv_namespaces": [
    {
      "binding": "NEWS_CACHE",
      "id": "<PRODUCTION_ID_FROM_STEP_1>",
      "preview_id": "<PREVIEW_ID_FROM_STEP_2>"
    }
  ]
}
```

- [ ] **Step 4: Set the CRON_SECRET**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx wrangler secret put CRON_SECRET`

Enter a strong random value when prompted. Save this value somewhere safe for manual curl usage.

- [ ] **Step 5: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add wrangler.jsonc
git commit -m "feat: add KV namespace binding to wrangler config"
```

---

### Task 4: API Route for Manual Refresh

**Files:**
- Create: `src/pages/api/refresh-news.ts`
- Reference: `src/pages/api/create-payment-intent.ts` (pattern to follow)
- Reference: `src/utils/refresh-news.ts` (from Task 2)

- [ ] **Step 1: Verify hybrid rendering works**

The existing `src/pages/api/create-payment-intent.ts` uses `export const prerender = false` with `output: 'static'` in `astro.config.ts`. Before creating our new route, confirm this still works:

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx astro build 2>&1 | tail -20`
Expected: Build succeeds. If it fails with errors about `prerender = false` under `output: 'static'`, change `astro.config.ts` to `output: 'hybrid'` or `output: 'server'` before proceeding.

- [ ] **Step 2: Create the API route**

```ts
// src/pages/api/refresh-news.ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { refreshNews } from '../../utils/refresh-news.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Validate secret
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
```

- [ ] **Step 3: Build to verify the route compiles**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx astro build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/pages/api/refresh-news.ts
git commit -m "feat: add authenticated API route for manual news refresh"
```

---

### Task 5: Post-Build Script for Scheduled Handler

**Files:**
- Create: `scripts/post-build.mjs`
- Modify: `package.json` (update build/deploy scripts)

The Astro Cloudflare adapter generates a complete Worker at `dist/server/entry.mjs` with its own `wrangler.json`. We cannot import from `dist/` in source files. Instead, a post-build script creates a thin wrapper entry alongside the generated one.

- [ ] **Step 1: Inspect the current build output to understand the generated structure**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx astro build && ls -la dist/server/`

Note the generated files, especially `entry.mjs` and `wrangler.json`. Read `dist/server/wrangler.json` to understand the generated config structure.

Run: `cat dist/server/wrangler.json`

Record the `main` field value (likely `"entry.mjs"`) and any existing bindings.

- [ ] **Step 2: Create the post-build script**

```js
// scripts/post-build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const DIST_SERVER = 'dist/server';
const WRANGLER_PATH = `${DIST_SERVER}/wrangler.json`;
const WRAPPER_PATH = `${DIST_SERVER}/worker-entry.mjs`;

// 1. Create wrapper entry that delegates fetch to Astro and adds scheduled handler
const wrapper = `import handler from './entry.mjs';

export default {
  fetch(request, env, ctx) {
    return handler.fetch(request, env, ctx);
  },

  async scheduled(event, env, ctx) {
    console.log('[cron] Starting scheduled news refresh...');
    try {
      const url = 'https://llmsfordoctors.com/api/refresh-news';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + env.CRON_SECRET },
      });
      const data = await res.json();
      console.log('[cron] Refresh result:', JSON.stringify(data));
    } catch (err) {
      console.error('[cron] Scheduled refresh failed:', err);
    }
  },
};
`;

writeFileSync(WRAPPER_PATH, wrapper);
console.log('[post-build] Created worker-entry.mjs');

// 2. Patch the generated wrangler.json
const wrangler = JSON.parse(readFileSync(WRANGLER_PATH, 'utf-8'));

// Point main to our wrapper instead of the raw Astro entry
wrangler.main = 'worker-entry.mjs';

// Add cron trigger
if (!wrangler.triggers) wrangler.triggers = {};
wrangler.triggers.crons = ['0 6 * * *'];

// Ensure KV namespace is present
if (!wrangler.kv_namespaces) wrangler.kv_namespaces = [];
if (!wrangler.kv_namespaces.some((ns) => ns.binding === 'NEWS_CACHE')) {
  // Read the production ID from the root wrangler.jsonc
  const rootConfig = JSON.parse(
    readFileSync('wrangler.jsonc', 'utf-8')
      .replace(/\/\/.*$/gm, '')  // strip single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')  // strip block comments
  );
  const newsKv = rootConfig.kv_namespaces?.find((ns) => ns.binding === 'NEWS_CACHE');
  if (newsKv) {
    wrangler.kv_namespaces.push(newsKv);
  } else {
    console.warn('[post-build] WARNING: NEWS_CACHE KV namespace not found in root wrangler.jsonc');
  }
}

writeFileSync(WRANGLER_PATH, JSON.stringify(wrangler, null, 2));
console.log('[post-build] Patched wrangler.json with cron trigger and KV binding');
```

- [ ] **Step 3: Update package.json scripts**

Add a `deploy` script that chains build, post-build, and deploy. Update the existing scripts:

In `package.json`, add/modify:
```json
"post-build": "node scripts/post-build.mjs",
"deploy": "astro build && node scripts/post-build.mjs && wrangler deploy --config dist/server/wrangler.json"
```

- [ ] **Step 4: Test the full build pipeline**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npm run build && npm run post-build`

Verify:
- `dist/server/worker-entry.mjs` exists and contains the `scheduled` handler
- `dist/server/wrangler.json` has `"main": "worker-entry.mjs"`, the cron trigger, and the KV namespace

Run: `cat dist/server/worker-entry.mjs && echo "---" && cat dist/server/wrangler.json`

- [ ] **Step 5: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add scripts/post-build.mjs package.json
git commit -m "feat: add post-build script for scheduled handler and cron trigger"
```

---

### Task 6: Update Homepage to Read from KV

**Files:**
- Modify: `src/pages/index.astro:1-17` (frontmatter section)

- [ ] **Step 1: Update the frontmatter to read from KV with fallback**

Replace the existing frontmatter (lines 1-17) with:

```astro
---
export const prerender = false;

import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import Sidebar from '../components/Sidebar.astro';
import NewsSection from '../components/NewsSection.astro';
import { getCollection } from 'astro:content';
import { env } from 'cloudflare:workers';
import type { NewsItem } from '../utils/types';

let newsData: NewsItem[] = [];
try {
  const cached = await env.NEWS_CACHE.get('latest');
  newsData = cached ? JSON.parse(cached) : [];
} catch {
  // Local dev or KV unavailable — fall back to static JSON
  try {
    newsData = (await import('../data/news.json')).default;
  } catch {
    // No news at all — degrade gracefully
  }
}

const allGuides = await getCollection('guides');
const featuredGuides = allGuides
  .filter((g) => g.data.featured && g.id !== 'llms-in-clinical-care-101')
  .sort((a, b) => b.data.lastUpdated.getTime() - a.data.lastUpdated.getTime());
---
```

The rest of the template (line 18 onward) stays exactly the same.

- [ ] **Step 2: Build to verify no errors**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx astro build`
Expected: Build succeeds without errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/pages/index.astro
git commit -m "feat: read news from KV with static JSON fallback"
```

---

### Task 7: Cleanup

**Files:**
- Delete: `src/utils/fetch-news.ts`
- Modify: `package.json` (remove `rss-parser`)

- [ ] **Step 1: Delete the old fetch-news script**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
rm src/utils/fetch-news.ts
```

- [ ] **Step 2: Remove the rss-parser dependency**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npm uninstall rss-parser
```

- [ ] **Step 3: Update the fetch-news npm script**

In `package.json`, the `"fetch-news"` script currently runs `tsx src/utils/fetch-news.ts`. Since `refresh-news.ts` no longer writes to the filesystem, update this script:

Change `"fetch-news": "tsx src/utils/fetch-news.ts"` to:
```json
"fetch-news": "echo 'News is now fetched via Cloudflare cron. Manual trigger: curl -X POST -H \"Authorization: Bearer <secret>\" https://llmsfordoctors.com/api/refresh-news'"
```

- [ ] **Step 4: Run all tests to verify nothing is broken**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx vitest run`
Expected: All tests PASS. No imports of the deleted `fetch-news.ts` remain.

- [ ] **Step 5: Run the full build pipeline**

Run: `cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npx astro build && node scripts/post-build.mjs`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add -A
git commit -m "chore: remove rss-parser and old fetch-news script"
```

---

### Task 8: Seed KV and Deploy

**Files:** None (operational task)

- [ ] **Step 1: Seed KV with current news data**

The existing `src/data/news.json` has valid data. Push it to KV so the homepage works immediately after deploy. Use the root `wrangler.jsonc` (which has the KV namespace ID) for this CLI command:

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
npx wrangler kv key put --binding NEWS_CACHE "latest" "$(cat src/data/news.json)"
```

Verify the namespace ID in the root `wrangler.jsonc` matches the one in `dist/server/wrangler.json` (the post-build script copies it from root to dist, but confirm after Task 5).

- [ ] **Step 2: Deploy using the new pipeline**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npm run deploy
```

This runs: `astro build && node scripts/post-build.mjs && wrangler deploy --config dist/server/wrangler.json`

Expected: Deploy succeeds. The cron trigger should appear in the Cloudflare dashboard under Workers > llmsfordoctors > Triggers.

- [ ] **Step 3: Verify the homepage loads news from KV**

Visit https://llmsfordoctors.com and confirm the news section renders with the seeded data.

- [ ] **Step 4: Test the manual refresh API**

```bash
curl -X POST -H "Authorization: Bearer <your-secret>" https://llmsfordoctors.com/api/refresh-news
```

Expected: `{"count":10,"timestamp":"...","written":true}` (or similar)

- [ ] **Step 5: Verify cron is registered**

Run: `npx wrangler deployments list` or check the Cloudflare dashboard for the cron trigger. The first automatic run will happen at 6 AM UTC.

- [ ] **Step 6: Monitor first cron execution**

Run: `npx wrangler tail` and wait for the next cron fire (or trigger it manually from the Cloudflare dashboard). Check for `[cron] Refresh result:` in the logs.
