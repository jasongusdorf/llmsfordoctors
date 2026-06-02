---
name: add-editorial
description: Write a new editorial (opinion/analysis piece) for llmsfordoctors.com from a brief or notes. Drafts the full MDX in Jason's editorial voice, writes the file, and queues it for the next automated X post. Use when the user says "add editorial", "write an editorial", "new editorial", or describes an opinion/analysis piece they want for the site.
---

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

## Step 2: Calibrate voice

Read one existing editorial (e.g., `src/content/editorials/the-crossword-problem.mdx`) before drafting. Calibrate tone, specificity, and Callout usage. Do NOT clone its structure. Each editorial should have its own shape.

## Step 3: Write the MDX

Create the file at `src/content/editorials/<slug>.mdx`. Slug: lowercase, hyphenated, descriptive, no year suffix.

### Frontmatter

```yaml
---
title: "<Editorial title>"
description: "<One-sentence hook, used on the index card>"
tags: [<lowercase-hyphenated>, editorial]
lastUpdated: <today as YYYY-MM-DD>
featured: <true if the user says so, else false>
socialPost: "<see socialPost rules below>"
---
```

### Fixed conventions (the edges)

- **Open on something concrete:** a scene, an anecdote, a specific data point, an image. NEVER a thesis statement. NEVER "In today's rapidly evolving..." The reader should be inside the piece before they know the argument.
- Import Callout if used: `import Callout from '../../components/Callout.astro';`
- Use `<Callout type="evidence|pitfall|tip">` where it earns its place. Not every section gets one.
- **Close** with a lingering sentence or question, then the byline on its own line:

  `*Jason G. Gusdorf, MD*`

  then a `## Related on this site` block with 3-4 links to other pieces on the site, each with a short dash-led gloss.

### Free (the middle)

Section count, section titles, length, register, and Callout placement all follow the brief. Vary them. Two editorials should not read as the same template with different words. A piece can be one continuous argument or six short movements; that is a per-piece decision.

### Voice rules

Follow the global style guide (`~/.claude/CLAUDE.md`). Specifically:

- No em dashes. Use commas, colons, semicolons, parentheses, or separate sentences.
- No banned phrases: "leverage", "utilize", "in today's rapidly evolving", "game-changer", "passionate about", "cutting-edge", etc.
- Name sources of authority. Specific over general. Numbers over vague quantifiers.
- No emoji.
- New Yorker wit, NYT sharpness, NEJM precision when the subject is clinical.

### socialPost rules

- **Max 256 characters.** The tweet is `{socialPost} {URL}`; X counts URLs as 23 chars; 280 - 23 - 1 space = 256. Verify before saving:

  ```bash
  echo -n "YOUR SOCIALPOST TEXT" | wc -c
  ```

  If over 256, trim.
- Lead with the argument, not a hook or setup line.
- No em dashes, no emoji, no hype words.
- Tone: a physician making a sharp point to a smart colleague.

## Step 4: Queue for X posting

1. Read the current queue:

```bash
npx wrangler kv key get --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue"
```

2. Prepend the new editorial. If the queue is empty or returns "Value not found", create a new single-item array:

```bash
npx wrangler kv key put --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue" '[{"slug":"<slug>","collection":"editorials"}]'
```

To prepend to an existing queue, splice the new item in front of the parsed array and write the whole array back.

ALWAYS use `--remote`. Without it, the write lands in local KV and never reaches production.

## Step 5: Report to the user

1. **File created:** `src/content/editorials/<slug>.mdx`
2. **socialPost preview:** exact tweet text, with character count
3. **Queue status:** "Queued as next X post"
4. **Next step:** "Run `npm run deploy` to publish."
