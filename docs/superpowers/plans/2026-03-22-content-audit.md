# Content Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit all 91 content files on llmsfordoctors.com, produce a content standards rubric, scored audit report, and prioritized punch list.

**Architecture:** Three-phase process: (1) write the content standards doc, (2) dispatch 6 parallel agents to score every content file against the rubric, (3) consolidate scores into the audit report and punch list. All work is content/docs - no code changes.

**Tech Stack:** Astro MDX content files, markdown deliverables, Claude agents for parallel scoring.

**Spec:** `docs/superpowers/specs/2026-03-22-content-audit-design.md`

**Note:** The spec's agent output format (`| File | Dimension | Score | Issues |`) is refined here to use one table per file with file metadata above the table. This is more readable and functionally equivalent.

---

### Task 1: Write Content Standards Document

**Files:**
- Create: `docs/content-standards.md`

- [ ] **Step 1: Write the content standards doc**

Create `docs/content-standards.md` with the full rubric from the spec. Structure it as a living style guide with six sections:

1. **Shared Criteria** (6 dimensions, each with 1/3/5 anchors) - applies to all content
2. **Guide-Specific Criteria** (3 additional dimensions) - applies to guides only
3. **Template-Specific Criteria** (5 additional dimensions) - applies to templates only
4. **Canonical Template Structure** - the 7-section pattern every template must follow:
   - When to use this (one sentence)
   - HIPAA callout
   - The prompt (in PromptPlayground component)
   - How to customize
   - Variations (2-3 alternatives)
   - Example output (realistic clinical example)
   - Tips & pitfalls
5. **Scoring Notes for Reference Content** - how to interpret shared criteria for tools, workflows, trials
6. **Effort Scale** - S/M/L definitions with time ranges and examples

Copy the rubric tables and scoring guidance verbatim from the spec. Add a header noting this is the standard for all current and future content on llmsfordoctors.com.

- [ ] **Step 2: Verify the doc is complete**

Read `docs/content-standards.md` and confirm it contains all 6 shared dimensions, 3 guide dimensions, 5 template dimensions, the canonical template structure, scoring notes, and effort scale. Every dimension must have 1/3/5 anchor descriptions.

- [ ] **Step 3: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/content-standards.md
git commit -m "Add content standards rubric for site-wide content audit"
```

---

### Task 2: Audit Guides (Agent 1 - 5 files)

**Files:**
- Read: `src/content/guides/evidence-landscape-2025.mdx`
- Read: `src/content/guides/hipaa-compliance.mdx`
- Read: `src/content/guides/llm-clinical-reasoning-comparison.mdx`
- Read: `src/content/guides/llms-in-clinical-care-101.mdx`
- Read: `src/content/guides/prompting-101.mdx`
- Create: `docs/audit-reports/guides.md`

- [ ] **Step 1: Read all 5 guide files in full**

Read each guide completely. These are long files (200-900 lines each).

- [ ] **Step 2: Score each guide against all 9 dimensions**

For each guide, score on a 1-5 scale across all 9 applicable dimensions:

**Shared (6):** Clarity, Actionability, Navigation, Audience Fit, Freshness, Cross-linking
**Guide-specific (3):** Structure, Practical Examples, Summary/TL;DR

Use the rubric anchors from `docs/content-standards.md`. For each score below 4, write a specific issue description with line references (e.g., "Lines 45-90: 400-word paragraph with no subheadings or formatting breaks").

- [ ] **Step 3: Write the guides audit report**

Create `docs/audit-reports/guides.md` with:

For each guide, a markdown table:
```
## [Guide Title]
**File:** `src/content/guides/[filename].mdx`
**Composite Score:** [average of all 9 dimensions, rounded to 1 decimal]

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | X | [specific issue or "No issues"] |
| ... | ... | ... |
```

Then a **Cross-File Observations** section noting patterns across all 5 guides (e.g., "None of the guides have a TL;DR section", "Cross-linking is sparse across all guides").

- [ ] **Step 4: Verify report completeness**

Confirm the report has entries for all 5 guides, all 9 dimensions scored per guide, and a cross-file observations section.

- [ ] **Step 5: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/audit-reports/guides.md
git commit -m "Add audit scores for all 5 guides"
```

---

### Task 3: Audit Templates - Note-Writing + Admin-Billing (Agent 2 - 10 files)

**Files:**
- Read (note-writing, 5 files): `src/content/templates/progress-note-soap.mdx`, `discharge-summary-basic.mdx`, `consult-note.mdx`, `procedure-note.mdx`, `handoff-signout.mdx`
- Read (admin-billing, 5 files): `src/content/templates/appeal-letter.mdx`, `prior-authorization.mdx`, `referral-letter.mdx`, `peer-to-peer-prep.mdx`, `mdm-complexity.mdx`
- Create: `docs/audit-reports/templates-note-writing-admin.md`

- [ ] **Step 1: Read all 10 template files**

Read each file completely. Note the current structure: frontmatter, intro paragraph, HIPAA callout, PromptPlayground, customization sections.

- [ ] **Step 2: Score each template against all 11 dimensions**

**Shared (6):** Clarity, Actionability, Navigation, Audience Fit, Freshness, Cross-linking
**Template-specific (5):** Prompt Quality, Instructions, Variations, Example Output, Consistency

For each score below 4, provide a specific issue. Pay special attention to:
- Does the template have the 7 canonical sections? Which are missing?
- Is the prompt well-engineered (role, context, constraints, output format)?
- Are there realistic example outputs showing what the LLM produces?
- Are there specialty/context variations?

- [ ] **Step 3: Check for overlaps within scope**

Flag any templates that serve the same clinical scenario and would confuse a reader choosing between them. Note: `appeal-letter.mdx` might overlap with admin-billing content. `mdm-complexity.mdx` might overlap with note-writing content. Assess and document.

- [ ] **Step 4: Write the templates audit report**

Create `docs/audit-reports/templates-note-writing-admin.md` with the same format as Task 2: per-file scoring table, issues, and cross-file observations. Include a **Missing Canonical Sections** summary (e.g., "7/10 templates missing Example Output section").

- [ ] **Step 5: Verify report completeness**

Confirm the report has entries for all 10 templates, all 11 dimensions scored per template, overlap assessment, and a missing canonical sections summary.

- [ ] **Step 6: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/audit-reports/templates-note-writing-admin.md
git commit -m "Add audit scores for note-writing and admin-billing templates"
```

---

### Task 4: Audit Templates - Clinical-Reasoning + Board-Prep (Agent 3 - 14 files)

**Files:**
- Read (clinical-reasoning, 9 files): `src/content/templates/ddx-generator.mdx`, `differential-diagnosis.mdx`, `workup-planner.mdx`, `case-synthesis.mdx`, `case-summary-assessment.mdx`, `risk-stratification.mdx`, `bias-check.mdx`, `lab-interpretation.mdx`, `medication-reconciliation.mdx`
- Read (board-prep, 5 files): `src/content/templates/question-generator.mdx`, `pharm-flashcards.mdx`, `topic-review.mdx`, `case-vignette-analysis.mdx`, `differential-drill.mdx`
- Create: `docs/audit-reports/templates-clinical-reasoning-board.md`

- [ ] **Step 1: Read all 14 template files**

- [ ] **Step 2: Score each template against all 11 dimensions**

Same criteria as Task 3. Pay special attention to:
- `ddx-generator.mdx` vs `differential-diagnosis.mdx` - are these duplicates? Do they serve different purposes?
- `case-synthesis.mdx` vs `case-summary-assessment.mdx` - similar names, check for significant overlap
- `differential-drill.mdx` vs the other DDx templates - is this differentiated enough?

- [ ] **Step 3: Flag overlaps**

This category has the highest potential for duplication. For each overlap found, recommend: keep both (with clearer differentiation), merge into one, or deprecate one.

- [ ] **Step 4: Write the audit report**

Create `docs/audit-reports/templates-clinical-reasoning-board.md`. Same format. Include overlap recommendations.

- [ ] **Step 5: Verify report completeness**

Confirm the report has entries for all 14 templates, all 11 dimensions scored per template, overlap assessment with recommendations, and a missing canonical sections summary.

- [ ] **Step 6: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/audit-reports/templates-clinical-reasoning-board.md
git commit -m "Add audit scores for clinical-reasoning and board-prep templates"
```

---

### Task 5: Audit Templates - Patient-Education + Literature-Review (Agent 4 - 16 files)

**Files:**
- Read (patient-education, 11 files): `src/content/templates/diagnosis-explainer.mdx`, `condition-explainer.mdx`, `discharge-instructions-patient.mdx`, `discharge-instructions.mdx`, `medication-instructions.mdx`, `new-medication-guide.mdx`, `lifestyle-modification.mdx`, `lifestyle-modification-plan.mdx`, `follow-up-visit-prep.mdx`, `procedure-prep.mdx`, `post-procedure-care.mdx`
- Read (literature-review, 5 files): `src/content/templates/article-summary.mdx`, `journal-club-prep.mdx`, `evidence-comparison.mdx`, `guideline-summary.mdx`, `research-question.mdx`
- Create: `docs/audit-reports/templates-education-literature.md`

- [ ] **Step 1: Read all 16 template files**

- [ ] **Step 2: Score each template against all 11 dimensions**

Pay special attention to overlaps:
- `diagnosis-explainer.mdx` vs `condition-explainer.mdx` - likely overlap
- `discharge-instructions-patient.mdx` vs `discharge-instructions.mdx` - known potential duplicate
- `lifestyle-modification.mdx` vs `lifestyle-modification-plan.mdx` - similar names
- `medication-instructions.mdx` vs `new-medication-guide.mdx` - check differentiation

- [ ] **Step 3: Flag overlaps with recommendations**

- [ ] **Step 4: Write the audit report**

Create `docs/audit-reports/templates-education-literature.md`. Same format.

- [ ] **Step 5: Verify report completeness**

Confirm the report has entries for all 16 templates, all 11 dimensions scored per template, overlap assessment with recommendations, and a missing canonical sections summary.

- [ ] **Step 6: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/audit-reports/templates-education-literature.md
git commit -m "Add audit scores for patient-education and literature-review templates"
```

---

### Task 6: Audit Tools + Workflows (Agent 5 - 18 files)

**Files:**
- Read (tools, 12 files): `src/content/tools/abridge.mdx`, `augmedix.mdx`, `claude.mdx`, `deepscribe.mdx`, `doximity.mdx`, `dragon-copilot.mdx`, `gemini.mdx`, `nabla.mdx`, `openai.mdx`, `openevidence.mdx`, `perplexity.mdx`, `suki.mdx`
- Read (workflows, 6 files): `src/content/workflows/clinical-reasoning.mdx`, `cognitive-debiasing.mdx`, `discharge-summary.mdx`, `inpatient-discharge-education.mdx`, `outpatient-visit-education.mdx`, `procedure-education.mdx`
- Create: `docs/audit-reports/tools-workflows.md`

- [ ] **Step 1: Read all 18 files**

- [ ] **Step 2: Score on shared criteria only (6 dimensions)**

Use the reference-content scoring notes from the content standards:
- **Actionability** for tools = does the review help a clinician decide whether to try/buy? For workflows = does the step-by-step actually guide them through the process?
- **Navigation** for short entries (< 200 words) = score 5 by default
- **Audience Fit** = is it readable by a non-technical clinician?

- [ ] **Step 3: Write the audit report**

Create `docs/audit-reports/tools-workflows.md`. Same per-file format with 6 dimensions.

- [ ] **Step 4: Verify report completeness**

Confirm the report has entries for all 18 files (12 tools + 6 workflows), all 6 dimensions scored per file, and a cross-file observations section.

- [ ] **Step 5: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/audit-reports/tools-workflows.md
git commit -m "Add audit scores for tools and workflows"
```

---

### Task 7: Audit Trials (Agent 6 - 28 files)

**Files:**
- Read (trials, 28 files): `src/content/trials/ai-chest-xray-lung-cancer-triage-2025.mdx`, `ai-neurocritical-care-physiological-signals-2025.mdx`, `ai-symptom-assessment-patient-behavior-2026.mdx`, `ai-trial-eligibility-screening-2025.mdx`, `ambient-ai-practitioner-wellbeing-rct-2025.mdx`, `ambient-ai-scribes-dax-nabla-rct-2025.mdx`, `amie-breast-oncology-2025.mdx`, `appraise-hri-hemorrhage-fda-2025.mdx`, `continual-learning-ett-placement-2025.mdx`, `deepseek-clinical-benchmark-2025.mdx`, `desire-ai-surgical-discharge-2025.mdx`, `diagnostic-rct-ai-literacy-2026.mdx`, `ecg-foundation-model-cardiac-function-2025.mdx`, `emr-cds-safety-kenya-2026.mdx`, `genai-mental-health-chatbot-rct-2025.mdx`, `gpt4-physician-management-rct-2025.mdx`, `hospital-course-summarization-2025.mdx`, `llm-clinical-reasoning-jama-2023.mdx`, `llm-diagnostic-nejm-2024.mdx`, `med-palm-2-expert-qa-2025.mdx`, `medical-llm-data-poisoning-2025.mdx`, `medversa-generalist-imaging-model-2026.mdx`, `sail-2025-ai-year-in-review-2025.mdx`, `sepsis-cohort-llama3-2025.mdx`, `sleep-eeg-brain-health-biomarker-2026.mdx`, `smart-match-surgical-blood-readiness-2025.mdx`, `smartphone-strabismus-measurement-2025.mdx`, `verifact-llm-hallucination-detection-2025.mdx`
- Create: `docs/audit-reports/trials.md`

- [ ] **Step 1: Read all 28 trial files**

These are typically shorter summaries. Batch-read by groups.

- [ ] **Step 2: Score on shared criteria only (6 dimensions)**

Use reference-content scoring notes:
- **Actionability** = does the summary help a clinician decide whether this evidence changes their practice?
- **Audience Fit** = is it readable by a non-researcher clinician?
- **Navigation** for short entries (< 200 words) = score 5 by default

- [ ] **Step 3: Write the audit report**

Create `docs/audit-reports/trials.md`. Same per-file format.

- [ ] **Step 4: Verify report completeness**

Confirm the report has entries for all 28 trials, all 6 dimensions scored per trial, and a cross-file observations section.

- [ ] **Step 5: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/audit-reports/trials.md
git commit -m "Add audit scores for trials"
```

---

### Task 8: Consolidate into Audit Report

**Files:**
- Read: `docs/audit-reports/guides.md`
- Read: `docs/audit-reports/templates-note-writing-admin.md`
- Read: `docs/audit-reports/templates-clinical-reasoning-board.md`
- Read: `docs/audit-reports/templates-education-literature.md`
- Read: `docs/audit-reports/tools-workflows.md`
- Read: `docs/audit-reports/trials.md`
- Create: `docs/audit-report.md`

- [ ] **Step 1: Read all 6 sub-reports**

- [ ] **Step 2: Merge into a single audit report**

Create `docs/audit-report.md` with:

1. **Executive Summary** - total files audited, average composite scores by collection, top 3 systemic issues
2. **Scores by Collection** - one section per collection, files sorted by composite score (lowest first)
3. **Cross-Scope Overlap Analysis** - compare template titles/descriptions across agent reports, flag any cross-category duplicates not caught within individual reports
4. **Issue Patterns** - aggregate issues by type with counts (e.g., "23 templates missing Example Output", "4 guides have no TL;DR", "8 templates have weak prompt engineering")

For composite scores: simple average of all applicable dimension scores, rounded to one decimal. Tiebreaker: guides rank above templates, templates above all others.

- [ ] **Step 3: Verify completeness**

Confirm: all 91 files appear in the report, every file has a composite score, the executive summary stats match the detailed data.

- [ ] **Step 4: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/audit-report.md
git commit -m "Add consolidated audit report for all 91 content files"
```

---

### Task 9: Produce Prioritized Punch List

**Files:**
- Read: `docs/audit-report.md`
- Read: `docs/content-standards.md`
- Create: `docs/audit-punch-list.md`

- [ ] **Step 1: Read the consolidated audit report**

- [ ] **Step 2: Generate the punch list**

Create `docs/audit-punch-list.md` organized as:

1. **Summary Stats** - total items, breakdown by effort (S/M/L), breakdown by collection
2. **Priority 1: Guide Fixes** - every guide issue scoring below 4, sorted by dimension score ascending
3. **Priority 2: Template Consistency** - templates missing canonical sections, grouped by which section is missing
4. **Priority 3: Template Prompt Quality** - templates with Prompt Quality score below 4
5. **Priority 4: Cross-Linking Gaps** - files with Cross-linking score below 4
6. **Priority 5: Tools/Workflows/Trials** - remaining issues from reference content
7. **Overlap Resolutions** - duplicate/overlap recommendations from the audit

Each item in the punch list follows this format:
```
- [ ] **[S/M/L]** `src/content/[collection]/[file].mdx` - [specific action needed]
```

Effort sizing:
- **S** = mechanical fix, < 15 min (add a cross-link, fix a stale name, add a one-liner)
- **M** = requires thought/writing, 15-60 min (add example output, rewrite a dense section, add variations)
- **L** = substantial rewrite, 1+ hours (restructure a guide, re-engineer a prompt, consolidate duplicates)

- [ ] **Step 3: Verify punch list completeness**

Every issue from the audit report with a score below 4 should appear in the punch list. No issues should be silently dropped.

- [ ] **Step 4: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add docs/audit-punch-list.md
git commit -m "Add prioritized punch list from content audit"
```

---

## Execution Notes

- **Tasks 2-7 are independent** and should be dispatched as parallel agents. They have no dependencies on each other.
- **Task 1 must complete before Tasks 2-7** (agents need the content standards doc to score against).
- **Task 8 depends on Tasks 2-7** (needs all sub-reports to consolidate).
- **Task 9 depends on Task 8** (needs the consolidated report to produce the punch list).

```
Task 1 (standards)
    |
    v
Tasks 2-7 (parallel scoring agents)
    |
    v
Task 8 (consolidate)
    |
    v
Task 9 (punch list)
```
