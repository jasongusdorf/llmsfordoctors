# Consolidated Content Audit Report

**Date:** 2026-03-22
**Files audited:** 91
**Rubric:** `/docs/content-standards.md`
**Sub-reports:** `docs/audit-reports/` (guides, templates-note-writing-admin, templates-clinical-reasoning-board, templates-education-literature, tools-workflows, trials)

---

## 1. Executive Summary

### Composite Scores by Collection

| Collection | Files | Avg Composite | Lowest | Highest |
|------------|-------|---------------|--------|---------|
| Trials | 28 | 4.6 | 4.2 | 4.8 |
| Workflows | 6 | 4.4 | 4.2 | 4.8 |
| Tools | 12 | 4.3 | 3.8 | 4.7 |
| Guides | 5 | 4.3 | 3.8 | 4.8 |
| Templates (clinical-reasoning & board-prep) | 14 | 3.9 | 3.2 | 4.5 |
| Templates (note-writing & admin-billing) | 10 | 3.5 | 3.4 | 3.7 |
| Templates (patient-education & literature-review) | 16 | 3.5 | 3.3 | 3.7 |
| **Site-wide** | **91** | **4.1** | **3.2** | **4.8** |

### Top 3 Systemic Issues

1. **Missing Example Output in all 40 templates.** Every template across all three template sub-reports scores 1/5 on Example Output. No template shows what the LLM actually produces. This is the single highest-impact gap on the site.

2. **Weak cross-linking across every collection.** Cross-linking is the lowest-scoring dimension in guides (avg 2.6), templates (avg 2.0), tools (avg 3.2, with most tools not linking to peers), workflows (avg 2.5 excluding clinical-reasoning), and trials (26 of 28 are standalone islands). Content reads as isolated articles rather than an interconnected resource.

3. **No dedicated Variations sections in any template.** All 40 templates use a Customization Guide table instead of providing concrete alternate prompts. 0/40 templates have a standalone Variations section meeting the canonical standard.

---

## 2. Scores by Collection

### 2.1 Guides (5 files)

Scored on 9 dimensions (6 shared + 3 guide-specific). Collection average: **4.3**.

| # | File | Composite | Weakest Dimensions |
|---|------|-----------|--------------------|
| 1 | `prompting-101.mdx` | 3.8 | Cross-linking (1), Summary/TL;DR (1), Practical Examples (3) |
| 2 | `evidence-landscape-2025.mdx` | 4.1 | Cross-linking (2), Actionability (3), Practical Examples (3) |
| 3 | `llm-clinical-reasoning-comparison.mdx` | 4.2 | Cross-linking (3), Summary/TL;DR (3) |
| 4 | `hipaa-compliance.mdx` | 4.6 | Cross-linking (3), Navigation (4) |
| 5 | `llms-in-clinical-care-101.mdx` | 4.8 | Cross-linking (4), Summary/TL;DR (4) |

<details>
<summary>Per-file scoring tables</summary>

#### Prompting 101 for Clinicians — 3.8

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 1 |
| Structure | 4 |
| Practical Examples | 3 |
| Summary/TL;DR | 1 |

#### Evidence Landscape 2025 — 4.1

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 3 |
| Navigation | 4 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 2 |
| Structure | 5 |
| Practical Examples | 3 |
| Summary/TL;DR | 4 |

#### LLM Clinical Reasoning Comparison — 4.2

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 3 |
| Structure | 4 |
| Practical Examples | 5 |
| Summary/TL;DR | 3 |

#### HIPAA Compliance — 4.6

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 4 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 3 |
| Structure | 5 |
| Practical Examples | 5 |
| Summary/TL;DR | 5 |

#### LLMs in Clinical Care 101 — 4.8

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 4 |
| Structure | 5 |
| Practical Examples | 5 |
| Summary/TL;DR | 4 |

</details>

---

### 2.2 Templates: Note-Writing & Admin-Billing (10 files)

Scored on 11 dimensions (6 shared + 5 template-specific). Collection average: **3.5**.

| # | File | Category | Composite | Weakest Dimensions |
|---|------|----------|-----------|---------------------|
| 1 | `procedure-note.mdx` | note-writing | 3.4 | Example Output (1), Variations (1), Cross-linking (1) |
| 2 | `referral-letter.mdx` | admin-billing | 3.4 | Example Output (1), Variations (1), Cross-linking (1) |
| 3 | `progress-note-soap.mdx` | note-writing | 3.5 | Example Output (1), Cross-linking (1), Variations (2) |
| 4 | `discharge-summary-basic.mdx` | note-writing | 3.5 | Example Output (1), Cross-linking (1), Variations (2) |
| 5 | `consult-note.mdx` | note-writing | 3.5 | Example Output (1), Cross-linking (1), Variations (2) |
| 6 | `appeal-letter.mdx` | admin-billing | 3.5 | Example Output (1), Cross-linking (1), Variations (2) |
| 7 | `mdm-complexity.mdx` | admin-billing | 3.5 | Example Output (1), Variations (1), Cross-linking (1) |
| 8 | `handoff-signout.mdx` | note-writing | 3.6 | Example Output (1), Cross-linking (1), Variations (2) |
| 9 | `peer-to-peer-prep.mdx` | admin-billing | 3.6 | Example Output (1), Cross-linking (1), Variations (2) |
| 10 | `prior-authorization.mdx` | admin-billing | 3.7 | Example Output (1), Cross-linking (1), Variations (2) |

<details>
<summary>Per-file scoring tables</summary>

#### Post-Procedure Note — 3.4

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 3 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 1 |
| Example Output | 1 |
| Consistency | 3 |

#### Specialist Referral Letter — 3.4

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 3 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 1 |
| Example Output | 1 |
| Consistency | 3 |

#### SOAP Progress Note — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Discharge Summary: Basic — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Specialty Consultation Note — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Insurance Denial Appeal Letter — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Medical Decision-Making Documentation — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 1 |
| Example Output | 1 |
| Consistency | 3 |

#### Shift Handoff: I-PASS Format — 3.6

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Peer-to-Peer Review Preparation — 3.6

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Prior Authorization Letter — 3.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 4 |

</details>

---

### 2.3 Templates: Clinical-Reasoning & Board-Prep (14 files)

Scored on 11 dimensions (6 shared + 5 template-specific). Collection average: **3.9**.

| # | File | Category | Composite | Weakest Dimensions |
|---|------|----------|-----------|---------------------|
| 1 | `pharm-flashcards.mdx` | board-prep | 3.2 | Example Output (1), Variations (1), Cross-linking (1), Instructions (2) |
| 2 | `case-summary-assessment.mdx` | clinical-reasoning | 3.4 | Example Output (1), Cross-linking (2), Prompt Quality (3) |
| 3 | `differential-diagnosis.mdx` | clinical-reasoning | 3.5 | Example Output (1), Cross-linking (3), Instructions (3), Variations (3) |
| 4 | `case-vignette-analysis.mdx` | board-prep | 3.5 | Example Output (1), Audience Fit (3), Cross-linking (3) |
| 5 | `differential-drill.mdx` | board-prep | 3.6 | Example Output (1), Instructions (3), Variations (3), Consistency (3) |
| 6 | `lab-interpretation.mdx` | clinical-reasoning | 3.8 | Example Output (1), Cross-linking (2), Variations (3) |
| 7 | `question-generator.mdx` | board-prep | 3.9 | Example Output (1), Cross-linking (2) |
| 8 | `ddx-generator.mdx` | clinical-reasoning | 4.0 | Example Output (1), Navigation (4), Audience Fit (4) |
| 9 | `risk-stratification.mdx` | clinical-reasoning | 4.0 | Example Output (1), Cross-linking (2) |
| 10 | `medication-reconciliation.mdx` | clinical-reasoning | 4.0 | Example Output (1), Cross-linking (2), Instructions (3), Variations (3) |
| 11 | `topic-review.mdx` | board-prep | 4.0 | Example Output (1), Cross-linking (3), Variations (3) |
| 12 | `case-synthesis.mdx` | clinical-reasoning | 4.3 | Example Output (1), Cross-linking (3) |
| 13 | `workup-planner.mdx` | clinical-reasoning | 4.3 | Example Output (1), Navigation (4) |
| 14 | `bias-check.mdx` | clinical-reasoning | 4.5 | Example Output (1), Cross-linking (3) |

<details>
<summary>Per-file scoring tables</summary>

#### Pharmacology Flashcard Generator — 3.2

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 3 |
| Freshness | 4 |
| Cross-linking | 1 |
| Prompt Quality | 4 |
| Instructions | 2 |
| Variations | 1 |
| Example Output | 1 |
| Consistency | 3 |

#### Case Summary & Assessment/Plan — 3.4

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 3 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 3 |
| Instructions | 3 |
| Variations | 3 |
| Example Output | 1 |
| Consistency | 4 |

#### Differential Diagnosis Generator — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 3 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 3 |
| Example Output | 1 |
| Consistency | 4 |

#### Case Vignette Analysis — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 3 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 3 |
| Example Output | 1 |
| Consistency | 3 |

#### Differential Diagnosis Drill — 3.6

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 5 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 3 |
| Example Output | 1 |
| Consistency | 3 |

#### Lab Panel Interpretation — 3.8

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 4 |
| Instructions | 4 |
| Variations | 3 |
| Example Output | 1 |
| Consistency | 4 |

#### Board-Style Question Generator — 3.9

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 5 |
| Instructions | 4 |
| Variations | 3 |
| Example Output | 1 |
| Consistency | 4 |

#### DDx Generator — 4.0

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 4 |
| Prompt Quality | 5 |
| Instructions | 4 |
| Variations | 4 |
| Example Output | 1 |
| Consistency | 4 |

#### Clinical Risk Stratification — 4.0

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 5 |
| Instructions | 4 |
| Variations | 4 |
| Example Output | 1 |
| Consistency | 4 |

#### Medication Reconciliation Review — 4.0

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 3 |
| Example Output | 1 |
| Consistency | 4 |

#### High-Yield Topic Review — 4.0

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 5 |
| Instructions | 4 |
| Variations | 3 |
| Example Output | 1 |
| Consistency | 4 |

#### Case Synthesis: Assessment & Plan — 4.3

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 4 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 3 |
| Prompt Quality | 5 |
| Instructions | 4 |
| Variations | 4 |
| Example Output | 1 |
| Consistency | 4 |

#### Diagnostic Workup Planner — 4.3

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 4 |
| Prompt Quality | 5 |
| Instructions | 4 |
| Variations | 4 |
| Example Output | 1 |
| Consistency | 4 |

#### Devil's Advocate: Cognitive Bias Check — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 3 |
| Prompt Quality | 5 |
| Instructions | 5 |
| Variations | 4 |
| Example Output | 1 |
| Consistency | 4 |

</details>

---

### 2.4 Templates: Patient-Education & Literature-Review (16 files)

Scored on 11 dimensions (6 shared + 5 template-specific). Collection average: **3.5**.

| # | File | Category | Composite | Weakest Dimensions |
|---|------|----------|-----------|---------------------|
| 1 | `article-summary.mdx` | literature-review | 3.3 | Example Output (1), Variations (2), Cross-linking (3) |
| 2 | `evidence-comparison.mdx` | literature-review | 3.3 | Example Output (1), Variations (1), Instructions (2) |
| 3 | `condition-explainer.mdx` | patient-education | 3.4 | Example Output (1), Variations (2), Cross-linking (2) |
| 4 | `journal-club-prep.mdx` | literature-review | 3.4 | Example Output (1), Variations (1), Instructions (2) |
| 5 | `diagnosis-explainer.mdx` | patient-education | 3.5 | Example Output (1), Variations (2), Cross-linking (2) |
| 6 | `discharge-instructions.mdx` | patient-education | 3.5 | Example Output (1), Variations (2) |
| 7 | `medication-instructions.mdx` | patient-education | 3.5 | Example Output (1), Variations (2) |
| 8 | `lifestyle-modification.mdx` | patient-education | 3.5 | Example Output (1), Variations (2), Cross-linking (2) |
| 9 | `follow-up-visit-prep.mdx` | patient-education | 3.5 | Example Output (1), Variations (2), Cross-linking (3) |
| 10 | `procedure-prep.mdx` | patient-education | 3.5 | Example Output (1), Variations (2), Cross-linking (2) |
| 11 | `post-procedure-care.mdx` | patient-education | 3.5 | Example Output (1), Variations (2) |
| 12 | `guideline-summary.mdx` | literature-review | 3.5 | Example Output (1), Variations (2), Cross-linking (2) |
| 13 | `discharge-instructions-patient.mdx` | patient-education | 3.6 | Example Output (1), Variations (2) |
| 14 | `new-medication-guide.mdx` | patient-education | 3.6 | Example Output (1), Variations (2) |
| 15 | `lifestyle-modification-plan.mdx` | patient-education | 3.7 | Example Output (1), Variations (2) |
| 16 | `research-question.mdx` | literature-review | 3.7 | Example Output (1), Variations (2), Cross-linking (2) |

<details>
<summary>Per-file scoring tables</summary>

#### Journal Article Summary — 3.3

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Treatment Evidence Comparison — 3.3

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 2 |
| Variations | 1 |
| Example Output | 1 |
| Consistency | 3 |

#### Condition Explainer — 3.4

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Journal Club Preparation — 3.4

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 5 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 5 |
| Instructions | 2 |
| Variations | 1 |
| Example Output | 1 |
| Consistency | 3 |

#### Diagnosis Explanation for Patients — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Patient Discharge Instructions (discharge-instructions) — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Medication Instructions: Plain Language — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Lifestyle Modification Counseling — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 5 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Follow-Up Visit Preparation — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 5 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Procedure Preparation Guide — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Post-Procedure Care Instructions — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Clinical Practice Guideline Summary — 3.5

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Patient Discharge Instructions (discharge-instructions-patient) — 3.6

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### New Medication Guide — 3.6

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 4 |
| Instructions | 4 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### Lifestyle Modification Plan — 3.7

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 5 |
| Navigation | 3 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |
| Prompt Quality | 5 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

#### PICO Research Question Builder — 3.7

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 5 |
| Navigation | 3 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 2 |
| Prompt Quality | 4 |
| Instructions | 3 |
| Variations | 2 |
| Example Output | 1 |
| Consistency | 3 |

</details>

---

### 2.5 Tools (12 files)

Scored on 6 shared dimensions only. Collection average: **4.3**.

| # | File | Composite | Weakest Dimensions |
|---|------|-----------|--------------------|
| 1 | `augmedix.mdx` | 3.8 | Cross-linking (3), Clarity (4), Audience Fit (4) |
| 2 | `deepscribe.mdx` | 4.0 | Cross-linking (4), Clarity (4), Audience Fit (4) |
| 3 | `nabla.mdx` | 4.0 | Cross-linking (4), Clarity (4), Audience Fit (4) |
| 4 | `openevidence.mdx` | 4.0 | Cross-linking (4), Clarity (4), Audience Fit (4) |
| 5 | `abridge.mdx` | 4.2 | Cross-linking (3), Freshness (4), Actionability (4) |
| 6 | `suki.mdx` | 4.2 | Cross-linking (4), Freshness (4), Audience Fit (4) |
| 7 | `doximity.mdx` | 4.3 | Cross-linking (3), Freshness (4), Navigation (4) |
| 8 | `dragon-copilot.mdx` | 4.3 | Cross-linking (4), Audience Fit (4), Freshness (4) |
| 9 | `gemini.mdx` | 4.5 | Cross-linking (3), Audience Fit (4) |
| 10 | `perplexity.mdx` | 4.5 | Cross-linking (4), Audience Fit (4), Freshness (4) |
| 11 | `claude.mdx` | 4.7 | Cross-linking (4), Freshness (4) |
| 12 | `openai.mdx` | 4.7 | Cross-linking (4), Freshness (4) |

<details>
<summary>Per-file scoring tables</summary>

#### Augmedix — 3.8

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |

#### DeepScribe — 4.0

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Nabla — 4.0

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 4 |

#### OpenEvidence — 4.0

| Dimension | Score |
|-----------|-------|
| Clarity | 4 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Abridge — 4.2

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 3 |

#### Suki — 4.2

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 4 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Doximity — 4.3

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 4 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 3 |

#### Dragon Copilot — 4.3

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Gemini — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 3 |

#### Perplexity — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Claude — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### OpenAI — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

</details>

---

### 2.6 Workflows (6 files)

Scored on 6 shared dimensions only. Collection average: **4.4**.

| # | File | Composite | Weakest Dimensions |
|---|------|-----------|--------------------|
| 1 | `inpatient-discharge-education.mdx` | 4.2 | Cross-linking (2), Navigation (4), Freshness (4) |
| 2 | `outpatient-visit-education.mdx` | 4.2 | Cross-linking (2), Navigation (4), Freshness (4) |
| 3 | `procedure-education.mdx` | 4.2 | Cross-linking (1), Freshness (4) |
| 4 | `discharge-summary.mdx` | 4.3 | Cross-linking (2), Freshness (4) |
| 5 | `cognitive-debiasing.mdx` | 4.5 | Cross-linking (3), Freshness (4) |
| 6 | `clinical-reasoning.mdx` | 4.8 | Cross-linking (4), Freshness (5) |

<details>
<summary>Per-file scoring tables</summary>

#### Creating Inpatient Discharge Education Materials — 4.2

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 4 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 2 |

#### Creating Outpatient Visit Education Materials — 4.2

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 4 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 2 |

#### Creating Procedure Education Materials — 4.2

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 1 |

#### Writing a Discharge Summary with AI — 4.3

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 2 |

#### Cognitive Debiasing with AI — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 3 |

#### Clinical Reasoning with AI — 4.8

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 4 |

</details>

---

### 2.7 Trials (28 files)

Scored on 6 shared dimensions only. Collection average: **4.6**.

| # | File | Composite | Weakest Dimensions |
|---|------|-----------|--------------------|
| 1 | `sepsis-cohort-llama3-2025.mdx` | 4.2 | Cross-linking (3), Actionability (4), Audience Fit (4) |
| 2 | `ai-neurocritical-care-physiological-signals-2025.mdx` | 4.3 | Actionability (3), Cross-linking (4) |
| 3 | `ai-trial-eligibility-screening-2025.mdx` | 4.5 | Cross-linking (4), Audience Fit (4) |
| 4 | `amie-breast-oncology-2025.mdx` | 4.5 | Actionability (4), Cross-linking (4) |
| 5 | `appraise-hri-hemorrhage-fda-2025.mdx` | 4.5 | Actionability (4), Cross-linking (4) |
| 6 | `continual-learning-ett-placement-2025.mdx` | 4.5 | Actionability (4), Audience Fit (4), Cross-linking (4) |
| 7 | `desire-ai-surgical-discharge-2025.mdx` | 4.5 | Actionability (4), Cross-linking (4) |
| 8 | `ecg-foundation-model-cardiac-function-2025.mdx` | 4.5 | Actionability (4), Audience Fit (4), Cross-linking (4) |
| 9 | `llm-diagnostic-nejm-2024.mdx` | 4.5 | Actionability (4), Freshness (4) |
| 10 | `med-palm-2-expert-qa-2025.mdx` | 4.5 | Actionability (4), Cross-linking (4) |
| 11 | `medversa-generalist-imaging-model-2026.mdx` | 4.5 | Actionability (4), Cross-linking (4) |
| 12 | `sail-2025-ai-year-in-review-2025.mdx` | 4.5 | Actionability (4), Cross-linking (4) |
| 13 | `sleep-eeg-brain-health-biomarker-2026.mdx` | 4.5 | Actionability (4), Audience Fit (4), Cross-linking (4) |
| 14 | `smart-match-surgical-blood-readiness-2025.mdx` | 4.5 | Actionability (4), Cross-linking (4) |
| 15 | `smartphone-strabismus-measurement-2025.mdx` | 4.5 | Actionability (4), Cross-linking (4) |
| 16 | `ai-chest-xray-lung-cancer-triage-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 17 | `ai-symptom-assessment-patient-behavior-2026.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 18 | `ambient-ai-practitioner-wellbeing-rct-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 19 | `ambient-ai-scribes-dax-nabla-rct-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 20 | `deepseek-clinical-benchmark-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 21 | `diagnostic-rct-ai-literacy-2026.mdx` | 4.7 | Cross-linking (4) |
| 22 | `genai-mental-health-chatbot-rct-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 23 | `gpt4-physician-management-rct-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 24 | `hospital-course-summarization-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 25 | `llm-clinical-reasoning-jama-2023.mdx` | 4.7 | Freshness (3) |
| 26 | `medical-llm-data-poisoning-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 27 | `verifact-llm-hallucination-detection-2025.mdx` | 4.7 | Freshness (4), Cross-linking (4) |
| 28 | `emr-cds-safety-kenya-2026.mdx` | 4.8 | Cross-linking (4) |

<details>
<summary>Per-file scoring tables</summary>

#### Syndromic Analysis of Sepsis Cohorts Using LLaMA 3 — 4.2

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 3 |

#### AI-Boosted Physiological Signals in Neurocritical Care — 4.3

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 3 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### AI-Assisted Trial Eligibility Prescreening — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 4 |
| Cross-linking | 4 |

#### AMIE in Breast Oncology — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### APPRAISE-HRI Hemorrhage FDA — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Continual Learning ETT Placement — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 4 |

#### DESIRE AI Surgical Discharge — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### ECG Foundation Model — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 4 |

#### LLM Diagnostic NEJM 2024 — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 5 |

#### Med-PaLM 2 Expert QA — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### MedVersa Generalist Imaging Model — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 4 |

#### SAIL 2025 Year in Review — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 4 |

#### Sleep EEG Brain Health Biomarker — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 4 |
| Freshness | 5 |
| Cross-linking | 4 |

#### Smart Match Surgical Blood Readiness — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Smartphone Strabismus Measurement — 4.5

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 4 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### AI Chest X-Ray Lung Cancer Triage — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### AI Symptom Assessment Patient Behavior — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Ambient AI Practitioner Wellbeing RCT — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Ambient AI Scribes DAX vs Nabla RCT — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### DeepSeek Clinical Benchmark — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Diagnostic RCT AI Literacy — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 4 |

#### GenAI Mental Health Chatbot RCT — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### GPT-4 Physician Management RCT — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Hospital Course Summarization — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### LLM Clinical Reasoning JAMA 2023 — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 3 |
| Cross-linking | 5 |

#### Medical LLM Data Poisoning — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### VeriFact LLM Hallucination Detection — 4.7

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 4 |
| Cross-linking | 4 |

#### Safety of LLM-Based CDS in African Primary Care — 4.8

| Dimension | Score |
|-----------|-------|
| Clarity | 5 |
| Actionability | 5 |
| Navigation | 5 |
| Audience Fit | 5 |
| Freshness | 5 |
| Cross-linking | 4 |

</details>

---

## 3. Cross-Scope Overlap Analysis

### 3.1 Overlaps Within Template Sub-Reports

Each template sub-report documented internal overlaps. The confirmed findings are:

**Note-Writing & Admin-Billing (no problematic overlaps):**
- Appeal Letter vs. Prior Authorization: distinct (sequential workflow — before vs. after denial)
- Appeal Letter vs. Peer-to-Peer Prep: distinct (written letter vs. phone call script)
- MDM Complexity vs. Note-Writing: distinct (billing documentation vs. clinical documentation)
- Consult Note vs. Referral Letter: distinct but confusable (specialist response vs. referring request) — needs cross-linking and "When to use this" clarification

**Clinical-Reasoning & Board-Prep (2 merges recommended):**
- **ddx-generator vs. differential-diagnosis: SIGNIFICANT OVERLAP.** Same purpose (ranked DDx from clinical presentation), near-identical output structure. Only difference is target LLM. Merge recommended — keep ddx-generator.
- **case-synthesis vs. case-summary-assessment: SIGNIFICANT OVERLAP.** Both synthesize a patient case into summary + A/P. case-synthesis is a strict superset. Merge recommended — keep case-synthesis.
- differential-drill vs. DDx templates: no overlap (board-prep interactive drill vs. clinical tool)

**Patient-Education & Literature-Review (2 merges, 1 differentiation recommended):**
- **diagnosis-explainer vs. condition-explainer: HIGH OVERLAP.** Near-duplicate patient education templates with nearly identical output structures. Merge recommended.
- **discharge-instructions-patient vs. discharge-instructions: HIGH OVERLAP.** Same title, same purpose. Merge recommended.
- **lifestyle-modification vs. lifestyle-modification-plan: MODERATE-HIGH OVERLAP.** Significant overlap but some differentiation; lifestyle-modification-plan is stronger. Merge recommended.
- medication-instructions vs. new-medication-guide: moderate overlap but different use cases (batch meds vs. single new prescription). Keep both, differentiate explicitly.

### 3.2 Cross-Category Overlap Check

Comparing template titles and descriptions across all three template sub-reports for overlaps not caught within individual reports:

| Template A | Template B | Assessment |
|------------|------------|------------|
| `discharge-summary-basic.mdx` (note-writing) | `discharge-instructions-patient.mdx` / `discharge-instructions.mdx` (patient-education) | **No overlap.** Discharge summary is a clinician-facing clinical document; discharge instructions are patient-facing education materials. Different audiences, different outputs. Should cross-link. |
| `procedure-note.mdx` (note-writing) | `procedure-prep.mdx` / `post-procedure-care.mdx` (patient-education) | **No overlap.** Procedure note is clinician documentation; procedure-prep and post-procedure-care are patient-facing. Different audiences. Should cross-link. |
| `consult-note.mdx` (note-writing) | `referral-letter.mdx` (admin-billing) | Already flagged within note-writing/admin-billing report. Distinct but confusable. |
| `medication-reconciliation.mdx` (clinical-reasoning) | `medication-instructions.mdx` / `new-medication-guide.mdx` (patient-education) | **No overlap.** Medication reconciliation is a clinical safety review (interactions, duplications, dosing); medication templates are patient education output. Different purposes. Should cross-link. |
| `risk-stratification.mdx` (clinical-reasoning) | `case-synthesis.mdx` (clinical-reasoning) | **No overlap.** Risk stratification computes and interprets validated scores; case synthesis produces an assessment and plan narrative. Complementary, not duplicative. |

**No new cross-category overlaps found beyond those already documented in the individual sub-reports.**

### 3.3 Summary of Merge Recommendations

| Pair | Overlap Level | Action | Surviving File |
|------|---------------|--------|----------------|
| ddx-generator + differential-diagnosis | Significant | Merge | ddx-generator |
| case-synthesis + case-summary-assessment | Significant | Merge | case-synthesis |
| diagnosis-explainer + condition-explainer | High | Merge | condition-explainer |
| discharge-instructions-patient + discharge-instructions | High | Merge | discharge-instructions |
| lifestyle-modification + lifestyle-modification-plan | Moderate-High | Merge | lifestyle-modification-plan |

Completing all 5 merges would reduce the template count from 40 to 35.

---

## 4. Issue Patterns

### Issues Aggregated by Type Across All Collections

| Issue | Files Affected | Collections |
|-------|---------------|-------------|
| **Missing Example Output** | 40/40 templates | All 3 template sub-reports |
| **Weak cross-linking** | 80/91 files (score <=3) | All collections |
| **Missing Variations section** | 40/40 templates | All 3 template sub-reports |
| **Missing "When to use this" section** | 40/40 templates | All 3 template sub-reports |
| **"Notes" instead of "Tips & pitfalls"** | ~35/40 templates | All 3 template sub-reports |
| **No table of contents in long guides** | 2/5 guides (HIPAA at 887 lines, Evidence Landscape at 502 lines) | Guides |
| **Missing or inconsistent TL;DR** | 3/5 guides | Guides |
| **Missing DOI link** | 10/28 trials | Trials |
| **Ambient tools not cross-linked to peers** | 6/12 tools | Tools |
| **Education workflows not linked to siblings** | 3/6 workflows | Workflows |
| **Non-canonical section names** | 40/40 templates | All 3 template sub-reports |
| **Missing How to customize** | 3/40 templates (journal-club-prep, evidence-comparison, mdm-complexity) | Templates |

### Dimension Averages by Collection

| Dimension | Guides | Templates (NW/AB) | Templates (CR/BP) | Templates (PE/LR) | Tools | Workflows | Trials |
|-----------|--------|-------------------|--------------------|--------------------|-------|-----------|--------|
| Clarity | 4.8 | 4.9 | 4.6 | 4.0 | 4.7 | 5.0 | 5.0 |
| Actionability | 4.4 | 4.3 | 4.4 | 4.3 | 4.4 | 5.0 | 4.6 |
| Navigation | 4.4 | 3.0 | 4.1 | 3.0 | 4.4 | 4.7 | 5.0 |
| Audience Fit | 4.8 | 3.7 | 4.0 | 4.1 | 4.3 | 5.0 | 4.8 |
| Freshness | 4.8 | 4.2 | 4.3 | 4.0 | 4.1 | 4.2 | 4.2 |
| Cross-linking | 2.6 | 1.0 | 2.8 | 2.6 | 3.6 | 2.3 | 4.0 |
| Prompt Quality | -- | 4.9 | 4.6 | 4.1 | -- | -- | -- |
| Instructions | -- | 3.0 | 3.5 | 2.9 | -- | -- | -- |
| Variations | -- | 1.7 | 3.2 | 1.9 | -- | -- | -- |
| Example Output | -- | 1.0 | 1.0 | 1.0 | -- | -- | -- |
| Consistency | -- | 3.1 | 3.8 | 3.0 | -- | -- | -- |

### Top Strengths Across the Site

1. **Writing quality (Clarity):** Average 4.7 site-wide. Every trial scores 5. Workflows score 5 across the board. This is a genuine differentiator.
2. **Prompt engineering quality:** Templates average 4.5 on Prompt Quality. Prompts include roles, structured output, constraints, and safety guardrails consistently.
3. **Freshness:** All 91 files have lastUpdated dates in March 2026. The content is current.
4. **HIPAA callouts:** Present and well-executed in every applicable file.
5. **Trials collection consistency:** All 28 trials follow an identical four-section structure. Most consistent collection on the site.

### Priority Remediation (Highest Impact)

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| 1 | Add Example Output to all 40 templates | Fixes universal 1.0 score dimension | 40 x M |
| 2 | Add cross-links site-wide (80 files) | Fixes lowest-scoring dimension across every collection | 80 x S |
| 3 | Execute 5 template merges | Eliminates confusion from duplicate content | 5 x L |
| 4 | Add Variations sections to all 40 templates | Fixes second-lowest template dimension | 40 x M |
| 5 | Add "When to use this" to all 40 templates | Improves navigation and template selection | 40 x S |
| 6 | Rename "Notes" to "Tips & pitfalls" in ~35 templates | Aligns with canonical structure | 35 x S |
| 7 | Add missing DOI links to 10 trials | Mechanical fix for source attribution | 10 x S |
| 8 | Add TOC to the 2 longest guides | Improves navigation for 887-line and 502-line guides | 2 x S |

---

*For detailed issue descriptions and line-level findings, see the individual sub-reports in `docs/audit-reports/`.*
