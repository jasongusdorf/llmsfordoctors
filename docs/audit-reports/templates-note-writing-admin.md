# Audit Report: Note-Writing & Admin-Billing Templates

**Auditor:** Claude (automated)
**Date:** 2026-03-22
**Rubric:** `/docs/content-standards.md` (6 shared + 5 template-specific dimensions, 1-5 scale)
**Templates audited:** 10 (5 note-writing, 5 admin-billing)

---

## SOAP Progress Note
**File:** `src/content/templates/progress-note-soap.mdx`
**Category:** note-writing
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Clean formatting, scannable prompt with headers and bullet lists |
| Actionability | 4 | Prompt is ready to paste; customization table gives concrete next steps |
| Navigation | 3 | Headers exist but section names deviate from canonical labels ("Customization Guide" vs "How to customize", "Notes" vs "Tips & pitfalls") |
| Audience Fit | 4 | Intro explicitly mentions residents and attendings; layered well |
| Freshness | 4 | No stale references; tool-agnostic enough to stay current |
| Cross-linking | 1 | No links to related templates (discharge summary, consult note), guides, or workflows |
| Prompt Quality | 5 | Excellent: role, context, structured output, explicit constraints, safety guardrail ("do not infer or fabricate") |
| Instructions | 3 | Customization table present but no "When to use this" heading; usage notes are in the intro paragraph only |
| Variations | 2 | Customization table mentions ICU and specialty but provides no standalone variation prompts with concrete examples |
| Example Output | 1 | No example output showing what the LLM produces |
| Consistency | 3 | Partially follows canonical structure; uses "Notes" instead of "Tips & pitfalls" |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output

---

## Discharge Summary: Basic Template
**File:** `src/content/templates/discharge-summary-basic.mdx`
**Category:** note-writing
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent formatting; prompt sections are well-labeled, scannable |
| Actionability | 4 | Ready to paste; customization table gives concrete tweaks |
| Navigation | 3 | Three sections present but names don't match canonical labels |
| Audience Fit | 4 | Intro targets general medicine; mentions specialty-specific templates exist |
| Freshness | 4 | Current, no dated references |
| Cross-linking | 1 | Mentions "specialty-specific templates" but provides no actual links |
| Prompt Quality | 5 | Strong: role set as hospitalist, detailed section structure, concise constraints |
| Instructions | 3 | Customization table present but no explicit "When to use this" section heading |
| Variations | 2 | Mentions cardiology/oncology/surgical variants in Notes but no actual variation prompts |
| Example Output | 1 | No example output |
| Consistency | 3 | Same structural pattern as SOAP note; partially canonical |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output

---

## Specialty Consultation Note
**File:** `src/content/templates/consult-note.mdx`
**Category:** note-writing
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Clean, well-structured prompt; concise intro |
| Actionability | 4 | Prompt is immediately usable; customization table helps adapt |
| Navigation | 3 | Section names don't match canonical labels |
| Audience Fit | 4 | Targets consulting physicians broadly; placeholder for specialty customization |
| Freshness | 4 | Current, no stale references |
| Cross-linking | 1 | No links to related templates (referral letter, procedure note) or guides |
| Prompt Quality | 5 | Excellent: role placeholder for specialty, two input zones (consult question + clinical info), clear recommendation format, safety guardrail |
| Instructions | 3 | Good customization table; no "When to use this" heading |
| Variations | 2 | Curbside and procedural consult mentioned but not given as full alternate prompts |
| Example Output | 1 | No example output |
| Consistency | 3 | Matches site pattern partially |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output

---

## Post-Procedure Note
**File:** `src/content/templates/procedure-note.mdx`
**Category:** note-writing
**Composite Score:** 3.4

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Very well-structured prompt with standard procedure note sections |
| Actionability | 4 | Ready to use; customization table present |
| Navigation | 3 | Three sections, but non-canonical heading names |
| Audience Fit | 3 | Works broadly but no specialty-specific guidance beyond the customization table one-liners |
| Freshness | 4 | Current |
| Cross-linking | 1 | No links to related templates (consult note, SOAP note) or guides |
| Prompt Quality | 5 | Thorough: covers indication, consent, timeout, technique, findings, specimens, EBL, complications, post-procedure plan; safety guardrail present |
| Instructions | 3 | Customization table present; no "When to use this" heading |
| Variations | 1 | Customization hints exist but no standalone variations at all; a procedure note template especially needs bedside vs OR vs endoscopy variations |
| Example Output | 1 | No example output |
| Consistency | 3 | Same partial-canonical pattern |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output, Tips & pitfalls (the "Notes" section has only general advice, and it is very brief -- only two bullet points that are not labeled tips/pitfalls)

---

## Shift Handoff: I-PASS Format
**File:** `src/content/templates/handoff-signout.mdx`
**Category:** note-writing
**Composite Score:** 3.6

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Prompt clearly maps to I-PASS framework; each element is labeled |
| Actionability | 4 | Ready to use; customization table present |
| Navigation | 3 | Sections present but non-canonical labels |
| Audience Fit | 4 | Addresses residents and cross-cover scenarios; mentions evidence base |
| Freshness | 5 | Cites Starmer et al. NEJM 2014 -- landmark study, still current evidence for I-PASS |
| Cross-linking | 1 | No links to related content |
| Prompt Quality | 5 | Well-engineered: I-PASS framework clearly mapped, "if/then" contingency planning is a strong addition, safety guardrail present |
| Instructions | 3 | Customization table present; no "When to use this" heading |
| Variations | 2 | Cross-cover and service-specific mentioned in customization table but no standalone variation prompts |
| Example Output | 1 | No example output |
| Consistency | 3 | Same partial-canonical pattern as other note-writing templates |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output

---

## Insurance Denial Appeal Letter
**File:** `src/content/templates/appeal-letter.mdx`
**Category:** admin-billing
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Extremely well-structured prompt; sections mirror the actual letter structure |
| Actionability | 4 | Ready to use; input placeholders are specific and helpful |
| Navigation | 3 | Non-canonical section names |
| Audience Fit | 4 | Appropriate for any physician dealing with denials; regulatory section adds depth |
| Freshness | 4 | References step therapy reform laws, mental health parity -- current topics |
| Cross-linking | 1 | No links to peer-to-peer prep template (natural companion) or prior-auth template |
| Prompt Quality | 5 | Excellent: role, structured letter sections, tone instruction, regulatory/contractual arguments, three input zones (denial info, clinical info, prior auth letter) |
| Instructions | 3 | Customization table present; no "When to use this" heading |
| Variations | 2 | Customization table mentions first/second/external appeal levels but no standalone variation prompts |
| Example Output | 1 | No example output |
| Consistency | 3 | Matches partial-canonical pattern |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output

---

## Prior Authorization Letter
**File:** `src/content/templates/prior-authorization.mdx`
**Category:** admin-billing
**Composite Score:** 3.7

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Clear, professional prompt structure; excellent input placeholders |
| Actionability | 5 | Immediately usable; tip callout about pasting insurer's own criteria is highly actionable |
| Navigation | 3 | Non-canonical section names |
| Audience Fit | 4 | Works for any physician; extra tip callout adds depth for power users |
| Freshness | 4 | Current; references ICD-10 codes, step therapy -- standard current workflow |
| Cross-linking | 1 | No links to appeal-letter or peer-to-peer templates (the natural next steps if prior auth is denied) |
| Prompt Quality | 5 | Excellent: role, structured letter format, evidence-citation instruction, step therapy documentation, tone guidance |
| Instructions | 3 | Customization table present; bonus tip callout about insurer criteria; no "When to use this" heading |
| Variations | 2 | Customization mentions DME, specialty medication but no standalone variations |
| Example Output | 1 | No example output |
| Consistency | 4 | Extra callout (tip) shows slightly more polish than other templates; otherwise same pattern |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output

---

## Specialist Referral Letter
**File:** `src/content/templates/referral-letter.mdx`
**Category:** admin-billing
**Composite Score:** 3.4

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Clean, well-organized prompt structure |
| Actionability | 4 | Ready to use; input placeholders helpful |
| Navigation | 3 | Non-canonical section names |
| Audience Fit | 3 | Assumes primary care referring physician; doesn't address specialist-to-specialist referrals |
| Freshness | 4 | Current |
| Cross-linking | 1 | No links to consult note template (the receiving specialist's counterpart) or prior-auth template |
| Prompt Quality | 4 | Good: role, structured letter, "What I'm Hoping For" section is practical; lacks explicit safety guardrail ("do not fabricate") present in other templates |
| Instructions | 3 | Customization table present; no "When to use this" heading |
| Variations | 1 | No variations at all; a referral letter especially needs PCP-to-specialist vs specialist-to-specialist vs urgent referral variations |
| Example Output | 1 | No example output |
| Consistency | 3 | Same partial-canonical pattern; missing Notes/Tips section entirely |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output, Tips & pitfalls (no "Notes" section at all)

---

## Peer-to-Peer Review Preparation
**File:** `src/content/templates/peer-to-peer-prep.mdx`
**Category:** admin-billing
**Composite Score:** 3.6

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent structure; time-stamped sections mirror the actual phone call flow |
| Actionability | 5 | Immediately actionable -- produces a call script with timing guidance |
| Navigation | 3 | Non-canonical section names |
| Audience Fit | 4 | Targets any physician doing P2P calls; practical advice in Notes |
| Freshness | 4 | Current |
| Cross-linking | 1 | No links to appeal-letter (the written follow-up) or prior-auth template |
| Prompt Quality | 5 | Excellent: role, time-budgeted sections, anticipated pushback section, "key numbers to have ready" -- very well-engineered for the real-world task |
| Instructions | 3 | Customization table present; no "When to use this" heading |
| Variations | 2 | Customization mentions adversarial vs collaborative tone but no standalone variations |
| Example Output | 1 | No example output |
| Consistency | 3 | Same partial-canonical pattern |

**Missing Canonical Sections:** When to use (as labeled heading), Variations (standalone section with concrete alternate prompts), Example output

---

## Medical Decision-Making Documentation
**File:** `src/content/templates/mdm-complexity.mdx`
**Category:** admin-billing
**Composite Score:** 3.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Well-structured prompt mapping to CMS MDM elements; clear classification levels |
| Actionability | 4 | Produces structured MDM documentation ready for review |
| Navigation | 3 | Non-canonical section names |
| Audience Fit | 4 | Addresses physicians needing coding support; pitfall callout warns about limitations |
| Freshness | 5 | References 2021 CMS E&M guidelines -- current standard |
| Cross-linking | 1 | No links to SOAP note template or billing/coding guides |
| Prompt Quality | 5 | Excellent: maps precisely to 2021 CMS MDM elements, includes E&M code ranges, safety guardrail present |
| Instructions | 3 | Has a pitfall callout (good), customization section is absent entirely |
| Variations | 1 | No variations at all; needs inpatient vs outpatient vs ED variations, and time-based billing alternative |
| Example Output | 1 | No example output |
| Consistency | 3 | Partially canonical; missing customization guide section entirely (the only template of the 10 that lacks one) |

**Missing Canonical Sections:** When to use (as labeled heading), How to customize (no customization guide at all), Variations (standalone section), Example output

---

# Summary

## Composite Scores

| Template | Category | Composite |
|----------|----------|-----------|
| SOAP Progress Note | note-writing | 3.5 |
| Discharge Summary | note-writing | 3.5 |
| Consultation Note | note-writing | 3.5 |
| Post-Procedure Note | note-writing | 3.4 |
| Shift Handoff (I-PASS) | note-writing | 3.6 |
| Appeal Letter | admin-billing | 3.5 |
| Prior Authorization | admin-billing | 3.7 |
| Referral Letter | admin-billing | 3.4 |
| Peer-to-Peer Prep | admin-billing | 3.6 |
| MDM Complexity | admin-billing | 3.5 |

**Overall average:** 3.52

## Missing Canonical Sections Summary

The 7 canonical sections are: (1) When to use, (2) HIPAA callout, (3) The prompt, (4) How to customize, (5) Variations, (6) Example output, (7) Tips & pitfalls.

| Section | Present in X/10 templates | Notes |
|---------|--------------------------|-------|
| When to use (labeled heading) | 0/10 | All templates have an intro paragraph serving this purpose, but none use a dedicated "When to use this" heading |
| HIPAA callout | 10/10 | All templates include a HIPAA callout component |
| The prompt | 10/10 | All templates include a PromptPlayground component |
| How to customize | 9/10 | MDM Complexity is the only template missing a customization guide |
| Variations | 0/10 | No template has a standalone Variations section with concrete alternate prompts |
| Example output | 0/10 | No template shows what the LLM actually produces |
| Tips & pitfalls | 8/10 | Post-Procedure Note and Referral Letter lack a meaningful tips section (procedure note has minimal "Notes"; referral letter has none) |

**Key finding:** 10/10 templates are missing Example Output and Variations sections. 10/10 are missing a labeled "When to use this" heading. These are the three most systemic gaps across both categories.

## Overlap Assessment

### Appeal Letter vs. Prior Authorization
These templates serve **sequential, distinct** clinical scenarios and do NOT overlap problematically:
- **Prior Authorization** is used *before* a denial, to request initial approval.
- **Appeal Letter** is used *after* a denial, to contest the decision.
- The appeal template even includes an input zone for pasting the prior auth letter, showing they are designed as a workflow sequence.
- **Recommendation:** Add cross-links between them and to the Peer-to-Peer Prep template to make the workflow sequence explicit.

### Appeal Letter vs. Peer-to-Peer Prep
These also serve **distinct modalities** (written letter vs. phone call script) and do NOT overlap. They are complementary -- a physician might use peer-to-peer prep for the call and appeal letter for the written follow-up.
- **Recommendation:** Cross-link these three admin-billing insurance templates (prior-auth -> peer-to-peer -> appeal letter) as a denial-management workflow.

### MDM Complexity vs. Note-Writing Content
MDM Complexity focuses on **billing/coding documentation** (structuring encounter data for E&M level determination), while note-writing templates focus on **clinical documentation** (SOAP notes, discharge summaries, etc.). These serve different purposes and do NOT overlap.
- **Potential confusion:** A physician might wonder whether to use the SOAP Progress Note or MDM Complexity template for a clinic visit. The SOAP template writes the clinical note; MDM Complexity structures the billing documentation. This distinction should be made explicit via cross-links or a "When to use this" section.

### Consult Note vs. Referral Letter
These could cause reader confusion:
- **Consult Note** is the specialist's response *after* seeing the patient.
- **Referral Letter** is the referring physician's request *before* the consult.
- These are complementary but a reader might not immediately know which to use. **Recommendation:** Cross-link them and clarify in each template's "When to use this" section.

**No problematic overlaps found. All templates serve distinct clinical scenarios.**

## Cross-File Observations

1. **Cross-linking is the weakest dimension across all 10 templates.** Every template scored 1/5. The admin-billing templates form a natural workflow (prior auth -> denial -> peer-to-peer -> appeal) but none link to each other. The note-writing templates are related by clinical setting (admission -> progress note -> consult -> procedure -> discharge -> handoff) but none link to each other.

2. **Example Output is universally absent.** This is the single highest-impact gap. Physicians cannot evaluate whether a template will produce useful output without seeing a sample. Adding realistic example output to all 10 templates would significantly improve usability and trust.

3. **Variations are universally absent as standalone sections.** Several templates mention variations in their customization tables (e.g., ICU format, curbside consult) but none provide complete alternate prompts. The customization tables are a partial substitute but don't meet the rubric standard.

4. **Prompt Quality is the strongest dimension across all 10 templates.** Every template scored 4-5/5. The prompts are well-engineered with roles, structured output, clear constraints, and safety guardrails. This is the site's greatest strength.

5. **Structural consistency is high but non-canonical.** All 10 templates follow the same 3-section pattern (intro + HIPAA callout, Prompt Template, Customization Guide + Notes) consistently, but this pattern does not match the 7-section canonical structure defined in the content standards. Remediation should rename/restructure existing sections and add the three missing sections (When to use, Variations, Example output) to all templates.

6. **The "Notes" sections function as Tips & pitfalls but are too brief.** Most are 2-3 bullet points. Expanding these with common failure modes, edge cases, and AI-specific pitfalls would strengthen them.

7. **MDM Complexity is an outlier** -- it is the only template missing a Customization Guide entirely, and it has an extra pitfall callout that no other template uses (a positive differentiator that should be adopted more broadly).
