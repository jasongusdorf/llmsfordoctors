# Audit Report: Patient-Education & Literature-Review Templates

> **Auditor:** Claude (automated)
> **Date:** 2026-03-22
> **Rubric:** `/docs/content-standards.md` (6 shared + 5 template-specific dimensions, 1–5 scale)
> **Templates audited:** 16 (11 patient-education, 5 literature-review)

---

## Scoring Key

| Score | Meaning |
|-------|---------|
| 5 | Excellent — meets all criteria |
| 4 | Good — minor gaps |
| 3 | Acceptable — functional but clear room for improvement |
| 2 | Below expectations — significant gaps |
| 1 | Needs rework |

Canonical sections (7): When to use this, HIPAA callout, The prompt, How to customize, Variations, Example output, Tips & pitfalls.

---

## Patient-Education Templates (11)

---

### 1. Diagnosis Explanation for Patients

**File:** `src/content/templates/diagnosis-explainer.mdx`
**Category:** patient-education
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-formatted, scannable, plain language throughout |
| Actionability | 4 | Customization table and tips are actionable; prompt itself produces actionable output |
| Navigation | 3 | Has headers but uses "Prompt Template" / "Customization Guide" / "Notes" rather than canonical section names |
| Audience Fit | 4 | Reading-level callout is excellent; adjustable for pediatric, language, chronic vs. acute |
| Freshness | 4 | Updated 2026-03-18; no stale references |
| Cross-linking | 2 | No links to related templates (condition-explainer, discharge-instructions, medication-instructions) |
| Prompt Quality | 4 | Well-structured with role, reading level, structured output sections, patient context slot |
| Instructions | 3 | Customization table is good; missing "when to use this" as a labeled section; tips are in "Notes" |
| Variations | 2 | Customization table mentions adjustments but no full alternate prompt variations with examples |
| Example Output | 1 | No example output |
| Consistency | 3 | Structure is close to canonical but uses non-standard section names; missing 3 canonical sections |

**Missing Canonical Sections:** Variations (dedicated section with concrete alternate prompts), Example output, Tips & pitfalls (content exists in "Notes" but not labeled canonically)

---

### 2. Condition Explainer

**File:** `src/content/templates/condition-explainer.mdx`
**Category:** patient-education
**Composite Score:** 3.4

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clean, scannable, well-formatted prompt with numbered sections |
| Actionability | 4 | Produces directly usable patient handout; customization table is actionable |
| Navigation | 3 | Headers present but generic ("Prompt Template", "Customization Guide", "Notes") |
| Audience Fit | 4 | Defaults to 6th grade; customization options for caregiver, length, specialty |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No links to related templates |
| Prompt Quality | 4 | Good role assignment, clear structure, reading level constraint, jargon guidance |
| Instructions | 3 | Customization table present; intro sentence serves as "when to use" but not labeled |
| Variations | 2 | Customization table mentions adjustments but no standalone variation prompts |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows the same pattern as diagnosis-explainer; missing same canonical sections |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 3. Patient Discharge Instructions (discharge-instructions-patient.mdx)

**File:** `src/content/templates/discharge-instructions-patient.mdx`
**Category:** patient-education
**Composite Score:** 3.6

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Exceptionally clear prompt with numbered sections, bolded safety info, specific formatting guidance |
| Actionability | 4 | Highly actionable; output is ready-to-give patient handout |
| Navigation | 3 | Uses "Prompt Template" / "Customization Guide" / "Notes" headers |
| Audience Fit | 4 | 6th grade default; pediatric, surgical, reading level adjustments in customization |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | Mentions "Discharge Summary: Basic Template" distinction in notes; mentions medication template pairing |
| Prompt Quality | 5 | Excellent structure: role, reading level, jargon guidance, 6 well-defined output sections, concrete specificity |
| Instructions | 3 | Good customization guide; intro explicitly differentiates from clinician-facing template |
| Variations | 2 | Customization table only; no full alternate prompts |
| Example Output | 1 | No example output |
| Consistency | 3 | Same structural pattern as other patient-education templates |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 4. Patient Discharge Instructions (discharge-instructions.mdx)

**File:** `src/content/templates/discharge-instructions.mdx`
**Category:** patient-education
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-structured prompt; includes wound care section the other discharge template lacks |
| Actionability | 4 | Produces actionable discharge sheet |
| Navigation | 3 | Same generic headers as other templates |
| Audience Fit | 4 | Reading level adjustable; language, caregiver, pediatric options |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References Medication Instructions template in notes |
| Prompt Quality | 4 | Good structure; uses "nurse" role vs. "physician" in the other; includes wound care section |
| Instructions | 3 | Customization table present; notes differentiate from AVS |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 5. Medication Instructions: Plain Language

**File:** `src/content/templates/medication-instructions.mdx`
**Category:** patient-education
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clean structure, clear sections for each medication |
| Actionability | 4 | Produces directly usable med instruction sheet |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | 6th grade default; visual format option in customization |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References Discharge Instructions template in notes |
| Prompt Quality | 4 | Good role (pharmacist), structured output, includes safety sections |
| Instructions | 3 | Customization table; intro describes when to use |
| Variations | 2 | Customization mentions "combined medication schedule" and "table" format but no full prompts |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 6. New Medication Guide

**File:** `src/content/templates/new-medication-guide.mdx`
**Category:** patient-education
**Composite Score:** 3.6

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-structured with numbered sections; includes storage section the other med template lacks |
| Actionability | 4 | Produces complete, usable medication guide |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | 6th grade default; pediatric, injectable, controlled substance, antibiotic customization options |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References workflows (Inpatient Discharge Education, Outpatient Visit Education) in notes |
| Prompt Quality | 4 | Thorough prompt; 6 output sections; includes storage and missed-dose instructions |
| Instructions | 4 | Extra "pitfall" callout about AI medication errors is excellent safety guidance |
| Variations | 2 | Customization table with 5 options, but no full alternate prompts |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (pitfall callout exists as a Callout component, but no dedicated canonical section)

---

### 7. Lifestyle Modification Counseling

**File:** `src/content/templates/lifestyle-modification.mdx`
**Category:** patient-education
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-structured prompt with clear sections; comprehensive coverage of diet, exercise, sleep, stress, monitoring, goals |
| Actionability | 5 | Exceptionally actionable: SMART goals, sample meal plans, week-by-week ramp-up, specific tracking instructions |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | Reading level specified; cultural considerations, motivational interviewing, comorbidities in customization |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No links to related templates |
| Prompt Quality | 4 | Comprehensive prompt with patient context section (age, barriers); explicit instruction to avoid vague advice |
| Instructions | 3 | Customization table present |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern; missing Notes section |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls

---

### 8. Lifestyle Modification Plan

**File:** `src/content/templates/lifestyle-modification-plan.mdx`
**Category:** patient-education
**Composite Score:** 3.7

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Excellent prompt structure; 7 numbered sections; explicit instruction against vague advice with concrete examples |
| Actionability | 5 | Weekly starter plan table, progress tracking, specific "when to check in" criteria |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | 6th grade default; diabetes, heart failure, obesity, elderly, budget variations |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References Follow-Up Visit Prep template in notes |
| Prompt Quality | 5 | Strongest prompt in the pair: more structured (7 sections vs. 6), includes weekly starter plan table, explicit anti-vagueness instruction with examples |
| Instructions | 3 | Customization table; notes include quality-of-input guidance |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 9. Follow-Up Visit Preparation

**File:** `src/content/templates/follow-up-visit-prep.mdx`
**Category:** patient-education
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-structured prompt; includes symptom diary table format |
| Actionability | 5 | Highly actionable: symptom diary table, specific questions, checklist, expectation-setting |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | Post-surgical, chronic, new diagnosis, telehealth, multiple-provider variations |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References Inpatient Discharge Education and Outpatient Visit Education workflows |
| Prompt Quality | 4 | Good structure with 5 sections; symptom diary table is a nice touch |
| Instructions | 3 | Customization table present |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 10. Procedure Preparation Guide

**File:** `src/content/templates/procedure-prep.mdx`
**Category:** patient-education
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clear 6-section prompt; includes "Questions to Ask" section |
| Actionability | 4 | Actionable checklist (what to bring, how to prepare) |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | Anesthesia type, pediatric, colonoscopy, surgical, anxiety variations |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No links to post-procedure-care template (the natural pair) |
| Prompt Quality | 4 | Solid structure; includes patient perspective walkthrough |
| Instructions | 3 | Customization table present |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 11. Post-Procedure Care Instructions

**File:** `src/content/templates/post-procedure-care.mdx`
**Category:** patient-education
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clear 7-section prompt; bold safety information |
| Actionability | 4 | Activity restriction timelines, pain management schedule, follow-up expectations |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | Minor/major procedure, drain/device, pediatric, opioid variations |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References Inpatient Discharge Education and Procedure Education workflows |
| Prompt Quality | 4 | Good structure with tiered urgency (call doctor vs. go to ER) |
| Instructions | 3 | Customization table present |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern |

**Missing Canonical Sections:** Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

## Literature-Review Templates (5)

---

### 12. Journal Article Summary

**File:** `src/content/templates/article-summary.mdx`
**Category:** literature-review
**Composite Score:** 3.3

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clear, structured prompt with specific statistical output requirements (HR, OR, NNT, CI) |
| Actionability | 4 | "Clinical Bottom Line" section is directly actionable |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | Targets busy physicians; depth and audience adjustable |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References Evidence Comparison template in notes |
| Prompt Quality | 4 | Strong: specific statistical requirements, anti-fabrication instruction, structured output |
| Instructions | 3 | Customization table present; missing "when to use" as labeled section |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern; missing HIPAA callout (appropriate for literature-review but noted for consistency) |

**Missing Canonical Sections:** HIPAA callout (arguably not needed for lit review of published articles), Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 13. Journal Club Preparation

**File:** `src/content/templates/journal-club-prep.mdx`
**Category:** literature-review
**Composite Score:** 3.4

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Excellent prompt structure; methods critique broken into specific domains |
| Actionability | 5 | Produces a complete journal club presentation package; discussion questions, validity rating, statistics decoded |
| Navigation | 3 | Generic headers; no customization guide table |
| Audience Fit | 4 | Targets faculty/residents; progressive discussion questions (factual → interpretive → applicability) |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References Article Summary template in notes |
| Prompt Quality | 5 | Most comprehensive literature-review prompt; multi-domain methods critique, validity assessment, NNT calculation, 5-tier discussion questions |
| Instructions | 2 | No customization guide table; only brief notes |
| Variations | 1 | No variations or customization options |
| Example Output | 1 | No example output |
| Consistency | 3 | Missing customization guide (present in all other templates); missing HIPAA callout |

**Missing Canonical Sections:** HIPAA callout, How to customize, Variations (dedicated), Example output, Tips & pitfalls

---

### 14. Treatment Evidence Comparison

**File:** `src/content/templates/evidence-comparison.mdx`
**Category:** literature-review
**Composite Score:** 3.3

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clear structure with evidence summary table template |
| Actionability | 4 | Synthesis section directly answers "should this change practice?" |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | Targets clinical epidemiologist level; evidence callout sets appropriate expectations |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 3 | References PICO Research Question Builder in notes |
| Prompt Quality | 4 | Good structure; evidence summary table, head-to-head comparison, gaps analysis |
| Instructions | 2 | No customization guide table |
| Variations | 1 | No variations |
| Example Output | 1 | No example output |
| Consistency | 3 | Missing customization guide table (has one in most other templates); has evidence callout instead of HIPAA (appropriate) |

**Missing Canonical Sections:** HIPAA callout (has evidence callout instead, appropriate), How to customize (no table), Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 15. Clinical Practice Guideline Summary

**File:** `src/content/templates/guideline-summary.mdx`
**Category:** literature-review
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-structured prompt; algorithm/decision pathway format is clever |
| Actionability | 4 | Quick reference cheat sheet is directly usable; "what changed" section is practice-relevant |
| Navigation | 3 | Generic headers |
| Audience Fit | 4 | Targets physicians; specialty filter, comparison, population customization |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No links to related templates |
| Prompt Quality | 4 | Strong: algorithm extraction, change tracking, quick reference, anti-fabrication instruction |
| Instructions | 3 | Customization table present |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern; missing HIPAA callout |

**Missing Canonical Sections:** HIPAA callout (arguably not needed), Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

### 16. PICO Research Question Builder

**File:** `src/content/templates/research-question.mdx`
**Category:** literature-review
**Composite Score:** 3.7

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-structured; PICO explained in tip callout for newcomers |
| Actionability | 5 | Produces a ready-to-paste PubMed search string; most directly actionable literature-review template |
| Navigation | 3 | Generic headers |
| Audience Fit | 5 | Layered: tip callout for beginners, MeSH terms for advanced users, teaching mode in customization |
| Freshness | 4 | Updated 2026-03-18 |
| Cross-linking | 2 | No links to other literature-review templates (should link to article-summary, evidence-comparison) |
| Prompt Quality | 4 | Good structure with PICO breakdown, search strategy, alternative formulations |
| Instructions | 3 | Customization table present; tip callout is helpful |
| Variations | 2 | Customization table only |
| Example Output | 1 | No example output |
| Consistency | 3 | Follows site pattern; has tip callout instead of HIPAA (appropriate for this use case) |

**Missing Canonical Sections:** HIPAA callout (has tip callout instead, appropriate), Variations (dedicated), Example output, Tips & pitfalls (content in "Notes" but not labeled)

---

## Summary Tables

### Composite Scores

| # | Template | Category | Composite |
|---|----------|----------|-----------|
| 1 | Diagnosis Explanation for Patients | patient-education | 3.5 |
| 2 | Condition Explainer | patient-education | 3.4 |
| 3 | Patient Discharge Instructions (discharge-instructions-patient) | patient-education | 3.6 |
| 4 | Patient Discharge Instructions (discharge-instructions) | patient-education | 3.5 |
| 5 | Medication Instructions: Plain Language | patient-education | 3.5 |
| 6 | New Medication Guide | patient-education | 3.6 |
| 7 | Lifestyle Modification Counseling | patient-education | 3.5 |
| 8 | Lifestyle Modification Plan | patient-education | 3.7 |
| 9 | Follow-Up Visit Preparation | patient-education | 3.5 |
| 10 | Procedure Preparation Guide | patient-education | 3.5 |
| 11 | Post-Procedure Care Instructions | patient-education | 3.5 |
| 12 | Journal Article Summary | literature-review | 3.3 |
| 13 | Journal Club Preparation | literature-review | 3.4 |
| 14 | Treatment Evidence Comparison | literature-review | 3.3 |
| 15 | Clinical Practice Guideline Summary | literature-review | 3.5 |
| 16 | PICO Research Question Builder | literature-review | 3.7 |

**Overall Mean:** 3.5
**Patient-Education Mean:** 3.5
**Literature-Review Mean:** 3.4

### Dimension Averages (Across All 16 Templates)

| Dimension | Average | Notes |
|-----------|---------|-------|
| Clarity | 4.0 | Consistent strength across all templates |
| Actionability | 4.3 | Strongest dimension; many templates score 4–5 |
| Navigation | 3.0 | Universal gap: all use generic headers, none use canonical section names |
| Audience Fit | 4.1 | Strong; reading-level adjustments and customization options |
| Freshness | 4.0 | All updated 2026-03-18 |
| Cross-linking | 2.6 | Weakest shared dimension; most templates are islands |
| Prompt Quality | 4.1 | Generally strong prompt engineering |
| Instructions | 2.9 | Customization tables present but "when to use" not always explicit |
| Variations | 1.9 | Systemic gap: no template has dedicated variation prompts |
| Example Output | 1.0 | **Universal gap: zero templates have example output** |
| Consistency | 3.0 | All follow same (non-canonical) structure |

---

## Missing Canonical Sections Summary

All 16 templates are missing the same core canonical sections. This is a systemic issue, not a per-template issue.

| Canonical Section | Present In | Status |
|-------------------|-----------|--------|
| When to use this | 16/16 (as intro paragraph, not labeled section) | Relabel needed (S) |
| HIPAA callout | 11/16 | Missing from 5 literature-review templates (3 intentionally; 2 could add evidence-handling callout) |
| The prompt | 16/16 | Present as "Prompt Template" — rename to match canonical (S) |
| How to customize | 14/16 | Missing from journal-club-prep and evidence-comparison (M) |
| Variations | 0/16 | **No template has a dedicated Variations section with alternate prompts** (M per template) |
| Example output | 0/16 | **No template has example output** (M per template) |
| Tips & pitfalls | 0/16 (as labeled section) | Content exists in "Notes" for most templates; relabel and expand (S–M) |

**Bottom line:** Every template needs (1) a Variations section with 2–3 alternate prompts and (2) an Example Output section with a realistic clinical scenario. These are the two largest systemic gaps.

---

## Overlap Assessment

### 1. `diagnosis-explainer.mdx` vs `condition-explainer.mdx`

**Overlap severity:** HIGH — these are near-duplicates.

| Aspect | diagnosis-explainer | condition-explainer |
|--------|-------------------|-------------------|
| Title | "Diagnosis Explanation for Patients" | "Condition Explainer" |
| Target tool | Claude | Any |
| Role in prompt | "caring physician explaining a new diagnosis" | "physician writing a patient education handout" |
| Output structure | 6 sections (What is it, Causes, What does this mean, Treatment, Watch for, Questions to ask) | 5 sections (What You Have, Causes, What to Expect, Treatment Plan, When to Get Help) |
| Reading level | Configurable (default 6th grade) | Fixed at 6th grade (adjustable via customization) |
| Patient context | Has explicit PATIENT CONTEXT input section | Has generic CLINICAL INFORMATION input |
| Unique value | "Questions to ask your doctor" section; reading-level tip callout | Slightly more structured prompt; length customization option |

**Recommendation: MERGE into one template.** Keep `condition-explainer.mdx` as the base (more structured prompt), incorporate the "Questions to ask your doctor" section and the explicit PATIENT CONTEXT input and reading-level tip callout from `diagnosis-explainer.mdx`. Deprecate `diagnosis-explainer.mdx` with a redirect. Rename the merged template to "Diagnosis & Condition Explainer" to capture both search terms.

**Effort:** L (requires merging best elements, updating cross-links, adding redirect)

---

### 2. `discharge-instructions-patient.mdx` vs `discharge-instructions.mdx`

**Overlap severity:** HIGH — these are near-duplicates with the same title.

| Aspect | discharge-instructions-patient | discharge-instructions |
|--------|-------------------------------|----------------------|
| Title | "Patient Discharge Instructions" | "Patient Discharge Instructions" (identical!) |
| Target tool | Any | Claude |
| Role in prompt | "physician writing discharge instructions" | "nurse writing discharge instructions" |
| Output sections | 6 (Why hospitalized, Medications, Activity/Diet, Follow-Up, Call Doctor, Go to ER) | 8 (Why hospitalized, What we did, Medications, Activity/Diet, Follow-Up, Wound Care, Call Doctor, Go to ER) |
| Unique value | Explicit differentiation from clinician-facing discharge summary in notes | Wound care section; "What we did" section; references AVS; pairs with Medication Instructions template |
| Workflow | inpatient-discharge-education | discharge-education |

**Recommendation: MERGE into one template.** The `discharge-instructions.mdx` version is slightly more complete (includes wound care and "What we did" sections). Merge the best elements: use the more comprehensive prompt from `discharge-instructions.mdx`, add the explicit differentiation note from `discharge-instructions-patient.mdx`, consolidate the customization tables. Deprecate `discharge-instructions-patient.mdx`.

**Effort:** L (merge, update cross-links, resolve duplicate workflows)

---

### 3. `lifestyle-modification.mdx` vs `lifestyle-modification-plan.mdx`

**Overlap severity:** MODERATE-HIGH — significant overlap but some differentiation.

| Aspect | lifestyle-modification | lifestyle-modification-plan |
|--------|----------------------|---------------------------|
| Title | "Lifestyle Modification Counseling" | "Lifestyle Modification Plan" |
| Target tool | Claude | Any |
| Prompt sections | 6 (Diet, Physical Activity, Sleep, Stress Management, Monitoring, Setting Goals) | 7 (Why These Changes Matter, Diet, Exercise, Other Changes, Weekly Starter Plan, Track Progress, When to Check In) |
| Unique value | SMART goals; explicit barriers input; motivational interviewing customization | Weekly starter plan table; "Why These Changes Matter" motivation section; quality-of-input guidance in notes; cross-links to Follow-Up Visit Prep |
| Input structure | Detailed PATIENT CONTEXT (age, condition, current lifestyle, barriers) | Generic CLINICAL INFORMATION |

**Recommendation: MERGE into one template.** The `lifestyle-modification-plan.mdx` version is stronger (more sections, weekly starter plan, progress tracking). Incorporate the explicit PATIENT CONTEXT input format (age, barriers), SMART goals section, and motivational interviewing customization from `lifestyle-modification.mdx`. Deprecate `lifestyle-modification.mdx`.

**Effort:** L (merge, incorporate best elements from both)

---

### 4. `medication-instructions.mdx` vs `new-medication-guide.mdx`

**Overlap severity:** MODERATE — overlapping purpose but somewhat different angles.

| Aspect | medication-instructions | new-medication-guide |
|--------|------------------------|---------------------|
| Title | "Medication Instructions: Plain Language" | "New Medication Guide" |
| Target tool | Claude | Any |
| Role in prompt | "pharmacist explaining a new medication" | "physician creating a medication guide" |
| Output sections | 7 (What for, How to take, Avoid, Side effects, Call doctor, Emergency help, Reminders) | 6 (What for, How to take, Common side effects, Serious side effects, Things to avoid, Storage) |
| Unique value | Handles multiple medications at once; emergency help section; standard reminders section | Missed-dose instructions; storage instructions; pitfall callout about AI medication errors; more specialty variations (insulin, controlled substance, antibiotic) |
| Strength | Better for discharge med reconciliation (multiple meds) | Better for single new prescription education |

**Recommendation: KEEP BOTH with clearer differentiation.** These serve different use cases: `medication-instructions.mdx` is for **batch medication education** (discharge med reconciliation — multiple meds at once), while `new-medication-guide.mdx` is for **single new prescription education** (deeper detail per medication). Actions needed:
1. Rename `medication-instructions.mdx` to emphasize the multi-medication/discharge use case (e.g., "Discharge Medication Summary")
2. Each template should explicitly cross-link to the other with guidance on when to use which
3. Add the AI-error pitfall callout from `new-medication-guide.mdx` to `medication-instructions.mdx`

**Effort:** M (rename, add cross-links, add callout)

---

## Cross-File Observations

### Systemic Issues (apply to all 16 templates)

1. **No example output anywhere.** This is the single largest gap. Every template scores 1/5 on this dimension. Adding example output would be the highest-impact improvement across the collection. Estimated effort: M per template (16M total).

2. **No dedicated Variations sections.** All templates use a customization table (which is useful) but none provide full alternate prompt variations with concrete examples. The customization table tells users *what to change*; a Variations section shows them *what the changed prompt looks like*. Estimated effort: M per template.

3. **Non-canonical section names.** All templates use "Prompt Template" / "Customization Guide" / "Notes" instead of the canonical "The prompt" / "How to customize" / "Tips & pitfalls". This is a consistent pattern (good for internal consistency) but doesn't match the documented standard. Estimated effort: S per template (mechanical rename).

4. **Cross-linking is sparse.** Templates that naturally pair (procedure-prep + post-procedure-care, medication-instructions + discharge-instructions, lifestyle-modification + follow-up-visit-prep) rarely link to each other. The literature-review templates form a natural pipeline (research-question → article-summary → evidence-comparison → journal-club-prep → guideline-summary) but this flow is not documented. Estimated effort: S per template.

5. **Literature-review templates lack HIPAA callouts.** This is arguably appropriate (published literature contains no PHI), but 2 of 5 lack any safety/limitations callout. `evidence-comparison.mdx` has an "evidence" callout, and `research-question.mdx` has a "tip" callout — good models to follow. Consider adding a brief "Limitations" or "Evidence Quality" callout to `article-summary.mdx`, `journal-club-prep.mdx`, and `guideline-summary.mdx` noting that AI may misread statistics or fabricate citations. Estimated effort: S per template.

### Strengths

1. **Prompt engineering quality is consistently good.** All prompts include role assignment, reading-level specification, structured output sections, and anti-jargon instructions. The patient-education templates are particularly well-engineered for health literacy.

2. **Customization tables are a strong pattern.** Present in 14/16 templates, they provide a scannable way to adapt the prompt. This pattern should be preserved even as Variations sections are added.

3. **HIPAA callouts in patient-education templates are thorough and consistent.** All 11 patient-education templates have appropriate de-identification warnings.

4. **Anti-fabrication instructions in literature-review prompts.** Templates like article-summary, evidence-comparison, and guideline-summary explicitly instruct the AI not to fabricate data. This is a strong safety practice.

5. **Freshness is not a concern.** All templates updated 2026-03-18, with no stale tool or model references.

### Priority Remediation Sequence

| Priority | Action | Templates Affected | Effort | Impact |
|----------|--------|-------------------|--------|--------|
| 1 | Add example output to all 16 templates | All 16 | 16 × M | Fixes the lowest-scoring dimension (1.0 average) |
| 2 | Merge diagnosis-explainer + condition-explainer | 2 → 1 | L | Eliminates high-overlap duplicate |
| 3 | Merge discharge-instructions-patient + discharge-instructions | 2 → 1 | L | Eliminates high-overlap duplicate with identical title |
| 4 | Merge lifestyle-modification + lifestyle-modification-plan | 2 → 1 | L | Eliminates moderate-high overlap |
| 5 | Add cross-links between related templates | All 16 | 16 × S | Fixes second-lowest dimension (2.6 average) |
| 6 | Add Variations sections with alternate prompts | All 16 | 16 × M | Fixes third-lowest dimension (1.9 average) |
| 7 | Rename sections to canonical names | All 16 | 16 × S | Improves consistency score |
| 8 | Differentiate medication-instructions vs new-medication-guide | 2 | M | Clarifies when to use which |
| 9 | Add How to customize to journal-club-prep and evidence-comparison | 2 | 2 × S | Fills missing section |
| 10 | Add safety/limitations callouts to remaining literature-review templates | 3 | 3 × S | Improves Instructions score |
