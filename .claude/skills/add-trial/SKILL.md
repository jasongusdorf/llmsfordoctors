---
name: add-trial
description: Add a new clinical trial to the site from a DOI or PDF. Summarizes the paper, writes the MDX file with socialPost, and queues it for the next automated X post. Use when the user says "add trial", "new trial", "add this paper", or provides a DOI/PDF to add to the trials collection.
---

# Add Trial

Add a new clinical trial summary to llmsfordoctors.com from a DOI or PDF.

## Input

The user provides one of:
- A DOI (e.g., `10.1056/AIra2401164`)
- A path to a PDF file

If the argument starts with `/` or `~` and ends in `.pdf`, treat it as a PDF path. Otherwise, treat it as a DOI.

## Step 1: Fetch the paper

**If DOI:**
1. Fetch metadata from CrossRef: `https://api.crossref.org/works/<doi>`
2. Extract: title, journal, year, authors, abstract
3. Fetch the full paper via `https://doi.org/<doi>` for additional content
4. If the full text is paywalled, work from the CrossRef abstract and tell the user: "Full text was paywalled. Summary is based on the abstract and may need enrichment."

**If PDF:**
1. Read the PDF file directly
2. Extract the same metadata from the paper content

## Step 2: Write the MDX file

Create the file at `src/content/trials/<slug>.mdx`.

**Slug format:** lowercase, hyphenated, descriptive. Follow the existing convention: `<key-topic>-<year>.mdx` (e.g., `ai-cancer-therapeutic-decision-making-2025.mdx`).

### Frontmatter

```yaml
---
title: "<Clinical-perspective title, not the raw paper title>"
journal: "<Journal name>"
year: <publication year>
doi: "<doi string>"
keyFinding: "<One paragraph, specific numbers, primary result>"
lastUpdated: <today's date as YYYY-MM-DD>
tags: [<lowercase-hyphenated clinical tags>]
socialPost: "<Max ~200 chars, NEJM professional voice>"
---
```

### Body structure

Follow this exact structure (matching existing trial files):

```
import Callout from '../../components/Callout.astro';

## Study Design

<1-2 paragraphs describing methods, population, design>

---

## Key Findings

<Bulleted list of specific, quantified findings. Bold the key numbers.>

<Callout type="evidence">
  <A synthesis observation about what the findings mean together>
</Callout>

---

## Clinical Implications

<Numbered list of practical implications for clinicians. Each item has a bold lead sentence followed by explanation.>

<Callout type="pitfall">
  <A warning about a failure mode, limitation, or risk that clinicians should know>
</Callout>

---

## My Takeaway

<1 paragraph, first person, the "so what" for a practicing physician. This is where editorial voice is strongest.>

---

[Read the full article at <Journal>](https://doi.org/<doi>)
```

### Voice rules

- NEJM editorial precision: restrained, data-forward, specific
- No em dashes. Use commas, colons, semicolons, or separate sentences.
- No hype words: "game-changer," "groundbreaking," "exciting," "revolutionary"
- No emoji
- Bold key numbers in the Key Findings section
- The title should be a clinical-perspective framing, not the raw paper title (e.g., "AI for Cancer Treatment Decisions: Promise Outpaces Evidence" not "Artificial Intelligence in Cancer Treatment")
- keyFinding should include the most important numbers from the study
- Tags should be lowercase-hyphenated (e.g., `clinical-decision-support`, not `Clinical Decision Support`)

### socialPost rules

- Max ~200 characters (a URL is appended automatically by the posting system)
- NEJM professional voice
- No em dashes, no emoji, no hype
- Quantify where possible
- Either a hook-with-link (provocative line pulling toward the URL) or a standalone insight (self-contained takeaway)

## Step 3: Queue for immediate X posting

After writing the file, push the new trial to the front of the social posting queue:

1. First, read the current queue:
```bash
npx wrangler kv key get --namespace-id=7aaff7582add425c9e6372c1dc9cd0f4 "queue" 2>/dev/null
```

2. If the queue exists, prepend the new trial. If it doesn't exist or is empty, create a new array:
```bash
npx wrangler kv key put --namespace-id=7aaff7582add425c9e6372c1dc9cd0f4 "queue" '[{"slug":"<slug>","collection":"trials"}]'
```

The `<slug>` must match the filename without the `.mdx` extension.

## Step 4: Report to user

After completing all steps, report:

1. **File created:** `src/content/trials/<slug>.mdx`
2. **socialPost preview:** show the exact text that will be tweeted
3. **Queue status:** "Queued as next X post"
4. **Next step:** "Run `npm run deploy` to publish the trial and make it available for posting"

## Reference: existing trial for calibration

When writing the summary, aim for the depth and specificity of existing trials on the site. Read one existing trial file (e.g., `src/content/trials/ai-cancer-therapeutic-decision-making-2025.mdx`) to calibrate tone, structure, and level of detail before writing.
