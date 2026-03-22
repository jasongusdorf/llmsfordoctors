# Content Audit Design: llmsfordoctors.com

**Date:** 2026-03-22
**Author:** Jason Gusdorf, MD + Claude
**Status:** Draft

---

## Problem Statement

The site has 91 content files across 5 collections (5 guides, 40 templates, 12 tools, 6 workflows, 28 trials). Two key issues:

1. **Guides are too dense, not actionable, and hard to navigate** - physicians skim and bounce rather than learning and doing
2. **Templates need improvement across the board** - prompt quality, instructions, organization, coverage gaps, and consistency all need work

The audience is broad: AI-curious clinicians, power users, trainees, and administrators. Content must work at multiple levels.

## Goals

Produce three deliverables:

1. **Content Standards** - a rubric defining what "good" looks like, reusable for all future content
2. **Audit Report** - every content file scored against the rubric with specific issues noted
3. **Prioritized Punch List** - ranked fix list grouped by issue type with effort estimates

## Non-Goals

- Site architecture, components, or layout changes
- Design/styling updates
- Trials collection restructuring (already well-structured)

---

## Content Standards Rubric

### Shared Criteria (all content files)

| Dimension | 1 (Needs Rework) | 3 (Acceptable) | 5 (Excellent) |
|-----------|-------------------|-----------------|---------------|
| **Clarity** | Jargon-heavy, long paragraphs, no formatting aids | Readable but could be tighter; some dense sections | Scannable, plain language, well-formatted with headers/lists/callouts |
| **Actionability** | Informational only, no clear next step | Suggests actions but leaves reader to figure out how | Every section ends with something the reader can do right now |
| **Navigation** | Wall of text, no internal structure | Has headers but they're generic ("Overview", "Details") | Descriptive headers, TOC for long pieces, logical flow, easy to jump to what you need |
| **Audience Fit** | Assumes wrong level of knowledge | Works for one audience but alienates others | Layered - works for newcomers, has depth for power users |
| **Freshness** | References outdated tools/models/studies | Mostly current with minor gaps | Up to date, references latest evidence and tool versions |
| **Cross-linking** | Standalone island, no links to related content | Some links but inconsistent | Rich links to related templates, workflows, tools, trials where relevant |

### Guide-Specific Criteria

| Dimension | 1 | 3 | 5 |
|-----------|---|---|---|
| **Structure** | Monolithic essay format | Sections exist but uneven depth | Chunked into digestible sections with clear learning progression |
| **Practical Examples** | Abstract concepts only | Some examples but generic | Real clinical scenarios showing exactly what to do |
| **Summary/TL;DR** | None | Exists but buried | Top-of-page summary with key takeaways, detailed content below |

### Template-Specific Criteria

| Dimension | 1 | 3 | 5 |
|-----------|---|---|---|
| **Prompt Quality** | Vague instructions, poor LLM output | Functional but generic results | Well-engineered prompt with role, context, constraints - produces excellent output |
| **Instructions** | "Paste this prompt" and nothing else | Basic usage notes | When to use, how to customize, what good output looks like, common pitfalls |
| **Variations** | One-size-fits-all | Mentions alternatives | Specialty/context variations with concrete examples |
| **Example Output** | None | Generic example | Realistic clinical example showing what the LLM actually produces |
| **Consistency** | Doesn't match other templates in structure/tone | Partially matches site patterns | Follows a clear, repeatable template structure |

---

## Audit Process

### Phase 1: Score Every File

Dispatch parallel agents to read each content file and score it against the rubric. Each file gets a score (1-5) per applicable dimension. Agents also flag specific issues (e.g., "paragraph 3 is 200 words with no break", "no example output provided", "links to deprecated tool version").

**Agent grouping for parallel execution:**

| Agent | Scope | Files |
|-------|-------|-------|
| Agent 1 | All guides | 5 |
| Agent 2 | Templates: note-writing + admin-billing | 10 |
| Agent 3 | Templates: clinical-reasoning + board-prep | 14 |
| Agent 4 | Templates: patient-education + literature-review | 16 |
| Agent 5 | Tools + workflows (shared criteria only) | 18 |
| Agent 6 | Trials (shared criteria only) | 28 |

**Agent output format:** Each agent produces a markdown table per file with these columns:

```
| File | Dimension | Score (1-5) | Issues |
```

Plus a summary section listing any cross-file observations (duplicates, patterns, gaps). This format ensures reports are directly mergeable in Phase 2.

**Overlap detection:** Agents 2-4 are each responsible for flagging overlapping templates within their scope. Cross-scope overlaps are identified during Phase 2 consolidation by comparing template titles and descriptions across agent reports. "Significant overlap" means two templates that serve the same clinical scenario and would confuse a reader choosing between them.

### Phase 2: Consolidate & Rank

- Merge all agent reports into a single audit report
- Calculate composite scores per file: simple average of all applicable dimension scores (shared + collection-specific), rounded to one decimal
- Rank by priority: lowest composite scores first; when scores tie, guides rank above templates, templates above all others
- Group issues by type (e.g., "15 templates missing example output", "3 guides have no TL;DR")

**Scoring notes for reference-style content (tools, workflows, trials):** Interpret shared criteria contextually:
- **Actionability** for trials = does the summary help a clinician decide whether this evidence changes their practice? For tools = does the review help them decide whether to try/buy?
- **Navigation** for short entries (< 200 words) = score 5 by default (no navigation problem possible)
- **Audience Fit** for trials = is it readable by a non-researcher clinician?

### Phase 3: Produce Deliverables

| Deliverable | Path | Contents |
|-------------|------|----------|
| Content Standards | `docs/content-standards.md` | The rubric as a living style guide |
| Audit Report | `docs/audit-report.md` | Full scores and issues per file, sorted by priority |
| Punch List | `docs/audit-punch-list.md` | Prioritized fixes grouped by issue type with effort estimates (S/M/L) |

**Effort scale:**
- **S (Small)** - Mechanical fix, < 15 min. Examples: adding a missing cross-link, fixing a stale tool name, adding a one-line "When to use this" section
- **M (Medium)** - Requires thought or writing, 15-60 min. Examples: adding example output to a template, rewriting a dense section of a guide, adding variations
- **L (Large)** - Substantial rewrite or creation, 1+ hours. Examples: restructuring an entire guide, re-engineering a prompt that produces poor output, consolidating duplicate templates

---

## Fix Strategy

### Prioritization Order

1. **Guides first** - 5 files, front door to the site, high-impact
2. **Template consistency pass** - establish canonical structure, align all 40
3. **Template prompt quality** - re-engineer low-scoring prompts, add missing example outputs
4. **Cross-linking gaps** - wire up templates, workflows, tools, trials connections
5. **Tools/workflows/trials** - lighter touch, fix freshness or clarity issues

### Guide Fix Pattern

For each guide scoring below 4 on any dimension:

- Add a TL;DR / key takeaways box at the top
- Break long sections into scannable chunks with descriptive headers
- Add "What to do next" callouts linking to relevant templates/workflows
- Add real clinical scenario examples where content is abstract
- Add TOC and anchor links for long guides

### Template Fix Pattern

Define a canonical template structure that every template follows:

1. **When to use this** - one sentence
2. **HIPAA callout** - privacy/compliance reminder
3. **The prompt** - in the PromptPlayground component
4. **How to customize** - what to swap for your specialty/context
5. **Variations** - 2-3 alternatives for different scenarios
6. **Example output** - realistic clinical example of LLM output
7. **Tips & pitfalls** - common mistakes, what to watch for

Templates missing any section get flagged in the punch list.

### Duplicate/Overlap Resolution

The audit should identify templates that overlap significantly (e.g., `discharge-instructions.mdx` vs `discharge-instructions-patient.mdx`, `ddx-generator.mdx` vs `differential-diagnosis.mdx`) and recommend consolidation where appropriate.

---

## Success Criteria

- Every content file has been scored against the rubric
- All guides score 4+ on every dimension after fixes
- All templates follow the canonical structure after fixes
- Punch list is fully resolved or explicitly deprioritized with rationale
- Content standards doc is committed and usable for future content creation
