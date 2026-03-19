# Patient Education Templates — Design Spec

**Date:** 2026-03-18
**Status:** Draft
**Author:** Jason Gusdorf, MD + Claude

## Overview

Add a suite of 7 patient education prompt templates and 3 workflows to llmsfordoctors.com. These are LLM prompt templates that clinicians copy into any LLM, paste in clinical context, and receive patient-friendly education materials at a 6th grade reading level.

## Design Decisions

- **Tool-agnostic:** All templates use `targetTool: "any"` instead of targeting a specific LLM. The site UI displays "Any LLM" for these templates.
- **6th grade reading level:** All prompts instruct the LLM to write at a 6th grade reading level per AMA recommendations. Short sentences, no unexplained jargon, bullet points for action items.
- **Existing architecture:** No schema changes, no new components, no new pages. Everything fits within the current content collections and page routes.
- **Workflow assignment:** Templates that belong to exactly one workflow set `workflow` in frontmatter. Templates shared across multiple workflows omit `workflow` (it's optional). Cross-referencing is handled by the `templates` array in workflow frontmatter.
- **Tool field on workflows:** The `tools` field is required on workflows. All patient-education workflows use `tools: [claude]` (the only tool in the system) even though the content is tool-agnostic in tone. This is a schema constraint, not a content recommendation.

## Templates (7 MDX files)

All placed in `src/content/templates/` with `category: patient-education` and `targetTool: "any"`.

Each template follows the existing pattern from `discharge-summary-basic.mdx`:
- Intro paragraph explaining what the template produces
- HIPAA callout (de-identification reminder)
- `PromptPlayground` component with the full prompt (copy-to-clipboard), using `tool="Any LLM"`
- Customization guide table
- Notes section

### 1. condition-explainer.mdx — Condition Explainer

```yaml
---
title: "Condition Explainer"
category: patient-education
targetTool: any
workflow: outpatient-visit-education
tags: [patient-education, diagnosis, condition, explainer]
lastUpdated: 2026-03-18
---
```

**Purpose:** Takes a diagnosis and clinical context, outputs a plain-language explanation for the patient.

**Prompt instructs the LLM to produce:**
- What the condition is (in simple terms)
- What causes it
- What the patient can expect (symptoms, progression)
- What the treatment plan involves
- When to seek emergency care

### 2. discharge-instructions-patient.mdx — Patient Discharge Instructions

```yaml
---
title: "Patient Discharge Instructions"
category: patient-education
targetTool: any
workflow: inpatient-discharge-education
tags: [patient-education, discharge, instructions, inpatient]
lastUpdated: 2026-03-18
---
```

**Purpose:** Takes discharge notes, outputs a patient-friendly take-home instruction sheet.

**Prompt instructs the LLM to produce:**
- Why the patient was in the hospital (simple summary)
- Medications: what's new, what changed, what stopped — with plain-language explanations
- Activity and diet instructions
- Follow-up appointments with dates/times
- Warning signs that mean "go to the ER"

### 3. new-medication-guide.mdx — New Medication Guide

```yaml
---
title: "New Medication Guide"
category: patient-education
targetTool: any
tags: [patient-education, medication, prescription, pharmacy]
lastUpdated: 2026-03-18
---
```

**Note:** No `workflow` field — this template is shared by both inpatient-discharge-education and outpatient-visit-education workflows. Cross-referenced via those workflows' `templates` arrays.

**Purpose:** Takes medication name, dose, and indication, outputs a patient-friendly medication explanation.

**Prompt instructs the LLM to produce:**
- What the medication is for (in simple terms)
- How to take it (timing, with/without food, etc.)
- Common side effects and what to do about them
- Dangerous side effects that need immediate attention
- Interactions to avoid (foods, other medications, alcohol)
- What to do if a dose is missed

### 4. procedure-prep.mdx — Procedure Preparation Guide

```yaml
---
title: "Procedure Preparation Guide"
category: patient-education
targetTool: any
workflow: procedure-education
tags: [patient-education, procedure, preparation, pre-op]
lastUpdated: 2026-03-18
---
```

**Purpose:** Takes procedure name and details, outputs a "what to expect" guide for the patient.

**Prompt instructs the LLM to produce:**
- What the procedure is and why it's being done (simple terms)
- How to prepare (fasting, medication holds, what to bring)
- What will happen during the procedure (step by step, patient perspective)
- How long it typically takes
- What to expect immediately after
- Who to call with questions before the procedure

### 5. post-procedure-care.mdx — Post-Procedure Care Instructions

```yaml
---
title: "Post-Procedure Care Instructions"
category: patient-education
targetTool: any
tags: [patient-education, procedure, post-op, recovery, wound-care]
lastUpdated: 2026-03-18
---
```

**Note:** No `workflow` field — this template is shared by both inpatient-discharge-education and procedure-education workflows. Cross-referenced via those workflows' `templates` arrays.

**Purpose:** Takes procedure performed and clinical context, outputs recovery instructions.

**Prompt instructs the LLM to produce:**
- What was done (simple summary)
- Wound/site care instructions (if applicable)
- Activity restrictions and timeline for resuming normal activities
- Pain management guidance
- Signs of complications that require calling the doctor
- Signs of emergency that require going to the ER
- Follow-up appointment details

### 6. lifestyle-modification-plan.mdx — Lifestyle Modification Plan

```yaml
---
title: "Lifestyle Modification Plan"
category: patient-education
targetTool: any
workflow: outpatient-visit-education
tags: [patient-education, lifestyle, diet, exercise, behavioral-health]
lastUpdated: 2026-03-18
---
```

**Purpose:** Takes condition, current habits, and goals, outputs an actionable lifestyle plan.

**Prompt instructs the LLM to produce:**
- Why these changes matter for the patient's specific condition
- Diet recommendations (specific, actionable — not just "eat healthy")
- Exercise recommendations (type, frequency, duration, starting point)
- Behavioral changes (sleep, stress management, smoking cessation if applicable)
- A simple weekly starter plan
- How to track progress
- When to follow up with the doctor about progress

### 7. follow-up-visit-prep.mdx — Follow-Up Visit Preparation

```yaml
---
title: "Follow-Up Visit Preparation"
category: patient-education
targetTool: any
tags: [patient-education, follow-up, visit-prep, self-monitoring]
lastUpdated: 2026-03-18
---
```

**Note:** No `workflow` field — this template is shared by both inpatient-discharge-education and outpatient-visit-education workflows. Cross-referenced via those workflows' `templates` arrays.

**Purpose:** Takes condition and treatment history, outputs a guide for what the patient should do before their next visit.

**Prompt instructs the LLM to produce:**
- What to track before the visit (symptoms, measurements, side effects)
- A simple symptom diary template (table format)
- Questions the patient should consider asking the doctor
- What to bring to the appointment (medication list, test results, insurance)
- What the doctor will likely check or ask about

## Workflows (3 MDX files)

All placed in `src/content/workflows/` with `category: patient-education`. The `tools` field is required by the schema, so all workflows use `tools: [claude]` (the only tool in the system). Content is tool-agnostic in tone.

Each workflow follows the existing pattern from `discharge-summary.mdx`:
- Introduction explaining the clinical scenario
- Step-by-step guide (which templates, in what order, what context to provide)
- Review checklist (verify before giving to patient)
- HIPAA callout
- Customization tips

### 1. inpatient-discharge-education.mdx — Creating Inpatient Discharge Education Materials

```yaml
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
```

**Workflow steps:**
1. De-identify the discharge summary / clinical notes
2. Use the **Patient Discharge Instructions** template for the main take-home sheet
3. Use the **New Medication Guide** template for each new or changed medication
4. If a procedure was performed, use the **Post-Procedure Care** template
5. Use the **Follow-Up Visit Prep** template to help the patient prepare for their first outpatient follow-up
6. Review all outputs against the clinical record for accuracy
7. Adjust reading level or detail as needed for the specific patient

### 2. outpatient-visit-education.mdx — Creating Outpatient Visit Education Materials

```yaml
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
```

**Workflow steps:**
1. After the visit, identify what the patient needs to understand (new diagnosis, new medication, lifestyle changes)
2. Use the **Condition Explainer** template for any new or poorly understood diagnosis
3. Use the **New Medication Guide** template for any new prescriptions
4. Use the **Lifestyle Modification Plan** template if behavioral changes were discussed
5. Use the **Follow-Up Visit Prep** template to help the patient prepare for their next visit
6. Review all outputs for accuracy and appropriateness
7. Consider the patient's specific literacy level and adjust if needed

### 3. procedure-education.mdx — Creating Procedure Education Materials

```yaml
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
```

**Workflow steps:**
1. Before the procedure: use the **Procedure Preparation Guide** template with procedure details
2. After the procedure: use the **Post-Procedure Care** template with procedure notes and specific instructions
3. Review both outputs against standard institutional protocols
4. Verify any medication instructions (pain management, antibiotics) match the actual orders
5. Adjust detail level based on procedure complexity

## Code Changes

### src/pages/templates/index.astro

The templates index page renders `For {tmpl.data.targetTool}` directly. When `targetTool === "any"`, display "Any LLM" instead. A simple inline conditional: `tmpl.data.targetTool === "any" ? "Any LLM" : tmpl.data.targetTool`.

**Note:** `TemplateCard.astro` exists but is not currently imported or used by any page — no changes needed there. `ContentLayout.astro` does not display `targetTool` — no changes needed. `PromptPlayground.astro` accepts `tool` as a display string — templates simply pass `tool="Any LLM"` with no component changes needed.

### src/utils/collections.ts — `getTemplatesForWorkflow()`

Update to also check the workflow's `templates` array, so templates shared across multiple workflows appear in all their workflow sidebars. Current implementation only checks the template's `workflow` field. Updated implementation:

```typescript
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

## File Summary

**New files (10):**
- `src/content/templates/condition-explainer.mdx`
- `src/content/templates/discharge-instructions-patient.mdx`
- `src/content/templates/new-medication-guide.mdx`
- `src/content/templates/procedure-prep.mdx`
- `src/content/templates/post-procedure-care.mdx`
- `src/content/templates/lifestyle-modification-plan.mdx`
- `src/content/templates/follow-up-visit-prep.mdx`
- `src/content/workflows/inpatient-discharge-education.mdx`
- `src/content/workflows/outpatient-visit-education.mdx`
- `src/content/workflows/procedure-education.mdx`

**Modified files (3):**
- `src/pages/templates/index.astro` — "Any LLM" display conditional for `targetTool === "any"`
- `src/pages/templates/[...slug].astro` — Reverse workflow lookup so shared templates show all parent workflows in sidebar
- `src/utils/collections.ts` — Update `getTemplatesForWorkflow()` to also check the workflow's `templates` array

## Out of Scope

- Schema changes to `content.config.ts`
- New Astro components or pages
- Specialty-specific template variants (can be added later)
- Multi-language support
- Courses collection content
