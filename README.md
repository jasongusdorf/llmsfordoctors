# LLMs for Doctors

Clinical AI education for physicians, by a physician. Practical workflows, honest tool reviews, prompt templates, and research summaries, written for clinicians and free of ads, sponsors, and conflicts of interest.

Production: [llmsfordoctors.com](https://llmsfordoctors.com) (served from Cloudflare Workers at `llmsfordoctors.jasongusdorf.workers.dev`)

## Stack

- **Astro 6** with MDX content collections
- **Cloudflare Workers** for server-side rendering (via `@astrojs/cloudflare`), not Cloudflare Pages
- **Preact** for interactive components
- **Tailwind CSS 4** with `@tailwindcss/typography`
- **Pagefind** for static search
- **Stripe** for donations

## Content

All content lives in `src/content/` as `.mdx` files; the schema is in `src/content.config.ts`. Seven collections: guides, editorials, trials, videos (Learn) and workflows, templates, tools (Use). Every piece is scored against `docs/content-standards.md`.

## Commands

| Command | Action |
| :------ | :----- |
| `npm run dev` | Local dev server at `localhost:4321` |
| `npm run build` | Production build to `dist/` |
| `npm run deploy` | Build, patch the Worker config, and ship to Cloudflare |

**Always deploy with `npm run deploy`, never `wrangler deploy` directly.** The deploy script runs `scripts/post-build.mjs`, which adds the `scheduled` cron handler (daily news refresh + X posting) and patches the KV binding into the deployed config. Skip it and cron silently breaks. Pushing to `main` does not auto-deploy.

## Style

No em dashes anywhere in the project (`—` or `&mdash;`). Use commas, colons, semicolons, parentheses, or separate sentences. For title separators use a spaced hyphen (` - `); for list-item descriptions use a colon. Content follows the writing style guide in `~/.claude/CLAUDE.md`, with technical topics written in plain language anchored in clinical experience.

## More

- `CLAUDE.md` for architecture, conventions, and deploy details
- `docs/content-standards.md` for the content scoring rubric
- `docs/DEPLOYMENT.md` for deployment specifics
