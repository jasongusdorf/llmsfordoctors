# Design: `add-editorial` and `add-guide` skills

**Date:** 2026-06-02
**Status:** Approved, ready for implementation plan

## Problem

The site has three project-specific skills for content: `add-trial`, `search-trials`, and `post-to-x`. All three serve the trials collection, which summarizes other people's published research and is therefore safe to fully automate.

There is no skill for the two collections that carry original, bylined work: editorials (opinion and analysis) and guides (practical how-to). Adding to either is currently manual: hand-write the MDX frontmatter and body, drop the file in `src/content/editorials/` or `src/content/guides/`, then separately queue it for X.

## Goal

Two skills, `add-editorial` and `add-guide`, that take a brief (anything from a one-line topic to a page of notes) and produce a complete, ready-to-review MDX file in the correct collection, then queue it for X posting. They mirror the shape of the existing `add-trial` skill but write original content in the site's editorial voice.

## Decisions

| Question | Decision |
|---|---|
| Claude's role | Full draft from a brief, ready to review and edit |
| One skill or two | Two separate skills (editorial and guide have different structure and purpose) |
| Input format | Either a topic line or detailed notes; the skill adapts |
| Auto-queue for X | Yes, same pipeline as `add-trial` |
| Content structure | Hybrid: fixed conventions at the edges, free in the middle. **Explicitly anti-cookie-cutter:** pieces must vary in shape, length, section count, and register. The conventions are guardrails, not molds. |

## Verification against the codebase

Confirmed before writing this spec:

- **Both collections are fully supported by the posting worker** (`src/utils/social.ts`). `editorials` and `guides` each have a collection weight (0.15, 0.10) and a URL prefix (`/editorials/`, `/guides/`). Queuing them works end to end.
- **Queue entry format** is `{"slug":"...","collection":"..."}`, stored in the `SOCIAL_STORE` KV namespace (ID `7aaff7582add425c9e6372c1dc9cd0f4`) under the `queue` key.
- **Frontmatter schemas** (`src/content.config.ts`):
  - editorials: `title`, `description`, `tags[]`, `lastUpdated` (date), `featured` (bool, default false), `socialPost?`
  - guides: `title`, `description`, `tags[]`, `lastUpdated` (date), `featured` (bool, default false), `hideToc` (bool, default false), `socialPost?`

### Corrections to apply (deviations from `add-trial`)

1. **Use `--remote` on all `wrangler kv` commands.** The `add-trial` skill omits `--remote`, which per the `post-to-x` skill writes only to local KV and never reaches production. The new skills use `--remote`. (`add-trial` should be fixed separately.)
2. **socialPost limit is 256 characters**, not the ~220-250 mentioned in early discussion. The hard rule (from `post-to-x`): tweet is `{socialPost} {URL}`, X shortens URLs to 23 chars, 280 - 23 - 1 space = 256. Verify every socialPost with `echo -n "..." | wc -c` before saving.

## `add-editorial`

**Trigger:** "add editorial", "write an editorial", "new editorial", or a request to write an opinion/analysis piece for the site.

**Intake.** Accept whatever the user provides. A one-line topic is treated as a topic plus implicit brief; a page of notes is treated as constraints to build around. Before drafting the full piece, state the angle being taken and the rough structure, so the user can redirect early.

**Calibration.** Read one existing editorial (e.g., `the-crossword-problem.mdx`) to calibrate tone and specificity. Explicitly: calibrate voice, do not clone structure.

**Conventions (edges fixed, middle free):**
- Open on something concrete: a scene, an anecdote, a specific data point, an image. Never a thesis statement. Never "In today's rapidly evolving..." The reader is inside the piece before they know the argument.
- Use `<Callout>` components (types: `evidence`, `pitfall`, `tip`) where they earn their place. Not every section gets one.
- Close with a lingering sentence or question, then the byline `*Jason G. Gusdorf, MD*`, then a `## Related on this site` block with 3-4 links to other pieces.
- **Anti-cookie-cutter:** vary shape, length, section count, and register between editorials. Section titles and Callout placement follow the brief, not a template.

**Frontmatter:** `title`, `description`, `tags[]` (lowercase-hyphenated, include `editorial`), `lastUpdated` (today), `featured` (ask or default false), `socialPost`.

**File:** `src/content/editorials/<slug>.mdx`. Slug is lowercase-hyphenated, descriptive, no year suffix.

**socialPost:** ≤256 chars (verify with `wc -c`), leads with the argument not a hook, no em dashes, no hype words, no emoji.

## `add-guide`

**Trigger:** "add guide", "write a guide", "new guide", or a request for a practical how-to piece.

**Intake, calibration, queue, and report:** identical pattern to `add-editorial`, with `collection: "guides"`, path `src/content/guides/<slug>.mdx`, and calibration against an existing guide (e.g., `hipaa-compliance.mdx`).

**Conventions (edges fixed, middle free):**
- Near the top, a single plain-language rule the reader can apply immediately ("If you remember nothing else, remember..."). Not buried mid-piece.
- A `## Contents` TOC (unless `hideToc` is set).
- End on a Quick Reference table or an action checklist: the thing a reader bookmarks.
- Section depth follows the topic: a 5-step workflow gets 5 sections; a conceptual guide might have 3 large parts. Claude decides.
- **Anti-cookie-cutter:** same instruction as editorials.

**Frontmatter:** `title`, `description`, `tags[]`, `lastUpdated`, `featured` (default false), `hideToc` (default false), `socialPost`.

## Shared post-write pipeline (both skills)

1. Write the MDX file to the correct collection path.
2. Read the current queue:
   ```bash
   npx wrangler kv key get --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue"
   ```
3. Prepend the new item and write it back:
   ```bash
   npx wrangler kv key put --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue" '[{"slug":"<slug>","collection":"<editorials|guides>"}, ...existing]'
   ```
   If the queue is empty or absent ("Value not found"), create a new single-item array.
4. Report to the user:
   - File created: `<path>`
   - socialPost preview: exact text that will be tweeted, with character count
   - Queue status: "Queued as next X post"
   - Next step: "Run `npm run deploy` to publish."

## Voice rules (both skills)

Inherit the global writing style guide (`~/.claude/CLAUDE.md`):
- No em dashes. Commas, colons, semicolons, parentheses, or separate sentences.
- No banned phrases ("leverage", "utilize", "in today's rapidly evolving", "game-changer", etc.).
- Name sources of authority. Specific over general. Numbers over vague quantifiers.
- No emoji.
- Editorial register for editorials (New Yorker / NYT); practical and authoritative for guides, anchored in clinical experience, jargon budget zero by default.

## Out of scope

- Editing or regenerating existing editorials/guides (these skills only add new ones).
- Image sourcing or generation for the piece.
- Fixing the `--remote` bug in `add-trial` (noted, handled separately).
- Immediate posting (the skills queue only; the user runs `post-to-x` to publish now).

## File layout

```
.claude/skills/add-editorial/SKILL.md
.claude/skills/add-guide/SKILL.md
```

Each is a single self-contained `SKILL.md`, matching the existing project skills (no `references/` subdirectories needed).
