# Web Content Editor: Design Spec

**Date:** 2026-06-03
**Status:** Approved for planning
**Author:** Jason Gusdorf, MD (with Claude)

## Goal

Let the site owner edit existing articles directly from the live site: click an Edit button on an article page, change the content in a markdown editor with live preview, and publish. Publishing commits the change to the GitHub repo and auto-deploys, so the public page updates in about a minute.

## Decisions (settled during brainstorming)

1. **Edit location:** the live public site (`llmsfordoctors.com`), not a local-only tool.
2. **Editor feel:** markdown source plus live preview, not type-on-the-page WYSIWYG.
3. **Publish model:** commit the edited `.mdx` to GitHub `main`, then auto-deploy via GitHub Actions. Files in git remain the single source of truth.
4. **Auth:** a single admin password (one author), exchanged for a secure server-side session.

## Context that shapes the design

- Content is Astro MDX content collections in `src/content/<collection>/<slug>.mdx`, compiled at build time and served via SSR on Cloudflare Workers. There is no content database.
- The repo already has a GitHub Action (`.github/workflows/daily-news-build.yml`) with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets configured, which already builds and deploys the Worker. The auto-deploy pipeline mostly exists.
- The real deploy is `npm run deploy` = `astro build` + `node scripts/post-build.mjs` + `wrangler deploy --config dist/server/wrangler.json`. `post-build.mjs` writes the `scheduled` cron handler and patches `dist/server/wrangler.json` with the cron trigger and KV bindings. A deploy that skips `post-build.mjs` ships without the cron/bindings patch.
- Pushing to `main` does NOT currently auto-deploy. We will change that for content paths only.
- No admin auth exists on the main site today. `forum-auth` is a separate Fly.io Discourse SSO service and is out of scope.

## Architecture overview

```
Browser (admin)
  -> /admin/login  (password)  -> POST /api/admin/login -> session cookie
  -> article page (Edit button shown if session valid)
  -> /admin/edit/<collection>/<slug>
        GET  /api/admin/file   (load current MDX from GitHub)
        POST /api/admin/save   (validate -> commit to GitHub main)
  -> GitHub push to main (src/content/**)
  -> GitHub Action: build + post-build + wrangler deploy
  -> live (~60s)
```

All admin endpoints verify the session server-side. GitHub and Cloudflare credentials live only on the server.

## Components

### Auth

- **`POST /api/admin/login`**: accepts `{ password }`. Compares against `ADMIN_PASSWORD_HASH` (a hash, e.g. PBKDF2/scrypt via Web Crypto, stored as a Worker secret). On success: generate a random 256-bit session token, store `session:<token> -> { createdAt, expiresAt }` in the admin KV with a TTL (7 days), set cookie `lfd_admin=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=...`. On failure: increment `login_fail:<ip>` in KV (short TTL); after N failures (e.g. 5 in 15 min) return 429 until the window expires.
- **`POST /api/admin/logout`**: delete the session from KV, clear the cookie.
- **`requireAdmin(request, env)`** (shared helper in `src/lib/admin-auth.ts`): read the `lfd_admin` cookie, look up the session in KV, return the session or null. Used by every admin API and admin page.
- **`/admin/login`** page: a minimal password form that posts to the login API and redirects back to the editor on success.

### Editor UI

- **Edit affordance**: on each article detail page, render an Edit link when `requireAdmin` passes during SSR. The link points to `/admin/edit/<collection>/<slug>`. Visibility is cosmetic; the APIs are the real gate.
- **`/admin/edit/<collection>/<slug>`** page (admin-gated during SSR; redirects to `/admin/login` if no session): two panes.
  - Left: a code editor (CodeMirror, markdown mode) for the body, plus a small form for frontmatter fields parsed from the file (`title`, `description`, `tags`, `lastUpdated`, `featured`, `socialPost`, and collection-specific fields where present, e.g. tools `rating`/`verdict`).
  - Right: a live preview that renders the markdown body client-side (e.g. `marked` or `markdown-it`). Custom MDX components (`Callout`, `PromptPlayground`) render as labeled placeholder boxes, not their final styled form. This limitation is stated in the UI.
  - A Publish button and a status line ("Publishing, live in about a minute") with a link to the GitHub Action run.

### Read API

- **`GET /api/admin/file?collection=<c>&slug=<s>`** (admin-gated): validates `collection` against an allowlist and `slug` against the set of existing files in that collection, then fetches the raw `.mdx` from GitHub (`GET /repos/:owner/:repo/contents/<path>?ref=main`). Returns `{ frontmatter, body, sha }`. The `sha` is the file blob SHA needed for the commit. Reading from GitHub (not the build) guarantees the editor shows the current source.

### Save API

- **`POST /api/admin/save`** (admin-gated): accepts `{ collection, slug, frontmatter, body, sha }`.
  - **Validation** (reject with 400 on any failure):
    - `collection` in the allowlist; `slug` matches an existing file in that collection (no path traversal, no new files in v1).
    - Frontmatter parses as valid YAML and satisfies the collection's required fields (mirror the Zod schema in `src/content.config.ts`).
    - Content contains no em dash character (U+2014), enforcing the house rule.
    - `socialPost`, if present, <= 256 characters.
  - Reconstruct the full file: `---\n<frontmatter yaml>\n---\n\n<body>`.
  - Commit via GitHub Contents API (`PUT /repos/:owner/:repo/contents/<path>`) with the provided `sha`, branch `main`, message `content: edit <slug> via web editor`, using `GITHUB_TOKEN`. If the SHA is stale (someone edited since load), GitHub returns 409; surface a "file changed, reload" message.
  - Return `{ ok: true, commitUrl }`.

### Auto-deploy workflow

- New workflow `.github/workflows/deploy-content.yml`, triggered on `push` to `main` with `paths: ['src/content/**']`.
- Steps: checkout, setup Node 22, `npm ci`, `npm run build`, `node scripts/post-build.mjs`, deploy via `cloudflare/wrangler-action` with `command: deploy --config dist/server/wrangler.json`, using the existing Cloudflare secrets. (This runs the full, correct deploy including `post-build.mjs`.)
- Code pushes (anything outside `src/content/**`) still require manual `npm run deploy`, preserving current behavior.
- **Related fix:** the existing `daily-news-build.yml` builds and deploys without running `post-build.mjs`. Update it to run `post-build.mjs` before deploy so scheduled deploys keep the cron and KV bindings. Tracked as part of this work.

## Data model (admin KV)

A dedicated KV namespace `ADMIN_STORE`:

- `session:<token>` -> `{ createdAt, expiresAt }`, TTL 7 days.
- `login_fail:<ip>` -> count, TTL 15 min (rate limiting).

The binding must be added to both `wrangler.jsonc` and the `post-build.mjs` patch (the deploy uses the patched `dist/server/wrangler.json`).

## Secrets and config

Worker secrets (set via `wrangler secret put`):

- `ADMIN_PASSWORD_HASH`: hash of the chosen admin password.
- `GITHUB_TOKEN`: fine-grained PAT, this repo only, Contents read/write.
- `GITHUB_REPO` / `GITHUB_OWNER`: can be plain vars (`jasongusdorf` / `llmsfordoctors`).

GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` already exist.

For local dev, the same keys go in `.dev.vars`.

## Security posture

- Server-side session check on every admin API and admin page; Edit button visibility is cosmetic.
- Cookie is HttpOnly, Secure, SameSite=Strict. CSRF further mitigated by requiring a custom request header (e.g. `X-Requested-With`) on state-changing POSTs.
- Login rate-limited by IP.
- Strict save validation: existing-file slug allowlist (no arbitrary paths), valid frontmatter schema, em-dash guard, socialPost length.
- GitHub and Cloudflare credentials are server-only.
- Note: MDX is powerful (it can embed components and JS evaluated at build). Only the authenticated admin can write it, and only to existing content files, which is an accepted risk for a single-author site.

## Scope

**In (v1):** edit existing articles in all detail-page collections (editorials, guides, tools, trials, templates, workflows, videos); login/logout; commit + auto-deploy; live preview.

**Out (v1):** creating or deleting articles via the UI; image/media upload; multiple users or roles; inline type-on-the-page WYSIWYG; editing list/index pages.

## Testing

- **Unit:** `requireAdmin` session validation; login password hashing and rate-limit; save validation (rejects invalid YAML, missing required fields, em dashes, mismatched/unknown slug, oversized socialPost); MDX reconstruction round-trip (load then save with no change yields an identical file).
- **Manual end-to-end:** log in; edit a guide; publish; confirm the GitHub commit, the Action run, and the live change; confirm logout revokes access; confirm a wrong password is rate-limited.

## Setup steps (owner, one time)

1. Create a GitHub fine-grained PAT scoped to `llmsfordoctors` with Contents read/write.
2. Create the `ADMIN_STORE` KV namespace (or Claude does this via `wrangler kv namespace create`).
3. Set Worker secrets: `wrangler secret put ADMIN_PASSWORD_HASH`, `wrangler secret put GITHUB_TOKEN`.
4. Deploy once so the new bindings and routes go live.

## Risks and mitigations

- **Stale-SHA conflicts:** rare for a single author; handled by surfacing GitHub's 409 with a reload prompt.
- **Publish latency (~60s):** accepted; the editor shows status and a link to the run. Live preview covers the immediate feedback need.
- **Auto-deploy scope creep:** path filter limits triggers to `src/content/**`.
- **Build break from a bad edit:** validation catches schema and YAML errors before commit; if a deploy still fails, the previously deployed version stays live and the Action surfaces the error.
- **post-build.mjs omission in CI:** explicitly included in the new workflow and fixed in the existing one.
