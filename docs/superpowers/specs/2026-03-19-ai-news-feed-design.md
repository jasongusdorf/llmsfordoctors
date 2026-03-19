# AI in Medicine News Feed — Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Branch:** feature/llms-for-doctors

## Overview

Add a daily-updated "AI in Medicine News" section to the llmsfordoctors.com homepage. News is fetched at build time from curated RSS feeds and NewsAPI, displayed as image cards below the workflow grid, and refreshed via a daily GitHub Action that deploys to Cloudflare Pages.

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

## Architecture

### Data Pipeline (`src/utils/fetch-news.ts`)

Build-time Node script that:

1. **Fetches RSS feeds** in parallel from curated sources (with per-feed timeout — one failure doesn't break the build)
2. **Fetches NewsAPI** results for broad keyword coverage (1 API call)
3. **Normalizes** both into a common shape:
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
4. **Deduplicates** by URL and fuzzy title matching
5. **Filters** to last 3 days only
6. **Scores** by recency + source priority (curated RSS sources rank higher than NewsAPI results)
7. **Picks top 5** items
8. **Writes** to `src/data/news.json`

### RSS Feed Sources (`src/data/news-sources.ts`)

Curated config file containing feed URLs and priority scores:

- STAT News AI/Health
- Nature Digital Medicine
- MIT Technology Review (Health/AI)
- The Lancet Digital Health
- JAMA Network (health informatics)
- Wired (health/science)
- Ars Technica (health)
- Google News RSS (query: "artificial intelligence medicine")

### NewsAPI Query

- Endpoint: `everything`
- Query: `"AI medicine" OR "artificial intelligence healthcare" OR "LLM clinical"`
- Filters: last 3 days, English, sorted by relevance
- 1 call per build (well within free tier of 100 req/day)

### Fallback Strategy

`news.json` is committed to the repo. If all sources fail during a build, the previous `news.json` is preserved and the homepage renders stale-but-valid news rather than an empty section.

## Homepage UI

### Component: `NewsSection.astro`

Placed below the workflow grid, above the CTA section in `src/pages/index.astro`.

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
3. Run news fetch script — writes `src/data/news.json`
4. Commit `news.json` if changed (keeps cache fresh in version control)
5. Run `npm run build`
6. Deploy with `wrangler pages deploy dist --project-name=llmsfordoctors --branch=main`

**Secrets required:**
- `NEWSAPI_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Why commit `news.json`?

- Acts as fallback cache if fetch fails on a subsequent build
- Makes news data inspectable in version control
- Non-cron deploys (manual pushes) still have recent news baked in

## File Changes

### New files
| File | Purpose |
|------|---------|
| `src/utils/fetch-news.ts` | Fetch + normalize + deduplicate + score logic |
| `src/data/news.json` | Cached news output (committed to repo) |
| `src/data/news-sources.ts` | RSS feed URLs + source priority config |
| `src/components/NewsSection.astro` | Homepage news grid section |
| `src/components/NewsCard.astro` | Individual news card component |
| `.github/workflows/daily-news-build.yml` | Daily cron + deploy workflow |
| `public/_headers` | Cloudflare Pages security headers (migrated from netlify.toml) |

### Modified files
| File | Change |
|------|--------|
| `src/pages/index.astro` | Import `news.json`, add `NewsSection` below workflow grid |
| `package.json` | Add `rss-parser` dependency |

### Deleted files
| File | Reason |
|------|--------|
| `netlify.toml` | Deployment is Cloudflare Pages, not Netlify. Headers migrated to `_headers`. |

### Unchanged
- `astro.config.ts` (stays `output: 'static'`)
- Content collections (news is ephemeral data, not a collection)
- Existing components and layouts

## Dependencies

| Package | Purpose |
|---------|---------|
| `rss-parser` | Parse RSS/Atom feeds |
