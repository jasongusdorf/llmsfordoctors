# Audit Report: Clinical-Reasoning & Board-Prep Templates

**Date:** 2026-03-22
**Auditor:** Agent 3 (automated)
**Scope:** 14 templates (9 clinical-reasoning, 5 board-prep)
**Rubric:** `/docs/content-standards.md` — 6 shared + 5 template-specific dimensions (1–5 scale)

---

## Clinical-Reasoning Templates (9)

---

### DDx Generator
**File:** `src/content/templates/ddx-generator.mdx`
**Category:** clinical-reasoning
**Composite Score:** 4.0

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Scannable, well-formatted with headers, lists, and callouts |
| Actionability | 4 | Prompt is immediately usable; Notes section offers practical guidance but lacks explicit "next step" framing |
| Navigation | 4 | Clear sections but headers are functional ("Prompt Template", "Notes") rather than descriptive |
| Audience Fit | 4 | Works for intermediate clinicians; beginners may find minimal hand-holding |
| Freshness | 5 | References GPT-4o, updated 2026-03-19 |
| Cross-linking | 4 | Links to Differential Diagnosis Drill (board-prep); could link to Workup Planner and Bias Check |
| Prompt Quality | 5 | Excellent: clear role, structured output, explicit rules, Must-Not-Miss section, Synthesis section |
| Instructions | 4 | Customization table is strong; missing explicit "when to use this" dedicated section |
| Variations | 4 | Customization table covers breadth, specialty, acuity, age group, teaching; no separate prompt variations |
| Example Output | 1 | No example output provided |
| Consistency | 4 | Follows site patterns well; section headers differ slightly from canonical ("Notes" instead of "Tips & Pitfalls") |

**Missing Canonical Sections:** When to use this (inline only, no dedicated section), Example output, Tips & pitfalls (labeled "Notes")

---

### Differential Diagnosis Generator
**File:** `src/content/templates/differential-diagnosis.mdx`
**Category:** clinical-reasoning
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clean and scannable but noticeably thinner than ddx-generator |
| Actionability | 3 | Usable prompt but fewer customization options and no explicit next steps |
| Navigation | 4 | Same section structure, clear headers |
| Audience Fit | 4 | Slightly simpler, potentially better for beginners but less depth for advanced users |
| Freshness | 4 | Updated 2026-03-18; targets Claude (no specific model version mentioned) |
| Cross-linking | 3 | Links to Differential Diagnosis Drill only; no other cross-links |
| Prompt Quality | 4 | Functional and clean but less detailed than ddx-generator (Top 5 only, fewer input fields, no Duration/PMH/Allergies fields) |
| Instructions | 3 | Customization table is shorter (4 rows vs 5); no "When to use" section |
| Variations | 3 | Customization table covers depth, specialty, pediatric, EM; fewer options than ddx-generator |
| Example Output | 1 | No example output provided |
| Consistency | 4 | Follows site patterns |

**Missing Canonical Sections:** When to use this, HIPAA callout (present), Example output, Tips & pitfalls (labeled "Notes")

---

### Diagnostic Workup Planner
**File:** `src/content/templates/workup-planner.mdx`
**Category:** clinical-reasoning
**Composite Score:** 4.3

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent formatting with tier-based structure, clear output expectations |
| Actionability | 5 | Tiered output is immediately actionable; "Decision Branch Points" and "What to Avoid" add clinical value |
| Navigation | 4 | Good structure; section headers are standard rather than descriptive |
| Audience Fit | 4 | Best suited for intermediate-to-advanced; tier structure is intuitive for all levels |
| Freshness | 5 | Updated 2026-03-19, references GPT-4o |
| Cross-linking | 4 | Links to DDx Generator; could also link to Risk Stratification and Lab Interpretation |
| Prompt Quality | 5 | Outstanding: tiered urgency, decision branch points, "What to Avoid" section, explicit rules |
| Instructions | 4 | Strong customization table (5 rows); lacks dedicated "When to use" section |
| Variations | 4 | Customization covers setting, resources, prior workup, subspecialty, patient factors |
| Example Output | 1 | No example output |
| Consistency | 4 | Consistent with site patterns |

**Missing Canonical Sections:** When to use this, Example output, Tips & pitfalls (labeled "Notes")

---

### Case Synthesis: Assessment & Plan
**File:** `src/content/templates/case-synthesis.mdx`
**Category:** clinical-reasoning
**Composite Score:** 4.3

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Well-structured with clear output format specification; assertion-based reasoning well explained |
| Actionability | 5 | Output structure (Summary Statement, Problem List, Disposition, Outstanding Questions) is directly usable |
| Navigation | 4 | Clear section flow; headers are standard |
| Audience Fit | 5 | Explicitly targets attending-level synthesis; tagged "advanced"; Notes explain the intent |
| Freshness | 5 | Updated 2026-03-19 |
| Cross-linking | 3 | References Case Summary & Assessment/Plan for comparison; could link to more templates |
| Prompt Quality | 5 | Excellent: structured output, assertion-based reasoning, sub-categories for plan, disposition, outstanding questions |
| Instructions | 4 | Good customization table; Notes provide usage context |
| Variations | 4 | 5 customization options covering style, format, teaching, outpatient, focus |
| Example Output | 1 | No example output |
| Consistency | 4 | Follows site patterns |

**Missing Canonical Sections:** When to use this (inline only), Example output, Tips & pitfalls (labeled "Notes")

---

### Case Summary & Assessment/Plan
**File:** `src/content/templates/case-summary-assessment.mdx`
**Category:** clinical-reasoning
**Composite Score:** 3.4

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clean and readable but notably thinner than case-synthesis |
| Actionability | 4 | Usable output structure but less detailed plan sub-categories |
| Navigation | 4 | Standard clear sections |
| Audience Fit | 3 | Tagged "intermediate" but doesn't clearly differentiate itself from the advanced version |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No cross-links to other templates at all |
| Prompt Quality | 3 | Functional but thinner: no Outstanding Questions, no assertion-based reasoning instruction, simpler plan structure |
| Instructions | 3 | Customization table has 4 rows; no dedicated "When to use" |
| Variations | 3 | 4 customization options, fewer than case-synthesis |
| Example Output | 1 | No example output |
| Consistency | 4 | Follows site patterns |

**Missing Canonical Sections:** When to use this, HIPAA callout (present but no pitfall/evidence callout), Example output, Variations (customization only), Tips & pitfalls (labeled "Notes")

---

### Clinical Risk Stratification
**File:** `src/content/templates/risk-stratification.mdx`
**Category:** clinical-reasoning
**Composite Score:** 4.0

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Clean format, clear output structure per score |
| Actionability | 4 | Score calculation is directly actionable; lacks example of how to act on results |
| Navigation | 4 | Standard section structure |
| Audience Fit | 4 | Works for any clinician familiar with risk scores; lists common scores in Notes |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No cross-links to other templates (should link to DDx Generator, Workup Planner) |
| Prompt Quality | 5 | Well-engineered: component-level calculation, risk category, interpretation, caveats, multi-score comparison |
| Instructions | 4 | Good customization table; Notes serve as usage guide |
| Variations | 4 | Customization covers score selection, population, serial scoring, disposition |
| Example Output | 1 | No example output |
| Consistency | 4 | Follows site patterns |

**Missing Canonical Sections:** When to use this, Example output, Tips & pitfalls (labeled "Notes")

---

### Devil's Advocate: Cognitive Bias Check
**File:** `src/content/templates/bias-check.mdx`
**Category:** clinical-reasoning
**Composite Score:** 4.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent formatting; bias analysis structure is clear and scannable |
| Actionability | 5 | "Forcing Question" section is a standout: one concrete next step per case |
| Navigation | 5 | Descriptive headers (Cognitive Bias Analysis, Alternative Diagnoses Stress Test, Worst-Case Scenario, Forcing Question) |
| Audience Fit | 5 | Tip callout explains exactly when to use; works across experience levels |
| Freshness | 5 | Updated 2026-03-19 |
| Cross-linking | 3 | References Cognitive Debiasing workflow; could cross-link to DDx Generator, Case Synthesis |
| Prompt Quality | 5 | Outstanding: adversarial framing, structured bias identification, stress test, worst-case, forcing question |
| Instructions | 5 | Strong customization table with 5 creative options (focus, depth, team debrief, post-diagnosis, serial cases) |
| Variations | 4 | Customization table serves as variations; no separate prompt variations |
| Example Output | 1 | No example output |
| Consistency | 4 | Follows site patterns; section naming slightly differs |

**Missing Canonical Sections:** When to use this (tip callout serves this purpose but not a dedicated section), Example output

---

### Lab Panel Interpretation
**File:** `src/content/templates/lab-interpretation.mdx`
**Category:** clinical-reasoning
**Composite Score:** 3.8

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clear and scannable; straightforward structure |
| Actionability | 4 | Output includes "Recommended Next Steps" and "Critical Values" sections |
| Navigation | 4 | Standard headers |
| Audience Fit | 4 | Tagged "beginner"; accessible but could offer more depth for advanced users |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No cross-links to other templates (should link to Workup Planner, Medication Reconciliation) |
| Prompt Quality | 4 | Good structure: abnormal values, pattern recognition, most likely explanation, next steps, critical values |
| Instructions | 4 | Customization table covers pediatric, trending, specific panel, teaching |
| Variations | 3 | 4 customization options; no separate prompt variations |
| Example Output | 1 | No example output |
| Consistency | 4 | Follows site patterns |

**Missing Canonical Sections:** When to use this, Example output, Tips & pitfalls (labeled "Notes")

---

### Medication Reconciliation Review
**File:** `src/content/templates/medication-reconciliation.mdx`
**Category:** clinical-reasoning
**Composite Score:** 4.0

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent structure with clearly delineated safety categories |
| Actionability | 5 | Every output section drives a specific action (discontinue, adjust, add, deprescribe) |
| Navigation | 4 | Standard headers; output section labels are descriptive |
| Audience Fit | 4 | Works for any prescribing clinician; Beers Criteria and deprescribing sections add depth |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No cross-links (should link to Lab Interpretation for renal/hepatic context) |
| Prompt Quality | 5 | Comprehensive: interactions, duplications, dosing, missing meds, deprescribing, summary |
| Instructions | 3 | Customization table has only 4 rows; no "When to use" section |
| Variations | 3 | 4 customization options |
| Example Output | 1 | No example output |
| Consistency | 4 | Follows site patterns; no "Notes" section at all |

**Missing Canonical Sections:** When to use this, Example output, Tips & pitfalls / Notes (absent entirely)

---

## Board-Prep Templates (5)

---

### Board-Style Question Generator
**File:** `src/content/templates/question-generator.mdx`
**Category:** board-prep
**Composite Score:** 3.9

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Clean, well-formatted prompt with clear output structure |
| Actionability | 4 | Generates usable practice questions; Notes recommend supplementing with question banks |
| Navigation | 4 | Standard section headers |
| Audience Fit | 4 | Targets exam preppers; tip callout mentions specific exams |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No cross-links (should link to Topic Review, Case Vignette Analysis) |
| Prompt Quality | 5 | Well-structured: vignette format, answer choices, explanations with distractor analysis, high-yield point |
| Instructions | 4 | Good customization table (4 rows); tip callout provides usage guidance |
| Variations | 3 | 4 customization options; no separate prompt variations for different exam types |
| Example Output | 1 | No example output |
| Consistency | 4 | Follows site patterns |

**Missing Canonical Sections:** When to use this, HIPAA callout (not needed for board-prep), Example output, Tips & pitfalls (labeled "Notes")

---

### Pharmacology Flashcard Generator
**File:** `src/content/templates/pharm-flashcards.mdx`
**Category:** board-prep
**Composite Score:** 3.2

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clear format; Anki-compatible output is a nice touch |
| Actionability | 4 | Output is directly importable into flashcard apps |
| Navigation | 3 | Only two sections (Prompt Template, Notes); minimal structure |
| Audience Fit | 3 | Targets medical students; no layering for different levels |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 1 | No cross-links at all; no callouts |
| Prompt Quality | 4 | Good structure per card; comparison cards are a nice addition |
| Instructions | 2 | No customization guide table; bare "Notes" section with 3 bullet points |
| Variations | 1 | No variations or customization options offered |
| Example Output | 1 | No example output |
| Consistency | 3 | Missing HIPAA callout (acceptable for board-prep), no customization guide, thinner than other templates |

**Missing Canonical Sections:** When to use this, HIPAA callout (N/A for board-prep), How to customize (absent), Variations (absent), Example output, Tips & pitfalls (labeled "Notes" with minimal content)

---

### High-Yield Topic Review
**File:** `src/content/templates/topic-review.mdx`
**Category:** board-prep
**Composite Score:** 4.0

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent structure with clear section labels in the prompt output |
| Actionability | 4 | Rapid-review format is directly usable for study; "Exam Pearls" and "Common Exam Traps" are high-value |
| Navigation | 4 | Standard headers; prompt output sections are descriptive |
| Audience Fit | 4 | Tip callout explains the intent clearly; works for any exam prepper |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | Links to Question Generator; could link to Case Vignette Analysis, Differential Drill |
| Prompt Quality | 5 | Comprehensive: definition, classic presentation, buzzwords, diagnosis, treatment, complications, exam pearls, traps, differentials |
| Instructions | 4 | Good customization table (4 rows) |
| Variations | 3 | 4 customization options; no separate prompt variations |
| Example Output | 1 | No example output |
| Consistency | 4 | Follows site patterns |

**Missing Canonical Sections:** When to use this (tip callout partially serves this), Example output, Tips & pitfalls (labeled "Notes")

---

### Case Vignette Analysis
**File:** `src/content/templates/case-vignette-analysis.mdx`
**Category:** board-prep
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clear step-by-step structure |
| Actionability | 4 | Step-by-step reasoning process is directly usable for study |
| Navigation | 4 | Standard headers; numbered steps in prompt are clear |
| Audience Fit | 3 | Targets exam preppers but no layering for different skill levels |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | Links to Question Generator in Notes; could link to Topic Review, Differential Drill |
| Prompt Quality | 4 | Good step-by-step structure; teaching-oriented; less sophisticated than some clinical templates |
| Instructions | 3 | Customization table has 4 rows; no dedicated "When to use" |
| Variations | 3 | 4 customization options |
| Example Output | 1 | No example output |
| Consistency | 3 | Missing HIPAA callout (acceptable for board-prep), missing any type of callout |

**Missing Canonical Sections:** When to use this, HIPAA callout (N/A), Callout of any kind (no callouts present), Example output, Tips & pitfalls (labeled "Notes")

---

### Differential Diagnosis Drill
**File:** `src/content/templates/differential-drill.mdx`
**Category:** board-prep
**Composite Score:** 3.6

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clear format; interactive drill structure is well-explained |
| Actionability | 5 | Interactive format with progressive reveals is inherently actionable |
| Navigation | 4 | Standard headers |
| Audience Fit | 4 | Good for trainees; difficulty adjustment is built into the prompt |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References DDx Generator in Notes; differentiates practice vs. clinical use |
| Prompt Quality | 4 | Good Socratic format; interactive multi-step design is creative |
| Instructions | 3 | Customization table has 4 rows; no "When to use" |
| Variations | 3 | 4 customization options |
| Example Output | 1 | No example output |
| Consistency | 3 | Missing any callout; thinner than clinical-reasoning templates |

**Missing Canonical Sections:** When to use this, HIPAA callout (N/A), Callouts (none present), Example output, Tips & pitfalls (labeled "Notes")

---

## Missing Canonical Sections Summary

The 7 canonical sections per content standards are:
1. When to use this
2. HIPAA callout
3. The prompt (via PromptPlayground)
4. How to customize
5. Variations
6. Example output
7. Tips & pitfalls

| Template | When to use | HIPAA | Prompt | Customize | Variations | Example Output | Tips & Pitfalls |
|----------|:-----------:|:-----:|:------:|:---------:|:----------:|:--------------:|:---------------:|
| ddx-generator | missing | present | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| differential-diagnosis | missing | present | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| workup-planner | missing | present | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| case-synthesis | missing | present | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| case-summary-assessment | missing | present | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| risk-stratification | missing | present | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| bias-check | partial (tip callout) | present | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| lab-interpretation | missing | present | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| medication-reconciliation | missing | present | present | present | missing (customization only) | **missing** | **missing** |
| question-generator | missing | N/A | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| pharm-flashcards | missing | N/A | present | **missing** | **missing** | **missing** | "Notes" (minimal) |
| topic-review | partial (tip callout) | N/A | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| case-vignette-analysis | missing | N/A | present | present | missing (customization only) | **missing** | "Notes" (rename) |
| differential-drill | missing | N/A | present | present | missing (customization only) | **missing** | "Notes" (rename) |

**Systemic gaps across all 14 templates:**
- **Example Output:** Missing from every single template (0/14). This is the most critical gap — it is impossible for a reader to evaluate prompt quality without seeing what the output looks like.
- **When to use this:** Missing as a dedicated section from all 14 (two have partial coverage via tip callouts). The intro paragraph serves this purpose loosely, but the canonical structure calls for a dedicated section.
- **Variations:** No template provides distinct prompt variations. All use a "Customization Guide" table instead, which covers how to modify the single prompt rather than offering 2-3 alternative prompts for different scenarios.
- **Tips & Pitfalls:** 12 of 14 have a "Notes" section that partially fills this role but should be renamed. One template (medication-reconciliation) is missing it entirely.

---

## Overlap Assessment

### 1. `ddx-generator.mdx` vs `differential-diagnosis.mdx`

**Verdict: SIGNIFICANT OVERLAP — merge or deprecate one**

These two templates serve the **same clinical scenario** (generating a ranked differential diagnosis from a clinical presentation) with **near-identical output structures**:

| Aspect | ddx-generator | differential-diagnosis |
|--------|---------------|----------------------|
| Title | "Differential Diagnosis Generator" | "Differential Diagnosis Generator" |
| Purpose | Ranked DDx from clinical vignette | Ranked DDx from clinical presentation |
| Output | Top 5-7, supporting/opposing, clinching test, must-not-miss, synthesis | Top 5, supporting/opposing, key next step, must-not-miss, synthesis |
| Target tool | OpenAI (GPT-4o) | Claude |
| Category | clinical-reasoning | clinical-reasoning |
| Depth | More detailed (7 input fields, teaching customization) | Thinner (5 input fields, fewer customizations) |

The **only meaningful difference** is the target LLM. The prompts are structurally identical, the use cases are identical, and a reader choosing between them would be confused.

**Recommendation: Merge into one template.** Keep the ddx-generator prompt (it is richer and more detailed). Add a tool toggle or note that the prompt works with both GPT-4o and Claude. Deprecate `differential-diagnosis.mdx` and redirect. Estimated effort: **M (Medium)**.

---

### 2. `case-synthesis.mdx` vs `case-summary-assessment.mdx`

**Verdict: SIGNIFICANT OVERLAP — merge or clearly differentiate**

Both templates synthesize a patient case into a summary statement and problem-based assessment/plan. The structural overlap is high:

| Aspect | case-synthesis | case-summary-assessment |
|--------|---------------|------------------------|
| Title | "Case Synthesis: Assessment & Plan" | "Case Summary & Assessment/Plan" |
| Purpose | Synthesize case into summary + A/P | Synthesize case into summary + A/P |
| Output | Summary statement, problem list (assessment + plan with sub-categories), disposition, outstanding questions | One-line summary, problem list (assessment + plan with sub-categories), disposition |
| Tag level | advanced | intermediate |
| Differentiator | Assertion-based reasoning, "Outstanding Questions" section, explicit reasoning instructions | Simpler, fewer plan sub-categories |

The case-synthesis template is strictly a **superset** of case-summary-assessment. The "intermediate" version adds no unique value; it is simply a thinner version of the same concept. A reader who finds case-summary-assessment will wonder why case-synthesis exists (and vice versa). The case-synthesis Notes section even says to "Compare this template to the Case Summary & Assessment/Plan template," which confirms the overlap.

**Recommendation: Merge into one template.** Keep `case-synthesis.mdx` as the primary template (it is richer). Add a "simplified version" customization option: "For a shorter output, add: 'Limit each problem to 3 lines and omit the Outstanding Questions section.'" Deprecate `case-summary-assessment.mdx`. Estimated effort: **M (Medium)**.

---

### 3. `differential-drill.mdx` vs DDx templates (ddx-generator, differential-diagnosis)

**Verdict: NO SIGNIFICANT OVERLAP — keep, but clarify differentiation**

The Differential Drill is a **board-prep interactive learning exercise** (Socratic format, progressive case reveals, trainee feedback). The DDx Generator templates are **clinical tools** (input a real case, get a DDx). These serve fundamentally different purposes:

- DDx Generator: real patient care support (input → output)
- Differential Drill: practice and learning (interactive conversation)

Both ddx-generator.mdx and differential-drill.mdx already note this distinction in their Notes sections. The differentiation is adequate.

**Recommendation: Keep both.** No action needed beyond the merge recommendation above (which would eliminate differential-diagnosis.mdx, leaving one DDx clinical template and one DDx practice template — a clean separation). Estimated effort: **S (Small)** — just verify cross-references remain accurate after the DDx merge.

---

## Cross-File Observations

### 1. Universal absence of Example Output
Every single template in this audit (14/14) is missing the Example Output canonical section. This is the highest-priority remediation item. Without seeing what the prompt produces, readers cannot evaluate whether the template is worth using. Adding realistic clinical examples would also serve as implicit "marketing" for each template.

**Estimated effort per template:** M (Medium) — requires generating a realistic fictional case and output, then editing for clinical accuracy.

### 2. Systematic "Notes" vs "Tips & Pitfalls" naming
13 of 14 templates use "Notes" as the final section header. The canonical structure calls for "Tips & Pitfalls." A rename would improve consistency and better signal the content's purpose.

**Estimated effort:** S (Small) per template — global find-and-replace on the heading plus minor content reorganization.

### 3. No dedicated "When to use this" sections
All 14 templates embed their use-case description in the intro paragraph below the frontmatter. The canonical structure expects a dedicated "When to use this" section. Adding a one-sentence dedicated section would improve scannability and help readers quickly triage which template to use.

**Estimated effort:** S (Small) per template.

### 4. Variations section is universally missing
Every template uses a "Customization Guide" table instead of providing 2-3 distinct prompt variations. The customization tables are genuinely useful but do not meet the canonical "Variations" requirement. The fix: add 2-3 short alternative prompts (e.g., specialty-specific, complexity-adjusted, or setting-specific) below the customization table.

**Estimated effort:** M (Medium) per template.

### 5. Cross-linking is sparse
Average cross-linking score across all 14 templates: 2.6/5. Most templates are near-islands. The clinical-reasoning templates should form a natural workflow chain (DDx → Workup → Lab Interpretation → Risk Stratification → Case Synthesis), and the board-prep templates should cross-reference each other as a study system. Adding a "Related Templates" section at the bottom of each template would significantly improve discoverability.

**Estimated effort:** S (Small) per template.

### 6. Board-prep templates are thinner than clinical-reasoning templates
The 5 board-prep templates average 3.6 composite vs 4.0 for clinical-reasoning. The board-prep templates tend to have fewer callouts (3/5 have no callouts at all), thinner Notes sections, and less customization guidance. `pharm-flashcards.mdx` is the weakest template in the entire audit, missing both the Customization Guide and Variations sections entirely.

### 7. Composite Score Summary

| Template | Category | Composite |
|----------|----------|-----------|
| bias-check | clinical-reasoning | 4.5 |
| case-synthesis | clinical-reasoning | 4.3 |
| workup-planner | clinical-reasoning | 4.3 |
| ddx-generator | clinical-reasoning | 4.0 |
| risk-stratification | clinical-reasoning | 4.0 |
| medication-reconciliation | clinical-reasoning | 4.0 |
| topic-review | board-prep | 4.0 |
| question-generator | board-prep | 3.9 |
| lab-interpretation | clinical-reasoning | 3.8 |
| differential-drill | board-prep | 3.6 |
| differential-diagnosis | clinical-reasoning | 3.5 |
| case-vignette-analysis | board-prep | 3.5 |
| case-summary-assessment | clinical-reasoning | 3.4 |
| pharm-flashcards | board-prep | 3.2 |

**Overall average:** 3.9 / 5.0

### 8. Priority Remediation List

1. **Add Example Output to all 14 templates** — largest impact, universal gap (effort: M each)
2. **Merge ddx-generator + differential-diagnosis** — resolve duplicate (effort: M)
3. **Merge case-synthesis + case-summary-assessment** — resolve duplicate (effort: M)
4. **Add cross-links across template families** — improve navigation (effort: S each)
5. **Add "When to use this" sections to all 14** — improve scannability (effort: S each)
6. **Rename "Notes" to "Tips & Pitfalls" across all 13 applicable** — consistency (effort: S each)
7. **Add Customization Guide and Variations to pharm-flashcards** — weakest template (effort: M)
8. **Add callouts to the 3 board-prep templates missing them** — consistency (effort: S each)
