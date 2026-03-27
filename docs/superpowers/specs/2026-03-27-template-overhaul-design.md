# Template Overhaul — Design Spec

**Date:** 2026-03-27
**Status:** Approved

## Overview

Overhaul all 35 templates to have structured output templates that guide LLM reasoning and output. Add 7 new templates. The form of the response is a critical aspect of the template.

## Quality Standard

Every template MUST have all 5 elements:

1. **Rules section** — explicit formatting, voice, tense, detail-level rules specific to the task
2. **Vocabulary section** — standardized terms, preferred phrasing, abbreviation conventions
3. **Structured output template** — exact shape of the output with fill-in markers (`***`, `[BRACKETS]`, section headers), not just "generate a summary"
4. **Variations** — 3+ PromptPlayground blocks for different clinical contexts (e.g., surgical vs. medical, urgent vs. routine)
5. **Example output** — realistic fictional clinical example showing what good output looks like

## Template Pattern

Every template follows this MDX structure:

```mdx
## When to use this
[2-3 sentences. What it does, who it's for, when to reach for it.]

<Callout type="hipaa"> (if clinical data involved)

## The prompt
<PromptPlayground tool="X" title="Y">
[Purpose statement]

### Rules
[Numbered or bulleted specific rules]

### Vocabulary
[Term conventions]

### Output format
[Structured template with fill-in markers]

---
[INPUT SECTION]
</PromptPlayground>

## How to customize
[Table: Element | How to Adjust]

## Variations
### [Variation name]
[Context sentence]
<PromptPlayground> ... </PromptPlayground>

### [Variation name]
<PromptPlayground> ... </PromptPlayground>

### [Variation name]
<PromptPlayground> ... </PromptPlayground>

## Example output
[Realistic fictional clinical example]

## Tips & pitfalls
[Specific failure modes and how to avoid them]

## Related
[Links to related templates/workflows]
```

## Work Breakdown

### Already Overhauled (10) — no changes needed

appeal-letter, article-summary, bias-check, case-synthesis, consult-note, handoff-signout, journal-club-prep, medication-reconciliation, peer-to-peer-prep, prior-authorization

### Partially Done (14) — add missing Rules, Vocabulary, formalize output template

| File | Missing |
|------|---------|
| case-vignette-analysis | Formal Rules section |
| ddx-generator | Rules embedded in prompt, not separated |
| differential-drill | Formal output template |
| evidence-comparison | Formal Rules section |
| guideline-summary | Formal Rules section |
| lab-interpretation | Output template too generic |
| mdm-complexity | Rules prompt-integrated, not separated |
| progress-note-soap | Detailed clinical documentation Rules |
| procedure-note | Output template too flexible |
| question-generator | Output structure, Rules formalization |
| referral-letter | Minimal Rules section |
| research-question | Rules embedded |
| risk-stratification | Explicit Rules section |
| topic-review | Formal Rules section |

### Needs Full Overhaul (10) — rewrite from scratch

condition-explainer, discharge-instructions, follow-up-visit-prep, lifestyle-modification-plan, medication-instructions, new-medication-guide, post-procedure-care, procedure-prep, workup-planner, pharm-flashcards

### New Templates (7)

| File | Category | Description |
|------|----------|-------------|
| history-and-physical.mdx | note-writing | Admission H&P with structured output |
| transfer-summary.mdx | note-writing | Transfer/SNF summary with receiving facility focus |
| death-summary.mdx | note-writing | Death summary for chart documentation |
| ed-note.mdx | note-writing | Emergency department note |
| clinical-question.mdx | literature-review | PICO-structured evidence lookup |
| disability-fmla-letter.mdx | admin-billing | Disability/FMLA documentation |
| formulary-exception.mdx | admin-billing | Insurance formulary exception request |

## Category-Specific Rules

### Note-Writing
- Past tense throughout
- Medical abbreviations without expansion
- Paragraph prose, no bullet points in clinical sections
- Specific dates (M/D/YY format), lab values, vitals
- Structured output mirroring real EHR documentation
- Transitional issues with actionable specifics

### Clinical Reasoning
- Systematic reasoning structure (most likely → least likely)
- Must-not-miss diagnoses always included
- Evidence for/against each consideration
- Specific next steps with timeframes
- Decision thresholds and branching logic

### Patient Education
- 6th grade reading level enforced
- No unexplained medical terms
- Concrete examples and analogies
- Warning signs as specific "Go to the ER if..." lists
- Action items as numbered steps, not vague advice

### Literature Review
- Required fields: study design, N, effect size, CI, NNT when applicable
- Limitations always addressed
- "Clinical Bottom Line" in every output
- Critical appraisal framework, not just summary

### Admin/Billing
- Insurer-facing professional tone
- Guideline citations with specific recommendation grades
- Required documentation elements per payer type
- Appeal-specific language and legal framework

### Board Prep
- Strict vignette format: age, sex, setting, HPI, PE, labs, stem, 5 choices
- Buzzword identification in explanations
- Distractor analysis (why each wrong answer is wrong)
- High-yield teaching points linked to each question

## Files Summary

- 10 templates: no changes
- 14 templates: partial rewrite (add missing sections)
- 10 templates: full rewrite
- 7 templates: new files
- **Total: 31 files to write/modify**
