# /add-trial Skill: Design Spec

## Purpose

A Claude Code slash command that takes a DOI or PDF path, summarizes the paper as a trial MDX file for the site, writes a socialPost, and queues it for immediate X posting.

## Invocation

```
/add-trial 10.1056/AIra2401164
/add-trial /path/to/paper.pdf
```

The argument is either a DOI string or an absolute file path ending in `.pdf`.

## Workflow

### Step 1: Fetch the paper

- **DOI input**: Fetch metadata from CrossRef (`https://api.crossref.org/works/<doi>`). Then fetch the full paper via the DOI URL for content to summarize. If the full text is paywalled, work from the abstract and metadata available from CrossRef, and flag to the user that the summary may need enrichment.
- **PDF input**: Read the PDF file directly.

### Step 2: Write the MDX file

Create `src/content/trials/<slugified-title>.mdx` following the structure of existing trial summaries.

**Frontmatter fields:**
- `title`: descriptive title (not the raw paper title; follows the site's convention of a clinical-perspective title)
- `journal`: publication name
- `year`: publication year
- `doi`: the DOI string
- `keyFinding`: one-paragraph summary of the primary result, with specific numbers
- `lastUpdated`: today's date
- `tags`: relevant clinical tags, lowercase-hyphenated
- `socialPost`: tweet text, max ~200 characters, NEJM professional voice

**Body sections** (following existing trial file conventions):
- Study Design
- Key Findings
- Clinical Implications
- Limitations

Voice follows the site's writing style guide: NEJM editorial precision, no em dashes, no hype words, specific and quantified.

### Step 3: Queue for immediate posting

After writing the file, push the new trial to the front of the `SOCIAL_QUEUE` in Cloudflare KV so it is posted on the next cron cycle.

This is done by running:
```bash
npx wrangler kv key put --namespace-id=7aaff7582add425c9e6372c1dc9cd0f4 "queue" '[{"slug":"<new-trial-slug>","collection":"trials"}]'
```

If the queue already has entries, prepend the new trial to the existing array rather than replacing it.

### Step 4: Confirm

Report to the user:
- File created at `src/content/trials/<slug>.mdx`
- socialPost text shown for review
- Queued for next X post
- Remind user to rebuild and deploy (`npm run deploy`) for the trial to appear on the site and for the social post to be available to the cron job

## What the skill does NOT do

- Deploy the site (user does this)
- Post to X immediately (the cron job handles it)
- Handle non-trial content types (separate skills if needed later)
- Commit to git (user decides when to commit)

## Implementation

This is a Claude Code skill (prompt template), not a script. The skill file lives at `.claude/skills/add-trial/SKILL.md` in the project directory and contains structured instructions that Claude follows when invoked. The actual work (fetching, writing, KV update) uses Claude's existing tools (WebFetch, Write, Bash).

## Files to create

- `.claude/skills/add-trial/SKILL.md`
