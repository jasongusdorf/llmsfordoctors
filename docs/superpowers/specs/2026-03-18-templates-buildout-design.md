# Templates Buildout — Design Spec

## Overview

Populate the llmsfordoctors.com templates collection with 29 new templates (30 total including the existing `discharge-summary-basic.mdx`) across all 6 content categories. Each template provides a tool-agnostic, copy-paste-ready prompt for a specific clinical workflow.

## Decisions

- **Scope:** 5 templates per category, 30 total
- **Approach:** Workflow-mirrored — each template maps to a real clinical task
- **Tool strategy:** Tool-agnostic prompts; `targetTool: claude` as recommended, not required
- **Audience:** Mixed difficulty conveyed through writing style, not schema fields
- **Cross-linking:** `workflow` field set on all templates (creates backlog of workflows to build)
- **Schema:** No changes to existing `content.config.ts` schema

## Template Inventory

### Note-Writing

| File | Title | Workflow | Difficulty |
|------|-------|----------|------------|
| `discharge-summary-basic.mdx` | Discharge Summary — Basic Template | `discharge-summary` | Beginner |
| `progress-note-soap.mdx` | SOAP Progress Note | `progress-note` | Beginner |
| `consult-note.mdx` | Specialty Consultation Note | `consult-note` | Intermediate |
| `procedure-note.mdx` | Post-Procedure Note | `procedure-note` | Intermediate |
| `handoff-signout.mdx` | Shift Handoff — I-PASS Format | `shift-handoff` | Intermediate |

### Clinical-Reasoning

| File | Title | Workflow | Difficulty |
|------|-------|----------|------------|
| `differential-diagnosis.mdx` | Differential Diagnosis Generator | `differential-diagnosis` | Intermediate |
| `case-summary-assessment.mdx` | Case Summary & Assessment/Plan | `case-assessment` | Intermediate |
| `lab-interpretation.mdx` | Lab Panel Interpretation | `lab-interpretation` | Beginner |
| `medication-reconciliation.mdx` | Medication Reconciliation Review | `medication-reconciliation` | Intermediate |
| `risk-stratification.mdx` | Clinical Risk Stratification | `risk-stratification` | Advanced |

### Patient-Education

| File | Title | Workflow | Difficulty |
|------|-------|----------|------------|
| `diagnosis-explainer.mdx` | Diagnosis Explanation for Patients | `diagnosis-education` | Beginner |
| `medication-instructions.mdx` | Medication Instructions — Plain Language | `medication-education` | Beginner |
| `procedure-prep.mdx` | Procedure Preparation Guide | `procedure-education` | Intermediate |
| `discharge-instructions.mdx` | Patient Discharge Instructions | `discharge-education` | Beginner |
| `lifestyle-modification.mdx` | Lifestyle Modification Counseling | `lifestyle-counseling` | Intermediate |

### Literature-Review

| File | Title | Workflow | Difficulty |
|------|-------|----------|------------|
| `article-summary.mdx` | Journal Article Summary | `article-review` | Beginner |
| `evidence-comparison.mdx` | Treatment Evidence Comparison | `evidence-comparison` | Advanced |
| `guideline-summary.mdx` | Clinical Practice Guideline Summary | `guideline-review` | Intermediate |
| `journal-club-prep.mdx` | Journal Club Preparation | `journal-club` | Advanced |
| `research-question.mdx` | PICO Research Question Builder | `research-question` | Beginner |

### Admin-Billing

| File | Title | Workflow | Difficulty |
|------|-------|----------|------------|
| `prior-authorization.mdx` | Prior Authorization Letter | `prior-authorization` | Beginner |
| `appeal-letter.mdx` | Insurance Denial Appeal Letter | `insurance-appeal` | Intermediate |
| `referral-letter.mdx` | Specialist Referral Letter | `referral` | Beginner |
| `mdm-complexity.mdx` | Medical Decision-Making Documentation | `mdm-coding` | Advanced |
| `peer-to-peer-prep.mdx` | Peer-to-Peer Review Preparation | `peer-to-peer` | Intermediate |

### Board-Prep

| File | Title | Workflow | Difficulty |
|------|-------|----------|------------|
| `question-generator.mdx` | Board-Style Question Generator | `board-questions` | Beginner |
| `topic-review.mdx` | High-Yield Topic Review | `topic-review` | Beginner |
| `case-vignette-analysis.mdx` | Case Vignette Analysis | `vignette-analysis` | Intermediate |
| `pharm-flashcards.mdx` | Pharmacology Flashcard Generator | `pharm-review` | Beginner |
| `differential-drill.mdx` | Differential Diagnosis Drill | `ddx-practice` | Intermediate |

## Content Structure (Per Template)

Each `.mdx` file follows this structure:

### Frontmatter

```yaml
---
title: "Human-Readable Title"
category: one-of-six-categories
targetTool: claude
workflow: matching-workflow-slug
tags: [relevant, descriptive, tags]
lastUpdated: 2026-03-18
---
```

### Body

```mdx
import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

[Intro paragraph: 2-3 sentences. What this does, who it's for, when to use it.]

<Callout type="hipaa">
  [Present on templates involving patient data. Omitted for board-prep and literature-review.]
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="[Template Title]">
[The actual prompt with [BRACKETED PLACEHOLDERS] for user input.]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| [Aspect] | [Instruction] |

---

## Notes

- [Caveats, limitations, related templates, or next steps.]
```

### Sections Omitted When Unnecessary

- **HIPAA Callout:** Omitted for `board-prep` and `literature-review` categories
- **Customization Guide:** Omitted for simple, single-purpose templates (e.g., `pharm-flashcards`)
- **Notes:** Omitted when no meaningful caveats exist

## Prompt Design Conventions

### Placeholder Format

All user-input placeholders use `[ALL CAPS IN BRACKETS]`:
- `[PATIENT AGE]`, `[CHIEF COMPLAINT]`, `[MEDICATION LIST]`
- Consistent across all 30 templates

### Prompt Structure

Each prompt follows this pattern:
1. **Role/context** — "You are a [role] helping to [task]..."
2. **Task** — what to produce
3. **Input data** — placeholders for what the doctor pastes in
4. **Output format** — sections, bullets, tables, or prose
5. **Constraints** — safety rails and quality instructions

### Safety Constraints

Templates involving patient data include:
- "Do not infer or fabricate any clinical information not provided"
- "Flag any assumptions or missing data"
- "This is a draft — physician review required before use"

### Difficulty Through Writing

- **Beginner:** Verbose prompts with inline comments, longer intro, detailed customization guide
- **Intermediate:** Clean prompts, guidance in customization table
- **Advanced:** Minimal prompts, assumes familiarity with prompt patterns

## Tags Convention

Every template MUST include exactly one difficulty tag: `beginner`, `intermediate`, or `advanced`, matching the Difficulty column in the inventory tables above.

**Tag ordering:** difficulty tag first, then category tag, then domain/task tags. This matters because the index page only displays the first 3 tags per card.

Example: `tags: [beginner, note-writing, discharge, inpatient, documentation]`

Tags are lowercase, hyphenated, and drawn from:
- **Difficulty tags (required, exactly one):** `beginner`, `intermediate`, `advanced`
- **Category tags:** `note-writing`, `clinical-reasoning`, `patient-education`, `literature-review`, `admin-billing`, `board-prep`
- **Clinical domain tags:** `discharge`, `inpatient`, `outpatient`, `emergency`, `surgery`, `pediatrics`, etc.
- **Task tags:** `documentation`, `diagnosis`, `education`, `billing`, `coding`, `study`

## Cross-Linking Strategy

- Every template sets `workflow` to a slug matching the implied parent workflow
- These workflows don't exist yet — each becomes a backlog item
- The template detail page (`[...slug].astro`) queries workflows inline via `getCollection('workflows')` and matches on `wf.id === entry.data.workflow` — it handles missing workflows gracefully by skipping the related item
- When workflows are created later, the cross-links will activate automatically

## Files Created

29 new files in `src/content/templates/`:
- `progress-note-soap.mdx`
- `consult-note.mdx`
- `procedure-note.mdx`
- `handoff-signout.mdx`
- `differential-diagnosis.mdx`
- `case-summary-assessment.mdx`
- `lab-interpretation.mdx`
- `medication-reconciliation.mdx`
- `risk-stratification.mdx`
- `diagnosis-explainer.mdx`
- `medication-instructions.mdx`
- `procedure-prep.mdx`
- `discharge-instructions.mdx`
- `lifestyle-modification.mdx`
- `article-summary.mdx`
- `evidence-comparison.mdx`
- `guideline-summary.mdx`
- `journal-club-prep.mdx`
- `research-question.mdx`
- `prior-authorization.mdx`
- `appeal-letter.mdx`
- `referral-letter.mdx`
- `mdm-complexity.mdx`
- `peer-to-peer-prep.mdx`
- `question-generator.mdx`
- `topic-review.mdx`
- `case-vignette-analysis.mdx`
- `pharm-flashcards.mdx`
- `differential-drill.mdx`

## Files Modified

- `src/content/templates/discharge-summary-basic.mdx` — update tags to conform to new convention: add `beginner` as first tag, reorder to `[beginner, note-writing, discharge, inpatient, documentation]`

No schema, layout, page, or component changes needed.
