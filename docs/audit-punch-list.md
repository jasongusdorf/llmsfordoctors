# Prioritized Punch List

**Generated:** 2026-03-22
**Source:** `docs/audit-report.md` + 6 sub-reports in `docs/audit-reports/`
**Rubric:** `docs/content-standards.md`

---

## 1. Summary Stats

| Metric | Count |
|--------|-------|
| **Total fix items** | 45 |
| **S (Small, < 15 min)** | 23 |
| **M (Medium, 15-60 min)** | 17 |
| **L (Large, 1+ hours)** | 5 |
| **Resolved since original audit** | ~15 items (P2 mostly done, P3 done, P6 done) |

### Breakdown by Area

| Area | Open Items |
|------|-----------|
| Guides/Editorials (8 files) | 5 |
| Templates (35 files) | ~5 (was 16; most of P2 resolved, 1 template remains) |
| Trials (27 files) | 3 |
| Tools (14 files) | 2 |
| Workflows (6 files) | 2 |
| Cross-collection (overlaps) | ~~2~~ 0 (P6 merges complete) |
| Bugs & broken functionality (new) | 8 |
| Content & style (new) | 4 |
| Site polish (new) | 3 |

### Breakdown by Priority Tier

| Priority | Items | Status |
|----------|-------|--------|
| P1: Guide Fixes | 5 | Open (paths need updating for 2 files moved to editorials) |
| P2: Template Consistency | 5 | **Mostly resolved.** 34/35 templates updated. 1 remains (discharge-summary-basic, moved to P9). |
| P3: Template Prompt Quality | 2 | **Resolved.** Both referenced templates were merged. |
| P4: Cross-Linking Gaps | 8 | Open (references to deleted templates need adjustment) |
| P5: Tools/Workflows/Trials | 5 | Open |
| P6: Overlap Resolutions | 5 | **Resolved.** All 5 merges complete. |
| **P7: Bugs & Broken Functionality** | **8** | **New** |
| **P8: Content & Style** | **4** | **New** |
| **P9: Site Polish** | **3** | **New** |

---

## 2. Priority 1: Guide Fixes

Every guide issue scoring below 4 on any dimension, sorted by dimension score ascending (worst first).

### Cross-linking

- [ ] **[M]** `src/content/guides/prompting-101.mdx` — **Cross-linking: 1/5.** Zero internal links. Add links to: (1) `guides/llms-in-clinical-care-101` (companion workflow guide), (2) `guides/hipaa-compliance` (relevant when prompting with clinical data), (3) `guides/llm-clinical-reasoning-comparison` (model selection), (4) at least 3 templates that apply prompting skills (e.g., `templates/ddx-generator`, `templates/progress-note-soap`, `templates/discharge-summary-basic`), and (5) a "What's Next" section pointing readers forward.

- [ ] **[M]** `src/content/guides/evidence-landscape-2025.mdx` — **Cross-linking: 2/5.** No explicit internal links anywhere in the 500-line guide. Add links to: (1) `guides/hipaa-compliance`, (2) `guides/llm-clinical-reasoning-comparison`, (3) relevant trial summaries already on the site (e.g., `trials/llm-clinical-reasoning-jama-2023`, `trials/emr-cds-safety-kenya-2026`, `trials/ambient-ai-scribes-dax-nabla-rct-2025`), and (4) relevant tools discussed in the guide.

- [ ] **[S]** `src/content/guides/llm-clinical-reasoning-comparison.mdx` — **Cross-linking: 3/5.** Only links to HIPAA compliance guide. Add links to: (1) `guides/prompting-101` (improving prompting after seeing comparisons), (2) templates that use these models (e.g., `templates/ddx-generator`, `templates/case-synthesis`), and (3) `guides/evidence-landscape-2025`.

- [ ] **[S]** `src/content/guides/hipaa-compliance.mdx` — **Cross-linking: 3/5.** Self-contained guide that doesn't link to practical tools. Add links to: (1) `guides/llms-in-clinical-care-101` (de-identification workflow referenced), (2) `guides/prompting-101`, and (3) at least 2-3 templates to show how HIPAA principles apply in practice.

### Summary/TL;DR

- [ ] **[M]** `src/content/guides/prompting-101.mdx` — **Summary/TL;DR: 1/5.** No TL;DR, no summary, no key takeaways. Add a top-of-page summary box listing the four prompting principles (Set the Role, Provide Context, Be Specific About Format, Iterate) and a "What's Next" section at the bottom.

- [ ] **[S]** `src/content/guides/llm-clinical-reasoning-comparison.mdx` — **Summary/TL;DR: 3/5.** Has a skip-link to "The Verdict" but no dedicated TL;DR. Add a top-of-page summary box with key takeaways (e.g., "o3 for DDx, Claude for synthesis, Perplexity for literature search").

### Practical Examples

- [ ] **[M]** `src/content/guides/prompting-101.mdx` — **Practical Examples: 3/5.** Examples are present but minimal — only before/after prompt pairs without model output or clinical outcomes. Add at least one full worked-through scenario showing a complete prompt-response-review cycle, and show the model's actual output.

- [ ] **[M]** `src/content/guides/evidence-landscape-2025.mdx` — **Practical Examples: 3/5.** References study findings extensively but no concrete clinical scenarios showing what a reader should do. Add at least 2 worked examples (e.g., "Here is how you would evaluate a vendor's benchmark claims using the framework from this section").

### Actionability

- [ ] **[M]** `src/content/guides/evidence-landscape-2025.mdx` — **Actionability: 3/5.** Predominantly informational; most sections describe evidence without telling the reader what to do. Add "What to do with this" callouts at the end of each thematic section, converting findings into actionable steps.

### Navigation

- [ ] **[S]** `src/content/guides/hipaa-compliance.mdx` — **Navigation: 4/5 (but 887 lines with no TOC).** Add a table of contents at the top with anchor links to the 14 parts.

- [ ] **[S]** `src/content/guides/evidence-landscape-2025.mdx` — **Navigation: 4/5 (but 502 lines with no TOC).** Add a table of contents at the top with anchor links to the 5 thematic sections and the Cross-Cutting Lessons section.

### Structure

- [ ] **[S]** `src/content/guides/llm-clinical-reasoning-comparison.mdx` — **Structure: 4/5 but uneven depth.** Comparison 1 shows full model outputs via OutputComparison component while Comparisons 2-5 use prose summaries only. Add OutputComparison components (or at minimum representative output excerpts) for Comparisons 2-5 to match the depth of Comparison 1.

---

## 3. Priority 2: Template Consistency

Templates missing canonical sections, grouped by which section is missing. Per the canonical template structure in `docs/content-standards.md`, every template needs: (1) When to use this, (2) HIPAA callout, (3) The prompt, (4) How to customize, (5) Variations, (6) Example output, (7) Tips & pitfalls.

### Missing: Example Output (40/40 templates — score 1/5 on all)

Every template scores 1/5 on Example Output. No template shows what the LLM actually produces. This is the single highest-impact gap on the site.

- [ ] **[M x 40]** Add a realistic clinical example output section to each template, showing what the LLM produces for a believable (but fictional) patient scenario. Group by collection for batching:

  **Note-Writing (5):**
  `src/content/templates/progress-note-soap.mdx`,
  `src/content/templates/discharge-summary-basic.mdx`,
  `src/content/templates/consult-note.mdx`,
  `src/content/templates/procedure-note.mdx`,
  `src/content/templates/handoff-signout.mdx`

  **Admin-Billing (5):**
  `src/content/templates/appeal-letter.mdx`,
  `src/content/templates/prior-authorization.mdx`,
  `src/content/templates/referral-letter.mdx`,
  `src/content/templates/peer-to-peer-prep.mdx`,
  `src/content/templates/mdm-complexity.mdx`

  **Clinical-Reasoning (9):**
  `src/content/templates/ddx-generator.mdx`,
  `src/content/templates/differential-diagnosis.mdx`,
  `src/content/templates/workup-planner.mdx`,
  `src/content/templates/case-synthesis.mdx`,
  `src/content/templates/case-summary-assessment.mdx`,
  `src/content/templates/risk-stratification.mdx`,
  `src/content/templates/bias-check.mdx`,
  `src/content/templates/lab-interpretation.mdx`,
  `src/content/templates/medication-reconciliation.mdx`

  **Board-Prep (5):**
  `src/content/templates/question-generator.mdx`,
  `src/content/templates/pharm-flashcards.mdx`,
  `src/content/templates/topic-review.mdx`,
  `src/content/templates/case-vignette-analysis.mdx`,
  `src/content/templates/differential-drill.mdx`

  **Patient-Education (11):**
  `src/content/templates/diagnosis-explainer.mdx`,
  `src/content/templates/condition-explainer.mdx`,
  `src/content/templates/discharge-instructions-patient.mdx`,
  `src/content/templates/discharge-instructions.mdx`,
  `src/content/templates/medication-instructions.mdx`,
  `src/content/templates/new-medication-guide.mdx`,
  `src/content/templates/lifestyle-modification.mdx`,
  `src/content/templates/lifestyle-modification-plan.mdx`,
  `src/content/templates/follow-up-visit-prep.mdx`,
  `src/content/templates/procedure-prep.mdx`,
  `src/content/templates/post-procedure-care.mdx`

  **Literature-Review (5):**
  `src/content/templates/article-summary.mdx`,
  `src/content/templates/journal-club-prep.mdx`,
  `src/content/templates/evidence-comparison.mdx`,
  `src/content/templates/guideline-summary.mdx`,
  `src/content/templates/research-question.mdx`

### Missing: Variations Section (40/40 templates)

No template has a standalone Variations section with 2-3 concrete alternate prompts. All use a "Customization Guide" table instead, which tells users what to change but does not show what the changed prompt looks like.

- [ ] **[M x 40]** Add a dedicated Variations section with 2-3 concrete alternate prompts to each template. Keep the existing Customization Guide tables (they are useful), but add distinct prompt variations below them. Apply to all 40 templates listed above.

### Missing: "When to use this" Section (40/40 templates)

No template has a dedicated, labeled "When to use this" section. All embed usage context in the intro paragraph, but the canonical structure requires a dedicated section.

- [ ] **[S x 40]** Add a one-sentence "When to use this" heading and description to each of the 40 templates listed above. Most already have the content in their intro paragraph; this is a restructuring/relabeling task.

### Missing: "Tips & pitfalls" (labeled as "Notes" in ~35 templates, absent in ~5)

Most templates have a "Notes" section that partially fills this role but should be renamed and expanded. A few templates are missing it entirely.

- [ ] **[S x 35]** Rename "Notes" to "Tips & pitfalls" in all templates that have a Notes section. Expand with common failure modes and AI-specific pitfalls. Apply to all templates except those listed below.

- [ ] **[S x 5]** Add a "Tips & pitfalls" section to templates that lack even a "Notes" section:
  `src/content/templates/referral-letter.mdx` (no Notes section at all),
  `src/content/templates/medication-reconciliation.mdx` (no Notes/Tips section),
  `src/content/templates/lifestyle-modification.mdx` (missing Notes section),
  `src/content/templates/procedure-note.mdx` (Notes section has only 2 brief bullet points — expand substantially),
  `src/content/templates/mdm-complexity.mdx` (has pitfall callout but no dedicated section)

### Missing: How to Customize (3 templates)

- [ ] **[S]** `src/content/templates/journal-club-prep.mdx` — **Instructions: 2/5.** No customization guide table. Add a customization table with options for: study type (RCT, cohort, meta-analysis), audience level (residents, faculty, multidisciplinary), depth of statistical critique, and specialty focus.

- [ ] **[S]** `src/content/templates/evidence-comparison.mdx` — **Instructions: 2/5.** No customization guide table. Add a table with options for: number of treatments compared, evidence types to include, specialty filter, and guideline integration.

- [ ] **[S]** `src/content/templates/mdm-complexity.mdx` — **Instructions: 3/5 (missing How to customize entirely).** The only template of 40 without a Customization Guide. Add a table with options for: inpatient vs. outpatient vs. ED, time-based billing alternative, specialty-specific MDM elements, and complexity level.

### Non-canonical Section Names (40/40 templates)

- [ ] **[S x 40]** Rename section headers across all 40 templates to match canonical names: "Prompt Template" → "The prompt", "Customization Guide" → "How to customize", "Notes" → "Tips & pitfalls". This is a mechanical find-and-replace task.

---

## 4. Priority 3: Template Prompt Quality

Templates with Prompt Quality score below 4.

- [ ] **[L]** `src/content/templates/case-summary-assessment.mdx` — **Prompt Quality: 3/5.** Prompt is functional but thin compared to `case-synthesis.mdx`: no Outstanding Questions section, no assertion-based reasoning instruction, simpler plan structure. Re-engineer the prompt to include structured reasoning instructions, plan sub-categories, and explicit output constraints. (Note: if the recommended merge with `case-synthesis.mdx` in Priority 6 is executed first, this item is resolved by the merge.)

- [ ] **[M]** `src/content/templates/differential-diagnosis.mdx` — **Actionability: 3/5.** Usable prompt but fewer customization options and no explicit next steps. Add post-output "next steps" guidance and expand the customization table. (Note: if the recommended merge with `ddx-generator.mdx` in Priority 6 is executed first, this item is resolved by the merge.)

---

## 5. Priority 4: Cross-Linking Gaps

Files with Cross-linking score below 4, across all collections. Guide cross-linking issues are in Priority 1; this section covers templates, tools, workflows, and trials.

### Templates: Cross-linking (all 40 templates score 1-3)

- [ ] **[S x 10]** **Note-Writing & Admin-Billing templates (all score 1/5).** Add cross-links to each of the 10 templates in this collection. Specific links to add:

  | Template | Links to Add |
  |----------|-------------|
  | `progress-note-soap.mdx` | `templates/discharge-summary-basic`, `templates/consult-note`, `templates/handoff-signout`, `workflows/discharge-summary`, `guides/prompting-101` |
  | `discharge-summary-basic.mdx` | `templates/progress-note-soap`, `templates/handoff-signout`, `workflows/discharge-summary`, `templates/discharge-instructions` (patient-facing counterpart) |
  | `consult-note.mdx` | `templates/referral-letter` (with "When to use which" note: consult note = specialist response, referral letter = referring request), `templates/procedure-note` |
  | `procedure-note.mdx` | `templates/consult-note`, `templates/progress-note-soap`, `templates/procedure-prep` (patient-facing counterpart), `templates/post-procedure-care` |
  | `handoff-signout.mdx` | `templates/progress-note-soap`, `templates/discharge-summary-basic` |
  | `appeal-letter.mdx` | `templates/prior-authorization` (step before), `templates/peer-to-peer-prep` (phone call companion) — frame as denial-management workflow |
  | `prior-authorization.mdx` | `templates/appeal-letter` (step after denial), `templates/peer-to-peer-prep` |
  | `referral-letter.mdx` | `templates/consult-note` (specialist's counterpart), `templates/prior-authorization` |
  | `peer-to-peer-prep.mdx` | `templates/appeal-letter` (written follow-up), `templates/prior-authorization` |
  | `mdm-complexity.mdx` | `templates/progress-note-soap` (with note: SOAP = clinical documentation, MDM = billing documentation) |

- [ ] **[S x 14]** **Clinical-Reasoning & Board-Prep templates (scores 1-3).** Add cross-links to create a clinical reasoning workflow chain and board-prep study system:

  | Template | Links to Add |
  |----------|-------------|
  | `ddx-generator.mdx` | `templates/workup-planner`, `templates/bias-check`, `templates/risk-stratification` |
  | `differential-diagnosis.mdx` | `templates/ddx-generator` (recommend using this instead), `templates/differential-drill` |
  | `workup-planner.mdx` | `templates/ddx-generator`, `templates/risk-stratification`, `templates/lab-interpretation` |
  | `case-synthesis.mdx` | `templates/case-summary-assessment`, `templates/ddx-generator`, `workflows/clinical-reasoning` |
  | `case-summary-assessment.mdx` | `templates/case-synthesis`, `workflows/clinical-reasoning` |
  | `risk-stratification.mdx` | `templates/ddx-generator`, `templates/workup-planner`, `templates/lab-interpretation` |
  | `bias-check.mdx` | `templates/ddx-generator`, `templates/case-synthesis`, `workflows/cognitive-debiasing` |
  | `lab-interpretation.mdx` | `templates/workup-planner`, `templates/medication-reconciliation` |
  | `medication-reconciliation.mdx` | `templates/lab-interpretation`, `templates/medication-instructions` (patient-facing counterpart), `templates/new-medication-guide` |
  | `question-generator.mdx` | `templates/topic-review`, `templates/case-vignette-analysis` |
  | `pharm-flashcards.mdx` | `templates/topic-review`, `templates/question-generator` |
  | `topic-review.mdx` | `templates/question-generator`, `templates/case-vignette-analysis`, `templates/differential-drill` |
  | `case-vignette-analysis.mdx` | `templates/question-generator`, `templates/topic-review`, `templates/differential-drill` |
  | `differential-drill.mdx` | `templates/ddx-generator` (clinical use), `templates/case-vignette-analysis` |

- [ ] **[S x 16]** **Patient-Education & Literature-Review templates (scores 2-3).** Add cross-links to form natural pairs and pipelines:

  | Template | Links to Add |
  |----------|-------------|
  | `diagnosis-explainer.mdx` | `templates/condition-explainer`, `templates/discharge-instructions`, `templates/medication-instructions` |
  | `condition-explainer.mdx` | `templates/diagnosis-explainer`, `templates/discharge-instructions` |
  | `discharge-instructions-patient.mdx` | `templates/discharge-instructions` (note overlap), `templates/discharge-summary-basic` (clinician-facing counterpart) |
  | `discharge-instructions.mdx` | `templates/medication-instructions`, `templates/discharge-summary-basic` |
  | `medication-instructions.mdx` | `templates/new-medication-guide` (with "When to use which" — batch meds vs. single new Rx), `templates/discharge-instructions` |
  | `new-medication-guide.mdx` | `templates/medication-instructions`, `workflows/inpatient-discharge-education`, `workflows/outpatient-visit-education` |
  | `lifestyle-modification.mdx` | `templates/lifestyle-modification-plan`, `templates/follow-up-visit-prep` |
  | `lifestyle-modification-plan.mdx` | `templates/lifestyle-modification`, `templates/follow-up-visit-prep` |
  | `follow-up-visit-prep.mdx` | `templates/lifestyle-modification-plan`, `workflows/outpatient-visit-education` |
  | `procedure-prep.mdx` | `templates/post-procedure-care` (natural pair), `templates/procedure-note` (clinician counterpart), `workflows/procedure-education` |
  | `post-procedure-care.mdx` | `templates/procedure-prep`, `workflows/procedure-education` |
  | `guideline-summary.mdx` | `templates/article-summary`, `templates/evidence-comparison`, `templates/research-question` |
  | `article-summary.mdx` | `templates/evidence-comparison`, `templates/journal-club-prep` |
  | `journal-club-prep.mdx` | `templates/article-summary`, `templates/evidence-comparison` |
  | `evidence-comparison.mdx` | `templates/research-question`, `templates/guideline-summary` |
  | `research-question.mdx` | `templates/article-summary`, `templates/evidence-comparison`, `templates/journal-club-prep` |

### Tools: Cross-linking (6 tools score 3/5)

- [ ] **[S]** Add a "Compare With" or "Related Tools" section to the 6 ambient documentation tool reviews that don't link to peers. Each should link to the other ambient tools in the same category:

  | Tool | Links to Add |
  |------|-------------|
  | `src/content/tools/abridge.mdx` (3/5) | Link to `tools/nabla`, `tools/suki`, `tools/dragon-copilot`, `tools/augmedix`, `tools/deepscribe`, and `trials/ambient-ai-scribes-dax-nabla-rct-2025` |
  | `src/content/tools/augmedix.mdx` (3/5) | Link to `tools/abridge`, `tools/suki`, `tools/dragon-copilot`, `tools/nabla`, `tools/deepscribe` |
  | `src/content/tools/doximity.mdx` (3/5) | Link to `tools/claude`, `tools/openai` (general-purpose LLM alternatives), and patient education templates |
  | `src/content/tools/gemini.mdx` (3/5) | Link to `tools/claude`, `tools/openai`, `templates/case-synthesis` (where Gemini's context window helps), and `workflows/clinical-reasoning` |

### Workflows: Cross-linking (5 workflows score 1-3)

- [ ] **[S]** Add cross-links to the 5 workflows scoring below 4 on cross-linking:

  | Workflow | Score | Links to Add |
  |----------|-------|-------------|
  | `src/content/workflows/procedure-education.mdx` | 1/5 | `workflows/inpatient-discharge-education`, `workflows/outpatient-visit-education`, tool reviews, related guides |
  | `src/content/workflows/inpatient-discharge-education.mdx` | 2/5 | `workflows/outpatient-visit-education`, `workflows/procedure-education`, `workflows/discharge-summary`, tool reviews |
  | `src/content/workflows/outpatient-visit-education.mdx` | 2/5 | `workflows/inpatient-discharge-education`, `workflows/procedure-education`, tool reviews |
  | `src/content/workflows/discharge-summary.mdx` | 2/5 | `templates/discharge-summary-basic`, `workflows/inpatient-discharge-education`, `workflows/clinical-reasoning`, related trials |
  | `src/content/workflows/cognitive-debiasing.mdx` | 3/5 | `workflows/clinical-reasoning` (natural companion), other tool reviews beyond Claude, related guides |

### Trials: Cross-linking (26 of 28 trials score 4, 1 scores 3)

- [ ] **[S]** `src/content/trials/sepsis-cohort-llama3-2025.mdx` — **Cross-linking: 3/5.** No link to full article. No cross-links. Add DOI link and cross-links to related research methodology content.

- [ ] **[S]** Add "Related on this site" cross-links to the 26 trials scoring 4/5 that currently link only to their source article. Group thematically:
  - **Ambient AI trials** (`ambient-ai-practitioner-wellbeing-rct-2025`, `ambient-ai-scribes-dax-nabla-rct-2025`): cross-link to each other, and to `tools/abridge`, `tools/nabla`, `tools/dragon-copilot`, `tools/suki`
  - **Clinical reasoning trials** (`llm-clinical-reasoning-jama-2023`, `llm-diagnostic-nejm-2024`, `gpt4-physician-management-rct-2025`, `deepseek-clinical-benchmark-2025`): cross-link to `workflows/clinical-reasoning`, `guides/llm-clinical-reasoning-comparison`
  - **Safety trials** (`emr-cds-safety-kenya-2026`, `medical-llm-data-poisoning-2025`, `verifact-llm-hallucination-detection-2025`): cross-link to each other, to `guides/hipaa-compliance`
  - **Documentation trials** (`hospital-course-summarization-2025`, `desire-ai-surgical-discharge-2025`): cross-link to `workflows/discharge-summary`, `templates/discharge-summary-basic`
  - **SAIL year-in-review** (`sail-2025-ai-year-in-review-2025`): cross-link to the individual trials it discusses that are on this site
  - All remaining trials: add at least one cross-link to a related guide, tool, workflow, or template

---

## 6. Priority 5: Tools/Workflows/Trials — Remaining Issues

Issues from reference content beyond cross-linking (handled in P4).

### Trials: Missing DOI Links (10 files)

- [ ] **[S x 10]** Add "Read the full article" DOI links to the 10 trials missing them:
  `src/content/trials/ai-trial-eligibility-screening-2025.mdx`,
  `src/content/trials/deepseek-clinical-benchmark-2025.mdx`,
  `src/content/trials/diagnostic-rct-ai-literacy-2026.mdx`,
  `src/content/trials/emr-cds-safety-kenya-2026.mdx`,
  `src/content/trials/genai-mental-health-chatbot-rct-2025.mdx`,
  `src/content/trials/gpt4-physician-management-rct-2025.mdx`,
  `src/content/trials/hospital-course-summarization-2025.mdx`,
  `src/content/trials/med-palm-2-expert-qa-2025.mdx`,
  `src/content/trials/medical-llm-data-poisoning-2025.mdx`,
  `src/content/trials/sepsis-cohort-llama3-2025.mdx`

### Trials: Actionability Below 4 (1 file)

- [ ] **[M]** `src/content/trials/ai-neurocritical-care-physiological-signals-2025.mdx` — **Actionability: 3/5.** Review article summarizing emerging applications with most tools in validation stages. Add a "What this means for your practice now" section with concrete actions clinicians can take today (e.g., questions to ask vendors, pilot program considerations, which applications are closest to clinical readiness).

### Trials: Freshness Below 4 (1 file)

- [ ] **[S]** `src/content/trials/llm-clinical-reasoning-jama-2023.mdx` — **Freshness: 3/5.** 2023 study with no mention of whether findings have been replicated or superseded. Add a brief note on subsequent replication studies and whether the complementary-error-pattern finding has held up in more recent work (e.g., reference the 2024 NEJM study already on the site).

### Templates: Pharm Flashcards — Multiple Gaps

- [ ] **[M]** `src/content/templates/pharm-flashcards.mdx` — **Multiple sub-4 scores: Instructions (2), Variations (1), Cross-linking (1), Navigation (3), Audience Fit (3), Consistency (3).** This is the weakest template in the entire audit (3.2 composite). Remediation: add a How to Customize table (the only template of 40 missing one), add at least 2 Variations (e.g., pharmacology by organ system, drug interaction focused, rapid-fire format), add cross-links to `templates/topic-review` and `templates/question-generator`, add a callout for audience guidance, and expand the thin Notes section into a proper Tips & pitfalls section.

### Templates: Board-Prep Callouts Missing

- [ ] **[S]** Add a tip or evidence callout to the 3 board-prep templates that have no callouts at all, to match the pattern used in clinical-reasoning templates:
  `src/content/templates/case-vignette-analysis.mdx` (Audience Fit: 3/5 — add guidance on who should use this and when),
  `src/content/templates/differential-drill.mdx` (Consistency: 3/5 — add a tip callout explaining the interactive format),
  `src/content/templates/pharm-flashcards.mdx` (addressed above)

---

## 7. Overlap Resolutions

Duplicate/overlap recommendations from the audit. Completing all 5 merges would reduce the template count from 40 to 35.

### Recommended Merges (5)

- [ ] **[L]** **Merge `differential-diagnosis.mdx` into `ddx-generator.mdx`.** Both generate ranked differential diagnoses from clinical presentations with near-identical output structures. The only difference is the target LLM (Claude vs. GPT-4o). Keep `ddx-generator.mdx` (richer prompt, more input fields, teaching customization). Add a note that the prompt works with both GPT-4o and Claude. Deprecate `differential-diagnosis.mdx` with redirect. Update all cross-references.

- [ ] **[L]** **Merge `case-summary-assessment.mdx` into `case-synthesis.mdx`.** Both synthesize patient cases into summary + assessment/plan. `case-synthesis.mdx` is a strict superset (assertion-based reasoning, Outstanding Questions, richer plan sub-categories). Keep `case-synthesis.mdx`. Add a "simplified version" customization option for users who want shorter output. Deprecate `case-summary-assessment.mdx`. Update cross-references.

- [ ] **[L]** **Merge `diagnosis-explainer.mdx` into `condition-explainer.mdx`.** Near-duplicate patient education templates. Keep `condition-explainer.mdx` (more structured prompt). Incorporate from `diagnosis-explainer.mdx`: "Questions to ask your doctor" section, explicit PATIENT CONTEXT input section, reading-level tip callout. Deprecate `diagnosis-explainer.mdx` with redirect.

- [ ] **[L]** **Merge `discharge-instructions-patient.mdx` into `discharge-instructions.mdx`.** Same title ("Patient Discharge Instructions"), same purpose. The `discharge-instructions.mdx` version is more complete (includes wound care, "What we did" sections). Merge the explicit clinician-facing differentiation note from `discharge-instructions-patient.mdx`. Deprecate `discharge-instructions-patient.mdx`. Update workflow references.

- [ ] **[L]** **Merge `lifestyle-modification.mdx` into `lifestyle-modification-plan.mdx`.** Significant overlap; `lifestyle-modification-plan.mdx` is stronger (7 sections vs. 6, weekly starter plan, progress tracking). Incorporate from `lifestyle-modification.mdx`: explicit PATIENT CONTEXT input (age, barriers), SMART goals section, motivational interviewing customization. Deprecate `lifestyle-modification.mdx`.

### Recommended Differentiation (1)

- [ ] **[M]** **Differentiate `medication-instructions.mdx` vs. `new-medication-guide.mdx`.** These serve different use cases: `medication-instructions.mdx` is for batch medication education (discharge med reconciliation — multiple meds at once), while `new-medication-guide.mdx` is for single new prescription education. Actions: (1) Rename `medication-instructions.mdx` to emphasize the multi-medication/discharge use case, (2) cross-link each to the other with "When to use which" guidance, (3) add the AI-error pitfall callout from `new-medication-guide.mdx` to `medication-instructions.mdx`.

### Recommended Cross-Link Clarifications (1)

- [ ] **[S]** **Clarify `consult-note.mdx` vs. `referral-letter.mdx`.** These are distinct but confusable (specialist response vs. referring request). Add "When to use this" sections that explicitly differentiate: consult note = specialist's response after seeing the patient, referral letter = referring physician's request before the consult. Cross-link each to the other.

---

## Stale Items & Corrections (March 25 review)

The original audit was generated March 22. The following changes have occurred since then and affect items above.

### Template merges complete (P6 resolved)

All 5 recommended merges have been executed. Template count is now **35**, not 40. The following files no longer exist:

- `differential-diagnosis.mdx` — merged into `ddx-generator.mdx`
- `case-summary-assessment.mdx` — merged into `case-synthesis.mdx`
- `diagnosis-explainer.mdx` — merged into `condition-explainer.mdx`
- `discharge-instructions-patient.mdx` — merged into `discharge-instructions.mdx`
- `lifestyle-modification.mdx` — merged into `lifestyle-modification-plan.mdx`

**Impact on other items:** P3 (both items referenced merged files) is resolved. P4 cross-linking tables that reference deleted templates need adjustment: replace `templates/differential-diagnosis` with `templates/ddx-generator`, `templates/case-summary-assessment` with `templates/case-synthesis`, etc. P6 is complete.

### Two guides moved to editorials (affects P1)

`llm-clinical-reasoning-comparison.mdx` and `evidence-landscape-2025.mdx` are now in `src/content/editorials/`, not `src/content/guides/`. All P1 cross-linking items that point to `guides/llm-clinical-reasoning-comparison` or `guides/evidence-landscape-2025` should use `/editorials/` paths. Guide count is now **3**; editorial count is **5**.

### P2 template consistency mostly resolved

34 of 35 templates now have all canonical sections with canonical names. No instances of old names ("Prompt Template", "Customization Guide", "Notes") remain. The sole exception:

- `src/content/templates/discharge-summary-basic.mdx` — missing **Example Output** and **Variations** sections (has: When to use this, The prompt, How to customize, Tips & pitfalls, Related).

### SAIL trial moved to editorials

`sail-2025-ai-year-in-review-2025.mdx` no longer exists as a trial. The content is now at `src/content/editorials/sail-2025-ai-year-in-review.mdx`. P5 cross-linking references to this trial should point to the editorial instead.

### Two new editorials unaudited

The following editorials were added after the original audit and have not been scored against the content standards:

- `src/content/editorials/epic-integrations-for-llms.mdx` (2026-03-25)
- `src/content/editorials/sail-2025-ai-year-in-review.mdx` (2026-03-21)

---

## 8. Priority 7: Bugs & Broken Functionality

Issues that break site functionality or produce visible errors for visitors.

### Font file corrupt (every page affected)

- [ ] **[S]** `public/fonts/Quadraat-Regular.woff2` — triggers "OTS parsing error: invalid sfntVersion: 1852861728" on every page load. The body text falls back to the Cormorant Garamond/Newsreader/Georgia stack. If the design depends on Quadraat as the display font, re-export or re-encode the .woff2 from the source .otf/.ttf file.

### Broken import path

- [ ] **[S]** `src/components/NewsSection.astro` line 3 — imports `NewsItem` type from `'../utils/fetch-news'`, which does not exist. The type is defined in `../utils/types.ts` and re-exported from `../utils/refresh-news.ts`. Change the import path.

### ToolCard rating-0 display bug

- [ ] **[S]** `src/components/ToolCard.astro` line 13 — clamps rating to 1-5 with `Math.min(5, Math.max(1, Math.round(rating)))`, which prevents rating 0 (the warning/red-border state) from displaying on tool cards. The ComparisonTable component correctly handles rating 0 as a special red-border warning case. The two components are inconsistent: tools rated 0 (Epic AI, Microsoft Copilot) display their warning state in the comparison table but show as 1-star on tool cards.

### HTML entity in trial frontmatter

- [ ] **[S]** `src/content/trials/ambient-ai-practitioner-wellbeing-rct-2025.mdx` line 6 — `keyFinding` field contains `P&lt;0.001` (HTML entity) instead of `P<0.001`. Renders as literal escaped HTML on the trials listing page.

### External links missing noreferrer

- [ ] **[S]** `src/components/NewsCard.astro` line 22 — `rel="noopener"` on `target="_blank"` links should be `rel="noopener noreferrer"`.

### Newsletter form has no backend

- [ ] **[M]** `src/components/Footer.astro` lines 55-76 — Newsletter signup form submits via POST with `name="newsletter"` but has no `action` URL and no API handler. Submissions go nowhere. Either implement a backend endpoint (Cloudflare Worker API route), integrate a third-party service (Buttondown, ConvertKit), or remove the form and the "Get new workflows and tool reviews delivered to your inbox" copy until a backend exists.

### Contact form has no backend

- [ ] **[M]** `src/pages/about.astro` lines 65-68 — Contact form with `method="POST"` and `name="contact"` has no submission handler. Same options as the newsletter form: implement a backend, use a third-party service, or remove the form.

### No Stripe webhook handler

- [ ] **[M]** Payment API routes exist (`src/pages/api/create-payment-intent.ts`, `src/pages/api/create-subscription.ts`) but there is no webhook endpoint to handle Stripe events (payment_intent.succeeded, invoice.payment_succeeded, customer.subscription.updated, etc.). One-time donations may work (Stripe Checkout handles the payment flow), but subscription lifecycle management (failed renewals, cancellations) has no server-side handling.

---

## 9. Priority 8: Content & Style

Content quality issues outside the content-collection audit.

### About page uses banned phrases

- [ ] **[S]** `src/pages/about.astro` lines 44 and 47 — Two phrases from the banned list in the writing style guide:
  - Line 44: "navigate the rapidly evolving landscape of AI tools" (banned: "rapidly evolving")
  - Line 47: "the intersection of technology, medicine, and privacy" (banned: "the intersection of X and Y")
  - Line 44 also uses "cutting through hype" (close to the banned "game-changer" register)

  Rewrite the bio to comply with the style guide. The bio section also reads as a list of attributes rather than showing the reader who this person is. Per the style guide's "About / Bio Pages" examples, it should be first-person, conversational, and specific.

### Videos collection is off-brand

- [ ] **[M]** 3 of 5 videos are developer-focused coding tutorials with no clinical relevance for the stated physician audience:
  - `claude-code-full-course-2026.mdx` (priority 4) — 4-hour software engineering course
  - `autoresearch-claude-skills.mdx` (priority 2) — developer automation tool
  - `claude-code-animated-sites.mdx` (priority 1) — web animation tutorial
  - `bernie-vs-claude.mdx` (priority 1) — tangentially relevant policy video

  Only `3blue1brown-transformers.mdx` (priority 5) has clear educational value for a clinician audience. The collection needs clinical AI content: ambient scribe demos, clinical decision-support walkthroughs, physician workflow tutorials. Replace or supplement the developer-focused entries.

### Donate page lacks transparency

- [ ] **[S]** `src/pages/donate.astro` — Single paragraph of copy above the donation widget. No information about where funds go, no cost breakdown (hosting, tools, research time), no tax-deductibility statement, no mention of the site's independence or what donors are supporting beyond "hosting, research time, and tool reviews." Donors who scroll past the one sentence see only the payment form. Add a brief "Where your money goes" section.

### New editorials need audit scoring

- [ ] **[M]** Score the two post-audit editorials against the content standards rubric (6 shared dimensions):
  - `src/content/editorials/epic-integrations-for-llms.mdx` (added 2026-03-25)
  - `src/content/editorials/sail-2025-ai-year-in-review.mdx` (added 2026-03-21)

---

## 10. Priority 9: Site Polish

Minor issues that affect consistency or code quality but are not user-visible bugs.

### Footer nav inconsistent with top nav

- [ ] **[S]** `src/components/Footer.astro` lines 4-13 — Footer links include 8 items (Workflows, Guides, Tools, Templates, Trials, Community, About, Donate) but omit Videos and Editorials, which are in the top nav (`src/components/Nav.astro`).

### Unused import

- [ ] **[S]** `src/pages/index.astro` line 6 — `Sidebar` component is imported but never used in the page template. Remove the dead import.

### discharge-summary-basic still missing canonical sections

- [ ] **[M]** `src/content/templates/discharge-summary-basic.mdx` — The only template of 35 still missing **Example Output** and **Variations** sections. All other templates have been updated to the full canonical structure.

---

## Verification Checklist

All sub-4 scores from the audit report are accounted for:

- **Guides:** Cross-linking (1, 2, 3, 3), Summary/TL;DR (1, 3), Practical Examples (3, 3), Actionability (3), Navigation (4, 4 — addressed for 887-line and 502-line guides), Structure (4 — addressed) -- all covered in P1. **Note:** 2 of 5 files are now in editorials; paths updated in Stale Items section.
- **Templates (35, was 40):** Example Output resolved for 34/35 (only discharge-summary-basic remains — P9). Variations, section naming, "When to use this", "Tips & pitfalls" — all resolved for 34/35. Cross-linking (1-3 x 35) — still open in P4 (with path corrections for merged templates). Prompt Quality — P3 resolved (both referenced files merged).
- **Tools:** Cross-linking (3 on 4 tools) -- covered in P4
- **Workflows:** Cross-linking (1, 2, 2, 2, 3) -- covered in P4
- **Trials (27, was 28):** Cross-linking (3 on 1, 4 on 26), Actionability (3 on 1), Freshness (3 on 1), missing DOI (10 files) -- covered in P4, P5. **Note:** SAIL trial moved to editorials.

New issues from March 25 review: 8 bug/functionality items (P7), 4 content/style items (P8), 3 polish items (P9).
