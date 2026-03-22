# Audit Report: Tools & Workflows

**Auditor:** Claude (automated)
**Date:** 2026-03-22
**Rubric:** Content Standards v1 - Shared Criteria Only (6 dimensions, 1-5 scale)
**Files audited:** 18 (12 tools + 6 workflows)

---

## Abridge
**File:** `src/content/tools/abridge.mdx`
**Collection:** tools
**Composite Score:** 4.2

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Scannable, well-formatted with headers, bullet lists, and callout boxes. Plain language throughout. |
| Actionability | 4 | Clearly helps a clinician understand whether to pursue procurement. Could add a concrete "next step" such as a link to request a demo or a comparison checklist. |
| Navigation | 4 | Descriptive headers (Overview, Clinical Strengths, Weaknesses, HIPAA & Privacy). Slight redundancy between the Overview and HIPAA sections covering the same security details. |
| Audience Fit | 5 | Accessible to non-technical clinicians. Security details are explained in context rather than assumed. |
| Freshness | 4 | lastUpdated 2026-03-18; content references current certifications. No specific model version numbers to go stale. Minor gap: no mention of competitors with newer features since last update. |
| Cross-linking | 3 | No cross-links to related tools (e.g., Nabla, Suki, Dragon Copilot for comparison), workflows, or the tool comparison guide. Standalone island for a category with many peers. |

---

## Augmedix
**File:** `src/content/tools/augmedix.mdx`
**Collection:** tools
**Composite Score:** 3.8

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-organized with clear headers and callouts. Some sections are wordy; the Overview and Strengths overlap on "operational maturity" messaging. |
| Actionability | 4 | Gives clinicians and procurement teams clear guidance on what to ask during vendor evaluation. The tip callout is actionable. |
| Navigation | 4 | Standard header structure works well. Some redundancy between Weaknesses and HIPAA sections. |
| Audience Fit | 4 | Readable by non-technical clinicians. Some compliance terminology (RBAC, NDA) could use brief inline definitions for less technical readers. |
| Freshness | 4 | lastUpdated 2026-03-18; content is current. References to the hybrid AI-plus-services model are accurate for the vendor's current positioning. |
| Cross-linking | 3 | No links to competing tools (Abridge, Suki, Dragon Copilot), no links to workflows or guides. Missed opportunity for comparative context. |

---

## Claude
**File:** `src/content/tools/claude.mdx`
**Collection:** tools
**Composite Score:** 4.7

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Concise, well-organized, scannable. Each section has a clear purpose and avoids redundancy. |
| Actionability | 5 | Tells clinicians exactly what Claude is best for, what it is not good for, and where alternatives are better (links to o3 for DDx). Directly helps the try/buy decision. |
| Navigation | 5 | Clear descriptive headers. Logical flow from overview to strengths to weaknesses to clinical reasoning to privacy. Short enough to scan easily. |
| Audience Fit | 5 | Written for clinicians with no assumed technical knowledge. Explains concepts like context windows in practical terms. |
| Freshness | 4 | lastUpdated 2026-03-18. References Claude 3.5+ context window (200K tokens) -- should verify whether newer model versions have changed this. |
| Cross-linking | 4 | Links to the clinical reasoning comparison guide, clinical reasoning workflow, and cognitive debiasing workflow. Missing links to templates (e.g., discharge summary, DDx generator) where Claude is recommended. |

---

## DeepScribe
**File:** `src/content/tools/deepscribe.mdx`
**Collection:** tools
**Composite Score:** 4.0

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-structured with clear headers and callouts. The Overview is slightly long and could be tighter. |
| Actionability | 4 | Good guidance on what to verify during procurement. The specialty-focused tip is directly actionable. Lacks a specific "how to evaluate" checklist. |
| Navigation | 4 | Standard header structure. HIPAA section partially repeats Weaknesses content. |
| Audience Fit | 4 | Accessible language. Some security terminology (RBAC, FIPS) used without definition, though context helps. |
| Freshness | 4 | lastUpdated 2026-03-18. Content is current. No stale references identified. |
| Cross-linking | 4 | References Nuance/Microsoft and Abridge as comparison points inline. However, no hyperlinks to those tool reviews or to related workflows. |

---

## Doximity
**File:** `src/content/tools/doximity.mdx`
**Collection:** tools
**Composite Score:** 4.3

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent use of callouts to highlight the critical "not all features are HIPAA-designated" point. Plain language throughout. |
| Actionability | 5 | Strong actionable guidance: check which features are covered, verify BAA scope, understand limitations. The pitfall callout is highly practical. |
| Navigation | 4 | Clear descriptive headers. Logical flow. Minor overlap between Weaknesses and HIPAA sections on feature-level coverage. |
| Audience Fit | 5 | Written for the individual clinician who likely already has a Doximity account. Meets them where they are. |
| Freshness | 4 | lastUpdated 2026-03-18. References current Doximity feature set. No stale information detected. |
| Cross-linking | 3 | No links to competing tools, related workflows, or the patient education templates that Doximity's drafting features relate to. |

---

## Dragon Copilot
**File:** `src/content/tools/dragon-copilot.mdx`
**Collection:** tools
**Composite Score:** 4.3

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Exceptionally well-structured. Specific technical details (TLS 1.3, AES-256, Entra ID) are presented clearly with context for why they matter. |
| Actionability | 4 | Good for procurement teams. The "automation complacency" pitfall is excellent. Could add a recommendation for solo practitioners on alternatives since this tool explicitly excludes them. |
| Navigation | 5 | Descriptive headers, logical flow, no redundancy. Each section serves a distinct purpose. |
| Audience Fit | 4 | Works well for IT/compliance audiences. Individual clinicians without enterprise IT may find sections on Entra ID and Azure Sentinel less relevant; could benefit from a brief "who this is for" qualifier. |
| Freshness | 4 | lastUpdated 2026-03-18. Content references current Microsoft product naming (Entra ID). |
| Cross-linking | 4 | Uses the evidence callout effectively to position the security white paper as a benchmark. No links to other tool reviews, workflows, or comparison guides. |

---

## Gemini
**File:** `src/content/tools/gemini.mdx`
**Collection:** tools
**Composite Score:** 4.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent use of comparison table ("When Gemini Makes Sense") that lets readers quickly assess fit. Clear, scannable formatting. |
| Actionability | 5 | The scenario table is highly actionable -- clinicians can immediately match their use case. Clear guidance on when to use Gemini vs. alternatives. |
| Navigation | 5 | Descriptive headers including "When Gemini Makes Sense" and "Bottom Line" go beyond generic section names. Logical flow. |
| Audience Fit | 4 | Accessible to clinicians. The Vertex AI section may be confusing for non-technical users; could benefit from a sentence explaining what Vertex AI is in practical terms. |
| Freshness | 5 | lastUpdated 2026-03-19. References current model versions (Gemini 1.5 Pro, 1M tokens). Context window specs are up to date. |
| Cross-linking | 3 | Links to the LLM Clinical Reasoning Comparison guide. Missing links to specific workflows or templates where Gemini's context window would be valuable (e.g., case synthesis). |

---

## Nabla
**File:** `src/content/tools/nabla.mdx`
**Collection:** tools
**Composite Score:** 4.0

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-organized. The privacy-first messaging is clear and consistent. Slightly verbose in spots (Overview restates points made in Strengths). |
| Actionability | 4 | Good procurement guidance. The tip about confirming defaults are contractually locked is directly useful. Could add a comparison point to help clinicians decide between Nabla and competitors. |
| Navigation | 4 | Standard header structure works well. Minor redundancy between Overview and HIPAA sections. |
| Audience Fit | 4 | Accessible language. SSO/SAML/SCIM and SMART on FHIR references may need brief explanation for non-technical clinicians. |
| Freshness | 4 | lastUpdated 2026-03-18. Content is current. The "relatively newer entrant" framing will need periodic updates. |
| Cross-linking | 4 | No cross-links to competing tools or related workflows. The SMART on FHIR mention could link to an EHR integration guide if one exists. |

---

## OpenAI
**File:** `src/content/tools/openai.mdx`
**Collection:** tools
**Composite Score:** 4.7

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Outstanding use of tables for model selection and pricing. Complex product lineup explained clearly. |
| Actionability | 5 | The "Which Model Should I Use?" table is exceptionally actionable. Clinicians can match their task to a model immediately. Pricing table with BAA column is decision-ready. |
| Navigation | 5 | Descriptive headers, logical flow, excellent use of tables for quick reference. "Bottom Line" section provides a clear summary. |
| Audience Fit | 5 | Addresses the confusing model lineup head-on. Written for clinicians who find the naming opaque. |
| Freshness | 4 | lastUpdated 2026-03-19. References current model lineup (o1, o3, GPT-4o). Model naming may shift; will need monitoring. |
| Cross-linking | 4 | Links to the LLM Clinical Reasoning Comparison guide. Could link to specific templates (DDx generator, discharge summary) where different models are recommended. |

---

## OpenEvidence
**File:** `src/content/tools/openevidence.mdx`
**Collection:** tools
**Composite Score:** 4.0

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Well-written and clear. The distinction between evidence lookup (safe) and PHI use (risky) is well-articulated. |
| Actionability | 4 | Good practical guidance: "use it like a medical textbook search." The checklist of questions to verify before using with patient data is actionable. |
| Navigation | 4 | Standard header structure. Clear flow from overview to strengths to weaknesses to privacy. |
| Audience Fit | 4 | Appropriate for clinicians. References to UpToDate and DynaMed help position the tool in a familiar context. |
| Freshness | 4 | lastUpdated 2026-03-18. BAA status noted as unclear -- this should be re-verified periodically. |
| Cross-linking | 4 | No links to related tools (Perplexity for comparison), literature review workflows, or clinical reasoning workflows where evidence lookup is relevant. |

---

## Perplexity
**File:** `src/content/tools/perplexity.mdx`
**Collection:** tools
**Composite Score:** 4.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Excellent structure. The "When Perplexity Makes Sense" table with Yes/No guidance is immediately useful. Bold "Never" for patient data is appropriately emphatic. |
| Actionability | 5 | The use-case table is highly actionable. The "hard stop" on BAA is unmistakably clear. Safe use pattern is concrete and practical. |
| Navigation | 5 | Descriptive section headers including "When Perplexity Makes Sense" and "Bottom Line." Logical flow. |
| Audience Fit | 4 | Accessible. Good framing of Perplexity as "smarter PubMed search." References to ACC/AHA, IDSA guidelines orient clinicians. |
| Freshness | 4 | lastUpdated 2026-03-19. BAA status accurately noted as unavailable. Should be monitored for changes. |
| Cross-linking | 4 | Links to the LLM Clinical Reasoning Comparison guide and recommends Claude/o3 for other tasks. Missing links to literature review workflows or evidence-related templates. |

---

## Suki
**File:** `src/content/tools/suki.mdx`
**Collection:** tools
**Composite Score:** 4.2

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Well-organized with specific, concrete details (30-day retention, TLS 1.2, AES-256). No ambiguity. |
| Actionability | 4 | Good procurement guidance. The consent responsibility callout is directly actionable. Could strengthen by adding a comparison to competitors on retention policies. |
| Navigation | 4 | Standard header structure. Minor overlap between Strengths and HIPAA sections on retention specifics. |
| Audience Fit | 4 | Accessible to clinicians. The consent workflow guidance is appropriately practical. |
| Freshness | 4 | lastUpdated 2026-03-18. Encryption specs (TLS 1.2) are current but should be monitored as TLS 1.3 becomes standard. |
| Cross-linking | 4 | No cross-links to competing ambient tools (Abridge, Nabla, Dragon Copilot) or to workflows/templates that Suki's capabilities support. |

---

## Clinical Reasoning with AI
**File:** `src/content/workflows/clinical-reasoning.mdx`
**Collection:** workflows
**Composite Score:** 4.8

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Exceptionally clear. Each step is well-defined with specific model recommendations and rationale. Callouts enhance without cluttering. |
| Actionability | 5 | Walk-through format with 4 concrete steps. Each step names the template to use, the model to choose, and why. Trainee-specific callouts add depth. |
| Navigation | 5 | Descriptive step-based headers. Rich "Related Content" section at the bottom organized by type (Templates, Tool Reviews, Evidence, Workflows, Guides). |
| Audience Fit | 5 | Works for attending physicians (workflow focus) and trainees (dedicated callouts). Layered perfectly. |
| Freshness | 5 | lastUpdated 2026-03-19. References current models (o3, Claude 3.5+). Cites 2023 and 2024 studies. |
| Cross-linking | 4 | Extensive links to templates, tool reviews, trials, guides, and the cognitive debiasing workflow. Missing a link to the discharge summary workflow for post-reasoning documentation. Near-excellent. |

---

## Cognitive Debiasing with AI
**File:** `src/content/workflows/cognitive-debiasing.mdx`
**Collection:** workflows
**Composite Score:** 4.5

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Vivid, direct writing. The problem statement is compelling. Steps are clear and well-scoped. |
| Actionability | 5 | Three concrete steps with specific instructions. The "what you're looking for is the one argument you don't have a ready answer for" guidance is precise and practical. |
| Navigation | 5 | Short enough (< 200 words per section) that navigation is effortless. Step-based structure is logical. |
| Audience Fit | 5 | Written for practicing clinicians with real clinical language. Trainee callout adds appropriate depth. No jargon barriers. |
| Freshness | 4 | lastUpdated 2026-03-19. References current models and the 2023 JAMA study. Mortality statistics should be periodically verified. |
| Cross-linking | 3 | Links to the Bias Check template, Claude tool review, and the JAMA 2023 trial. Missing links to the clinical reasoning workflow (its natural companion), other tool reviews, or related guides. No "Related Content" section like the clinical reasoning workflow has. |

---

## Writing a Discharge Summary with AI
**File:** `src/content/workflows/discharge-summary.mdx`
**Collection:** workflows
**Composite Score:** 4.3

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Crisp, scannable. The 3-step process is easy to follow. PromptPlayground component embeds the actual prompt. |
| Actionability | 5 | Highly actionable: gather inputs, use this prompt, review with this checklist. Every step has a concrete deliverable. |
| Navigation | 5 | Short, focused workflow. Step-based headers are descriptive. No navigation issues. |
| Audience Fit | 5 | Written for the hospitalist or resident writing discharge summaries. Meets the audience exactly. |
| Freshness | 4 | lastUpdated 2026-03-18. Content is current. No stale references. |
| Cross-linking | 2 | Only links to the Claude tool review via ToolCard. No links to the discharge summary template, the inpatient discharge education workflow, related trials, or the clinical reasoning workflow. Significant missed opportunities. |

---

## Creating Inpatient Discharge Education Materials
**File:** `src/content/workflows/inpatient-discharge-education.mdx`
**Collection:** workflows
**Composite Score:** 4.2

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Well-structured 7-step process. Each step is concise and purposeful. The review checklist is practical. |
| Actionability | 5 | Highly actionable: each step points to a specific template with clear guidance on when to use it. The checklist in Step 6 is directly usable. |
| Navigation | 4 | Step-based headers work well. Seven steps is at the upper limit before a TOC becomes helpful; currently manageable. |
| Audience Fit | 5 | Written for clinicians creating patient-facing materials. Guidance on reading level and translation is audience-appropriate. |
| Freshness | 4 | lastUpdated 2026-03-18. Content is current. Template references should be verified periodically. |
| Cross-linking | 2 | Links to 4 templates (discharge instructions, new medication guide, post-procedure care, follow-up visit prep). No links to tool reviews, the discharge summary workflow, the outpatient visit education workflow, or related guides. Missing connection to its natural sibling workflows. |

---

## Creating Outpatient Visit Education Materials
**File:** `src/content/workflows/outpatient-visit-education.mdx`
**Collection:** workflows
**Composite Score:** 4.2

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Clean, scannable. The scenario table in Step 1 helps clinicians decide which templates they need. |
| Actionability | 5 | Highly actionable: scenario-based template selection, specific template links, review checklist. The tip about including current habits in lifestyle prompts is practical. |
| Navigation | 4 | Step-based headers work well. Six steps flow logically. |
| Audience Fit | 5 | Written for the outpatient clinician. Practical guidance on delivery methods (portal, print, hand-deliver) reflects real workflow. |
| Freshness | 4 | lastUpdated 2026-03-18. Content is current. No stale references. |
| Cross-linking | 2 | Links to 4 templates. No links to tool reviews, the inpatient discharge education workflow (its sibling), the procedure education workflow, or related guides. |

---

## Creating Procedure Education Materials
**File:** `src/content/workflows/procedure-education.mdx`
**Collection:** workflows
**Composite Score:** 4.2

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | Concise and well-organized. The customization table by procedure type is immediately useful. |
| Actionability | 5 | Clear 2-step generate process + review + customize. The procedure-type customization table is directly actionable. |
| Navigation | 5 | Short workflow. Step-based headers. No navigation challenges. |
| Audience Fit | 5 | Written for proceduralists and surgeons. Examples span office procedures to major surgery. |
| Freshness | 4 | lastUpdated 2026-03-18. Content is current. No stale references. |
| Cross-linking | 1 | Links to only 2 templates (procedure-prep, post-procedure-care). No links to tool reviews, sibling education workflows (inpatient, outpatient), or any other content on the site. Most isolated file in the audit. |

---

## Cross-File Observations

### 1. Cross-linking is the weakest dimension across both collections

Every tool and most workflows scored 2-4 on cross-linking. The tools are particularly siloed: ambient documentation tools (Abridge, Augmedix, DeepScribe, Nabla, Suki, Dragon Copilot) never link to each other despite serving the same use case and inviting direct comparison. The patient education workflows (inpatient, outpatient, procedure) are natural siblings but never link to each other.

**Recommendation:** Add a "Related Tools" or "Compare With" section to each tool review linking to peers in the same category. Add a "Related Workflows" section to each workflow.

### 2. Tools follow a consistent, effective structure

All 12 tool reviews follow the same 4-section pattern (Overview, Clinical Strengths, Weaknesses, HIPAA & Privacy) with consistent callout usage (tip, pitfall, hipaa). This consistency is a strength and makes comparative reading easy.

### 3. Ambient documentation tools share significant structural overlap

Abridge, Augmedix, DeepScribe, Nabla, Suki, and Dragon Copilot all cover similar ground (BAA status, encryption, retention, EHR integration). A comparison table or "ambient documentation buyer's guide" could reduce redundancy and help clinicians evaluate the field more efficiently.

### 4. General-purpose LLM reviews (Claude, OpenAI, Gemini, Perplexity) are stronger than ambient tool reviews

The general-purpose LLM reviews score higher on actionability (model selection tables, use-case guidance) and cross-linking (references to guides and workflows). The ambient tool reviews read more like vendor assessments and could benefit from the same decision-support formatting.

### 5. Patient education workflows are highly actionable but poorly connected

The three patient education workflows (inpatient discharge, outpatient visit, procedure) are well-written and follow a clear step-by-step pattern. However, they are nearly identical in structure, link to no tool reviews (despite naming Claude in frontmatter), and do not link to each other. A clinician would not discover the sibling workflows without browsing.

### 6. Clinical reasoning workflows set the standard for cross-linking

The clinical reasoning workflow is the strongest file in the audit on cross-linking, with links to templates, tool reviews, trials, guides, and the cognitive debiasing workflow. This should be the model for all other workflows.

### 7. HIPAA callouts are consistently present and well-executed

Every file includes a HIPAA callout with vendor-specific guidance. This is a genuine strength of the content and a differentiator for the site.

### 8. Freshness is uniformly good but monitoring is needed

All files show lastUpdated dates within the past week (2026-03-18 or 2026-03-19). Content is current. Items to monitor: Claude's context window specs, OpenAI's model naming, Perplexity's BAA status, Suki's TLS version, and Nabla's "newer entrant" framing as the company matures.

---

## Summary Statistics

| Collection | Files | Avg Composite Score | Lowest Score | Highest Score |
|------------|-------|---------------------|--------------|---------------|
| Tools | 12 | 4.3 | 3.8 (Augmedix) | 4.7 (Claude, OpenAI) |
| Workflows | 6 | 4.4 | 4.2 (Discharge Summary, Inpatient Education, Outpatient Education, Procedure Education) | 4.8 (Clinical Reasoning) |
| **Overall** | **18** | **4.3** | **3.8** | **4.8** |

### Dimension Averages (All 18 Files)

| Dimension | Average Score |
|-----------|---------------|
| Clarity | 4.8 |
| Actionability | 4.6 |
| Navigation | 4.6 |
| Audience Fit | 4.6 |
| Freshness | 4.1 |
| Cross-linking | 3.2 |

**Bottom line:** Content quality is high across the board (clarity, actionability, audience fit). The primary gap is cross-linking, which drags down composite scores for nearly every file. Addressing cross-linking alone would raise the overall average by approximately 0.3 points.
