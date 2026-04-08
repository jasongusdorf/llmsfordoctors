# LLMs for Doctors

Clinical AI education site — Astro 6 + Cloudflare Workers + Preact + Tailwind CSS 4.

**Audience:** Clinicians. All content follows the writing style guide in `~/.claude/CLAUDE.md`. Technical subjects get the "Technical and Infrastructure Topics" treatment: plain language, anchored in clinical experience, zero jargon by default.

## Build & Deploy

- `npm run dev` — local dev server
- `npx astro build` — production build (always run before deploying)
- `npx wrangler deploy` — deploy to Cloudflare Workers (this is the live site)

**Deployment is Cloudflare Workers, NOT Cloudflare Pages.**
The `wrangler.jsonc` at the project root is minimal; the real worker config is generated at `dist/server/wrangler.json` during build.

Deploy workflow: `npx astro build && npx wrangler deploy`

Production URL: https://llmsfordoctors.jasongusdorf.workers.dev (proxied via llmsfordoctors.com)

## Architecture

- **Framework**: Astro 6 with MDX content collections
- **Runtime**: Cloudflare Workers (server-side rendering via `@astrojs/cloudflare`)
- **Interactive components**: Preact (e.g., ComparisonTable.tsx)
- **Styling**: Tailwind CSS 4 with `@tailwindcss/typography`
- **Search**: Pagefind (static search index built at build time)
- **Payments**: Stripe (donations)

## Content Collections

Content lives in `src/content/` as `.mdx` files. Schema defined in `src/content.config.ts`.

| Collection | Path | Key fields |
|---|---|---|
| tools | `src/content/tools/` | title, slug, vendor, rating (0-5), verdict, pricing, hasBaa, categories |
| videos | `src/content/videos/` | title, url, channel, summary, category, llm[], topic[], priority (1-5) |
| templates | `src/content/templates/` | title, category, targetTool, tags |
| guides | `src/content/guides/` | title, description, tags, featured |
| workflows | `src/content/workflows/` | title, category, tools[], tags |
| trials | `src/content/trials/` | title, journal, year, doi, keyFinding |

## Key Conventions

- Tool ratings: 0-5 scale. Rating 0 triggers red warning border on the review page and red left border in the comparison table
- Video priority: 1-5 scale (5 = "drop everything")
- Tool categories: note-writing, clinical-reasoning, patient-education, literature-review, admin-billing, board-prep, general
- Video categories: tutorial, lecture, demo, interview
- Templates page orders categories with note-writing first (not alphabetical)

## Git

Remote is `origin` → `https://github.com/jasongusdorf/llmsfordoctors.git`. Work on `main`; push commits to `origin/main`. Pushing to `main` does not auto-deploy — the live site only updates when you run `npm run deploy` (Astro build + `wrangler deploy`).
