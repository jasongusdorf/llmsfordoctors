# LLMs for Doctors — Development & Deployment Guide

## Project Overview

- **Framework:** Astro 6 with MDX content collections
- **Hosting:** Cloudflare Worker (NOT Cloudflare Pages)
- **Repo:** `jasongusdorf/jasongusdorf-website` on GitHub
- **Project directory:** `llmsfordoctors/` within the monorepo
- **Live URL:** https://llmsfordoctors.com
- **Worker URL:** https://llmsfordoctors.jasongusdorf.workers.dev

## Prerequisites

- Node.js >= 22.12.0
- npm
- Wrangler CLI (`npx wrangler` or install globally with `npm i -g wrangler`)
- Authenticated with Cloudflare (`npx wrangler login`)

## Local Development

```bash
cd llmsfordoctors/
npm install
npm run dev
```

The dev server runs at `http://localhost:4321` by default.

## Content Structure

All content lives in `src/content/` as MDX files:

| Collection | Directory | Description |
|---|---|---|
| Trials | `src/content/trials/` | Clinical trial and journal article summaries |
| Guides | `src/content/guides/` | Educational articles |
| Tools | `src/content/tools/` | AI tool reviews |
| Templates | `src/content/templates/` | Copy-ready prompt templates |
| Workflows | `src/content/workflows/` | Step-by-step AI use guides |

Schemas are defined in `src/content.config.ts`.

## Adding a New Trial / Article Summary

1. Create a new `.mdx` file in `src/content/trials/`:

```mdx
---
title: "Your Title Here"
journal: "NEJM AI"
year: 2026
doi: "10.1056/AIxxxxxxx"
keyFinding: "One-sentence summary of the key finding."
lastUpdated: 2026-03-21
tags: [tag1, tag2, tag3]
---

import Callout from '../../components/Callout.astro';

## Study Design

Description of the study...

---

## Key Findings

- Finding 1
- Finding 2

---

## Clinical Implications

1. **Point one.** Explanation.

---

## My Takeaway

Editorial commentary...

[Read the full article at NEJM AI](https://doi.org/10.1056/AIxxxxxxx)
```

2. **MDX gotcha:** Escape `<` characters that aren't JSX tags. Write `P&lt;0.001` instead of `P<0.001`, otherwise the build will fail.

3. The trial will automatically appear on `/trials/` (sorted by year) and get its own page at `/trials/your-file-name`.

## Build & Deploy

### Step 1: Build the site

```bash
npm run build
```

This outputs to `dist/` with `dist/server/` (Worker code) and `dist/client/` (static assets).

### Step 2: Deploy to Cloudflare Worker

```bash
npx wrangler deploy --config dist/server/wrangler.json
```

That's it. The Worker deployment uploads both the server code and all static assets.

### One-liner

```bash
npm run build && npx wrangler deploy --config dist/server/wrangler.json
```

## Common Issues

### Build fails with "Unexpected character before name"
You have an unescaped `<` in an MDX file (e.g., `P<0.001`). Replace with `P&lt;0.001`.

### Build fails with "could not be resolved"
A dependency is imported but not in `package.json`. Run `npm install <package-name> --legacy-peer-deps` and commit the updated `package.json` and `package-lock.json`.

### Wrangler deploy fails with auth error
Run `npx wrangler login` to re-authenticate with Cloudflare.

### Changes not showing on live site
Make sure you're deploying to the **Worker** (`npx wrangler deploy --config dist/server/wrangler.json`), not to Pages (`npx wrangler pages deploy`). The live site runs on the Worker.

## Git Workflow

The project uses the `main` branch for production. Feature work can be done on feature branches and merged into `main` when ready. Cloudflare does **not** auto-deploy from GitHub — you must manually run `wrangler deploy` after building.

```bash
# typical workflow
git checkout main
# make changes...
npm run build
npx wrangler deploy --config dist/server/wrangler.json
git add . && git commit -m "your message"
git push
```
