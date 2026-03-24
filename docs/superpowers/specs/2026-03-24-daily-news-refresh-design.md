# Daily News Refresh: Cloudflare Workers Cron + KV

## Problem

The news feed on llmsfordoctors.com is a static JSON file baked in at build time. Updating it requires running a local script, rebuilding, and redeploying. The site needs automated daily news updates without manual intervention.

## Solution

A Cloudflare Cron Trigger fires once daily, fetching RSS feeds and PubMed articles, then writing the results to a KV namespace. The homepage reads from KV at request time instead of importing static JSON.

## Architecture

### Runtime Infrastructure

**KV namespace:** `NEWS_CACHE`, bound in `wrangler.jsonc`. Stores one key:

- `latest` — JSON string of `NewsItem[]` (same shape as the current `news.json`)

**Cron Trigger:** `0 6 * * *` (6 AM UTC daily), configured in `wrangler.jsonc`. Invokes the Worker's `scheduled` event handler.

**Wrangler config additions:**

```jsonc
{
  "name": "llmsfordoctors",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/worker-entry.ts",
  "kv_namespaces": [
    { "binding": "NEWS_CACHE", "id": "<created-via-wrangler>" }
  ],
  "triggers": {
    "crons": ["0 6 * * *"]
  }
}
```

The `@astrojs/cloudflare` adapter merges the root `wrangler.jsonc` into the generated `dist/server/wrangler.json` at build time. Adding bindings and triggers to the root config is the correct and sufficient approach.

### RSS Parser Replacement

Drop the `rss-parser` dependency (which wraps `xml2js` and uses Node-specific stream/buffer APIs). Replace with a lightweight `parseRssFeed` function in `src/utils/parse-rss.ts` that:

1. Takes an XML string and source name
2. Extracts `<item>` blocks via regex
3. Pulls `<title>`, `<link>`, `<pubDate>`, `<description>`, and `<enclosure>` from each block
4. Returns `NewsItem[]`

Zero dependencies. No Node.js APIs. Guaranteed to run on Cloudflare Workers.

The PubMed fetcher already uses `fetch` + JSON and needs no changes. `AbortSignal.timeout` is part of the standard web API and is supported on Cloudflare Workers.

### News Refresh Logic

**Core module** (`src/utils/refresh-news.ts`): Contains all fetch, parse, deduplicate, and score logic. Extracted from the current `fetch-news.ts` but purged of Node.js APIs (`writeFileSync`, `resolve`, `dirname`, `fileURLToPath`). This is a pure async function: network calls in, `NewsItem[]` out.

**API route** (`src/pages/api/refresh-news.ts`): Server-rendered endpoint (`export const prerender = false`, following the existing pattern in `create-payment-intent.ts`) that:

1. Validates an `Authorization: Bearer <secret>` header against `env.CRON_SECRET` to prevent public abuse. `CRON_SECRET` is a Cloudflare Worker secret set via `wrangler secret put CRON_SECRET`.
2. Calls the refresh module
3. Writes the result to the `NEWS_CACHE` KV namespace via `env.NEWS_CACHE.put()`
4. Returns a JSON summary (count, timestamp)

Also serves as a manual trigger: `curl -H "Authorization: Bearer <secret>" https://llmsfordoctors.com/api/refresh-news`

**Cron wiring** (`src/worker-entry.ts`): Custom Worker entrypoint that wraps Astro's fetch handler and adds a `scheduled` handler. The scheduled handler calls the refresh module directly (no HTTP round-trip, no secret validation needed since there is no request context in a `scheduled` event), reads/writes KV via `env.NEWS_CACHE`, and logs results to the Workers console.

**Entrypoint configuration:** The custom entrypoint is wired via the `main` field in `wrangler.jsonc`, not through the Astro adapter's options. The `@astrojs/cloudflare` adapter no longer exposes a `workerEntryPoint` option; `main` in `wrangler.jsonc` is the supported mechanism.

### Homepage Changes

`src/pages/index.astro` switches from:

```ts
newsData = (await import('../data/news.json')).default;
```

to:

```ts
export const prerender = false;
// ...
const cached = await env.NEWS_CACHE.get('latest');
newsData = cached ? JSON.parse(cached) : [];
```

The homepage becomes server-rendered. The site's `output: 'static'` config is retained; Astro 6 supports hybrid rendering where individual pages opt into server rendering via `export const prerender = false` (the existing payment API routes already use this pattern). Each request reads from KV (~1ms latency), so there is no meaningful performance penalty.

## Error Handling

**Cron failure:** If the scheduled fetch fails entirely, the KV value is never overwritten. The homepage serves the last successful fetch indefinitely (per the "show last successful fetch" requirement).

**Partial feed failure:** Individual feeds that timeout or error return empty arrays. The rest proceed. If every feed fails, the result set is empty and the KV write is skipped, preserving the last good data.

**Local dev:** `astro dev` doesn't run on Cloudflare's runtime, so KV is unavailable. The homepage falls back gracefully:

```ts
let newsData: NewsItem[] = [];
try {
  const cached = await env.NEWS_CACHE.get('latest');
  newsData = cached ? JSON.parse(cached) : [];
} catch {
  try {
    newsData = (await import('../data/news.json')).default;
  } catch {
    // No news — degrade gracefully
  }
}
```

`src/data/news.json` is retained as a dev convenience. The local `npm run fetch-news` script remains functional but is no longer the primary data path.

## File Changes

### New files

| File | Purpose |
|------|---------|
| `src/utils/parse-rss.ts` | Lightweight RSS XML parser (regex-based, zero dependencies) |
| `src/utils/refresh-news.ts` | Core refresh logic: fetch, parse, deduplicate, score |
| `src/worker-entry.ts` | Custom Worker entrypoint: wraps Astro fetch + adds scheduled handler |
| `src/pages/api/refresh-news.ts` | API route for manual/authenticated refresh triggers |

### Modified files

| File | Change |
|------|--------|
| `wrangler.jsonc` | Add KV namespace binding, cron trigger, and `main` field pointing to custom entrypoint |
| `src/pages/index.astro` | Switch from static JSON import to KV read, add `prerender = false` |
| `package.json` | Remove `rss-parser` dependency |

### Removed

| File | Reason |
|------|--------|
| `src/utils/fetch-news.ts` | Replaced by `refresh-news.ts` + `parse-rss.ts` |

### Unchanged

| File | Note |
|------|------|
| `src/utils/news-sources.ts` | Same sources, same interface |
| `src/components/NewsSection.astro` | Same props |
| `src/components/NewsCard.astro` | Same props |
| All scoring/dedup/relevance logic | Moves into `refresh-news.ts` unchanged |

## Testing

- `parseRssFeed`: Unit tests with sample RSS XML payloads
- Scoring, dedup, and AI relevance functions: Already pure and testable; tests migrate from `fetch-news.ts`
- API route: Can be tested manually via curl with the secret header
- Cron: Verify via `wrangler tail` after deploy

## Constraints

- Cloudflare Workers free tier: 3 cron triggers (using 1), 100k KV reads/day, 1k KV writes/day
- Free tier cron triggers: 10ms CPU time limit, 15-minute wall clock limit. Because the work is almost entirely network I/O (waiting on RSS and PubMed responses), CPU usage stays well under 10ms and wall clock time completes in seconds
- No git remote configured; deploy is manual via `npx astro build && npx wrangler deploy`
