# AI in Medicine News Feed — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a daily-updated AI in medicine news section to the llmsfordoctors.com homepage, fetched from curated RSS feeds at build time.

**Architecture:** A standalone TypeScript script fetches RSS feeds, normalizes/deduplicates/scores items, and writes a JSON file. Astro components read this JSON at build time and render news cards. A GitHub Action runs the script daily and deploys to Cloudflare Pages.

**Tech Stack:** Astro 6 (static), rss-parser, tsx, Tailwind v4, GitHub Actions, Cloudflare Pages (wrangler)

**Spec:** `docs/superpowers/specs/2026-03-19-ai-news-feed-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/utils/news-sources.ts` | RSS feed URL config with priority scores |
| `src/utils/fetch-news.ts` | Fetch, normalize, deduplicate, score, write JSON |
| `src/data/news.json` | Cached news output (committed, auto-generated) |
| `src/components/NewsCard.astro` | Individual news card with image, title, source, summary |
| `src/components/NewsSection.astro` | Section wrapper with heading + responsive card grid |
| `src/pages/index.astro` | Modified: import news.json, render NewsSection |
| `package.json` | Modified: add rss-parser, tsx, fetch-news script |
| `.gitattributes` | Mark news.json as linguist-generated |
| `src/utils/fetch-news.test.ts` | Unit tests for pure utility functions |
| `.github/workflows/daily-news-build.yml` | Daily cron: fetch → build → deploy |

---

### Task 0: Set up working branch

- [ ] **Step 1: Check out the working branch**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git checkout main
git pull origin main
git checkout -b feature/ai-news-feed
```

---

### Task 1: Install dependencies and add fetch-news script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install rss-parser and tsx**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
npm install rss-parser
npm install -D tsx
```

- [ ] **Step 2: Add fetch-news script to package.json**

In `package.json`, add to the `"scripts"` block:

```json
"fetch-news": "tsx src/utils/fetch-news.ts"
```

So scripts becomes:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "fetch-news": "tsx src/utils/fetch-news.ts"
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add rss-parser and tsx dependencies, fetch-news script"
```

---

### Task 2: Create RSS feed sources config

**Files:**
- Create: `src/utils/news-sources.ts`

- [ ] **Step 1: Create the news sources config**

Create `src/utils/news-sources.ts`:

```ts
export interface NewsSource {
  name: string;
  url: string;
  priority: number; // 1 = highest
}

export const newsSources: NewsSource[] = [
  {
    name: 'STAT News',
    url: 'https://www.statnews.com/feed/',
    priority: 1,
  },
  {
    name: 'Nature Digital Medicine',
    url: 'https://www.nature.com/npjdigitalmed.rss',
    priority: 1,
  },
  {
    name: 'PubMed AI + Medicine',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1sxAg_bOANMKbcMkEb-yblSCDG5BtaQ-dqIMPa4EvOlb4xqNYR/?limit=20&utm_campaign=pubmed-2&fc=20250101000000',
    priority: 2,
  },
  {
    name: 'JAMA Health Forum',
    url: 'https://jamanetwork.com/rss/site_178/74.xml',
    priority: 2,
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    priority: 3,
  },
  {
    name: 'Wired Science',
    url: 'https://www.wired.com/feed/category/science/latest/rss',
    priority: 3,
  },
  {
    name: 'Ars Technica Science',
    url: 'https://feeds.arstechnica.com/arstechnica/science',
    priority: 3,
  },
  {
    name: 'Google News AI Medicine',
    url: 'https://news.google.com/rss/search?q=artificial+intelligence+medicine&hl=en&gl=US&ceid=US:en',
    priority: 4,
  },
];
```

Note: The PubMed RSS URL is a placeholder — during implementation, create a PubMed saved search for "artificial intelligence medicine" and use the resulting RSS URL. The JAMA URL should also be verified and adjusted if needed.

- [ ] **Step 2: Commit**

```bash
git add src/utils/news-sources.ts
git commit -m "feat: add RSS feed sources config for news pipeline"
```

---

### Task 3: Create fetch-news script

**Files:**
- Create: `src/utils/fetch-news.ts`
- Create: `src/data/news.json` (generated output)

- [ ] **Step 1: Create the src/data directory and seed news.json**

```bash
mkdir -p /Users/jasongusdorf/CodingProjects/llmsfordoctors/src/data
```

Create `src/data/news.json` with an empty array as initial seed:

```json
[]
```

- [ ] **Step 2: Create fetch-news.ts**

Create `src/utils/fetch-news.ts`:

```ts
import Parser from 'rss-parser';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newsSources } from './news-sources.js';

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
    const feed = await parser.parseURL(url);
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

function stripHtml(html: string): string {
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

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function deduplicate(items: NewsItem[]): NewsItem[] {
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

// --- Scoring ---

function scoreItem(item: NewsItem, sourcePriority: number): number {
  const ageMs = Date.now() - new Date(item.date).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  // Recency score: 0-10 (newer = higher)
  const recencyScore = Math.max(0, 10 - ageDays * 3);
  // Priority score: 1=10pts, 2=7pts, 3=4pts, 4=1pt
  const priorityScore = Math.max(1, 11 - sourcePriority * 3);
  return recencyScore + priorityScore;
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

  // Flatten and attach priority
  const allItems: { item: NewsItem; priority: number }[] = [];
  for (const result of results) {
    for (const item of result.items) {
      allItems.push({ item, priority: result.priority });
    }
  }

  // Filter to last 3 days
  const recent = allItems.filter(
    ({ item }) => new Date(item.date) >= cutoffDate && item.title && item.url
  );

  console.log(`[fetch-news] ${recent.length} items within last ${MAX_AGE_DAYS} days`);

  // Deduplicate
  const unique = deduplicate(recent.map((r) => r.item));

  // Build priority map for scoring
  const priorityMap = new Map<string, number>();
  for (const { item, priority } of recent) {
    if (!priorityMap.has(item.url)) {
      priorityMap.set(item.url, priority);
    }
  }

  // Score and sort
  const scored = unique
    .map((item) => ({
      item,
      score: scoreItem(item, priorityMap.get(item.url) || 4),
    }))
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

main().catch((err) => {
  console.error('[fetch-news] Unexpected error:', err);
  process.exit(1);
});
```

- [ ] **Step 3: Run the script to verify it works and populates news.json**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
npm run fetch-news
```

Expected: Script logs fetch progress, writes items to `src/data/news.json`. Some feeds may warn (that's OK). Verify `src/data/news.json` has items with title, source, url, date, summary fields.

- [ ] **Step 4: Commit**

```bash
git add src/utils/fetch-news.ts src/data/news.json
git commit -m "feat: add news fetch pipeline with RSS aggregation and dedup"
```

---

### Task 3b: Add unit tests for fetch-news utilities

**Files:**
- Modify: `package.json` (add vitest devDependency and test script)
- Create: `src/utils/fetch-news.test.ts`

The pure functions `tokenize`, `jaccardSimilarity`, `deduplicate`, `scoreItem`, and `stripHtml` in `fetch-news.ts` must be exported for testing. Add `export` in front of each function declaration (`export function tokenize(...)`, etc.) in `fetch-news.ts`.

- [ ] **Step 1: Install vitest**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
npm install -D vitest
```

Add a `"test"` script to `package.json`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Export pure functions from fetch-news.ts**

In `src/utils/fetch-news.ts`, add `export` keyword to these function declarations:
- `export function stripHtml(...)`
- `export function tokenize(...)`
- `export function jaccardSimilarity(...)`
- `export function deduplicate(...)`
- `export function scoreItem(...)`

- [ ] **Step 3: Create test file**

Create `src/utils/fetch-news.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  stripHtml,
  tokenize,
  jaccardSimilarity,
  deduplicate,
  scoreItem,
  type NewsItem,
} from './fetch-news.js';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('collapses whitespace', () => {
    expect(stripHtml('hello   world\n\tfoo')).toBe('hello world foo');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });
});

describe('tokenize', () => {
  it('lowercases and splits into words', () => {
    const tokens = tokenize('Hello World');
    expect(tokens).toEqual(new Set(['hello', 'world']));
  });

  it('strips punctuation', () => {
    const tokens = tokenize("AI's impact on medicine!");
    expect(tokens.has('ais')).toBe(true);
    expect(tokens.has('impact')).toBe(true);
    expect(tokens.has('medicine')).toBe(true);
  });

  it('filters words with 2 or fewer characters', () => {
    const tokens = tokenize('AI is a big deal');
    expect(tokens.has('is')).toBe(false);
    expect(tokens.has('a')).toBe(false);
    expect(tokens.has('big')).toBe(true);
    expect(tokens.has('deal')).toBe(true);
  });
});

describe('jaccardSimilarity', () => {
  it('returns 1.0 for identical sets', () => {
    const a = new Set(['hello', 'world']);
    expect(jaccardSimilarity(a, a)).toBe(1.0);
  });

  it('returns 0.0 for disjoint sets', () => {
    const a = new Set(['hello']);
    const b = new Set(['world']);
    expect(jaccardSimilarity(a, b)).toBe(0.0);
  });

  it('returns correct value for partial overlap', () => {
    const a = new Set(['hello', 'world', 'foo']);
    const b = new Set(['hello', 'world', 'bar']);
    // intersection: 2, union: 4 -> 0.5
    expect(jaccardSimilarity(a, b)).toBe(0.5);
  });

  it('returns 0.0 for two empty sets', () => {
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0.0);
  });
});

describe('deduplicate', () => {
  const makeItem = (title: string, url: string): NewsItem => ({
    title,
    source: 'Test',
    url,
    date: new Date().toISOString(),
    summary: 'Test summary',
  });

  it('removes exact URL duplicates', () => {
    const items = [
      makeItem('Article One', 'https://example.com/1'),
      makeItem('Article Two', 'https://example.com/1'),
    ];
    const result = deduplicate(items);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Article One');
  });

  it('removes fuzzy title duplicates (Jaccard > 0.8)', () => {
    const items = [
      makeItem('AI transforms medicine in new study results', 'https://a.com/1'),
      makeItem('AI transforms medicine in new study results today', 'https://b.com/2'),
    ];
    const result = deduplicate(items);
    expect(result).toHaveLength(1);
  });

  it('keeps distinct articles', () => {
    const items = [
      makeItem('AI in radiology improves diagnosis', 'https://a.com/1'),
      makeItem('New cancer treatment shows promise', 'https://b.com/2'),
    ];
    const result = deduplicate(items);
    expect(result).toHaveLength(2);
  });
});

describe('scoreItem', () => {
  it('scores recent high-priority items higher', () => {
    const recent: NewsItem = {
      title: 'Test',
      source: 'Test',
      url: 'https://example.com',
      date: new Date().toISOString(), // now
      summary: 'Test',
    };
    const highPriority = scoreItem(recent, 1);
    const lowPriority = scoreItem(recent, 4);
    expect(highPriority).toBeGreaterThan(lowPriority);
  });

  it('scores newer items higher than older ones at same priority', () => {
    const now: NewsItem = {
      title: 'Test',
      source: 'Test',
      url: 'https://example.com',
      date: new Date().toISOString(),
      summary: 'Test',
    };
    const twoDaysAgo: NewsItem = {
      ...now,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };
    expect(scoreItem(now, 2)).toBeGreaterThan(scoreItem(twoDaysAgo, 2));
  });
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/fetch-news.ts src/utils/fetch-news.test.ts package.json package-lock.json
git commit -m "test: add unit tests for news fetch pipeline utilities"
```

---

### Task 4: Create NewsCard component

**Files:**
- Create: `src/components/NewsCard.astro`

- [ ] **Step 1: Create NewsCard.astro**

Note: `relativeDate()` runs at build time (Astro frontmatter), so dates are snapshots from when the site was built. This is intentional — the site is fully static with no client-side JS for news.

Create `src/components/NewsCard.astro`:

```astro
---
interface Props {
  title: string;
  source: string;
  url: string;
  date: string;
  summary: string;
  imageUrl?: string;
}

const { title, source, url, date, summary, imageUrl } = Astro.props;

function relativeDate(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
---

<a
  href={url}
  target="_blank"
  rel="noopener"
  class="group block rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-800 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
>
  <!-- Thumbnail -->
  <div class="aspect-video bg-clinical-100 dark:bg-clinical-700 overflow-hidden">
    {imageUrl ? (
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    ) : (
      <div class="w-full h-full flex items-center justify-center text-clinical-400 dark:text-clinical-500">
        <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" />
        </svg>
      </div>
    )}
  </div>

  <!-- Content -->
  <div class="p-4">
    <h3 class="font-heading font-semibold text-sm text-clinical-900 dark:text-clinical-50 leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      {title}
    </h3>
    <p class="mt-1 text-xs text-clinical-500 dark:text-clinical-400">
      {source} &middot; {relativeDate(date)}
    </p>
    <p class="mt-2 text-xs text-clinical-600 dark:text-clinical-400 line-clamp-2">
      {summary}
    </p>
  </div>
</a>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/NewsCard.astro
git commit -m "feat: add NewsCard component for news feed items"
```

---

### Task 5: Create NewsSection component

**Files:**
- Create: `src/components/NewsSection.astro`

- [ ] **Step 1: Create NewsSection.astro**

Create `src/components/NewsSection.astro`:

```astro
---
import NewsCard from './NewsCard.astro';

interface NewsItem {
  title: string;
  source: string;
  url: string;
  date: string;
  summary: string;
  imageUrl?: string;
}

interface Props {
  items: NewsItem[];
}

const { items } = Astro.props;
---

{items.length > 0 && (
  <section>
    <div class="flex items-baseline justify-between mb-6">
      <div>
        <h2 class="font-heading text-2xl font-bold text-clinical-900 dark:text-clinical-50">
          AI in Medicine News
        </h2>
        <p class="mt-1 text-sm text-clinical-500 dark:text-clinical-400">Updated daily</p>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => (
        <NewsCard {...item} />
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/NewsSection.astro
git commit -m "feat: add NewsSection component with responsive card grid"
```

---

### Task 6: Integrate NewsSection into homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add NewsSection to index.astro**

Modify `src/pages/index.astro` to import news data and render the section between the workflow/sidebar container and the CTA:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import WorkflowGrid from '../components/WorkflowGrid.astro';
import Sidebar from '../components/Sidebar.astro';
import NewsSection from '../components/NewsSection.astro';
import newsData from '../data/news.json';
---

<BaseLayout
  title="LLMs for Doctors — AI Workflows for Clinicians"
  description="Practical AI workflows, tools, and templates for clinicians. Evidence-based, privacy-aware, specialty-specific."
>
  <Hero />

  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex flex-col lg:flex-row gap-10">
      <!-- Main content -->
      <main class="flex-1 min-w-0">
        <WorkflowGrid />
      </main>

      <!-- Sidebar — 300px on desktop, stacks below on mobile -->
      <div class="w-full lg:w-[300px] shrink-0">
        <div class="lg:sticky lg:top-20">
          <Sidebar />
        </div>
      </div>
    </div>
  </div>

  <!-- News Section -->
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
    <NewsSection items={newsData} />
  </div>

  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-clinical-900 rounded-lg p-10 text-center">
      <h2 class="font-heading text-2xl font-semibold text-clinical-50 mb-3">Join the Community</h2>
      <p class="text-clinical-300 mb-6">Connect with verified physicians using AI in clinical practice.</p>
      <a
        href="https://auth.llmsfordoctors.com/register"
        class="inline-block px-6 py-3 bg-clinical-600 hover:bg-clinical-500 text-white text-sm font-medium rounded-md transition-colors"
      >
        Join Now &mdash; Free for Physicians
      </a>
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify the build works**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
npm run build
```

Expected: Build succeeds with no errors. If `news.json` is empty (`[]`), the NewsSection renders nothing (graceful).

- [ ] **Step 3: Preview locally and verify the news section renders**

```bash
npm run preview
```

Open `http://localhost:4321` in browser. Verify:
- News section appears below workflow grid, above CTA
- Cards show title, source, date, summary, and image (or fallback icon)
- Dark mode toggle works
- Responsive: 1 col on mobile, 2 on tablet, 3 on desktop

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: integrate news feed section into homepage"
```

---

### Task 7: Add .gitattributes for news.json

**Files:**
- Create: `.gitattributes`

- [ ] **Step 1: Create .gitattributes**

Create `.gitattributes` at the project root:

```
src/data/news.json linguist-generated=true
```

- [ ] **Step 2: Commit**

```bash
git add .gitattributes
git commit -m "chore: mark news.json as linguist-generated in gitattributes"
```

---

### Task 8: Create GitHub Action for daily builds

**Files:**
- Create: `.github/workflows/daily-news-build.yml`

- [ ] **Step 1: Create the workflow directory**

```bash
mkdir -p /Users/jasongusdorf/CodingProjects/llmsfordoctors/.github/workflows
```

- [ ] **Step 2: Create daily-news-build.yml**

Create `.github/workflows/daily-news-build.yml`:

```yaml
name: Daily News Build & Deploy

on:
  schedule:
    - cron: '0 10 * * *'  # 10am UTC daily
  workflow_dispatch:       # manual trigger

permissions:
  contents: write          # needed to commit news.json

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Fetch news
        run: npm run fetch-news
        continue-on-error: true

      - name: Commit news.json if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add src/data/news.json
          git diff --staged --quiet || git commit -m "chore: update news.json [skip ci]"
          git push

      - name: Build site
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=llmsfordoctors --branch=main
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/daily-news-build.yml
git commit -m "ci: add daily news build and deploy workflow"
```

---

### Task 9: Configure GitHub secrets and verify end-to-end

**Prerequisite:** The feature branch must be merged to `main` before the GitHub Action can run, since scheduled workflows operate on the default branch.

- [ ] **Step 1: Add required secrets to GitHub repo**

Go to the GitHub repo Settings → Secrets and variables → Actions, and add:
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Pages edit permission
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID

- [ ] **Step 2: Trigger workflow manually to verify**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git push origin main
gh workflow run "Daily News Build & Deploy" --ref main
```

Monitor with:
```bash
gh run list --workflow=daily-news-build.yml --limit=1
gh run watch
```

Expected: Workflow completes successfully — fetches news, commits news.json, builds, and deploys.

- [ ] **Step 3: Verify deployed site**

Open `https://llmsfordoctors.com` and verify the news section renders with current AI in medicine stories.
