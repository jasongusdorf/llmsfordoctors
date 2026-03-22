# Content Standards: llmsfordoctors.com

> **This document is the authoritative standard for all current and future content on llmsfordoctors.com.** Every content file — guides, templates, tools, workflows, and trials — is evaluated against this rubric. Use it when creating new content, reviewing existing content, or conducting audits.

---

## 1. Shared Criteria

These six dimensions apply to **every content file** on the site, regardless of collection.

| Dimension | 1 (Needs Rework) | 3 (Acceptable) | 5 (Excellent) |
|-----------|-------------------|-----------------|---------------|
| **Clarity** | Jargon-heavy, long paragraphs, no formatting aids | Readable but could be tighter; some dense sections | Scannable, plain language, well-formatted with headers/lists/callouts |
| **Actionability** | Informational only, no clear next step | Suggests actions but leaves reader to figure out how | Every section ends with something the reader can do right now |
| **Navigation** | Wall of text, no internal structure | Has headers but they're generic ("Overview", "Details") | Descriptive headers, TOC for long pieces, logical flow, easy to jump to what you need |
| **Audience Fit** | Assumes wrong level of knowledge | Works for one audience but alienates others | Layered - works for newcomers, has depth for power users |
| **Freshness** | References outdated tools/models/studies | Mostly current with minor gaps | Up to date, references latest evidence and tool versions |
| **Cross-linking** | Standalone island, no links to related content | Some links but inconsistent | Rich links to related templates, workflows, tools, trials where relevant |

---

## 2. Guide-Specific Criteria

These three additional dimensions apply only to **guides**. Guides are scored on all 6 shared criteria plus these 3.

| Dimension | 1 (Needs Rework) | 3 (Acceptable) | 5 (Excellent) |
|-----------|-------------------|-----------------|---------------|
| **Structure** | Monolithic essay format | Sections exist but uneven depth | Chunked into digestible sections with clear learning progression |
| **Practical Examples** | Abstract concepts only | Some examples but generic | Real clinical scenarios showing exactly what to do |
| **Summary/TL;DR** | None | Exists but buried | Top-of-page summary with key takeaways, detailed content below |

---

## 3. Template-Specific Criteria

These five additional dimensions apply only to **templates**. Templates are scored on all 6 shared criteria plus these 5.

| Dimension | 1 (Needs Rework) | 3 (Acceptable) | 5 (Excellent) |
|-----------|-------------------|-----------------|---------------|
| **Prompt Quality** | Vague instructions, poor LLM output | Functional but generic results | Well-engineered prompt with role, context, constraints - produces excellent output |
| **Instructions** | "Paste this prompt" and nothing else | Basic usage notes | When to use, how to customize, what good output looks like, common pitfalls |
| **Variations** | One-size-fits-all | Mentions alternatives | Specialty/context variations with concrete examples |
| **Example Output** | None | Generic example | Realistic clinical example showing what the LLM actually produces |
| **Consistency** | Doesn't match other templates in structure/tone | Partially matches site patterns | Follows a clear, repeatable template structure |

---

## 4. Canonical Template Structure

Every template on the site must follow this 7-section pattern. Templates missing any section should be flagged for remediation.

### 4.1 When to use this

One sentence describing the clinical scenario or task this template addresses. Helps the reader immediately decide if this is the right template for their situation.

### 4.2 HIPAA callout

A privacy/compliance reminder appropriate to the template's use case. This should warn the reader about any patient data considerations before they proceed.

### 4.3 The prompt

The actual prompt, presented inside the `PromptPlayground` component. This is the core of the template — a well-engineered prompt with role, context, and constraints that produces excellent LLM output.

### 4.4 How to customize

Instructions for what to swap out for the reader's specialty, context, patient population, or institutional norms. Makes the template adaptable rather than one-size-fits-all.

### 4.5 Variations

2-3 alternative versions of the prompt for different scenarios (e.g., different specialties, inpatient vs. outpatient, different levels of complexity). Each variation should include a concrete example.

### 4.6 Example output

A realistic clinical example showing what the LLM actually produces when given this prompt. Uses a believable (but fictional) patient scenario so the reader can evaluate output quality.

### 4.7 Tips & pitfalls

Common mistakes, what to watch for in LLM output, edge cases, and advice for getting the best results. Helps the reader avoid failure modes they wouldn't anticipate.

---

## 5. Scoring Notes for Reference Content

Tools, workflows, and trials are scored on the 6 shared criteria only. However, some dimensions should be interpreted contextually for these shorter, reference-style entries:

### Actionability

- **Trials:** Does the summary help a clinician decide whether this evidence changes their practice?
- **Tools:** Does the review help them decide whether to try/buy?
- **Workflows:** Does the description give them enough to implement or adapt the workflow?

### Navigation

- **Short entries (< 200 words):** Score 5 by default. There is no navigation problem possible in a short entry.
- **Longer entries:** Apply the standard navigation criteria.

### Audience Fit

- **Trials:** Is the summary readable by a non-researcher clinician? A trial summary that requires epidemiology training to parse scores low.
- **Tools/Workflows:** Is the content accessible to someone who hasn't used the tool or workflow before?

---

## 6. Effort Scale

Used in the punch list to estimate the work required for each fix.

| Size | Time | Definition | Examples |
|------|------|------------|----------|
| **S (Small)** | < 15 min | Mechanical fix requiring minimal judgment | Adding a missing cross-link; fixing a stale tool name; adding a one-line "When to use this" section |
| **M (Medium)** | 15-60 min | Requires thought or writing | Adding example output to a template; rewriting a dense section of a guide; adding variations |
| **L (Large)** | 1+ hours | Substantial rewrite or creation | Restructuring an entire guide; re-engineering a prompt that produces poor output; consolidating duplicate templates |
