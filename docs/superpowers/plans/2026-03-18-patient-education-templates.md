# Patient Education Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 patient education prompt templates, 3 workflows, and supporting code changes to llmsfordoctors.com.

**Architecture:** Content-first approach using existing Astro content collections. Three small code changes enable tool-agnostic templates: updating the templates index display, the cross-referencing utility, and the template detail page reverse lookup. All 10 MDX files follow established patterns from `discharge-summary-basic.mdx` and `discharge-summary.mdx`.

**Tech Stack:** Astro 6, MDX, Tailwind CSS, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-18-patient-education-templates-design.md`

---

### Task 1: Update `getTemplatesForWorkflow()` to support cross-referencing

**Files:**
- Modify: `src/utils/collections.ts:16-19`

- [ ] **Step 1: Update the function**

Replace the existing `getTemplatesForWorkflow` function (lines 16-19) with:

```typescript
/** Find templates for a given workflow slug (checks both template.workflow field and workflow.templates array) */
export async function getTemplatesForWorkflow(workflowSlug: string) {
  const allTemplates = await getCollection('templates');
  const allWorkflows = await getCollection('workflows');
  const workflow = allWorkflows.find((w) => w.id === workflowSlug);
  const workflowTemplateIds = workflow?.data.templates ?? [];
  return allTemplates.filter(
    (entry) =>
      entry.data.workflow === workflowSlug ||
      workflowTemplateIds.includes(entry.id),
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build succeeds. The existing discharge-summary workflow should still resolve its template.

- [ ] **Step 3: Commit**

```bash
git add src/utils/collections.ts
git commit -m "feat: update getTemplatesForWorkflow to check workflow templates array"
```

---

### Task 2: Update templates index page for "Any LLM" display

**Files:**
- Modify: `src/pages/templates/index.astro:66`

- [ ] **Step 1: Update the targetTool display**

On line 66, replace:
```
For {tmpl.data.targetTool}
```

With:
```
For {tmpl.data.targetTool === 'any' ? 'Any LLM' : tmpl.data.targetTool}
```

The full line should read:
```astro
For {tmpl.data.targetTool === 'any' ? 'Any LLM' : tmpl.data.targetTool} · Updated {tmpl.data.lastUpdated.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/templates/index.astro
git commit -m "feat: display 'Any LLM' for tool-agnostic templates"
```

---

### Task 3: Update template detail page for reverse workflow lookup

**Files:**
- Modify: `src/pages/templates/[...slug].astro:14-26`

Templates shared across multiple workflows (new-medication-guide, post-procedure-care, follow-up-visit-prep) omit the `workflow` frontmatter field. The current template detail page only finds related workflows via `entry.data.workflow`, so shared templates would show zero related workflows. This task adds a reverse lookup through the workflow `templates` arrays.

- [ ] **Step 1: Add reverse lookup after the existing workflow block**

After line 26 (the closing `}` of the `if (entry.data.workflow)` block), add:

```typescript
// Also find workflows that list this template in their templates array
const allWorkflows = await getCollection('workflows');
for (const wf of allWorkflows) {
  const alreadyAdded = relatedItems.some((r) => r.href === `/workflows/${wf.id}`);
  if (!alreadyAdded && wf.data.templates?.includes(entry.id)) {
    relatedItems.push({
      title: wf.data.title,
      href: `/workflows/${wf.id}`,
      type: 'workflow',
    });
  }
}
```

Note: The `allWorkflows` variable is separate from the `workflows` variable inside the `if` block (which is scoped). If you prefer, you can refactor to hoist the `getCollection('workflows')` call, but the simpler approach is to just add a second call outside the `if` block.

- [ ] **Step 2: Verify build**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build succeeds. The existing `discharge-summary-basic` template should still show its parent workflow.

- [ ] **Step 3: Commit**

```bash
git add src/pages/templates/[...slug].astro
git commit -m "feat: add reverse workflow lookup for shared templates"
```

---

### Task 4: Create Condition Explainer template

**Files:**
- Create: `src/content/templates/condition-explainer.mdx`

Reference pattern: `src/content/templates/discharge-summary-basic.mdx`

- [ ] **Step 1: Create the template file**

```mdx
---
title: "Condition Explainer"
category: patient-education
targetTool: any
workflow: outpatient-visit-education
tags: [patient-education, diagnosis, condition, explainer]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

This template takes a diagnosis and relevant clinical context and produces a clear, patient-friendly explanation. The output is written at a 6th grade reading level so patients can understand their condition, what to expect, and when to seek help.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, dates of service, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Any LLM" title="Condition Explainer">
You are a physician writing a patient education handout. Your goal is to explain a medical condition in plain language that a patient with no medical background can understand.

Write at a 6th grade reading level. Use short sentences. Avoid medical jargon — if a medical term is unavoidable, define it in parentheses the first time you use it. Use bullet points for lists and action items.

Using the clinical information provided below, create a patient education handout with the following sections:

**1. What You Have**
Explain the diagnosis in 2–3 simple sentences. Use an analogy or comparison to everyday life if it helps.

**2. What Causes It**
Briefly explain the most common causes or risk factors in plain language. Keep to 2–4 bullet points.

**3. What to Expect**
Describe the typical symptoms, how the condition may progress, and what the patient might experience day-to-day. Be honest but reassuring where appropriate.

**4. Your Treatment Plan**
Explain what the doctor is recommending and why. Include:
- Medications (what they do, not just the name)
- Lifestyle changes (specific actions, not vague advice)
- Procedures or follow-up tests if applicable

**5. When to Get Help Right Away**
List 3–5 specific warning signs that mean the patient should call their doctor or go to the emergency room. Be concrete (e.g., "chest pain that does not go away after 10 minutes" rather than "worsening symptoms").

---
CLINICAL INFORMATION:
[Paste the diagnosis, relevant history, and any treatment plan details here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---|---|
| Reading level | Add: "Write at a 4th grade reading level" or "Write for a health-literate audience" |
| Condition type | Add: "This is a chronic condition — emphasize long-term management" |
| Specialty | Add: "This is a cardiology diagnosis. Include heart-specific lifestyle guidance." |
| Caregiver audience | Add: "This handout is for the patient's family caregiver, not the patient directly" |
| Length | Add: "Keep the entire handout to one page (approximately 300 words)" |

---

## Notes

- This template works for any diagnosis. For complex multi-system conditions, consider generating one handout per major diagnosis rather than combining them.
- Always review the "When to Get Help" section carefully — this is the most safety-critical part of the output.
- If the patient has limited English proficiency, consider using the output as a starting point and having it translated by a qualified medical interpreter.
```

- [ ] **Step 2: Verify build with first template**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build succeeds. This validates the pattern (frontmatter, imports, MDX structure) before replicating it 6 more times. If this fails, fix the issue before creating more templates.

- [ ] **Step 3: Commit**

```bash
git add src/content/templates/condition-explainer.mdx
git commit -m "feat: add condition explainer patient education template"
```

---

### Task 5: Create Patient Discharge Instructions template

**Files:**
- Create: `src/content/templates/discharge-instructions-patient.mdx`

- [ ] **Step 1: Create the template file**

```mdx
---
title: "Patient Discharge Instructions"
category: patient-education
targetTool: any
workflow: inpatient-discharge-education
tags: [patient-education, discharge, instructions, inpatient]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

This template takes discharge notes and produces a patient-friendly take-home instruction sheet. Unlike the clinician-facing discharge summary template, this output is written directly for the patient at a 6th grade reading level.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, admission/discharge dates, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Any LLM" title="Patient Discharge Instructions">
You are a physician writing discharge instructions for a patient who is leaving the hospital. The patient has no medical background. Write everything at a 6th grade reading level using short sentences and simple words.

Avoid medical jargon — if a medical term is unavoidable, define it in parentheses. Use bullet points for action items. Bold any critical safety information.

Using the clinical information provided below, create a patient discharge instruction sheet with the following sections:

**1. Why You Were in the Hospital**
Explain in 2–3 simple sentences what happened and why the patient was admitted. Use everyday language.

**2. Your Medications**
For each medication that is new, changed, or stopped:
- **New medications:** Name, what it is for, how to take it (dose, timing, with/without food), and how long to take it
- **Changed medications:** Name, what changed and why
- **Stopped medications:** Name and why it was stopped

**3. Activity and Diet**
- What activities are OK and what to avoid (be specific — e.g., "no lifting anything heavier than 10 pounds for 2 weeks")
- Any dietary changes (specific foods to eat or avoid, fluid restrictions)
- When normal activities can resume

**4. Follow-Up Appointments**
List each follow-up appointment:
- Who to see (type of doctor, not just a name)
- When (timeframe, e.g., "within 1 week")
- Why this visit matters
- How to schedule if not yet booked

**5. What to Watch For — Call Your Doctor**
List 3–5 signs that mean the patient should call their doctor's office.

**6. What to Watch For — Go to the ER**
List 3–5 signs that mean the patient should go to the emergency room or call 911 immediately. **Bold each one.**

---
CLINICAL INFORMATION:
[Paste your de-identified discharge summary, medication reconciliation, and follow-up plan here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---|---|
| Reading level | Add: "Write at a 4th grade reading level" |
| Surgical discharge | Add: "Include a wound care section with specific instructions" |
| Pediatric | Add: "These instructions are for the parents of a child patient" |
| Length | Add: "Keep the entire document to 2 pages maximum" |
| Medication detail | Add: "For each new medication, also list the most common side effects" |

---

## Notes

- This template is distinct from the **Discharge Summary — Basic Template**, which produces a clinician-facing document for the receiving PCP. This template is for the patient themselves.
- Always verify the medication section against the actual medication reconciliation — this is the highest-risk section for AI errors.
- For complex discharges (e.g., new cancer diagnosis, ICU stay), the output will need significant review and may benefit from being paired with an in-person explanation.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/templates/discharge-instructions-patient.mdx
git commit -m "feat: add patient discharge instructions template"
```

---

### Task 6: Create New Medication Guide template

**Files:**
- Create: `src/content/templates/new-medication-guide.mdx`

- [ ] **Step 1: Create the template file**

```mdx
---
title: "New Medication Guide"
category: patient-education
targetTool: any
tags: [patient-education, medication, prescription, pharmacy]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

This template takes a medication name, dose, and indication and produces a patient-friendly medication guide. It covers what the medication does, how to take it, side effects to watch for, and when to call the doctor.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, and any other direct identifiers. Medication names and doses alone are generally not identifiable.
</Callout>

<Callout type="pitfall">
  AI can generate plausible but incorrect medication information (wrong doses, missed interactions, outdated warnings). Always verify the output against a trusted drug reference (e.g., UpToDate, Lexicomp, Micromedex) before giving to the patient.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Any LLM" title="New Medication Guide">
You are a physician creating a medication guide for a patient who has just been prescribed a new medication. The patient has no medical background. Write at a 6th grade reading level using short sentences and simple words.

Avoid medical jargon — if a medical term is unavoidable, define it in parentheses. Use bullet points for lists.

Using the medication information provided below, create a patient medication guide with the following sections:

**1. What This Medication Is For**
Explain in 2–3 simple sentences what the medication does and why the doctor prescribed it. Use an analogy if helpful.

**2. How to Take It**
- Dose and frequency (e.g., "Take 1 tablet by mouth every morning")
- Take with food, on an empty stomach, or either
- Best time of day to take it
- What to do if you miss a dose
- How long you will need to take it (if known)

**3. Common Side Effects**
List the 3–5 most common side effects. For each one, briefly explain:
- What it feels like
- Whether it usually goes away on its own
- What to do about it (e.g., "take with food to reduce nausea")

**4. Serious Side Effects — Call Your Doctor**
List 3–5 serious side effects that mean the patient should call their doctor right away. **Bold each one.**

**5. Things to Avoid**
List interactions to be aware of:
- Foods to avoid (if any)
- Other medications that interact (common OTC drugs, supplements)
- Alcohol restrictions
- Activity restrictions (e.g., "may cause drowsiness — do not drive until you know how it affects you")

**6. Storage**
How to store the medication (room temperature, refrigerate, keep away from light, etc.).

---
MEDICATION INFORMATION:
[Paste the medication name, dose, frequency, indication, and any relevant patient history (e.g., kidney function, other medications) here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---|---|
| Multiple medications | Add: "Create a separate section for each medication listed below" |
| Pediatric | Add: "This medication is for a child. Include age-appropriate instructions for the parent." |
| Insulin/injectable | Add: "Include injection technique, site rotation, and sharps disposal instructions" |
| Controlled substance | Add: "Include safe storage guidance and disposal instructions for unused medication" |
| Antibiotic | Add: "Emphasize completing the full course even if the patient feels better" |

---

## Notes

- This template is shared across the **Inpatient Discharge Education** and **Outpatient Visit Education** workflows. Use it whenever a patient starts a new medication or has a significant dose change.
- For high-risk medications (anticoagulants, insulin, opioids, chemotherapy), the AI output should be considered a starting draft — pair it with institution-specific medication education resources.
- Always cross-reference side effects and interactions against a current drug reference before giving to the patient.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/templates/new-medication-guide.mdx
git commit -m "feat: add new medication guide patient education template"
```

---

### Task 7: Create Procedure Preparation Guide template

**Files:**
- Create: `src/content/templates/procedure-prep.mdx`

- [ ] **Step 1: Create the template file**

```mdx
---
title: "Procedure Preparation Guide"
category: patient-education
targetTool: any
workflow: procedure-education
tags: [patient-education, procedure, preparation, pre-op]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

This template takes a procedure name and relevant details and produces a patient-friendly "what to expect" preparation guide. It covers how to prepare, what happens during the procedure, and what to expect immediately after.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, scheduled dates, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Any LLM" title="Procedure Preparation Guide">
You are a physician writing a preparation guide for a patient who has an upcoming medical procedure. The patient has no medical background. Write at a 6th grade reading level using short sentences and simple words.

Avoid medical jargon — if a medical term is unavoidable, define it in parentheses. Use bullet points for action items.

Using the procedure information provided below, create a patient preparation guide with the following sections:

**1. What This Procedure Is**
Explain in 2–3 simple sentences what the procedure is and why the doctor recommended it. Describe what will happen in terms the patient can picture.

**2. How to Prepare**
List specific preparation steps:
- Fasting instructions (when to stop eating and drinking)
- Medications to take or skip on the day of the procedure
- What to wear (comfortable clothing, no jewelry, etc.)
- What to bring (ID, insurance card, medication list, comfort items)
- Transportation arrangements (will they need someone to drive them home?)

**3. What Will Happen**
Walk through the procedure from the patient's perspective:
- Arrival and check-in
- Pre-procedure preparation (IV, monitors, anesthesia if applicable)
- During the procedure (what they will feel, hear, or experience — be honest but reassuring)
- How long it typically takes

**4. Right After the Procedure**
- What to expect when it is over (recovery room, grogginess, discomfort)
- How long they will stay before going home
- Any immediate restrictions

**5. Who to Call With Questions**
Tell the patient who to contact if they have questions before the procedure:
- The type of office to call (surgeon's office, procedure scheduling, pre-op clinic)
- What kinds of questions to call about (medication questions, preparation confusion, need to reschedule)
- When to call (business hours, after hours, day of procedure)

**6. Questions to Ask Before Your Procedure**
List 5 specific questions the patient should consider asking their doctor before the procedure.

---
PROCEDURE INFORMATION:
[Paste the procedure name, indication, and any relevant details (anesthesia type, inpatient vs. outpatient, special considerations) here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---|---|
| Anesthesia type | Add: "This procedure uses general anesthesia" or "This is done under local anesthesia in the office" |
| Pediatric | Add: "This procedure is for a child. Write the guide for the parents and include tips for explaining it to the child." |
| Colonoscopy/endoscopy | Add: "Include detailed bowel prep instructions" |
| Surgical | Add: "Include pre-operative testing requirements (labs, EKG, chest X-ray) and when they need to be completed" |
| Anxiety | Add: "This patient is anxious about the procedure. Include reassuring language and coping strategies." |

---

## Notes

- This template works for any procedure from office-based biopsies to major surgery. The AI will adapt the detail level based on the procedure information you provide.
- Always verify preparation instructions against your institution's specific protocols — fasting guidelines, medication holds, and arrival times vary by institution and procedure.
- For procedures requiring bowel prep, anticoagulation bridging, or complex medication management, use the AI output as a starting point and add institution-specific details.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/templates/procedure-prep.mdx
git commit -m "feat: add procedure preparation guide template"
```

---

### Task 8: Create Post-Procedure Care Instructions template

**Files:**
- Create: `src/content/templates/post-procedure-care.mdx`

- [ ] **Step 1: Create the template file**

```mdx
---
title: "Post-Procedure Care Instructions"
category: patient-education
targetTool: any
tags: [patient-education, procedure, post-op, recovery, wound-care]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

This template takes a completed procedure and clinical details and produces patient-friendly recovery instructions. It covers wound care, activity restrictions, pain management, and warning signs.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, procedure dates, provider names, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Any LLM" title="Post-Procedure Care Instructions">
You are a physician writing post-procedure recovery instructions for a patient. The patient has no medical background. Write at a 6th grade reading level using short sentences and simple words.

Avoid medical jargon — if a medical term is unavoidable, define it in parentheses. Use bullet points for action items. Bold any critical safety information.

Using the procedure information provided below, create post-procedure care instructions with the following sections:

**1. What Was Done**
Explain in 2–3 simple sentences what procedure was performed and why. Use everyday language.

**2. Wound and Site Care** (if applicable)
- How to care for the incision, wound, or procedure site
- When and how to change bandages
- When it is OK to shower or bathe
- What normal healing looks like vs. signs of a problem

**3. Activity Restrictions**
Be specific about:
- What activities to avoid and for how long (lifting limits, exercise, driving, work, sexual activity)
- A timeline for returning to normal activities (day by day or week by week)
- Any positions to avoid or prefer (e.g., "sleep with your head elevated for 3 days")

**4. Pain Management**
- Prescribed pain medications: name, dose, how often, maximum daily amount
- When to transition to over-the-counter pain relief
- Non-medication pain strategies (ice, elevation, rest)
- **Bold:** When pain is NOT normal and needs medical attention

**5. Call Your Doctor If**
List 4–6 specific signs that mean the patient should call their doctor's office. Be concrete and specific.

**6. Go to the ER If**
List 3–5 signs that mean the patient should go to the emergency room or call 911 immediately. **Bold each one.**

**7. Follow-Up**
- When the follow-up appointment should be scheduled
- What will happen at the follow-up visit
- How to reach the doctor's office with questions before then

---
PROCEDURE INFORMATION:
[Paste the procedure performed, any complications, wound details, prescribed medications, and follow-up plan here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---|---|
| Minor procedure | Add: "This was a minor office procedure. Keep instructions brief (1 page)." |
| Major surgery | Add: "This was a major surgery requiring general anesthesia. Include detailed recovery timeline by week." |
| Drain/device care | Add: "The patient was sent home with a [drain/catheter/device]. Include specific care instructions." |
| Pediatric | Add: "This procedure was on a child. Write instructions for the parents." |
| Opioid prescribing | Add: "Include safe storage and disposal instructions for the prescribed opioid medication" |

---

## Notes

- This template is shared across the **Inpatient Discharge Education** and **Procedure Education** workflows.
- Pain management instructions are high-risk for AI errors. Always verify medication names, doses, and intervals against the actual prescription.
- For surgical procedures, the AI output should supplement (not replace) your institution's standardized post-operative instruction sheets.
- Wound care instructions vary significantly by procedure — review this section carefully before giving to the patient.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/templates/post-procedure-care.mdx
git commit -m "feat: add post-procedure care instructions template"
```

---

### Task 9: Create Lifestyle Modification Plan template

**Files:**
- Create: `src/content/templates/lifestyle-modification-plan.mdx`

- [ ] **Step 1: Create the template file**

```mdx
---
title: "Lifestyle Modification Plan"
category: patient-education
targetTool: any
workflow: outpatient-visit-education
tags: [patient-education, lifestyle, diet, exercise, behavioral-health]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

This template takes a condition, the patient's current habits, and clinical goals and produces an actionable, personalized lifestyle modification plan. The output includes specific diet, exercise, and behavioral recommendations — not generic "eat healthy and exercise" advice.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Any LLM" title="Lifestyle Modification Plan">
You are a physician creating a personalized lifestyle modification plan for a patient. The patient has no medical background. Write at a 6th grade reading level using short sentences and simple words.

Be specific and actionable — not vague. Instead of "eat a healthy diet," say "eat 2 servings of vegetables at lunch and dinner." Instead of "exercise more," say "walk for 20 minutes after dinner, 5 days a week."

Avoid medical jargon — if a medical term is unavoidable, define it in parentheses. Use bullet points for action items.

Using the clinical information provided below, create a lifestyle modification plan with the following sections:

**1. Why These Changes Matter**
Explain in 2–3 simple sentences how these lifestyle changes will help the patient's specific condition. Connect the changes to outcomes the patient cares about (feeling better, avoiding medication, preventing hospitalization).

**2. Diet**
Provide specific, actionable dietary recommendations:
- Foods to eat more of (with examples and serving sizes)
- Foods to eat less of or avoid (with specific examples)
- Meal timing or frequency guidance if relevant
- A sample day of meals (breakfast, lunch, dinner, snacks)
- Practical tips (meal prep, grocery shopping, eating out)

**3. Exercise**
Provide specific, actionable exercise recommendations:
- Type of exercise (walking, swimming, strength training, etc.)
- How often (days per week)
- How long (minutes per session)
- How hard (use simple descriptions: "you should be able to talk but not sing")
- A beginner starting point if the patient is currently sedentary
- Safety considerations or restrictions

**4. Other Changes**
Address other relevant behavioral modifications:
- Sleep (specific habits, target hours)
- Stress management (specific techniques, not just "reduce stress")
- Smoking or alcohol cessation if applicable (specific first steps)
- Weight management goals if applicable (realistic, time-bound)

**5. Your Weekly Starter Plan**
Create a simple Monday-through-Sunday starter plan that incorporates the above recommendations. Keep it realistic — small changes that build over time. Format as a table.

**6. How to Track Your Progress**
- What to measure or track (weight, blood pressure, blood sugar, symptoms, exercise minutes)
- How often to check
- A simple tracking method (app, notebook, calendar)

**7. When to Check In With Your Doctor**
- When the next follow-up should be
- What progress to report
- When to call sooner (if symptoms worsen or new symptoms appear)

---
CLINICAL INFORMATION:
[Paste the diagnosis, current lifestyle habits, clinical goals (e.g., target blood pressure, A1c goal), current medications, and any exercise restrictions here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---|---|
| Diabetes | Add: "Focus on carbohydrate counting and blood sugar monitoring. Include a carb-counting guide." |
| Heart failure | Add: "Include fluid restriction and daily weight monitoring. Emphasize sodium limits with specific gram targets." |
| Obesity | Add: "Focus on sustainable caloric deficit. Avoid language about dieting — frame as long-term habits." |
| Elderly | Add: "Account for mobility limitations. Focus on fall prevention and balance exercises." |
| Budget constraints | Add: "The patient has limited food budget. Recommend affordable, accessible foods." |

---

## Notes

- The quality of the output depends heavily on the specificity of the input. Include current habits, not just the diagnosis — "patient currently eats fast food 5x/week and does not exercise" produces a much better plan than "patient has hypertension."
- AI-generated diet plans should be reviewed for safety, especially for patients with diabetes, kidney disease, food allergies, or eating disorders.
- This template pairs well with the **Follow-Up Visit Prep** template to help the patient track and report their progress.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/templates/lifestyle-modification-plan.mdx
git commit -m "feat: add lifestyle modification plan template"
```

---

### Task 10: Create Follow-Up Visit Preparation template

**Files:**
- Create: `src/content/templates/follow-up-visit-prep.mdx`

- [ ] **Step 1: Create the template file**

```mdx
---
title: "Follow-Up Visit Preparation"
category: patient-education
targetTool: any
tags: [patient-education, follow-up, visit-prep, self-monitoring]
lastUpdated: 2026-03-18
---

import Callout from '../../components/Callout.astro';
import PromptPlayground from '../../components/PromptPlayground.astro';

This template takes a condition and treatment history and produces a guide that helps patients prepare for their next doctor's visit. It includes what to track, questions to ask, and what to bring — so the visit is more productive for both patient and physician.

<Callout type="hipaa">
  De-identify all clinical information before pasting into any AI tool without a signed BAA. Remove patient name, date of birth, MRN, and any other direct identifiers.
</Callout>

---

## Prompt Template

<PromptPlayground tool="Any LLM" title="Follow-Up Visit Preparation">
You are a physician creating a visit preparation guide to help a patient get the most out of their upcoming follow-up appointment. The patient has no medical background. Write at a 6th grade reading level using short sentences and simple words.

Avoid medical jargon — if a medical term is unavoidable, define it in parentheses. Use bullet points and tables for clarity.

Using the clinical information provided below, create a follow-up visit preparation guide with the following sections:

**1. What to Track Before Your Visit**
List 4–6 specific things the patient should monitor and record before their appointment. For each item, explain:
- What to measure (e.g., blood pressure, blood sugar, weight, symptoms)
- How often to measure it
- How to measure it correctly

**2. Symptom Diary**
Create a simple table the patient can fill out daily (or as appropriate). Include columns for:
- Date
- Relevant symptoms (specific to their condition)
- Severity (1–10 scale)
- Any triggers or notes
- Medications taken

Format as a markdown table with 7 rows (one week).

**3. Questions to Ask Your Doctor**
List 5–7 specific, relevant questions the patient should consider asking at their visit. Tailor these to the condition and treatment — not generic questions. Examples of good questions are specific: "Should I keep taking [medication] if my blood pressure is consistently below 120/80?" rather than "Do I still need my medication?"

**4. What to Bring**
Checklist of items to bring to the appointment:
- Current medication list (or bring all medication bottles)
- Symptom diary / tracking records
- Insurance card and ID
- List of questions (from section 3)
- Any test results from other providers
- A family member or friend to help remember what the doctor says (if desired)

**5. What Your Doctor Will Likely Do**
Explain what the patient can expect during the visit:
- What the doctor will ask about
- Physical exam components likely to be performed
- Tests that may be ordered
- Possible changes to the treatment plan

---
CLINICAL INFORMATION:
[Paste the diagnosis, current treatment plan, recent test results, and any specific concerns or goals for the next visit here]
</PromptPlayground>

---

## Customization Guide

| Element | How to Adjust |
|---|---|
| Post-surgical | Add: "This is a post-surgical follow-up. Include wound healing progress and functional milestones to report." |
| Chronic disease | Add: "This patient has had this condition for [duration]. Focus on long-term management and treatment optimization." |
| New diagnosis | Add: "This is the first follow-up after a new diagnosis. Include questions about prognosis and treatment options." |
| Telehealth | Add: "This visit will be by video. Include tech setup tips and how to show the doctor relevant physical findings on camera." |
| Multiple providers | Add: "This patient sees multiple specialists. Include a section on coordinating care and sharing records between providers." |

---

## Notes

- This template is shared across the **Inpatient Discharge Education** and **Outpatient Visit Education** workflows. Use it any time a patient has an upcoming follow-up visit.
- Patients who arrive prepared with tracked data and specific questions have more productive visits and better outcomes.
- The symptom diary table is intentionally simple. For patients with complex tracking needs (e.g., diabetes with multiple daily blood sugars), consider supplementing with a dedicated tracking app recommendation.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/templates/follow-up-visit-prep.mdx
git commit -m "feat: add follow-up visit preparation template"
```

---

### Task 11: Build verification — all templates

- [ ] **Step 1: Run the Astro build**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build succeeds. All 8 templates (7 new + 1 existing) should compile. The templates index page at `/templates/` should show a "Patient Education" category section with 7 templates, each displaying "For Any LLM".

- [ ] **Step 2: Fix any build errors if needed**

If the build fails, read the error message and fix the specific issue. Common issues:
- Frontmatter validation errors (check field names and types against `src/content.config.ts`)
- Import path errors (imports should use `../../components/`)
- MDX syntax errors (ensure no unescaped special characters in prompts)

---

### Task 12: Create Inpatient Discharge Education workflow

**Files:**
- Create: `src/content/workflows/inpatient-discharge-education.mdx`

Reference pattern: `src/content/workflows/discharge-summary.mdx`

Note: The existing discharge-summary workflow uses a `ToolCard` component with a "Recommended Tool" section. The new patient-education workflows intentionally omit this because they are tool-agnostic by design — the templates work with any LLM.

- [ ] **Step 1: Create the workflow file**

```mdx
---
title: "Creating Inpatient Discharge Education Materials"
category: patient-education
tools: [claude]
templates: [discharge-instructions-patient, new-medication-guide, post-procedure-care, follow-up-visit-prep]
tags: [patient-education, discharge, inpatient, education-materials]
timeToRead: 6
lastUpdated: 2026-03-18
specialty: [general-medicine]
---

import Callout from '../../components/Callout.astro';

## The Problem

Patients forget **40–80% of medical information** provided during discharge, and nearly half recall it incorrectly. Handwritten or rushed discharge instructions lead to medication errors, missed follow-ups, and preventable readmissions. AI can help generate clear, consistent, patient-friendly education materials in minutes.

This workflow walks you through generating a complete set of discharge education materials using prompt templates and any LLM.

<Callout type="hipaa">
  Never paste identifiable patient information (name, DOB, MRN, dates of service) into a consumer AI tool. Use a de-identified summary or ensure your organization has a BAA in place with the vendor before using patient data.
</Callout>

---

## Step 1: De-Identify Your Notes

Before using any AI tool, remove all direct identifiers from your discharge documentation:

- Patient name, date of birth, MRN
- Admission and discharge dates
- Provider names
- Any other PHI (addresses, phone numbers, Social Security numbers)

Keep the clinical content: diagnoses, medications, procedures, lab results, and follow-up plans.

---

## Step 2: Generate the Discharge Instructions

Use the **[Patient Discharge Instructions](/templates/discharge-instructions-patient)** template. Paste in your de-identified discharge summary or structured notes. The output will include:

- A simple explanation of why they were hospitalized
- Medication changes in plain language
- Activity and diet guidance
- Follow-up appointments
- Warning signs for when to call the doctor or go to the ER

---

## Step 3: Generate Medication Guides

For each **new or significantly changed medication**, use the **[New Medication Guide](/templates/new-medication-guide)** template. This produces a dedicated guide for each medication covering:

- What it does and why it was prescribed
- How to take it correctly
- Side effects and interactions
- What to do if a dose is missed

<Callout type="tip">
  For patients going home on 3+ new medications, generating individual medication guides for each one significantly improves adherence and reduces confusion.
</Callout>

---

## Step 4: Generate Post-Procedure Instructions (If Applicable)

If the patient had a procedure during their hospitalization, use the **[Post-Procedure Care Instructions](/templates/post-procedure-care)** template. This covers wound care, activity restrictions, pain management, and warning signs specific to the procedure.

Skip this step if no procedure was performed.

---

## Step 5: Generate Follow-Up Visit Prep

Use the **[Follow-Up Visit Preparation](/templates/follow-up-visit-prep)** template to help the patient prepare for their first outpatient follow-up. This gives them a tracking checklist, symptom diary, and questions to ask at their next visit.

---

## Step 6: Review All Materials

Before giving any AI-generated materials to the patient, verify:

- [ ] **Medication names, doses, and frequencies** match the actual discharge medication reconciliation
- [ ] **Follow-up appointments** are accurate and include scheduling instructions
- [ ] **Warning signs** are appropriate for this patient's specific conditions
- [ ] **Activity restrictions** are consistent with the physician's actual orders
- [ ] **No fabricated information** appears in any document
- [ ] **Reading level** is appropriate for this specific patient

<Callout type="pitfall">
  The medication section is the highest-risk part of any AI-generated patient education material. Always cross-reference against the actual medication reconciliation and pharmacy discharge paperwork.
</Callout>

---

## Step 7: Customize and Deliver

Adjust materials for the individual patient:

- **Lower reading level** if the patient has limited literacy
- **Add translations** if the patient has limited English proficiency (have a qualified medical interpreter review)
- **Increase or decrease detail** based on discharge complexity
- **Highlight the most critical action items** for this specific patient

Print, email through the patient portal, or hand-deliver depending on your institution's workflow.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/workflows/inpatient-discharge-education.mdx
git commit -m "feat: add inpatient discharge education workflow"
```

---

### Task 13: Create Outpatient Visit Education workflow

**Files:**
- Create: `src/content/workflows/outpatient-visit-education.mdx`

- [ ] **Step 1: Create the workflow file**

```mdx
---
title: "Creating Outpatient Visit Education Materials"
category: patient-education
tools: [claude]
templates: [condition-explainer, new-medication-guide, lifestyle-modification-plan, follow-up-visit-prep]
tags: [patient-education, outpatient, clinic, education-materials]
timeToRead: 5
lastUpdated: 2026-03-18
specialty: [general-medicine]
---

import Callout from '../../components/Callout.astro';

## The Problem

A typical outpatient visit is 15–20 minutes. In that time, you may deliver a new diagnosis, start a new medication, and recommend lifestyle changes. Patients leave with a lot of information and limited ability to retain it. Written education materials improve recall, adherence, and patient satisfaction — but creating them from scratch takes time you don't have.

This workflow shows you how to generate a complete set of patient education materials after an outpatient visit using prompt templates and any LLM.

<Callout type="hipaa">
  Never paste identifiable patient information (name, DOB, MRN) into a consumer AI tool. Use a de-identified summary or ensure your organization has a BAA in place with the vendor before using patient data.
</Callout>

---

## Step 1: Identify What the Patient Needs

After the visit, decide which education materials this patient needs. Not every patient needs all four templates. Common scenarios:

| Scenario | Templates to Use |
|---|---|
| New diagnosis | Condition Explainer |
| New medication | New Medication Guide |
| Lifestyle counseling | Lifestyle Modification Plan |
| Any follow-up needed | Follow-Up Visit Prep |
| New diagnosis + new medication + lifestyle changes | All four |

---

## Step 2: Explain the Diagnosis

For any new or poorly understood diagnosis, use the **[Condition Explainer](/templates/condition-explainer)** template. Paste in the diagnosis and relevant clinical context. The output explains the condition in plain language, including what it is, what causes it, what to expect, and when to seek emergency care.

<Callout type="tip">
  Even for conditions the patient has had for years, a Condition Explainer can be helpful if they don't seem to understand their disease well. "I've had diabetes for 10 years" doesn't mean they understand what A1c means.
</Callout>

---

## Step 3: Explain New Medications

For any new prescriptions, use the **[New Medication Guide](/templates/new-medication-guide)** template. Provide the medication name, dose, frequency, and indication. The output covers how to take it, side effects, interactions, and what to do about missed doses.

---

## Step 4: Create a Lifestyle Plan

If you discussed lifestyle modifications (diet, exercise, weight loss, smoking cessation, stress management), use the **[Lifestyle Modification Plan](/templates/lifestyle-modification-plan)** template.

For the best output, include the patient's **current habits** in the clinical information — not just the diagnosis. "Patient with hypertension who eats fast food daily and does not exercise" produces a much more actionable plan than "patient with hypertension."

---

## Step 5: Prepare for the Next Visit

Use the **[Follow-Up Visit Preparation](/templates/follow-up-visit-prep)** template to give the patient a guide for their next appointment. This includes what to track, questions to ask, and what to bring.

---

## Step 6: Review and Deliver

Before giving materials to the patient:

- [ ] **Verify all medical information** is accurate for this patient
- [ ] **Check medication details** against the prescription
- [ ] **Review lifestyle recommendations** for safety (especially for patients with comorbidities)
- [ ] **Confirm the reading level** is appropriate for the patient
- [ ] **Remove or adjust** any sections that don't apply

<Callout type="pitfall">
  AI-generated lifestyle recommendations may not account for all comorbidities. A "healthy diet" recommendation for a diabetic patient is very different from one for a patient with chronic kidney disease. Review carefully.
</Callout>

Deliver via patient portal, print, or hand to the patient before they leave the office.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/workflows/outpatient-visit-education.mdx
git commit -m "feat: add outpatient visit education workflow"
```

---

### Task 14: Create Procedure Education workflow

**Files:**
- Create: `src/content/workflows/procedure-education.mdx`

- [ ] **Step 1: Create the workflow file**

```mdx
---
title: "Creating Procedure Education Materials"
category: patient-education
tools: [claude]
templates: [procedure-prep, post-procedure-care]
tags: [patient-education, procedure, surgery, education-materials]
timeToRead: 4
lastUpdated: 2026-03-18
specialty: [general-medicine]
---

import Callout from '../../components/Callout.astro';

## The Problem

Patients who understand what to expect before and after a procedure have less anxiety, better compliance with preparation instructions, and fewer post-procedure complications. But writing custom preparation and recovery guides for every procedure takes time, and generic institutional handouts often don't match the specific procedure or patient situation.

This workflow shows you how to generate procedure-specific patient education materials using prompt templates and any LLM.

<Callout type="hipaa">
  Never paste identifiable patient information (name, DOB, MRN, scheduled dates) into a consumer AI tool. Use a de-identified summary or ensure your organization has a BAA in place with the vendor before using patient data.
</Callout>

---

## Step 1: Before the Procedure — Preparation Guide

Use the **[Procedure Preparation Guide](/templates/procedure-prep)** template to create a "what to expect" guide. Provide the procedure name, indication, anesthesia type, and any special preparation requirements.

The output covers:
- What the procedure is and why it's being done
- How to prepare (fasting, medication holds, what to bring)
- What will happen during the procedure (from the patient's perspective)
- What to expect immediately after

<Callout type="tip">
  Give the preparation guide to the patient at the time the procedure is scheduled — not the day before. Patients need time to arrange transportation, adjust medications, and prepare mentally.
</Callout>

---

## Step 2: After the Procedure — Recovery Instructions

After the procedure is completed, use the **[Post-Procedure Care Instructions](/templates/post-procedure-care)** template. Provide the procedure performed, any complications, wound details, prescribed pain medications, and the follow-up plan.

The output covers:
- What was done (in plain language)
- Wound/site care
- Activity restrictions with specific timelines
- Pain management guidance
- Warning signs that need medical attention

---

## Step 3: Review Against Institutional Protocols

AI-generated procedure instructions should be verified against your institution's standard protocols:

- [ ] **Preparation instructions** match your institution's specific fasting and medication hold policies
- [ ] **Wound care instructions** are appropriate for the specific procedure performed
- [ ] **Activity restrictions** match the surgeon's or proceduralist's actual recommendations
- [ ] **Pain management instructions** accurately reflect the prescribed medications and doses
- [ ] **Follow-up timing** matches the scheduled post-procedure visit
- [ ] **Warning signs** are comprehensive and appropriate

<Callout type="pitfall">
  Fasting guidelines, medication hold policies, and post-operative protocols vary by institution. The AI will generate reasonable general guidance, but always verify against your institution's specific policies.
</Callout>

---

## Step 4: Customize for Complexity

Adjust the detail level based on the procedure:

| Procedure Type | Customization |
|---|---|
| Minor office procedure | Shorten instructions to 1 page. Simplify wound care. |
| Endoscopy/colonoscopy | Add detailed bowel prep instructions. |
| Day surgery | Include anesthesia recovery expectations. |
| Major surgery | Add week-by-week recovery timeline. Include drain/device care if applicable. |
| Repeat procedure | Shorten the "what to expect" section — focus on any changes from last time. |

Deliver the preparation guide well in advance and the recovery guide at the time of discharge.
```

- [ ] **Step 2: Commit**

```bash
git add src/content/workflows/procedure-education.mdx
git commit -m "feat: add procedure education workflow"
```

---

### Task 15: Final build verification

- [ ] **Step 1: Run the full Astro build**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run build`
Expected: Build succeeds with zero errors.

- [ ] **Step 2: Verify the dev server**

Run: `cd /Users/jasongusdorf/CodingProjects/Claude/LLMsforDoctors/llmsfordoctors && npm run dev`

Check these pages in the browser:
- `/templates/` — Should show "Patient Education" category with 7 templates, each showing "For Any LLM"
- `/templates/condition-explainer` — Should render with PromptPlayground showing "Any LLM"
- `/workflows/` — Should show "Patient Education" category with 3 workflows
- `/workflows/inpatient-discharge-education` — Should show related templates in sidebar (including multi-workflow templates)
- `/workflows/outpatient-visit-education` — Same check for related templates
- `/workflows/procedure-education` — Same check for related templates

- [ ] **Step 3: Fix any issues found during verification**

If any page doesn't render correctly, identify the issue and fix it.
