# AI in Medicine News Feed — Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Branch:** feature/llms-for-doctors

## Overview

Add a daily-updated "AI in Medicine News" section to the llmsfordoctors.com homepage. News is fetched at build time from curated RSS feeds, displayed as image cards below the workflow grid, and refreshed via a daily GitHub Action that deploys to Cloudflare Pages.

## Goals

- Surface the top 3-5 AI-in-medicine stories from the last 3 days on the homepage
- Keep the site fully static — no runtime API calls or SSR
- Automate daily rebuilds so news stays fresh without manual intervention
- Degrade gracefully if sources are unavailable

## Non-Goals

- Separate "all news" page (homepage section only)
- User-configurable news preferences or filtering
- Full-text article content (link out to original sources)
- News as an Astro content collection (this is ephemeral data, not curated content)
- Migrating `netlify.toml` to Cloudflare config (tracked separately — the newsletter form uses Netlify Forms and needs its own migration plan)

## Architecture

### Data Pipeline (`src/utils/fetch-news.ts`)

Build-time Node script, run via `npm run fetch-news` (`tsx src/utils/fetch-news.ts`):

1. **Fetches RSS feeds** in parallel from curated sources (with 10s per-feed timeout — one failure doesn't break the build)
2. **Normalizes** all items into a common shape:
   ```ts
   interface NewsItem {
     title: string;
     source: string;
     url: string;
     date: string;       // ISO 8601
     summary: string;    // 1-2 sentences
     imageUrl?: string;  // nullable, fallback handled in UI
   }
   ```
3. **Deduplicates** by exact URL match, then by fuzzy title matching (normalize to lowercase, strip punctuation, flag as duplicate if Jaccard word similarity > 0.8)
4. **Filters** to last 3 days only
5. **Scores** by recency + source priority (higher-priority feeds rank first, recency breaks ties)
6. **Picks top 5** items
7. **Writes** to `src/data/news.json`

**Error handling:** The script exits 0 even if all sources fail (preserving existing `news.json`). Only exits non-zero for programming errors. This ensures deployment always proceeds.

### RSS Feed Sources (`src/utils/news-sources.ts`)

Curated config file containing feed URLs and priority scores:

| Source | Feed URL | Priority |
|--------|----------|----------|
| STAT News | `https://www.statnews.com/feed/` | 1 (highest) |
| Nature Digital Medicine | `https://www.nature.com/npjdigitalmed.rss` | 1 |
| PubMed (AI + medicine) | Custom saved-search RSS query | 2 |
| JAMA Network | `https://jamanetwork.com/rss/site_X/Y.xml` (exact URL pinned during implementation) | 2 |
| MIT Technology Review | Category-filtered feed (health/AI, not main feed) | 3 |
| Wired | `https://www.wired.com/feed/category/science/latest/rss` (science category, not main) | 3 |
| Ars Technica | Health/science category feed | 3 |
| Google News RSS | `https://news.google.com/rss/search?q=artificial+intelligence+medicine&hl=en` | 4 (broadest) |

Note: Exact URLs for JAMA, MIT Tech Review, and Ars Technica will be verified and pinned during implementation. Category-specific feeds are required to avoid pulling irrelevant articles.

### Fallback Strategy

`news.json` is committed to the repo. If all sources fail during a build, the previous `news.json` is preserved and the homepage renders stale-but-valid news rather than an empty section.

## Homepage UI

### Component: `NewsSection.astro`

Placed as a new full-width section between the workflow/sidebar flex container and the CTA section in `src/pages/index.astro` — outside the sidebar layout.

**Section layout:**
- Heading: "AI in Medicine News" with subheading "Updated daily"
- Responsive card grid: 1 col mobile, 2 cols tablet, 3 cols desktop

### Component: `NewsCard.astro`

Each card contains:
- **Thumbnail image** (top of card). Fallback: branded gradient or medical AI icon if no image available
- **Title** — linked to original article (`target="_blank"`, `rel="noopener"`)
- **Source name + relative date** (e.g., "STAT News · 2 hours ago")
- **Summary** — 1-2 sentences, truncated with ellipsis if needed

**Styling:**
- Matches existing card aesthetic (border radius, shadows, hover states consistent with workflow cards)
- Full dark mode support
- Uses existing clinical color palette — no new colors or design tokens

**Data flow:**
- `index.astro` imports `news.json` at build time, passes items as props to `NewsSection.astro`
- Pure static HTML output, zero client-side JS

## Automated Daily Build

### GitHub Action: `.github/workflows/daily-news-build.yml`

**Schedule:** `cron: '0 10 * * *'` (10am UTC daily)
**Also:** `workflow_dispatch` for manual triggers

**Steps:**
1. Checkout repo
2. Install Node dependencies
3. Run `npm run fetch-news` — writes `src/data/news.json`
4. Commit `news.json` if changed (keeps cache fresh in version control)
5. Run `npm run build`
6. Deploy with `wrangler pages deploy dist --project-name=llmsfordoctors --branch=main`

**Error handling:** The fetch-news step uses `continue-on-error: true` so deployment proceeds even if the script crashes unexpectedly.

**Secrets required:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Why commit `news.json`?

- Acts as fallback cache if fetch fails on a subsequent build
- Makes news data inspectable in version control
- Non-cron deploys (manual pushes) still have recent news baked in
- Add `src/data/news.json` to `.gitattributes` with `linguist-generated=true` so GitHub collapses diffs by default

## File Changes

### New files
| File | Purpose |
|------|---------|
| `src/utils/fetch-news.ts` | Fetch + normalize + deduplicate + score logic |
| `src/utils/news-sources.ts` | RSS feed URLs + source priority config |
| `src/data/news.json` | Cached news output (committed to repo) |
| `src/components/NewsSection.astro` | Homepage news grid section |
| `src/components/NewsCard.astro` | Individual news card component |
| `.github/workflows/daily-news-build.yml` | Daily cron + deploy workflow |
| `.gitattributes` | Mark `news.json` as linguist-generated |

### Modified files
| File | Change |
|------|--------|
| `src/pages/index.astro` | Import `news.json`, add `NewsSection` as full-width section below workflow/sidebar container, above CTA |
| `package.json` | Add `rss-parser` dependency, `tsx` devDependency, `fetch-news` script |

### Unchanged
- `astro.config.ts` (stays `output: 'static'`)
- `netlify.toml` (cleanup scoped out — newsletter form depends on Netlify Forms)
- Content collections (news is ephemeral data, not a collection)
- Existing components and layouts

## Dependencies

| Package | Type | Purpose |
|---------|------|---------|
| `rss-parser` | dependency | Parse RSS/Atom feeds |
| `tsx` | devDependency | Run TypeScript fetch script outside Astro build |
