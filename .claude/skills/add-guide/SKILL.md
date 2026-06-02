---
name: add-guide
description: Write a new practical guide (how-to content) for llmsfordoctors.com from a brief or notes. Drafts the full MDX in Jason's voice, writes the file, and queues it for the next automated X post. Use when the user says "add guide", "write a guide", "new guide", or describes a practical how-to piece they want for the site.
---

# Add Guide

Write a new guide for llmsfordoctors.com (the practical how-to collection) and queue it for X.

## Input

The user provides anything from a one-line topic to a page of notes.

- A short topic line is a topic plus implicit brief: make reasonable judgment calls on scope, steps, and structure.
- Detailed notes are constraints: build the guide around them, do not discard points.

## Step 1: State the angle before drafting

Before writing the full piece, tell the user in 2-3 sentences:

- what the guide covers and who it is for
- the rough shape (the immediate rule near the top, the main sections, the Quick Reference at the end)

This lets the user redirect before a full draft exists. Proceed to the draft unless they respond.

## Step 2: Calibrate voice

Read one existing guide (e.g., `src/content/guides/hipaa-compliance.mdx`) before drafting. Calibrate tone and specificity. Do NOT clone its structure. Section depth should follow the topic.

## Step 3: Write the MDX

Create the file at `src/content/guides/<slug>.mdx`. Slug: lowercase, hyphenated, descriptive, no year suffix.

### Frontmatter

```yaml
---
title: "<Guide title>"
description: "<One-sentence summary, used on the index card>"
tags: [<lowercase-hyphenated>]
lastUpdated: <today as YYYY-MM-DD>
featured: <true if the user says so, else false>
hideToc: false
socialPost: "<see socialPost rules below>"
---
```

### Fixed conventions (the edges)

- Import Callout if used: `import Callout from '../../components/Callout.astro';`
- Near the top, state a single plain-language rule the reader can apply immediately ("If you remember nothing else, remember..."). Do not bury it mid-piece.
- Include a `## Contents` table-of-contents block (anchor links to the sections), unless `hideToc` is true.
- **End** on a Quick Reference table or an action checklist: the thing a reader bookmarks.

### Free (the middle)

Section depth follows the topic: a 5-step workflow gets 5 sections; a conceptual guide might have 3 large parts. Section titles, length, and Callout placement follow the brief. Vary them across guides. Do not produce the same template each time.

### Voice rules

Follow the global style guide (`~/.claude/CLAUDE.md`). Specifically:

- No em dashes. Use commas, colons, semicolons, parentheses, or separate sentences.
- No banned phrases: "leverage", "utilize", "in today's rapidly evolving", "game-changer", "passionate about", "cutting-edge", etc.
- Name sources of authority. Specific over general. Numbers over vague quantifiers.
- No emoji.
- Practical and authoritative, anchored in clinical experience. Jargon budget zero by default: if a technical term appears, define it on first use or translate it into what it does.

### socialPost rules

- **Max 256 characters.** The tweet is `{socialPost} {URL}`; X counts URLs as 23 chars; 280 - 23 - 1 space = 256. Verify before saving:

  ```bash
  echo -n "YOUR SOCIALPOST TEXT" | wc -c
  ```

  If over 256, trim.
- Lead with the point, not a hook or setup line.
- No em dashes, no emoji, no hype words.
- Tone: a physician explaining something useful to a sharp colleague.

## Step 4: Queue for X posting

1. Read the current queue:

```bash
npx wrangler kv key get --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue"
```

2. Prepend the new guide. If the queue is empty or returns "Value not found", create a new single-item array:

```bash
npx wrangler kv key put --namespace-id 7aaff7582add425c9e6372c1dc9cd0f4 --remote "queue" '[{"slug":"<slug>","collection":"guides"}]'
```

To prepend to an existing queue, splice the new item in front of the parsed array and write the whole array back.

ALWAYS use `--remote`. Without it, the write lands in local KV and never reaches production.

## Step 5: Report to the user

1. **File created:** `src/content/guides/<slug>.mdx`
2. **socialPost preview:** exact tweet text, with character count
3. **Queue status:** "Queued as next X post"
4. **Next step:** "Run `npm run deploy` to publish."
