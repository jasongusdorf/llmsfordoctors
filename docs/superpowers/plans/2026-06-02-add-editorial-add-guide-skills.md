# add-editorial and add-guide Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two project skills, `add-editorial` and `add-guide`, that turn a brief into a complete bylined MDX file in the right content collection and queue it for X posting.

**Architecture:** Each skill is a single self-contained `SKILL.md` under `.claude/skills/`, modeled on the existing `add-trial` skill. They share an intake → calibrate → draft → write-file → queue → report pipeline, differing in collection path, frontmatter, and structural conventions. No application code changes; the posting worker already supports both collections.

**Tech Stack:** Markdown skill files. Content is Astro MDX. Queue operations use `wrangler kv` against the `SOCIAL_STORE` namespace.

**Note on testing:** A skill is not unit-testable. Verification is a dry-run invocation: confirm the produced MDX parses against the collection schema and the queue command is well-formed. Each task ends with a concrete verification step, not a `pytest` run.

---

### Task 1: Write `add-editorial/SKILL.md`

**Files:**
- Create: `.claude/skills/add-editorial/SKILL.md`

Reference while writing: `.claude/skills/add-trial/SKILL.md` (pipeline shape), `.claude/skills/post-to-x/SKILL.md` (queue commands, 256-char rule), `src/content/editorials/the-crossword-problem.mdx` (voice and structure), `src/content.config.ts:91-101` (editorials schema).

- [ ] **Step 1: Create the file with frontmatter and trigger description**

The skill frontmatter `description` must trigger on the right phrases. Use:

```markdown
---
name: add-editorial
description: Write a new editorial (opinion/analysis piece) for llmsfordoctors.com from a brief or notes. Drafts the full MDX in Jason's editorial voice, writes the file, and queues it for the next automated X post. Use when the user says "add editorial", "write an editorial", "new editorial", or describes an opinion/analysis piece they want for the site.
---
```

- [ ] **Step 2: Write the Input / Intake section**

```markdown
# Add Editorial

Write a new editorial for llmsfordoctors.com (the opinion and analysis collection) and queue it for X.

## Input

The user provides anything from a one-line topic to a page of notes.
- A short topic line is a topic plus implicit brief: make reasonable judgment calls on argument, examples, and structure.
- Detailed notes are constraints: build the piece around them, do not discard points.

## Step 1: State the angle before drafting

Before writing the full piece, tell the user in 2-3 sentences:
- the angle/thesis you are taking
- the rough shape (how it opens, the main movements, how it lands)

This lets the user redirect before a full draft exists. Proceed to the draft unless they respond.
```

- [ ] **Step 3: Write the Calibration section**

```markdown
## Step 2: Calibrate voice

Read one existing editorial (e.g., `src/content/editorials/the-crossword-problem.mdx`) before drafting. Calibrate tone, specificity, and Callout usage. Do NOT clone its structure. Each editorial should have its own shape.
```

- [ ] **Step 4: Write the Conventions section (edges fixed, middle free)**

```markdown
## Step 3: Write the MDX

Create the file at `src/content/editorials/<slug>.mdx`. Slug: lowercase, hyphenated, descriptive, no year suffix.

### Frontmatter

\```yaml
---
title: "<Editorial title>"
description: "<One-sentence hook, used on the index card>"
tags: [<lowercase-hyphenated>, editorial]
lastUpdated: <today as YYYY-MM-DD>
featured: <true if the user says so, else false>
socialPost: "<see socialPost rules below>"
---
\```

### Fixed conventions (the edges)

- **Open on something concrete:** a scene, an anecdote, a specific data point, an image. NEVER a thesis statement. NEVER "In today's rapidly evolving..." The reader should be inside the piece before they know the argument.
- Import Callout if used: `import Callout from '../../components/Callout.astro';`
- Use `<Callout type="evidence|pitfall|tip">` where it earns its place. Not every section gets one.
- **Close** with a lingering sentence or question, then the byline on its own line:
  `*Jason G. Gusdorf, MD*`
  then a `## Related on this site` block with 3-4 links to other pieces on the site, each with a short dash-led gloss.

### Free (the middle)

Section count, section titles, length, register, and Callout placement all follow the brief. Vary them. Two editorials should not read as the same template with different words. A piece can be one continuous argument or six short movements; that is a per-piece decision.
```

- [ ] **Step 5: Write the Voice rules section**

```markdown
### Voice rules

Follow the global style guide (`~/.claude/CLAUDE.md`). Specifically:
- No em dashes. Use commas, colons, semicolons, parentheses, or separate sentences.
- No banned phrases: "leverage", "utilize", "in today's rapidly evolving", "game-changer", "passionate about", "cutting-edge", etc.
- Name sources of authority. Specific over general. Numbers over vague quantifiers.
- No emoji.
- New Yorker wit, NYT sharpness, NEJM precision when the subject is clinical.
```

- [ ] **Step 6: Write the socialPost section**

```markdown
### socialPost rules

- **Max 256 characters.** The tweet is `{socialPost} {URL}`; X counts URLs as 23 chars; 280 - 23 - 1 space = 256. Verify before saving:
  \```bash
  echo -n "YOUR SOCIALPOST TEXT" | wc -c
  \```
  If over 256, trim.
- Lead with the argument, not a hook or setup line.
- No em dashes, no emoji, no hype words.
- Tone: a physician making a sharp point to a smart colleague.
```

- [ ] **Step 7: Write the queue + report sections**

```markdown
## Step 4: Queue for X posting

1. Read the current queue:
\```bash
npx wrangler kv key get --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue"
\```
2. Prepend the new editorial. If the queue is empty or returns "Value not found", create a new single-item array:
\```bash
npx wrangler kv key put --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue" '[{"slug":"<slug>","collection":"editorials"}]'
\```
To prepend to an existing queue, splice the new item in front of the parsed array and write the whole array back.

ALWAYS use `--remote`. Without it, the write lands in local KV and never reaches production.

## Step 5: Report to the user

1. **File created:** `src/content/editorials/<slug>.mdx`
2. **socialPost preview:** exact tweet text, with character count
3. **Queue status:** "Queued as next X post"
4. **Next step:** "Run `npm run deploy` to publish."
```

- [ ] **Step 8: Verify the skill file is coherent**

Read the finished file start to end. Confirm: trigger phrases present, every `wrangler` command has `--remote`, the 256-char rule and `wc -c` check are present, the byline and Related block are required, the anti-cookie-cutter instruction is present. Fix any gap inline.

- [ ] **Step 9: Commit**

```bash
git add .claude/skills/add-editorial/SKILL.md
git commit -m "Add add-editorial skill"
```

---

### Task 2: Write `add-guide/SKILL.md`

**Files:**
- Create: `.claude/skills/add-guide/SKILL.md`

Reference while writing: the just-written `add-editorial/SKILL.md` (shared pipeline), `src/content/guides/hipaa-compliance.mdx` (voice and structure), `src/content.config.ts:35-46` (guides schema).

- [ ] **Step 1: Create the file with frontmatter and trigger description**

```markdown
---
name: add-guide
description: Write a new practical guide (how-to content) for llmsfordoctors.com from a brief or notes. Drafts the full MDX in Jason's voice, writes the file, and queues it for the next automated X post. Use when the user says "add guide", "write a guide", "new guide", or describes a practical how-to piece they want for the site.
---
```

- [ ] **Step 2: Write Input / Intake / Calibration sections**

Same intake and angle-statement pattern as `add-editorial` (a short topic is an implicit brief; notes are constraints; state the angle and rough structure before drafting). For calibration, read an existing guide:

```markdown
## Step 2: Calibrate voice

Read one existing guide (e.g., `src/content/guides/hipaa-compliance.mdx`) before drafting. Calibrate tone and specificity. Do NOT clone its structure. Section depth should follow the topic.
```

- [ ] **Step 3: Write the Conventions section (guide-specific edges)**

```markdown
## Step 3: Write the MDX

Create the file at `src/content/guides/<slug>.mdx`. Slug: lowercase, hyphenated, descriptive, no year suffix.

### Frontmatter

\```yaml
---
title: "<Guide title>"
description: "<One-sentence summary, used on the index card>"
tags: [<lowercase-hyphenated>]
lastUpdated: <today as YYYY-MM-DD>
featured: <true if the user says so, else false>
hideToc: false
socialPost: "<see socialPost rules below>"
---
\```

### Fixed conventions (the edges)

- Near the top, state a single plain-language rule the reader can apply immediately ("If you remember nothing else, remember..."). Do not bury it mid-piece.
- Include a `## Contents` table-of-contents block (anchor links to the sections), unless `hideToc` is true.
- **End** on a Quick Reference table or an action checklist: the thing a reader bookmarks.

### Free (the middle)

Section depth follows the topic: a 5-step workflow gets 5 sections; a conceptual guide might have 3 large parts. Section titles, length, and Callout placement follow the brief. Vary them across guides. Do not produce the same template each time.
```

- [ ] **Step 4: Write Voice + socialPost sections**

Copy the Voice rules and socialPost rules verbatim from `add-editorial/SKILL.md` (256-char limit, `wc -c` check, no em dashes, lead with the point). Guides are practical and authoritative, anchored in clinical experience, jargon budget zero by default.

- [ ] **Step 5: Write the queue + report sections**

Identical to `add-editorial` Step 7, but the queue entry uses `"collection":"guides"` and the reported path is `src/content/guides/<slug>.mdx`:

```bash
npx wrangler kv key put --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue" '[{"slug":"<slug>","collection":"guides"}]'
```

- [ ] **Step 6: Verify the skill file is coherent**

Read start to end. Confirm: trigger phrases present, `--remote` on every command, 256-char rule present, the "if you remember nothing else" rule and Quick Reference ending are required, the anti-cookie-cutter instruction is present, `collection` is `guides` everywhere. Fix gaps inline.

- [ ] **Step 7: Commit**

```bash
git add .claude/skills/add-guide/SKILL.md
git commit -m "Add add-guide skill"
```

---

### Task 3: End-to-end dry run

**Files:** none created; this validates both skills produce schema-valid output.

- [ ] **Step 1: Dry-run add-editorial**

Invoke the skill with a small brief (e.g., "write an editorial about why hospitals buy the cheapest AI"). Let it produce the MDX in `src/content/editorials/`.

- [ ] **Step 2: Verify the file parses against the schema**

Run the build (or a content check):
```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors && npm run build 2>&1 | tail -20
```
Expected: build succeeds, no Zod schema error for the new editorial. A schema error here means a frontmatter field is wrong; fix the skill's frontmatter template.

- [ ] **Step 3: Confirm queue command shape (do not necessarily push)**

Confirm the skill emitted a `wrangler kv key put ... --remote "queue"` command with `"collection":"editorials"` and the correct slug. Running it against production is optional during the dry run; the point is to verify the command is well-formed.

- [ ] **Step 4: Repeat for add-guide**

Same three checks with a guide brief; verify `collection":"guides"` and a Quick Reference / checklist ending.

- [ ] **Step 5: Clean up dry-run artifacts if not keeping them**

If the dry-run pieces are throwaway, delete the generated MDX files and do not deploy. If they are keepers, leave them and let the user deploy.

---

## Self-Review

**Spec coverage:** Intake (T1.S2, T2.S2), calibration (T1.S3, T2.S2), editorial conventions (T1.S4), guide conventions (T2.S3), voice rules (T1.S5, T2.S4), socialPost 256-char rule (T1.S6, T2.S4), `--remote` correction (T1.S7, T2.S5), queue + report (T1.S7, T2.S5), schema validation (T3). All spec sections map to tasks.

**Placeholders:** None. Every skill section has its actual content. The `<slug>`, `<today>`, and brief-dependent fields are runtime placeholders inside the skill template, which is correct (the skill fills them at invocation).

**Type consistency:** Namespace ID `7aaff7582add425c9e6372c1dc9cd0f4`, the `{"slug","collection"}` queue shape, and the `--remote` flag are identical across both tasks and match `post-to-x/SKILL.md`. Collection strings are `editorials` and `guides`, matching `src/content.config.ts`.
