# Templates Buildout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 29 new MDX template files and update 1 existing template to populate all 6 categories with clinical prompt templates.

**Architecture:** Pure content additions — no schema, layout, or component changes. Each template is a standalone `.mdx` file in `src/content/templates/` following the established pattern from `discharge-summary-basic.mdx`. Templates are grouped by category and built in batches of 5.

**Tech Stack:** Astro 6, MDX, existing `Callout.astro` and `PromptPlayground.astro` components.

**Spec:** `docs/superpowers/specs/2026-03-18-templates-buildout-design.md`

**Base path:** All file paths relative to project root at `/Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors/`

---

### Task 1: Update existing template + verify build baseline

**Files:**
- Modify: `src/content/templates/discharge-summary-basic.mdx:6`

- [ ] **Step 1: Update tags on existing template**

Change line 6 of `src/content/templates/discharge-summary-basic.mdx` from:
```yaml
tags: [discharge, inpatient, documentation, note-writing]
```
to:
```yaml
tags: [beginner, note-writing, discharge, inpatient, documentation]
```

- [ ] **Step 2: Verify build succeeds**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build completes successfully with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/templates/discharge-summary-basic.mdx
git commit -m "Update discharge summary tags to match new convention"
```

---

### Task 2: Note-Writing templates (4 new)

**Files:**
- Create: `src/content/templates/progress-note-soap.mdx`
- Create: `src/content/templates/consult-note.mdx`
- Create: `src/content/templates/procedure-note.mdx`
- Create: `src/content/templates/handoff-signout.mdx`

- [ ] **Step 1: Create `progress-note-soap.mdx`**

```mdx
---
title: "SOAP Progress Note"
category: note-writing
targetTool: claude
workflow: progress-note
tags: [beginner, note-writing, progress-note, outpatient, documentation]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

A daily progress note generator that takes your clinical observations and organizes them into a clean SOAP format. Paste in your notes from the day — vitals, exam findings, labs, your assessment — and get a structured note back. Great for residents learning note structure or attendings who want a faster first draft.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="SOAP Progress Note">
You are an experienced attending physician writing a daily progress note in SOAP format.

Using the clinical information provided below, write a complete SOAP note with these sections:

**Subjective**
- Chief complaint or interval history in the patient's words (or paraphrased)
- Relevant review of systems
- Pain score if applicable
- Any overnight events or nursing concerns

**Objective**
- Vital signs (use the exact values provided)
- Physical exam findings organized by system
- Relevant lab results and imaging from the past 24 hours
- Current medications and drips if applicable

**Assessment**
- One-line summary: [Age] [sex] with [key diagnoses] who is [clinical trajectory]
- Problem-based assessment with numbered problem list

**Plan**
- Numbered plan corresponding to each problem in the assessment
- Include: medication changes, consults, diagnostics ordered, disposition planning
- Each plan item should be 1–3 bullet points

Do not infer or fabricate any clinical information not provided. If data is missing for a section, write "[Not provided — update before signing]". Flag any assumptions.

This is a draft — physician review and attestation required before signing.

---
CLINICAL INFORMATION:
[Paste your clinical notes, vitals, labs, exam findings, and plan items here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Specialty | Add: "This is a [SPECIALTY] service note. Emphasize [SPECIALTY]-relevant findings." |
| Brevity | Add: "Keep the plan to one line per problem. No bullet sub-points." |
| Teaching note | Add: "Include a brief teaching point for each problem in the assessment." |
| ICU format | Add: "Use an ICU-style systems-based format instead of problem-based." |

---

## Notes

- This template works best when you paste in **raw data** (vitals, labs, exam findings) rather than a pre-formatted note. The AI adds the structure.
- For ICU notes, consider switching to a systems-based format — add that instruction to the prompt.
- Always verify vital signs and lab values against the actual chart before signing.
```

- [ ] **Step 2: Create `consult-note.mdx`**

```mdx
---
title: "Specialty Consultation Note"
category: note-writing
targetTool: claude
workflow: consult-note
tags: [intermediate, note-writing, consult, documentation]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates a structured consultation note from the requesting team's question and your clinical findings. Follows the standard consult format: reason for consult, HPI, relevant history, exam, data review, assessment, and recommendations.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Specialty Consultation Note">
You are a [SPECIALTY] consultant writing a formal consultation note in response to a consult request.

Using the clinical information below, write a consultation note with these sections:

**Reason for Consultation**
State the specific clinical question asked by the requesting team.

**History of Present Illness**
Relevant narrative focused on the consult question. Include pertinent positives and negatives. Be concise — this is not a full admission H&P.

**Relevant Past Medical/Surgical History**
Only history relevant to the consult question.

**Medications**
Current medications relevant to the consult question.

**Examination**
Focused physical exam findings relevant to your specialty assessment.

**Data Review**
Relevant labs, imaging, pathology, or other diagnostics. Include dates and trends where applicable.

**Assessment**
Your clinical impression. State the most likely diagnosis or differential, supported by the data above.

**Recommendations**
Numbered list of specific, actionable recommendations. Each should be clear enough for the primary team to execute without additional clarification. Include:
- Diagnostic workup to order
- Medication changes (with doses)
- Follow-up plan and when to re-consult

Thank you for this consultation. We will continue to follow.

Do not infer or fabricate any clinical information not provided. Flag any assumptions clearly.

---
CONSULT QUESTION:
[What the requesting team is asking]

CLINICAL INFORMATION:
[Paste relevant clinical data: HPI, PMH, meds, exam, labs, imaging]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Specialty | Replace `[SPECIALTY]` with your field (e.g., cardiology, nephrology, ID) |
| Urgency | Add: "This is an urgent/emergent consultation. Lead with recommendations." |
| Curbside | Add: "This is a brief curbside — limit to assessment and 3 key recommendations." |
| Follow-up | Add: "Include a follow-up note section with contingency plans." |

---

## Notes

- The "Thank you for this consultation" closing is a convention. Remove it if your institution doesn't use it.
- For procedural consults (e.g., GI for EGD), add the procedure indication and risk discussion to the recommendations.
- Always verify that your recommendations match what you actually discussed with the primary team.
```

- [ ] **Step 3: Create `procedure-note.mdx`**

```mdx
---
title: "Post-Procedure Note"
category: note-writing
targetTool: claude
workflow: procedure-note
tags: [intermediate, note-writing, procedure, documentation]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates a structured post-procedure note from your procedure details. Covers indication, consent, technique, findings, specimens, complications, and post-procedure plan.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Post-Procedure Note">
You are a physician writing a post-procedure note for the medical record.

Using the procedure details below, write a structured procedure note with these sections:

**Procedure:** [Name of procedure performed]
**Date:** [DATE OF PROCEDURE]
**Operator(s):** [OPERATOR ROLE — e.g., "Attending with resident assistance"]
**Assistant(s):** [If applicable]

**Indication**
One to two sentences stating why the procedure was performed.

**Consent**
State how consent was obtained (e.g., "Informed consent obtained from the patient after discussion of risks, benefits, and alternatives" or "Emergency — consent waived").

**Timeout**
Confirm timeout was performed per institutional protocol.

**Technique**
Step-by-step narrative of the procedure in the order performed. Include:
- Patient positioning and preparation
- Anesthesia/sedation used (type, dose if provided)
- Anatomic landmarks or imaging guidance used
- Key technical steps
- Any deviations from standard technique

**Findings**
Describe what was found or visualized during the procedure.

**Specimens**
List any specimens obtained and where they were sent (e.g., pathology, culture, cytology). Write "None" if no specimens.

**Estimated Blood Loss:** [EBL]
**Complications:** [None / describe]

**Post-Procedure Plan**
- Monitoring instructions
- Activity restrictions
- Follow-up plan
- Pending results

Do not infer or fabricate any clinical details not provided. If a section's data is missing, write "[Verify and complete before signing]".

---
PROCEDURE DETAILS:
[Paste your procedure details: what you did, findings, complications, specimens, etc.]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Procedure type | Add: "This is a [bedside/OR/endoscopic/interventional] procedure" for appropriate formatting |
| Brevity | Add: "Keep the technique section to 3–4 sentences maximum" |
| Teaching | Add: "Note the trainee's level of participation in each step" |
| Billing | Add: "Include time start/stop for procedures billed by time" |
```

- [ ] **Step 4: Create `handoff-signout.mdx`**

```mdx
---
title: "Shift Handoff — I-PASS Format"
category: note-writing
targetTool: claude
workflow: shift-handoff
tags: [intermediate, note-writing, handoff, signout, patient-safety]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates a structured patient handoff using the I-PASS framework (Illness severity, Patient summary, Action list, Situation awareness, Synthesis by receiver). Paste in your patient's current status and get a concise, safety-focused signout.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Shift Handoff — I-PASS">
You are a physician preparing a structured shift handoff for the incoming team using the I-PASS framework.

Using the patient information below, generate a concise handoff for each patient:

**I — Illness Severity**
One word: STABLE / WATCHER / UNSTABLE

**P — Patient Summary**
Two to three sentence summary: [Age] [sex] with [key history] admitted for [reason], hospital day [X]. Current status: [brief trajectory].

**A — Action List**
Bulleted list of specific to-do items for the incoming team:
- Tasks that MUST be done (with timeframes)
- Pending results to follow up
- Medication timing (e.g., "Next dose of vancomycin at 22:00 — check trough before")

**S — Situation Awareness & Contingency Planning**
"If…then" statements for likely overnight scenarios:
- "If BP drops below 90 systolic → [specific action]"
- "If fever spikes → [specific action]"
- "If family calls → [what to tell them / who to contact]"

**S — Synthesis by Receiver**
Leave blank — to be completed verbally during handoff.

Keep each patient's handoff to one page maximum. Prioritize safety-critical information. Use exact values for vitals, labs, and medication doses.

Do not infer or fabricate any clinical information not provided. Flag any assumptions.

---
PATIENT INFORMATION:
[Paste current patient status: diagnoses, active issues, recent events, vitals, key labs, meds, pending items, and anticipated overnight issues]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Multiple patients | Add: "Generate a separate I-PASS handoff for each patient below, separated by a horizontal rule" |
| Code status | Add: "Include code status and goals of care at the top of each patient" |
| Cross-cover | Add: "This is a cross-cover handoff. I am not the primary team. Focus on overnight action items only." |
| Service-specific | Add: "This is a [surgery/ICU/OB] service. Adjust the contingency plans for [service]-specific emergencies." |

---

## Notes

- I-PASS has been shown to reduce medical errors during handoffs by up to 30% (Starmer et al., NEJM 2014).
- The "Synthesis by Receiver" section is intentionally left blank — it's meant to be completed during the live verbal handoff as a read-back.
- For cross-cover signout, prioritize anticipatory guidance over background history.
```

- [ ] **Step 5: Verify build succeeds**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build completes with 4 new template pages generated.

- [ ] **Step 6: Commit**

```bash
git add src/content/templates/progress-note-soap.mdx src/content/templates/consult-note.mdx src/content/templates/procedure-note.mdx src/content/templates/handoff-signout.mdx
git commit -m "Add note-writing templates: SOAP, consult, procedure, handoff"
```

---

### Task 3: Clinical-Reasoning templates (5 new)

**Files:**
- Create: `src/content/templates/differential-diagnosis.mdx`
- Create: `src/content/templates/case-summary-assessment.mdx`
- Create: `src/content/templates/lab-interpretation.mdx`
- Create: `src/content/templates/medication-reconciliation.mdx`
- Create: `src/content/templates/risk-stratification.mdx`

- [ ] **Step 1: Create `differential-diagnosis.mdx`**

```mdx
---
title: "Differential Diagnosis Generator"
category: clinical-reasoning
targetTool: claude
workflow: differential-diagnosis
tags: [intermediate, clinical-reasoning, diagnosis, differential]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates a structured differential diagnosis from a clinical presentation. Provide the chief complaint, key history, and findings, and get an organized DDx ranked by likelihood with supporting and opposing evidence for each.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

<Callout type="pitfall">
  AI-generated differentials are a thinking aid, not a diagnostic tool. They can miss rare conditions and may over-weight common diagnoses. Always apply your own clinical judgment.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Differential Diagnosis Generator">
You are an experienced diagnostician helping to generate a structured differential diagnosis.

Given the clinical presentation below, provide:

**Top 5 Differential Diagnoses** (ranked by likelihood)

For each diagnosis:
1. **Diagnosis name**
2. **Likelihood:** High / Moderate / Low
3. **Supporting evidence:** Specific findings from the presentation that support this diagnosis
4. **Opposing evidence:** Findings that argue against it, or expected findings that are absent
5. **Key next step:** The single most useful test or action to confirm or rule out this diagnosis

**Must-Not-Miss Diagnoses**
List any dangerous diagnoses that should be ruled out even if unlikely, with the specific test or evaluation needed for each.

**Synthesis**
In 2–3 sentences, state the most likely unifying diagnosis and your recommended initial workup approach.

Do not infer any history, findings, or test results not explicitly provided. If critical information is missing, state what additional history or data would help narrow the differential.

---
CLINICAL PRESENTATION:
Chief Complaint: [CHIEF COMPLAINT]
Age/Sex: [AGE AND SEX]
Key History: [RELEVANT HISTORY, TIMING, ASSOCIATED SYMPTOMS]
Exam Findings: [PERTINENT PHYSICAL EXAM FINDINGS]
Initial Data: [ANY LABS, IMAGING, OR VITALS AVAILABLE]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Depth | Add: "Expand to top 10 diagnoses" or "Limit to top 3" |
| Specialty focus | Add: "Focus on [cardiology/neurology/GI] diagnoses" |
| Pediatric | Add: "This is a pediatric patient. Use age-appropriate differentials." |
| EM setting | Add: "This is an emergency department presentation. Prioritize time-sensitive diagnoses." |

---

## Notes

- This template is for clinical reasoning support, not board prep. For practice differentials, see the **Differential Diagnosis Drill** template in Board Prep.
- The "must-not-miss" section is the most clinically valuable part — use it as a safety checklist.
- Works best when you include pertinent negatives, not just positive findings.
```

- [ ] **Step 2: Create `case-summary-assessment.mdx`**

```mdx
---
title: "Case Summary & Assessment/Plan"
category: clinical-reasoning
targetTool: claude
workflow: case-assessment
tags: [intermediate, clinical-reasoning, assessment, plan, case-summary]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Synthesizes a complex patient case into a concise summary statement and problem-based assessment and plan. Useful for organizing your thoughts on a complicated patient or preparing for attending rounds.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Case Summary & Assessment/Plan">
You are an experienced attending physician synthesizing a complex patient case.

Using the clinical information below, generate:

**One-Line Summary**
[Age] [sex] with [key PMH] presenting with [chief complaint] found to have [key findings], most likely representing [leading diagnosis].

**Problem List** (numbered, by clinical priority)

For each problem:

**Problem #[N]: [Problem Name]**
- **Assessment:** 2–3 sentences synthesizing the relevant data and your clinical reasoning for this problem. State the most likely etiology and key supporting evidence.
- **Plan:**
  - Diagnostics: tests to order or pending
  - Therapeutics: medications, procedures, or interventions (with doses where applicable)
  - Monitoring: what to watch and how often
  - Disposition: how this problem affects discharge planning

**Disposition Summary**
One to two sentences on overall trajectory and anticipated discharge timeline.

Do not infer or fabricate any clinical information not provided. If data is missing for a problem, note what is needed. This is a draft — physician review required.

---
CLINICAL INFORMATION:
[Paste the full clinical picture: HPI, PMH, meds, exam, vitals, labs, imaging, hospital course to date]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Attending style | Add: "Use a brief, assertion-based style — lead each assessment with your conclusion, not the data" |
| Systems-based | Add: "Organize by organ system instead of problem-based" |
| Teaching format | Add: "For each problem, include the key teaching point or clinical pearl" |
| Brevity | Add: "Limit each problem to 3 lines maximum" |

---

## Notes

- This works best when you paste in raw clinical data (HPI, labs, vitals, imaging) rather than a pre-written note. The AI provides the synthesis.
- For patients with 10+ active problems, consider grouping related problems (e.g., "Cardiorenal" instead of separate CHF and AKI problems).
- Always verify that your assessment matches your actual clinical reasoning — the AI summary is a draft, not your thinking.
```

- [ ] **Step 3: Create `lab-interpretation.mdx`**

```mdx
---
title: "Lab Panel Interpretation"
category: clinical-reasoning
targetTool: claude
workflow: lab-interpretation
tags: [beginner, clinical-reasoning, labs, interpretation]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Interprets a set of lab results in clinical context. Paste in the lab values and a brief clinical scenario, and get a structured interpretation highlighting abnormalities, likely causes, and suggested next steps. Designed for anyone who wants a second look at a complex panel.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

<Callout type="pitfall">
  AI may not account for lab-specific reference ranges at your institution, specimen handling issues, or interfering substances. Always correlate with your institution's reference ranges and the clinical picture.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Lab Panel Interpretation">
You are an experienced internist interpreting laboratory results.

Given the lab values and clinical context below, provide:

**Abnormal Values**
List each abnormal result with:
- The value and whether it is high or low
- The normal reference range
- Clinical significance in this patient's context

**Pattern Recognition**
Identify any recognizable lab patterns (e.g., anion gap metabolic acidosis, iron deficiency pattern, DIC labs, hepatocellular vs. cholestatic pattern). Explain the pattern and what it suggests.

**Most Likely Explanation**
In 2–3 sentences, state the most likely clinical explanation for the overall lab picture given the patient's context.

**Recommended Next Steps**
Bulleted list of additional labs, imaging, or clinical actions suggested by these results. Prioritize by clinical urgency.

**Critical Values**
Flag any values that require immediate clinical action, with the recommended response.

Do not fabricate reference ranges or normal values — use standard adult reference ranges unless told otherwise. If the clinical context is insufficient to interpret a result, say so.

---
CLINICAL CONTEXT:
[AGE, SEX, KEY DIAGNOSES, REASON LABS WERE DRAWN, RELEVANT MEDICATIONS]

LAB VALUES:
[Paste lab results here — include all values, units, and any flagged abnormals]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Pediatric | Add: "Use pediatric reference ranges. Patient age: [AGE]." |
| Trending | Add: "Here are the prior values for comparison: [PRIOR LABS]. Comment on trends." |
| Specific panel | Add: "Focus on the [hepatic/renal/coagulation/thyroid] panel" |
| Teaching | Add: "Explain each abnormality as if teaching a medical student" |

---

## Notes

- Reference ranges vary by institution, assay, and patient population. Always verify against your own lab's reference ranges.
- For trending results, paste multiple time points — the AI will comment on the trajectory.
- This template works for any lab panel: BMP, CMP, CBC, coag studies, LFTs, iron studies, thyroid, etc.
```

- [ ] **Step 4: Create `medication-reconciliation.mdx`**

```mdx
---
title: "Medication Reconciliation Review"
category: clinical-reasoning
targetTool: claude
workflow: medication-reconciliation
tags: [intermediate, clinical-reasoning, medications, reconciliation, safety]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Reviews a medication list for interactions, duplications, dosing concerns, and reconciliation issues. Paste in the current medication list along with relevant clinical context (diagnoses, renal/hepatic function) and get a structured safety review.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

<Callout type="pitfall">
  AI-generated medication reviews do not replace pharmacist review or clinical decision support systems. Always verify interactions against an authoritative drug database (e.g., Lexicomp, Micromedex).
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Medication Reconciliation Review">
You are a clinical pharmacist reviewing a medication list for safety and appropriateness.

Given the medication list and clinical context below, provide:

**Drug-Drug Interactions**
For each identified interaction:
- Medications involved
- Severity: Major / Moderate / Minor
- Clinical consequence (what could happen)
- Recommendation (monitor, adjust, or discontinue)

**Therapeutic Duplications**
Flag any medications in the same class or with overlapping mechanisms. Recommend which to continue and which to consider discontinuing.

**Dosing Concerns**
Flag any doses that appear inappropriate given the clinical context:
- Renal dose adjustments needed
- Hepatic dose adjustments needed
- Age-related dosing concerns
- Supratherapeutic or subtherapeutic doses

**Missing Medications**
Based on the diagnoses provided, flag any guideline-recommended medications that are absent (e.g., statin for ASCVD, ACEi for HFrEF). Note if there may be a valid reason for omission.

**Deprescribing Opportunities**
Flag any medications that may no longer be indicated, have high side-effect burden in this patient, or are on the Beers Criteria list for older adults.

**Summary**
2–3 sentences summarizing the highest-priority medication safety concerns.

Do not fabricate interactions or dosing information. If uncertain about a specific interaction or dose, say so. Base recommendations on current clinical guidelines.

---
CLINICAL CONTEXT:
Age/Sex: [AGE AND SEX]
Key Diagnoses: [ACTIVE DIAGNOSES]
Renal Function: [CREATININE AND/OR GFR IF KNOWN]
Hepatic Function: [RELEVANT LFTS IF KNOWN]
Allergies: [DRUG ALLERGIES]

CURRENT MEDICATION LIST:
[Paste full medication list with doses and frequencies]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Transition of care | Add: "Compare this admission med list against the home med list below and flag discrepancies: [HOME MEDS]" |
| Geriatric focus | Add: "Focus on Beers Criteria and anticholinergic burden" |
| Specific concern | Add: "I am specifically concerned about [QTc prolongation / bleeding risk / serotonin syndrome]" |
| Formulary | Add: "Check for therapeutic substitutions on the [INSTITUTION] formulary" |
```

- [ ] **Step 5: Create `risk-stratification.mdx`**

```mdx
---
title: "Clinical Risk Stratification"
category: clinical-reasoning
targetTool: claude
workflow: risk-stratification
tags: [advanced, clinical-reasoning, risk-assessment, decision-support]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Applies validated clinical scoring tools to a patient presentation to support risk stratification and disposition decisions. Provide the clinical data and specify which scoring tools to apply.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

<Callout type="evidence">
  Risk scores are decision-support tools — not decision-making tools. They are validated at the population level and may not apply to every individual patient. Clinical judgment always supersedes a calculated score.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Clinical Risk Stratification">
You are an experienced clinician applying validated risk stratification tools to a clinical presentation.

Given the clinical data below, calculate and interpret the requested scoring tools:

For each score:

**[Score Name]**
- Show each component criterion and whether it is met (with the point value)
- **Total Score:** [X] points
- **Risk Category:** [Low / Intermediate / High]
- **Interpretation:** What this score means clinically (expected event rate, recommended disposition, guideline-based next step)
- **Caveat:** Any population in which this score is not validated or should be used with caution

**Comparison & Synthesis**
If multiple scores are calculated, compare the risk stratifications and note any discordance. Recommend which score is most applicable to this clinical scenario and why.

Do not fabricate score criteria, cutoff values, or validation data. Use the published scoring criteria. If a required data point for a score is missing, note it and calculate the range of possible scores.

---
CLINICAL DATA:
Age/Sex: [AGE AND SEX]
Presentation: [CHIEF COMPLAINT AND KEY FINDINGS]
Vitals: [HEART RATE, BP, RR, O2 SAT, TEMP]
Labs: [RELEVANT LAB VALUES]
History: [RELEVANT PAST HISTORY AND RISK FACTORS]

SCORES TO CALCULATE:
[List the specific scoring tools — e.g., HEART score, Wells criteria for PE, CHA₂DS₂-VASc, CURB-65, MELD, Child-Pugh, qSOFA, NEWS2, PERC, Ottawa ankle rules]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Score selection | Add: "Only calculate [SPECIFIC SCORE]" or "Recommend the most appropriate score for this presentation" |
| Population | Add: "This is a [pediatric/geriatric/pregnant] patient — note any validation limitations" |
| Serial scoring | Add: "Here are prior scores/data from [DATE]: [DATA]. Compare trend." |
| Disposition | Add: "I need to make a disposition decision — emphasize score-based disposition recommendations" |

---

## Notes

- Common scoring tools this works well with: HEART, Wells (PE and DVT), CHA₂DS₂-VASc, HAS-BLED, CURB-65, qSOFA, NEWS2, MELD, Child-Pugh, PERC, Glasgow-Blatchford, ABCD², CRB-65, APACHE II.
- If you're unsure which score to use, paste the clinical scenario and ask: "What validated risk scores apply to this presentation?"
- For serial assessments, paste both time points and ask for trend comparison.
```

- [ ] **Step 6: Verify build succeeds**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build completes with 5 new clinical-reasoning template pages generated.

- [ ] **Step 7: Commit**

```bash
git add src/content/templates/differential-diagnosis.mdx src/content/templates/case-summary-assessment.mdx src/content/templates/lab-interpretation.mdx src/content/templates/medication-reconciliation.mdx src/content/templates/risk-stratification.mdx
git commit -m "Add clinical-reasoning templates: DDx, case summary, labs, med rec, risk scores"
```

---

### Task 4: Patient-Education templates (5 new)

**Files:**
- Create: `src/content/templates/diagnosis-explainer.mdx`
- Create: `src/content/templates/medication-instructions.mdx`
- Create: `src/content/templates/procedure-prep.mdx`
- Create: `src/content/templates/discharge-instructions.mdx`
- Create: `src/content/templates/lifestyle-modification.mdx`

- [ ] **Step 1: Create `diagnosis-explainer.mdx`**

```mdx
---
title: "Diagnosis Explanation for Patients"
category: patient-education
targetTool: claude
workflow: diagnosis-education
tags: [beginner, patient-education, diagnosis, health-literacy]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Creates a patient-friendly explanation of a diagnosis. Tell it the diagnosis, the patient's background, and the desired reading level, and get a clear explanation you can share with your patient or use as the basis for a conversation. Useful for any new diagnosis discussion.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Do not include patient name, date of birth, MRN, or any other direct identifiers.
</Callout>

<Callout type="tip">
  Adjust the reading level to your patient. The default is 6th grade (average US health literacy). For patients with higher literacy, you can raise this. For patients with limited English proficiency, simplify further and consider having the output translated.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Diagnosis Explanation for Patients">
You are a caring physician explaining a new diagnosis to a patient. Write at a [READING LEVEL — e.g., 6th grade] reading level.

Create a patient-friendly explanation of the following diagnosis:

**Diagnosis:** [DIAGNOSIS NAME]

The explanation should include:

**What is it?**
Explain the condition in plain language. Use an analogy if it helps. Avoid medical jargon — if you must use a medical term, define it immediately.

**What causes it?**
Brief, simple explanation of the cause or contributing factors relevant to this patient.

**What does this mean for me?**
How this diagnosis might affect their daily life, what symptoms to expect, and the general outlook. Be honest but reassuring where appropriate.

**What's the treatment?**
Overview of treatment options in plain language. Include medications (with common brand names), lifestyle changes, procedures, or referrals they can expect.

**What should I watch for?**
Warning signs that should prompt them to call their doctor or go to the emergency room.

**Questions to ask your doctor**
3–5 suggested questions the patient can bring to their next appointment.

Use short sentences and paragraphs. Avoid abbreviations. Use "you" and "your" to address the patient directly.

---
PATIENT CONTEXT (optional):
[AGE, RELEVANT BACKGROUND, LANGUAGE PREFERENCES, ANY SPECIFIC CONCERNS THE PATIENT HAS RAISED]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Reading level | Change `[READING LEVEL]` to "4th grade" (very simple) through "10th grade" (more detailed) |
| Language | Add: "Write the explanation in [LANGUAGE]" — works well for Spanish, French, and other common languages |
| Pediatric | Add: "This is for the parent/guardian of a child. Use 'your child' instead of 'you'." |
| Chronic vs. acute | Add: "This is a chronic condition — emphasize long-term management" or "This is an acute episode — emphasize recovery timeline" |

---

## Notes

- Always review AI-generated patient education before sharing. Check for accuracy and tone.
- Consider printing or sharing digitally as a take-home resource alongside the verbal conversation.
- For complex diagnoses (e.g., cancer), this template provides a starting point — but the conversation itself matters more than the handout.
```

- [ ] **Step 2: Create `medication-instructions.mdx`**

```mdx
---
title: "Medication Instructions — Plain Language"
category: patient-education
targetTool: claude
workflow: medication-education
tags: [beginner, patient-education, medications, instructions, health-literacy]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates plain-language medication instructions for patients. Provide the medication details and get a clear explanation of what the medication does, how to take it, what to watch for, and when to call the doctor. Ideal for new prescriptions at discharge or in clinic.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Do not include patient name, date of birth, MRN, or any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Medication Instructions — Plain Language">
You are a pharmacist explaining a new medication to a patient. Write at a 6th grade reading level. Use short sentences. Avoid medical jargon.

For each medication listed below, create a simple instruction sheet:

**[Medication Name] ([Brand Name if common])**

**What is this medicine for?**
One sentence explaining why you are taking this medication.

**How do I take it?**
- Dose: [how much]
- When: [how often, what time of day]
- With or without food
- Any special instructions (e.g., "take with a full glass of water," "do not crush or chew")

**What should I avoid?**
Foods, drinks, other medications, or activities to avoid while taking this medication (e.g., "Do not drink grapefruit juice," "Avoid driving until you know how this affects you").

**Common side effects**
List 3–5 common side effects and what to do about them (e.g., "You may feel dizzy — sit down until it passes").

**When to call your doctor**
Warning signs that need medical attention (e.g., "Call your doctor right away if you notice unusual bruising or bleeding").

**When to get emergency help**
Severe reactions that require going to the ER.

**Important reminders**
- Do not stop taking this medication without talking to your doctor
- Keep out of reach of children
- Store at room temperature unless told otherwise

---
MEDICATIONS:
[List each medication with dose, frequency, and indication — e.g., "Metformin 500mg twice daily for diabetes"]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Reading level | Add: "Write at a [4th/8th/10th] grade reading level" |
| Language | Add: "Write in [LANGUAGE]" |
| Multiple meds | Add: "Create a combined medication schedule showing what to take and when throughout the day" |
| Visual format | Add: "Format as a table with columns: Time of Day, Medication, Dose, Special Instructions" |

---

## Notes

- Always verify medication instructions against the prescribing information and your institution's patient education resources.
- For high-risk medications (anticoagulants, insulin, opioids), consider supplementing with standardized institutional handouts.
- This works well for discharge medication education — pair with the Discharge Instructions template.
```

- [ ] **Step 3: Create `procedure-prep.mdx`**

```mdx
---
title: "Procedure Preparation Guide"
category: patient-education
targetTool: claude
workflow: procedure-education
tags: [intermediate, patient-education, procedure, preparation]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Creates a patient-friendly preparation guide for an upcoming procedure. Covers what to expect before, during, and after, along with preparation instructions and recovery expectations.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Do not include patient name, date of birth, MRN, or any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Procedure Preparation Guide">
You are a nurse educator preparing a patient for an upcoming procedure. Write at a 6th grade reading level. Be calm, clear, and reassuring.

Create a patient preparation guide for:

**Procedure:** [PROCEDURE NAME]
**Setting:** [Outpatient clinic / Hospital / Ambulatory surgery center]

The guide should include:

**What is this procedure?**
A simple explanation of what will happen, in 2–3 sentences. Use an analogy if helpful.

**Before your procedure**
- How to prepare in the days before (medications to stop/continue, dietary changes)
- The night before (eating/drinking restrictions, bowel prep if applicable)
- The morning of (what to wear, what to bring, when to arrive)
- Medications to take or skip on the day of the procedure

**What to expect during the procedure**
- How long it typically takes
- What kind of anesthesia or sedation to expect
- What you will feel (use reassuring, specific language — e.g., "You may feel pressure but not pain")

**After the procedure**
- What happens in recovery
- When you can eat, drink, and get up
- When you can go home (and who needs to drive you)
- Activity restrictions and for how long
- Wound care or follow-up instructions if applicable

**Warning signs — when to call us**
List 4–6 specific symptoms that should prompt a call to the office or a visit to the ER.

**Contact information**
"If you have questions before your procedure, call [OFFICE PHONE NUMBER]."

---
ADDITIONAL CONTEXT:
[Any specific instructions from the ordering physician, patient concerns, or procedure-specific details]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Pediatric | Add: "This is for the parent of a child. Use 'your child' throughout and include tips for explaining the procedure to kids." |
| Anxiety | Add: "This patient is anxious about the procedure. Use extra reassuring language and explain what will be done to keep them comfortable." |
| Language | Add: "Write in [LANGUAGE]" |
| Specific prep | Add: "Include these specific preparation instructions from the physician: [INSTRUCTIONS]" |
```

- [ ] **Step 4: Create `discharge-instructions.mdx`**

```mdx
---
title: "Patient Discharge Instructions"
category: patient-education
targetTool: claude
workflow: discharge-education
tags: [beginner, patient-education, discharge, instructions]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates plain-language discharge instructions for patients leaving the hospital or ED. Covers diagnosis summary, medication changes, activity restrictions, follow-up appointments, and return precautions. Designed to complement — not replace — your institution's standard discharge paperwork.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Patient Discharge Instructions">
You are a nurse writing discharge instructions for a patient. Write at a 6th grade reading level. Use short sentences. Be specific and actionable.

Create discharge instructions based on the information below:

**Why you were in the hospital**
In 2–3 simple sentences, explain the reason for the visit and what was found/treated.

**What we did**
Brief summary of tests, treatments, or procedures performed during the stay.

**Your medications**
For each medication change:
- **New medications:** Name, dose, how often, what it's for, and key instructions
- **Stopped medications:** Name and why it was stopped
- **Changed medications:** Name, what changed, and why

**Activity and diet**
- What you can and cannot do (lifting, driving, exercise, work)
- Dietary changes or restrictions
- For how long each restriction applies

**Follow-up appointments**
- Who to see, when, and what it's for
- Phone numbers to call for scheduling if not yet scheduled
- Any tests that need to happen before the follow-up

**Wound care** (if applicable)
Specific instructions for any incisions, drains, or wounds.

**When to call your doctor**
List specific symptoms that should prompt a call to the doctor's office.

**When to go to the emergency room**
List specific symptoms that need emergency care — be concrete (e.g., "chest pain that does not go away after 5 minutes," not just "chest pain").

---
DISCHARGE INFORMATION:
[Paste: reason for visit, diagnoses, treatments given, medication changes, activity restrictions, follow-up appointments, and any special instructions]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Reading level | Change to "4th grade" for low health literacy or "8th grade" for more detail |
| Language | Add: "Write in [LANGUAGE]" |
| Caregiver | Add: "Address instructions to the patient's caregiver rather than the patient directly" |
| Pediatric | Add: "This is for a child's parent/guardian" |

---

## Notes

- This is a supplement to your institution's standard AVS (After Visit Summary), not a replacement.
- Pair with the **Medication Instructions** template for detailed med-by-med education.
- For surgical discharges, add wound care and activity restriction details to the input.
```

- [ ] **Step 5: Create `lifestyle-modification.mdx`**

```mdx
---
title: "Lifestyle Modification Counseling"
category: patient-education
targetTool: claude
workflow: lifestyle-counseling
tags: [intermediate, patient-education, lifestyle, counseling, prevention]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates a personalized lifestyle modification plan for patients. Takes a diagnosis or health goal and creates specific, actionable recommendations for diet, exercise, sleep, stress management, and behavior change. Designed for use in primary care and chronic disease management.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Do not include patient name, date of birth, MRN, or any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Lifestyle Modification Counseling">
You are a primary care physician providing lifestyle counseling to a patient. Write at a 6th grade reading level. Be specific, encouraging, and practical — avoid vague advice like "eat healthier." Give concrete examples.

Create a personalized lifestyle modification plan for:

**Condition/Goal:** [DIAGNOSIS OR HEALTH GOAL — e.g., "newly diagnosed type 2 diabetes," "weight loss," "hypertension management"]

**Diet**
- Specific foods to eat more of (with examples and portion guidance)
- Specific foods to limit or avoid (with alternatives)
- A sample one-day meal plan
- Practical tips (grocery shopping, meal prep, eating out)

**Physical Activity**
- Specific exercise recommendations (type, duration, frequency)
- How to start if currently inactive (week-by-week ramp-up)
- Activities to avoid or modify given their condition
- Ways to add movement to daily routines

**Sleep**
- Target hours per night
- 3–5 specific sleep hygiene tips relevant to their condition

**Stress Management**
- 2–3 concrete stress reduction techniques
- How stress affects their specific condition

**Monitoring**
- What to track at home (weight, blood pressure, blood sugar, etc.)
- How often to check
- What numbers to call the doctor about

**Setting Goals**
- Suggest 2–3 SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound) the patient can start this week

End with an encouraging sentence that acknowledges change is hard but emphasizes small steps.

---
PATIENT CONTEXT:
Age/Sex: [AGE AND SEX]
Condition: [DIAGNOSIS OR HEALTH GOAL]
Current Lifestyle: [CURRENT DIET, EXERCISE HABITS, RELEVANT SOCIAL FACTORS IF KNOWN]
Barriers: [ANY KNOWN BARRIERS — e.g., limited mobility, budget constraints, food desert, shift work]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Cultural considerations | Add: "Incorporate [CULTURE]-appropriate food examples and dietary patterns" |
| Motivational interviewing | Add: "Use motivational interviewing language — emphasize autonomy and self-efficacy" |
| Specific diet | Add: "Focus on [Mediterranean / DASH / low-carb / renal] diet recommendations" |
| Comorbidities | Add: "Patient also has [COMORBIDITIES] — ensure recommendations are safe for all conditions" |
```

- [ ] **Step 6: Verify build succeeds**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build completes with 5 new patient-education template pages generated.

- [ ] **Step 7: Commit**

```bash
git add src/content/templates/diagnosis-explainer.mdx src/content/templates/medication-instructions.mdx src/content/templates/procedure-prep.mdx src/content/templates/discharge-instructions.mdx src/content/templates/lifestyle-modification.mdx
git commit -m "Add patient-education templates: diagnosis, meds, procedure prep, discharge, lifestyle"
```

---

### Task 5: Literature-Review templates (5 new)

**Files:**
- Create: `src/content/templates/article-summary.mdx`
- Create: `src/content/templates/evidence-comparison.mdx`
- Create: `src/content/templates/guideline-summary.mdx`
- Create: `src/content/templates/journal-club-prep.mdx`
- Create: `src/content/templates/research-question.mdx`

- [ ] **Step 1: Create `article-summary.mdx`**

```mdx
---
title: "Journal Article Summary"
category: literature-review
targetTool: claude
workflow: article-review
tags: [beginner, literature-review, journal, summary, evidence]
lastUpdated: 2026-03-18
---

import PromptPlayground from '../../components/PromptPlayground.astro';

Summarizes a journal article into a structured, clinician-friendly format. Paste in the abstract (or full text) and get a concise summary covering study design, population, key findings, limitations, and clinical takeaway. Great for staying current with the literature efficiently.

---

## Prompt Template

<PromptPlayground tool="Claude" title="Journal Article Summary">
You are a clinical researcher summarizing a journal article for a busy physician audience.

Given the article text below, produce a structured summary:

**Citation**
Authors, title, journal, year, DOI (extract from the provided text).

**Study Design**
One line: [RCT / Cohort / Case-control / Systematic review / Meta-analysis / Case series / etc.]

**Population**
Who was studied: sample size, inclusion/exclusion criteria, setting, demographics.

**Intervention & Comparator** (if applicable)
What was done to the intervention group vs. the control group.

**Primary Outcome**
The main outcome measured, the result, and statistical significance (include exact numbers: HR, OR, RR, ARR, NNT, p-value, 95% CI).

**Secondary Outcomes**
Key secondary outcomes with results (2–3 most important).

**Limitations**
3–5 key limitations of the study (methodological, generalizability, bias).

**Clinical Bottom Line**
In 2–3 sentences: What does this mean for clinical practice? Should this change what I do? For whom?

Do not fabricate data, statistics, or citations. If the provided text does not contain specific numbers, state "not reported in the provided text."

---
ARTICLE TEXT:
[Paste the abstract, or full text, or key sections of the article here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Depth | Add: "Include a detailed methods critique" or "Keep to 200 words total" |
| Audience | Add: "Summarize for a [specialty] audience — highlight [specialty]-relevant implications" |
| Multiple articles | Add: "Summarize each article separately, then provide a comparison of the key findings" |
| Teaching | Add: "Include 3 discussion questions for a journal club audience" |

---

## Notes

- This works best with abstracts or full-text PDFs pasted as text. For studies behind paywalls, the abstract alone produces a useful (if less detailed) summary.
- Always verify extracted statistics against the original article — AI may misread tables or confidence intervals.
- For systematic reviews and meta-analyses, consider using the **Evidence Comparison** template instead.
```

- [ ] **Step 2: Create `evidence-comparison.mdx`**

```mdx
---
title: "Treatment Evidence Comparison"
category: literature-review
targetTool: claude
workflow: evidence-comparison
tags: [advanced, literature-review, evidence, comparison, treatment]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Compares the evidence for multiple treatment options across studies. Provide the clinical question and relevant study data, and get a structured comparison table with a synthesis of the evidence.

<Callout type="evidence">
  This template helps organize evidence but does not replace a formal systematic review. Evidence quality assessments are approximate — verify against GRADE or Oxford levels of evidence frameworks for formal clinical decision-making.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Treatment Evidence Comparison">
You are a clinical epidemiologist comparing treatment evidence for a clinical question.

**Clinical Question:** [CLINICAL QUESTION — e.g., "What is the best first-line treatment for moderate ulcerative colitis?"]

Given the study data below, produce:

**Evidence Summary Table**

| Study | Design | N | Intervention | Comparator | Primary Outcome | Result (95% CI) | Quality |
|-------|--------|---|-------------|------------|-----------------|-----------------|---------|
| [Fill from data] | | | | | | | |

**Head-to-Head Comparison**
For each treatment option, summarize:
- Number and quality of supporting studies
- Magnitude of benefit (effect sizes)
- Consistency of evidence across studies
- Applicability to the clinical question

**Gaps in Evidence**
What questions remain unanswered? What populations are underrepresented? Are there head-to-head trials, or only comparisons to placebo?

**Synthesis**
In 3–5 sentences: Which treatment has the strongest evidence? For which patients? What are the key trade-offs (efficacy vs. safety vs. cost vs. adherence)?

Do not fabricate study data, statistics, or citations. If information is missing from the provided data, state what is unavailable.

---
STUDY DATA:
[Paste abstracts, data tables, or summaries of the relevant studies. Include study names/authors, designs, sample sizes, and key outcomes.]
</PromptPlayground>

---

## Notes

- For formal evidence synthesis, use GRADE methodology or consult Cochrane reviews.
- This template works best when you provide 3–5 key studies. For larger evidence bases, consider narrowing the scope.
- Pair with the **PICO Research Question Builder** template to first define the clinical question.
```

- [ ] **Step 3: Create `guideline-summary.mdx`**

```mdx
---
title: "Clinical Practice Guideline Summary"
category: literature-review
targetTool: claude
workflow: guideline-review
tags: [intermediate, literature-review, guidelines, summary]
lastUpdated: 2026-03-18
---

import PromptPlayground from '../../components/PromptPlayground.astro';

Distills a clinical practice guideline into a concise, actionable reference. Paste in the guideline text (or key sections) and get a structured summary of recommendations organized by clinical scenario.

---

## Prompt Template

<PromptPlayground tool="Claude" title="Clinical Practice Guideline Summary">
You are a clinical guidelines expert distilling a practice guideline for a physician audience.

Given the guideline text below, produce:

**Guideline Overview**
- Organization and year of publication
- Scope: What clinical question(s) does this guideline address?
- Target population
- Methodology (evidence-based, expert consensus, or mixed)

**Key Recommendations**
For each major recommendation:
- **Recommendation:** Clear, actionable statement of what to do
- **Strength:** Strong / Conditional (or Class I/IIa/IIb/III if ACC/AHA format)
- **Evidence Quality:** High / Moderate / Low / Very Low
- **Clinical Scenario:** When this recommendation applies

**Algorithm/Decision Pathway**
If the guideline includes a clinical algorithm, describe the decision pathway as a step-by-step text flowchart:
1. Start: [Starting condition]
2. If [condition A] → [action A]
3. If [condition B] → [action B]
...

**What Changed from Previous Guideline**
Highlight 3–5 key changes from the prior version (if identifiable from the text). Note any recommendations that were upgraded, downgraded, or newly added.

**Quick Reference**
A one-page cheat sheet version: the 5–7 most important recommendations a clinician needs to remember.

Do not fabricate recommendations or evidence levels. If the provided text does not include strength/quality ratings, omit those fields and note it.

---
GUIDELINE TEXT:
[Paste the guideline text, executive summary, or key recommendation sections here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Specialty filter | Add: "Focus only on recommendations relevant to [primary care/emergency medicine/hospitalist] practice" |
| Comparison | Add: "Compare this guideline against the [OTHER ORGANIZATION] guideline on the same topic" |
| Patient population | Add: "Highlight recommendations specific to [elderly/pediatric/pregnant] patients" |
| Format | Add: "Format the quick reference as a table" |

---

## Notes

- Guidelines are periodically updated. Always check that you're referencing the most current version.
- Some organizations (ACC/AHA, IDSA, ATS) use different grading systems — the AI will attempt to standardize, but verify against the source.
- This works best when you paste the full recommendation sections, not just the abstract.
```

- [ ] **Step 4: Create `journal-club-prep.mdx`**

```mdx
---
title: "Journal Club Preparation"
category: literature-review
targetTool: claude
workflow: journal-club
tags: [advanced, literature-review, journal-club, critique, teaching]
lastUpdated: 2026-03-18
---

import PromptPlayground from '../../components/PromptPlayground.astro';

Prepares a structured journal club presentation and critical appraisal. Paste in the article and get a ready-to-present summary with methodological critique, discussion questions, and clinical applicability assessment.

---

## Prompt Template

<PromptPlayground tool="Claude" title="Journal Club Preparation">
You are a faculty member preparing a journal club presentation with critical appraisal.

Given the article below, produce a journal club preparation package:

**Article Summary** (5 minutes of presentation)
- Citation, study design, population, intervention, comparator, primary outcome, key result — in a concise narrative.

**Methods Critique**
Evaluate each domain:
- **Study Design:** Is this the right design for the question? What are inherent limitations?
- **Randomization & Blinding:** Adequate? Risk of allocation or ascertainment bias?
- **Sample Size & Power:** Was the study adequately powered? Was a power calculation reported?
- **Outcome Selection:** Is the primary outcome clinically meaningful or a surrogate?
- **Analysis:** Intention-to-treat vs. per-protocol? How were missing data handled?
- **Funding & Conflicts:** Industry-funded? Potential conflicts of interest?

**Validity Assessment**
- **Internal validity:** Can we trust the results? Rate: Strong / Moderate / Weak
- **External validity:** Do these results apply to our patients? Who is missing?

**Statistics Decoded**
Explain the key statistical results in plain language. For each major result:
- What the number means clinically
- Whether the confidence interval is clinically meaningful (not just statistically significant)
- Absolute vs. relative risk reduction (calculate NNT if applicable)

**Discussion Questions**
5 thought-provoking questions for group discussion, progressing from factual to interpretive to applicability:
1. [Factual — about the study design/methods]
2. [Factual — about the results]
3. [Interpretive — about the implications]
4. [Applicability — how this applies to our practice]
5. [Big picture — how this fits into the broader evidence]

**Clinical Bottom Line**
In 2–3 sentences: Should this change practice? For whom? What's the level of certainty?

Do not fabricate data, statistics, or citations. Base all critique on what is provided in the article text.

---
ARTICLE TEXT:
[Paste the full text or abstract + methods + results sections of the article]
</PromptPlayground>

---

## Notes

- For the richest critique, paste the full text including methods and results sections, not just the abstract.
- Pair with the **Article Summary** template for a quicker, less critical overview.
- The discussion questions are designed to fill 20–30 minutes of group discussion.
```

- [ ] **Step 5: Create `research-question.mdx`**

```mdx
---
title: "PICO Research Question Builder"
category: literature-review
targetTool: claude
workflow: research-question
tags: [beginner, literature-review, pico, research, search-strategy]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Turns a clinical question into a structured PICO format and generates a literature search strategy. Describe your clinical question in plain language and get a formatted PICO, MeSH terms, and a ready-to-use PubMed search string. Perfect for evidence-based medicine assignments, research projects, or answering clinical questions systematically.

<Callout type="tip">
  PICO stands for Population, Intervention, Comparison, Outcome. It's the standard framework for formulating searchable clinical questions. This template handles therapy, diagnosis, prognosis, and etiology question types.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="PICO Research Question Builder">
You are a medical librarian helping a clinician formulate a research question and search strategy.

Given the clinical question below, provide:

**PICO Breakdown**
- **P (Population):** Who are the patients? (age, sex, condition, setting)
- **I (Intervention/Exposure):** What is being done or studied?
- **C (Comparison):** What is the alternative? (placebo, standard care, another intervention)
- **O (Outcome):** What do we want to know? (mortality, symptom relief, diagnosis accuracy, etc.)

**Question Type**
Classify as: Therapy / Diagnosis / Prognosis / Etiology / Prevention

**Formatted Clinical Question**
"In [P], does [I] compared to [C] improve [O]?"

**Search Strategy**
- **MeSH Terms:** List relevant MeSH headings for each PICO element
- **Keywords:** Alternative text words and synonyms for each element
- **PubMed Search String:** A ready-to-paste Boolean search query combining MeSH and keywords with AND/OR operators
- **Filters to Consider:** Study type, date range, language, human subjects

**Suggested Study Designs**
What types of studies would best answer this question? (RCT, systematic review, cohort, etc.)

**Alternative PICO Formulations**
Suggest 1–2 alternative framings of the question that might yield additional relevant results.

---
CLINICAL QUESTION:
[Describe your clinical question in plain language — e.g., "Is apixaban better than warfarin for preventing stroke in elderly patients with atrial fibrillation?"]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Database | Add: "Also generate search strings for [Embase / CINAHL / Cochrane Library]" |
| Scope | Add: "Narrow the search to [systematic reviews and meta-analyses only]" |
| Teaching | Add: "Explain each step of the PICO process as if teaching a medical student" |
| Multiple questions | Add: "I have several related questions — group them and create a combined search strategy" |

---

## Notes

- The generated PubMed search string is a starting point. You'll likely need to iterate — broadening or narrowing based on the number of results.
- MeSH terms may not be perfectly matched — verify against the MeSH Browser at nlm.nih.gov/mesh/.
- For systematic reviews, the search strategy needs to be more comprehensive (multiple databases, hand-searching references). This template is designed for clinical question-answering, not formal systematic review protocols.
```

- [ ] **Step 6: Verify build succeeds**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build completes with 5 new literature-review template pages generated.

- [ ] **Step 7: Commit**

```bash
git add src/content/templates/article-summary.mdx src/content/templates/evidence-comparison.mdx src/content/templates/guideline-summary.mdx src/content/templates/journal-club-prep.mdx src/content/templates/research-question.mdx
git commit -m "Add literature-review templates: article summary, evidence, guidelines, journal club, PICO"
```

---

### Task 6: Admin-Billing templates (5 new)

**Files:**
- Create: `src/content/templates/prior-authorization.mdx`
- Create: `src/content/templates/appeal-letter.mdx`
- Create: `src/content/templates/referral-letter.mdx`
- Create: `src/content/templates/mdm-complexity.mdx`
- Create: `src/content/templates/peer-to-peer-prep.mdx`

- [ ] **Step 1: Create `prior-authorization.mdx`**

```mdx
---
title: "Prior Authorization Letter"
category: admin-billing
targetTool: claude
workflow: prior-authorization
tags: [beginner, admin-billing, prior-auth, insurance, documentation]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates a medical necessity letter for prior authorization requests. Provide the patient's clinical information, the requested service, and the insurer's requirements, and get a professional letter citing clinical criteria and evidence. One of the most time-consuming physician tasks — this template helps draft it in minutes.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, insurance ID, provider names, and any other direct identifiers.
</Callout>

<Callout type="tip">
  The strongest prior auth letters cite the insurer's own coverage criteria and relevant clinical guidelines. If you have the insurer's policy document, paste the relevant section into the prompt for better results.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Prior Authorization Letter">
You are a physician writing a letter of medical necessity to support a prior authorization request.

Using the clinical information below, write a formal letter that includes:

**Header**
[Date]
To: [INSURANCE COMPANY] Utilization Review Department
Re: Prior Authorization Request for [REQUESTED SERVICE/MEDICATION]
Member ID: [REDACTED — add before sending]

**Opening**
Identify yourself, your specialty, and your relationship to the patient. State what you are requesting authorization for.

**Clinical History**
Summarize the patient's relevant medical history, including:
- Diagnosis (with ICD-10 code if provided)
- Duration and severity of the condition
- Impact on the patient's functional status and quality of life

**Previous Treatments**
Document prior treatments tried and failed (step therapy), including:
- Medication/treatment name
- Duration of trial
- Reason for failure (ineffective, adverse effects, contraindicated)

**Medical Necessity Argument**
Explain why the requested service is medically necessary for this patient:
- Clinical rationale based on the patient's specific situation
- Reference to clinical practice guidelines (cite specific guidelines by name and year)
- Reference to insurer's own coverage criteria if provided
- Why alternatives are inappropriate, insufficient, or contraindicated

**Supporting Evidence**
Cite 2–3 relevant studies or guidelines that support this intervention for this indication.

**Closing**
Request expedited review if clinically urgent. Offer to provide additional information. Include contact information placeholder.

Use a professional, factual tone. Avoid emotional appeals. Focus on clinical evidence and guideline concordance.

---
CLINICAL INFORMATION:
Diagnosis: [DIAGNOSIS AND ICD-10 CODE]
Requested Service: [MEDICATION, PROCEDURE, IMAGING, DME, OR REFERRAL]
Insurance: [INSURANCE COMPANY AND PLAN TYPE]
Previous Treatments Tried: [LIST WITH DURATIONS AND OUTCOMES]
Relevant Clinical Data: [LABS, IMAGING, FUNCTIONAL ASSESSMENTS]
Insurer Coverage Criteria (if available): [PASTE RELEVANT POLICY LANGUAGE]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Urgency | Add: "This is an urgent/expedited request due to [REASON]" |
| Step therapy | Add: "Document that the following step therapy requirements have been met: [REQUIREMENTS]" |
| Specialty medication | Add: "Include pharmacokinetic rationale for this specific agent over alternatives" |
| DME | Add: "Include functional assessment scores and mobility evaluation results" |

---

## Notes

- Always verify citations and guideline references before sending — AI may generate plausible-sounding but inaccurate citations.
- Add the actual patient identifiers and your signature before submitting.
- Save successful prior auth letters as templates for future patients with similar conditions.
```

- [ ] **Step 2: Create `appeal-letter.mdx`**

```mdx
---
title: "Insurance Denial Appeal Letter"
category: admin-billing
targetTool: claude
workflow: insurance-appeal
tags: [intermediate, admin-billing, appeal, insurance, denial]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Drafts a formal appeal letter in response to an insurance denial. Provide the denial reason, the clinical case, and any supporting evidence, and get a structured appeal that addresses the insurer's specific objections.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, insurance ID, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Insurance Denial Appeal Letter">
You are a physician writing a formal appeal of an insurance coverage denial.

Using the information below, write an appeal letter that:

**Header**
[Date]
To: [INSURANCE COMPANY] Appeals Department
Re: Appeal of Denial — [REQUESTED SERVICE]
Reference/Case Number: [DENIAL REFERENCE NUMBER]
Member ID: [REDACTED — add before sending]

**Opening**
State that you are formally appealing the denial of [REQUESTED SERVICE]. Reference the denial letter date and stated reason for denial.

**Denial Reason Rebuttal**
Address the specific reason(s) for denial point by point:
- Quote the insurer's stated reason
- Explain why this reason does not apply to this patient's situation
- Provide clinical evidence that contradicts the denial rationale

**Clinical Case Summary**
Concise summary of why this service is medically necessary (do not simply repeat the prior auth letter — add new information or reframe the argument).

**New or Additional Evidence**
Include any new clinical data, specialist opinions, updated guidelines, or clinical deterioration since the initial request that strengthens the case.

**Regulatory and Contractual Arguments**
Where applicable:
- Reference the plan's own coverage policy and how this patient meets criteria
- Cite applicable state or federal regulations (mental health parity, step therapy reform laws, etc.)
- Reference any external review rights

**Request for Action**
Formally request reversal of the denial and approval of the service. Request a written response within the regulatory timeframe. Note your intent to escalate to external review if not resolved.

**Closing**
Offer to discuss the case by phone. Include contact information placeholder.

Tone: professional, factual, firm. Focus on clinical evidence and contractual obligations, not frustration.

---
DENIAL INFORMATION:
Denial Date: [DATE]
Denied Service: [WHAT WAS DENIED]
Stated Reason for Denial: [PASTE OR SUMMARIZE THE DENIAL REASON]
Denial Reference Number: [IF PROVIDED]

CLINICAL INFORMATION:
[UPDATED CLINICAL DATA, NEW EVIDENCE, SPECIALIST OPINIONS, OR CLINICAL CHANGES SINCE INITIAL REQUEST]

PRIOR AUTH LETTER (if available):
[Paste or summarize what was already submitted]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Appeal level | Add: "This is a [first/second/external] level appeal" |
| Peer-to-peer | Add: "A peer-to-peer review was conducted on [DATE] with [REVIEWER]. Include a summary of that discussion." |
| Regulatory | Add: "Include references to [STATE] insurance regulations regarding [TOPIC]" |
| Urgent | Add: "Request expedited appeal due to [clinical urgency reason]" |

---

## Notes

- Always include the denial reference number and quote the exact denial reason from the letter.
- Keep a copy of every appeal letter sent — you may need it for external review or state insurance department complaints.
- Time limits for appeals vary by plan and state. Check the denial letter for the deadline.
```

- [ ] **Step 3: Create `referral-letter.mdx`**

```mdx
---
title: "Specialist Referral Letter"
category: admin-billing
targetTool: claude
workflow: referral
tags: [beginner, admin-billing, referral, documentation]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates a professional specialist referral letter with clinical context, relevant workup, and a clear referral question. Helps ensure the receiving specialist has everything they need to provide a useful consultation.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Specialist Referral Letter">
You are a primary care physician writing a referral letter to a specialist colleague.

Using the information below, write a concise, professional referral letter:

**Header**
Dear Dr. [SPECIALIST NAME / "[SPECIALTY] Colleague"],

**Referral Question**
State the specific clinical question or reason for referral in one clear sentence.

**Clinical Summary**
Concise narrative (1 paragraph) covering:
- Key diagnoses relevant to the referral
- Relevant symptom history, duration, and trajectory
- What you've done so far (workup, treatments tried, response)

**Relevant History**
- Past medical/surgical history relevant to the referral
- Current medications
- Allergies
- Social history if relevant (smoking, occupation, etc.)

**Workup to Date**
- Lab results (relevant values with dates)
- Imaging results (relevant findings with dates)
- Prior specialist evaluations if applicable

**What I'm Hoping For**
Specifically what you'd like from the specialist:
- Diagnostic evaluation
- Procedural intervention
- Co-management recommendations
- Second opinion

**Urgency**
Routine / Urgent / Emergent — and why if urgent/emergent.

**Closing**
Thank you for seeing this patient. Please contact me at [PHONE] if you need additional information.

Keep the letter to one page. Be specific about what you've already done to avoid duplicate workup.

---
REFERRAL INFORMATION:
Referring To: [SPECIALTY]
Referral Question: [WHAT YOU WANT TO KNOW OR HAVE DONE]
Urgency: [ROUTINE / URGENT / EMERGENT]
Clinical Summary: [PATIENT'S RELEVANT CLINICAL INFORMATION]
Workup Done: [LABS, IMAGING, TREATMENTS ALREADY TRIED]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Brevity | Add: "Keep this to 3 paragraphs maximum — the specialist is busy" |
| Complexity | Add: "This is a complex multi-system patient. Include a comprehensive problem list." |
| Specific request | Add: "I am specifically requesting [EGD / nerve conduction study / surgical evaluation]" |
| Insurance | Add: "Include a medical necessity statement for insurance referral authorization" |
```

- [ ] **Step 4: Create `mdm-complexity.mdx`**

```mdx
---
title: "Medical Decision-Making Documentation"
category: admin-billing
targetTool: claude
workflow: mdm-coding
tags: [advanced, admin-billing, mdm, coding, e-m, billing]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Helps document medical decision-making (MDM) complexity to support E&M coding. Provide your clinical encounter details and get documentation organized by the three MDM elements: number and complexity of problems, data reviewed, and risk of management.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

<Callout type="pitfall">
  MDM documentation supports your professional judgment — it does not replace it. The AI cannot determine the correct E&M level for your encounter. Always verify coding against CMS guidelines and your institution's compliance requirements.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Medical Decision-Making Documentation">
You are a physician documentation specialist helping to structure medical decision-making for an encounter note.

Using the encounter details below, organize the documentation into the three MDM elements per 2021 CMS E&M guidelines:

**Element 1: Number and Complexity of Problems Addressed**
List each problem addressed during this encounter:
- Problem name
- Status: acute / chronic stable / chronic worsening / new / acute exacerbation
- Classify complexity: minimal / low / moderate / high

Summarize: The number and complexity of problems support a [MINIMAL / LOW / MODERATE / HIGH] level.

**Element 2: Amount and/or Complexity of Data Reviewed and Analyzed**
Document data elements:
- Tests ordered (list each)
- Tests reviewed (with results)
- External records reviewed (source, content)
- Independent interpretation of imaging/tracing (specify what was interpreted)
- Discussion with external physician or qualified health professional (who, about what)

Summarize: The data reviewed and analyzed supports a [MINIMAL / LIMITED / MODERATE / EXTENSIVE] level.

**Element 3: Risk of Complications and/or Morbidity or Mortality**
Document risk factors:
- Risk of the presenting problem(s)
- Risk of diagnostic procedures ordered
- Risk of management options selected
- Social determinants of health affecting management

Classify overall risk: [MINIMAL / LOW / MODERATE / HIGH]

**Overall MDM Level**
Based on the three elements (2 of 3 determine the level), the MDM supports:
[STRAIGHTFORWARD / LOW / MODERATE / HIGH] complexity

**E&M Code Range**
- Office/Outpatient: 99202-99205 (new) / 99211-99215 (established)
- Suggested level based on MDM: [CODE]

Do not fabricate encounter details. Document only what was actually described. Flag any areas where additional documentation would strengthen coding support.

---
ENCOUNTER DETAILS:
Setting: [Office / ED / Inpatient / Telehealth]
Visit Type: [New / Established]
Problems Addressed: [LIST PROBLEMS DISCUSSED AND MANAGED]
Tests Ordered: [LIST]
Data Reviewed: [LABS, IMAGING, EXTERNAL RECORDS REVIEWED]
Management Decisions: [MEDICATIONS PRESCRIBED, PROCEDURES PLANNED, REFERRALS, COUNSELING]
Risk Factors: [RELEVANT RISKS]
</PromptPlayground>

---

## Notes

- The 2021 CMS E&M guidelines determine level by MDM complexity OR total time — this template addresses MDM only. If billing by time, document total time instead.
- This is a documentation aide, not a billing tool. Always have your coder or compliance team review for accuracy.
- For inpatient E&M (99221–99223, 99231–99233), the same MDM framework applies but the code ranges differ.
```

- [ ] **Step 5: Create `peer-to-peer-prep.mdx`**

```mdx
---
title: "Peer-to-Peer Review Preparation"
category: admin-billing
targetTool: claude
workflow: peer-to-peer
tags: [intermediate, admin-billing, peer-to-peer, insurance, utilization-review]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Prepares talking points and a structured argument for a peer-to-peer phone call with an insurance reviewer. Provide the denied service, denial reason, and clinical case, and get a concise set of talking points organized for a 5–10 minute phone call.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, insurance ID, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Peer-to-Peer Review Preparation">
You are a physician preparing for a peer-to-peer review call with an insurance medical director.

Using the case details below, prepare a structured set of talking points for a 5–10 minute phone call:

**Opening (30 seconds)**
- Introduce yourself: specialty and role
- State what you're calling about: "I'm calling regarding the denial of [SERVICE] for my patient"
- Reference the denial number

**The Ask (30 seconds)**
State clearly what you are requesting and why in 2 sentences maximum.

**Clinical Case Summary (2 minutes)**
Concise, persuasive narrative hitting:
- Diagnosis and severity
- Clinical trajectory (getting worse / not responding / urgent)
- What's been tried and why it hasn't worked
- Why this specific service is needed NOW

**Rebuttal of Denial Reason (2 minutes)**
For each stated denial reason:
- Acknowledge it
- Explain why it doesn't apply
- Cite the specific clinical evidence or guideline

**Key Evidence Points (1 minute)**
3 strongest supporting arguments, in order of strength:
1. [Strongest clinical argument]
2. [Guideline support]
3. [Patient-specific factor that makes this case compelling]

**Anticipated Pushback**
For each likely objection the reviewer might raise:
- The objection
- Your response

**Closing (30 seconds)**
Restate the ask. Request immediate authorization. Ask for a reference number if approved. Ask about next steps if not approved on the call.

**Key Numbers to Have Ready**
List specific labs, dates, dosages, or scores you might be asked about during the call.

Keep all talking points concise — you're preparing for a phone call, not writing an essay.

---
CASE DETAILS:
Denied Service: [WHAT WAS DENIED]
Denial Reason: [STATED REASON]
Clinical Summary: [RELEVANT CLINICAL INFORMATION]
Previous Treatments: [WHAT'S BEEN TRIED]
Relevant Guidelines: [ANY GUIDELINES THAT SUPPORT YOUR CASE]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Tone | Add: "The reviewer is likely to be adversarial — prepare firmer pushback" or "The reviewer is likely to be collaborative — use a collegial tone" |
| Time | Add: "This call is limited to 5 minutes — condense to essentials only" |
| Specialty | Add: "The reviewing physician is a [SPECIALTY] — adjust clinical language accordingly" |
| Multiple denials | Add: "I have multiple denials to discuss on this call: [LIST]" |

---

## Notes

- Print the talking points and keep them in front of you during the call. The structure prevents rambling.
- Document the date, time, reviewer name, and outcome of every P2P call in the chart.
- If the reviewer is not in your specialty, be prepared to explain specialty-specific reasoning in general terms.
```

- [ ] **Step 6: Verify build succeeds**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build completes with 5 new admin-billing template pages generated.

- [ ] **Step 7: Commit**

```bash
git add src/content/templates/prior-authorization.mdx src/content/templates/appeal-letter.mdx src/content/templates/referral-letter.mdx src/content/templates/mdm-complexity.mdx src/content/templates/peer-to-peer-prep.mdx
git commit -m "Add admin-billing templates: prior auth, appeal, referral, MDM, peer-to-peer"
```

---

### Task 7: Board-Prep templates (5 new)

**Files:**
- Create: `src/content/templates/question-generator.mdx`
- Create: `src/content/templates/topic-review.mdx`
- Create: `src/content/templates/case-vignette-analysis.mdx`
- Create: `src/content/templates/pharm-flashcards.mdx`
- Create: `src/content/templates/differential-drill.mdx`

- [ ] **Step 1: Create `question-generator.mdx`**

```mdx
---
title: "Board-Style Question Generator"
category: board-prep
targetTool: claude
workflow: board-questions
tags: [beginner, board-prep, questions, study, usmle]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Generates board-style multiple choice questions on any medical topic. Specify the topic, difficulty level, and question style, and get practice questions with detailed explanations for each answer choice. Great for self-study or for attendings creating teaching questions.

<Callout type="tip">
  For the most realistic practice, ask for questions in the style of your specific exam (USMLE Step 1/2/3, COMLEX, shelf exams, specialty boards). Each has different question formats and emphasis areas.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="Board-Style Question Generator">
You are a medical education expert writing board-style exam questions.

Generate [NUMBER — e.g., 5] multiple choice questions on the following topic:

**Topic:** [MEDICAL TOPIC — e.g., "heart failure pharmacology," "pediatric milestones," "acid-base disorders"]
**Exam Style:** [USMLE Step 1 / Step 2 CK / Step 3 / Shelf / Specialty Board]
**Difficulty:** [Easy / Medium / Hard]

For each question:

**Question [N]**
Present a clinical vignette (3–5 sentences) followed by a question stem. Include relevant demographics, history, physical exam findings, and lab/imaging data.

**Answer Choices**
A. [Choice]
B. [Choice]
C. [Choice]
D. [Choice]
E. [Choice]

**Correct Answer:** [Letter]

**Explanation**
- Why the correct answer is right (2–3 sentences with the underlying mechanism or principle)
- Why each wrong answer is wrong (1 sentence each)
- **High-yield point:** One key takeaway to remember

Make questions clinically realistic. Avoid "all of the above" or "none of the above." Each question should test a single concept. Vary the question format: best next step, most likely diagnosis, mechanism of action, most likely finding, etc.

---
ADDITIONAL PREFERENCES:
[Any specific subtopics to focus on, question types to emphasize, or areas of weakness to target]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Quantity | Change `[NUMBER]` to however many questions you want |
| Image-based | Add: "Include a description of what the clinical image would show (e.g., ECG, X-ray, histology)" |
| Two-step | Add: "Make these two-step reasoning questions (identify the diagnosis, then choose the management)" |
| Explanations only | Add: "I already have questions. Here they are: [QUESTIONS]. Provide detailed explanations for each." |

---

## Notes

- AI-generated questions may not perfectly match the nuance of real board questions. Use them as a supplement to, not a replacement for, question banks (UWorld, Amboss, etc.).
- For Step 1-style questions, emphasize basic science mechanisms. For Step 2-style, emphasize clinical management.
- Verify key facts in the explanations against a trusted reference — AI can occasionally state incorrect pharmacology or physiology details.
```

- [ ] **Step 2: Create `topic-review.mdx`**

```mdx
---
title: "High-Yield Topic Review"
category: board-prep
targetTool: claude
workflow: topic-review
tags: [beginner, board-prep, review, study, high-yield]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

Creates a high-yield summary of any medical topic for board review. Specify the topic and target exam, and get a structured review covering the must-know facts, classic presentations, key associations, and common exam traps.

<Callout type="tip">
  This template is designed for rapid review, not deep learning. Use it to consolidate knowledge you've already studied, or as a starting point to identify what you need to study more deeply.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Claude" title="High-Yield Topic Review">
You are a board review course director creating a high-yield summary for exam preparation.

Create a focused review of:

**Topic:** [MEDICAL TOPIC]
**Target Exam:** [USMLE Step 1 / Step 2 CK / Step 3 / Shelf / Specialty Board]

**Definition & Pathophysiology**
In 2–3 sentences, explain what this is and the key mechanism. Focus on the "why" — the pathophysiology that explains the clinical features.

**Classic Presentation**
The textbook presentation: "A [age] [sex] presents with [symptoms]. On exam, [findings]. Labs show [results]."

**Buzzwords & Associations**
Bulleted list of classic buzzwords and high-yield associations that appear on exams:
- [Buzzword] → [Diagnosis/Finding]

**Diagnosis**
- Gold standard test
- Best initial test
- Key lab/imaging findings and their significance

**Treatment**
- First-line treatment
- Second-line / refractory management
- Emergency management if applicable
- Key contraindications to know

**Complications**
Most important complications and how to recognize them.

**Exam Pearls**
5–7 high-yield facts that are commonly tested:
1. [Fact]
2. [Fact]
...

**Common Exam Traps**
2–3 ways this topic appears tricky on exams and how to avoid the trap.

**Differentials to Know**
Key conditions that look similar and how to distinguish them (1 sentence each).

Keep this to a rapid-review format. No lengthy explanations — just the testable facts.

---
FOCUS AREAS (optional):
[Specific aspects to emphasize, known weak areas, or related topics to connect]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Depth | Add: "Go deeper on pathophysiology — I need to understand the mechanism" |
| Comparison | Add: "Compare and contrast with [RELATED TOPIC]" |
| Mnemonics | Add: "Include mnemonics for key lists where available" |
| Specialty focus | Add: "Emphasize what a [SPECIALTY] attending would expect me to know" |

---

## Notes

- Verify critical facts (drug doses, diagnostic criteria, guideline recommendations) against a trusted source like First Aid, UpToDate, or Amboss.
- For a complete study session, pair with the **Question Generator** template to test yourself after review.
- This format works for any medical topic — pathology, pharmacology, microbiology, clinical medicine, etc.
```

- [ ] **Step 3: Create `case-vignette-analysis.mdx`**

```mdx
---
title: "Case Vignette Analysis"
category: board-prep
targetTool: claude
workflow: vignette-analysis
tags: [intermediate, board-prep, case-vignette, reasoning, study]
lastUpdated: 2026-03-18
---

import PromptPlayground from '../../components/PromptPlayground.astro';

Walks you through a clinical vignette step-by-step, teaching the reasoning process for board-style questions. Paste in a question vignette and get a structured analysis of how to identify the key clues, build a differential, and arrive at the answer.

---

## Prompt Template

<PromptPlayground tool="Claude" title="Case Vignette Analysis">
You are a board review tutor walking a student through a clinical vignette step by step.

Analyze the following vignette using a systematic approach:

**Step 1: Identify the Key Clues**
List each clinically significant piece of information in the vignette:
- Demographics clues (age, sex, ethnicity — when epidemiologically relevant)
- Symptom clues (timing, quality, severity, aggravating/alleviating factors)
- Exam clues (vital signs, physical findings)
- Lab/imaging clues (abnormal values, patterns)
- Medication/exposure clues

**Step 2: Pattern Recognition**
What classic patterns or associations do these clues suggest? List each pattern and the diagnosis it points to.

**Step 3: Build the Differential**
Based on the clues and patterns:
1. Most likely diagnosis — and why
2. Runner-up diagnosis — and what would make it more likely
3. Must-not-miss diagnosis — and what rules it out here

**Step 4: Answer the Question**
- What is being asked? (Diagnosis / Next step / Mechanism / Treatment / Complication)
- The correct answer and reasoning
- Why each distractor is wrong

**Step 5: Teaching Points**
- The core concept being tested
- A one-sentence rule to remember for similar questions
- Related topics that might come up on the same exam

Show your reasoning at each step — the goal is to teach the thought process, not just give the answer.

---
VIGNETTE:
[Paste the full clinical vignette and question stem here. Include answer choices if available.]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| No answer choices | Add: "I don't have answer choices — work through the vignette and tell me the most likely answer" |
| Wrong answer review | Add: "I chose [X] and it was wrong. The correct answer is [Y]. Explain why I was wrong and how to avoid this mistake." |
| Speed practice | Add: "Walk me through this in under 60 seconds of reading — how would you solve this quickly on exam day?" |
| Series | Add: "After this analysis, generate 2 more vignettes testing the same concept with different presentations" |

---

## Notes

- This is most valuable when you've already attempted the question and want to understand the reasoning, not as a shortcut to skip thinking.
- For best results, include the answer choices — this allows the AI to explain why each distractor is designed to trap you.
- Pair with the **Question Generator** template to create vignettes on your weak areas, then analyze them with this template.
```

- [ ] **Step 4: Create `pharm-flashcards.mdx`**

```mdx
---
title: "Pharmacology Flashcard Generator"
category: board-prep
targetTool: claude
workflow: pharm-review
tags: [beginner, board-prep, pharmacology, flashcards, study]
lastUpdated: 2026-03-18
---

import PromptPlayground from '../../components/PromptPlayground.astro';

Generates pharmacology flashcard sets for any drug class or topic. Get structured cards covering mechanism, indications, side effects, contraindications, and high-yield board facts. Output formatted for easy import into Anki or other flashcard apps.

---

## Prompt Template

<PromptPlayground tool="Claude" title="Pharmacology Flashcard Generator">
You are a pharmacology professor creating flashcard sets for medical students.

Generate a set of flashcards for:

**Drug Class/Topic:** [DRUG CLASS OR SPECIFIC DRUGS — e.g., "ACE inhibitors," "anti-epileptics," "drugs used in heart failure"]

For each drug in the class, create a flashcard with:

**Front:** [Drug Name (generic)]
**Back:**
- **Class:** [Pharmacologic class]
- **Mechanism:** [Mechanism of action in one sentence]
- **Indications:** [Key clinical uses, bulleted]
- **Key Side Effects:** [Most important adverse effects]
- **Contraindications:** [When NOT to use]
- **Board Pearl:** [One high-yield fact for exams]
- **Interactions:** [Most important drug interactions]

After the individual drug cards, create 3 comparison cards:

**Front:** "Compare [Drug A] vs [Drug B]: key difference?"
**Back:** [One-sentence distinguishing feature]

Format all cards in this exact pattern so they can be copied into a flashcard app:
```
Q: [Front of card]
A: [Back of card]
---
```

---
PREFERENCES:
[Specific drugs to include/exclude, level of detail, exam focus]
</PromptPlayground>

---

## Notes

- Verify drug facts against a pharmacology reference (Pharmacology by Katzung, First Aid, or UpToDate). AI may occasionally mix up side effect profiles between similar drugs.
- The output can be pasted directly into Anki using the Basic card type with `---` as a separator.
- For the most useful flashcards, focus on one drug class at a time rather than requesting too many at once.
```

- [ ] **Step 5: Create `differential-drill.mdx`**

```mdx
---
title: "Differential Diagnosis Drill"
category: board-prep
targetTool: claude
workflow: ddx-practice
tags: [intermediate, board-prep, differential, practice, study]
lastUpdated: 2026-03-18
---

import PromptPlayground from '../../components/PromptPlayground.astro';

A practice drill that gives you a chief complaint and challenges you to build a differential diagnosis. The AI plays the role of an attending, progressively revealing clinical information as you work through the case. Great for building pattern recognition and systematic thinking.

---

## Prompt Template

<PromptPlayground tool="Claude" title="Differential Diagnosis Drill">
You are an attending physician running a differential diagnosis drill with a trainee. This is a Socratic teaching exercise.

**Format:**

1. Present a chief complaint with basic demographics: "[Age] [sex] presents to the [ED/clinic/floor] with [CHIEF COMPLAINT]."

2. Ask: "What is your initial differential? List your top 5."

3. After I respond, reveal additional history and ask: "How does this change your differential? What do you want to narrow it down?"

4. After I respond, reveal physical exam findings and ask: "What is your leading diagnosis now? What single test would you order first?"

5. After I respond, reveal the test result and ask: "What is your diagnosis and management plan?"

6. After I respond, provide:
   - The final diagnosis
   - What I got right and what I missed
   - The key clinical reasoning steps I should have taken
   - One teaching pearl about this presentation

**Rules:**
- Wait for my response at each step before proceeding
- If my differential is missing a dangerous diagnosis, hint at it: "Is there anything you're worried about missing?"
- Keep the case realistic and internally consistent
- Vary the difficulty based on my responses

**Topic:** [CHIEF COMPLAINT OR ORGAN SYSTEM — e.g., "chest pain," "acute abdominal pain," "altered mental status," "cardiology cases"]
**Difficulty:** [Easy / Medium / Hard]

Start with Step 1.
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---------|---------------|
| Specialty | Add: "Make this a [pediatric/OB/surgical/psychiatric] case" |
| Exam focus | Add: "Focus on diagnoses tested on [USMLE Step 2 / EM boards / IM boards]" |
| Multiple cases | Add: "After completing one case, immediately present another on a different topic" |
| Self-study mode | Add: "Don't wait for my responses — present the full case with pauses and teaching points throughout" |

---

## Notes

- This template works best as an interactive conversation. Each response you give shapes the next reveal.
- Unlike the **Differential Diagnosis Generator** (clinical-reasoning), this template is for *practice and learning*, not for real patient care.
- For maximum benefit, try to answer at each step before reading ahead. The learning happens in the struggle.
```

- [ ] **Step 6: Verify build succeeds**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build completes with 5 new board-prep template pages generated.

- [ ] **Step 7: Commit**

```bash
git add src/content/templates/question-generator.mdx src/content/templates/topic-review.mdx src/content/templates/case-vignette-analysis.mdx src/content/templates/pharm-flashcards.mdx src/content/templates/differential-drill.mdx
git commit -m "Add board-prep templates: questions, topic review, vignettes, flashcards, DDx drill"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full build verification**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build completes successfully. Verify that 30 template pages are generated (check build output for `/templates/` routes).

- [ ] **Step 2: Verify template count**

Run: `ls -1 /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors/src/content/templates/*.mdx | wc -l`
Expected: `30`

- [ ] **Step 3: Verify all categories are represented**

Run: `grep -h "^category:" /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors/src/content/templates/*.mdx | sort | uniq -c`
Expected: 5 of each category:
```
5 category: admin-billing
5 category: board-prep
5 category: clinical-reasoning
5 category: note-writing
5 category: patient-education
5 category: literature-review
```

- [ ] **Step 4: Verify all templates have difficulty tags**

Run: `grep -EL "beginner|intermediate|advanced" /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors/src/content/templates/*.mdx`
Expected: No output (all files contain a difficulty tag).

- [ ] **Step 5: Spot-check the dev server**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run dev`
Manually verify in browser:
- `/templates/` — index page shows all 30 templates grouped by category
- Click 2–3 individual templates — content renders, PromptPlayground copy button works, Callouts display correctly
- Dark mode toggle works on template pages

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -u src/content/templates/
git commit -m "Fix any build issues found during final verification"
```
