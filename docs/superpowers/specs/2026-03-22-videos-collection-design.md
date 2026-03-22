# Videos Collection Design

**Date:** 2026-03-22
**Author:** Jason Gusdorf, MD + Claude
**Status:** Draft

---

## Problem Statement

The site has no video content. There are great YouTube videos about LLMs in clinical practice that should be curated and surfaced to the audience. The site owner will send YouTube links with a priority rating; Claude generates the summary.

## Goals

- Add a "Videos" content collection and `/videos/` index page
- Support sorting by date added (default), priority (highest first), and alphabetical
- Each video has: title, YouTube link, priority (1-5 impact scale), category, LLM tags, topic tags, and a 2-3 sentence summary
- No individual video pages -- the list IS the page; clicking goes to YouTube

## Non-Goals

- Embedded YouTube players (just link out)
- Auto-fetching video metadata (manual curation)
- Individual `/videos/[slug]` routes

---

## Schema

Add to `src/content.config.ts`:

```typescript
const videoCategories = [
  'tutorial',
  'lecture',
  'demo',
  'interview',
] as const;

const videos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    channel: z.string(),
    category: z.enum(videoCategories),
    llm: z.array(z.string()),
    topic: z.array(z.string()),
    priority: z.number().min(1).max(5),
    dateAdded: z.date(),
  }),
});
```

Export in `collections` object alongside existing collections.

---

## Content Files

Each video is a short MDX file in `src/content/videos/`:

```mdx
---
title: "Video Title"
url: "https://www.youtube.com/watch?v=..."
channel: "Channel Name"
category: tutorial
llm: [claude]
topic: [prompting, automation]
priority: 2
dateAdded: 2026-03-22
---

2-3 sentence summary written by Claude after receiving the link and rating from the site owner.
```

The body content IS the summary. No components needed.

---

## Index Page

Create `src/pages/videos/index.astro`.

### Layout

Follows the trials index page pattern (`src/pages/trials/index.astro`):

1. **Header** with title, subtitle, and priority scale explanation
2. **Sort controls** -- three buttons: Date (default), Priority, A-Z
3. **Video list** -- compact rows, no cards

### Priority Scale Note

Display at the top:

> "Every video here is worth watching. Stars indicate impact -- 5 means drop everything, 1 means save for a quiet afternoon."

### Sort Controls

Three sort buttons using the Preact interactive component pattern (like `ComparisonTable.tsx`). Create `src/components/VideoList.tsx` as a client-side Preact component that handles sorting.

Alternatively, since Astro can do static sorting and the page is small, use simple anchor-based sorting with query params or just default to one sort order and skip client-side interactivity for now. Recommend starting with the simpler static approach and adding interactive sorting later if the list grows.

**Recommended approach:** Static page sorted by dateAdded (newest first). Add sort links that reload with a query param (`?sort=priority`, `?sort=alpha`). Handle in the Astro frontmatter -- no client-side JS needed.

### List Item Layout

Each row:

```
[priority stars]  Title                          [category] [llm tags]  [YouTube →]
                  2-3 sentence summary
                  Channel Name · Date added
```

- Priority: filled/empty star characters or styled spans
- Title: bold, prominent
- Tags: small inline pills (same style as trial tags)
- YouTube link: small external link at right, opens in new tab
- Summary: rendered from MDX body content
- Channel + date: small gray text below summary

---

## Navigation

Add to `navLinks` array in `src/components/Nav.astro`:

```typescript
{ href: '/videos', label: 'Videos' },
```

Place between "Templates" and "Community" in the nav order.

---

## Initial Videos (4)

| # | Title | Channel | URL | Priority | Category | LLM | Topic |
|---|-------|---------|-----|----------|----------|-----|-------|
| 1 | Stop Fixing Your Claude Skills. Autoresearch Does It For You | Nick Saraev | https://www.youtube.com/watch?v=qKU-e0x2EmE | 2 | tutorial | claude | automation, skills |
| 2 | Claude Code + Nano Banana 2 + Kling = $15K Animated Sites | Nick Saraev | https://www.youtube.com/watch?v=ZfYvv-0l9NA | 1 | demo | claude | web-development, animation |
| 3 | Claude Code Full Course 4 Hours: Build & Sell (2026) | Nick Saraev | https://www.youtube.com/watch?v=QoQBzR1NIqI | 4 | tutorial | claude | claude-code, development |
| 4 | Bernie vs. Claude | Senator Bernie Sanders | https://www.youtube.com/watch?v=h3AtWdeu_G0 | 1 | interview | claude | ai-policy, ethics |

---

## Files to Create/Modify

| Action | File |
|--------|------|
| Modify | `src/content.config.ts` -- add videos collection schema |
| Modify | `src/components/Nav.astro` -- add Videos nav link |
| Create | `src/content/videos/` -- directory for video MDX files |
| Create | `src/content/videos/autoresearch-claude-skills.mdx` |
| Create | `src/content/videos/claude-code-animated-sites.mdx` |
| Create | `src/content/videos/claude-code-full-course-2026.mdx` |
| Create | `src/content/videos/bernie-vs-claude.mdx` |
| Create | `src/pages/videos/index.astro` -- videos index page |

---

## Success Criteria

- `/videos/` page renders with all 4 initial videos
- Sorting works via query params (date, priority, alphabetical)
- Videos link opens YouTube in a new tab
- Nav bar includes "Videos" link
- Site builds without errors
