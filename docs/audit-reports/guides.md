# Audit Report: Guides

**Audited:** 2026-03-22
**Rubric:** `/docs/content-standards.md` — 6 shared dimensions + 3 guide-specific dimensions, 1–5 scale

---

## Evidence Landscape 2025

**File:** `src/content/guides/evidence-landscape-2025.mdx`
**Composite Score:** 4.1

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 4 | Lines 11–19: the four-paragraph opening block before the first heading is dense and could benefit from tighter editing; each paragraph is well-written individually, but the section as a whole delays the reader from reaching actionable content. |
| Actionability | 3 | Lines 11–501: the guide is predominantly informational. Callouts contain tips, but most sections describe what the evidence says rather than telling the reader what to do with it. The "Cross-Cutting Lessons" section (lines 339–418) has the strongest actionable content but arrives very late in a 500-line guide. No concrete "try this" steps in the body sections. |
| Navigation | 4 | Lines 25–298: thematic organization (5 themes) is effective, but the guide is ~500 lines with no table of contents. Descriptive subheadings within themes are good (e.g., "The Kenya CDS deployment"), but readers cannot jump to a specific study without scrolling. |
| Audience Fit | 5 | No issues. The guide layers effectively: accessible to a clinician new to the literature while offering depth (citation context, subgroup analyses, methodological notes) for experienced readers. |
| Freshness | 5 | No issues. References studies through early 2026 (Qazi et al., Agweyu et al.). lastUpdated 2026-03-18. |
| Cross-linking | 2 | Lines 1–501: the only internal link in the entire guide is implied by thematic connection to other site content. No explicit links to related templates, tools, workflows, or other guides on the site. A guide this comprehensive should link to the HIPAA compliance guide, the clinical reasoning comparison guide, and relevant templates. |
| Structure | 5 | No issues. Five thematic sections with clear learning progression, from controlled trials to safety to security to workflow to specialty domains, followed by cross-cutting lessons and a summary table. Well-chunked and digestible. |
| Practical Examples | 3 | Lines 11–501: the guide references study findings extensively but does not include concrete clinical scenarios showing what a reader should do. The "Cross-Cutting Lessons" section offers principles, but there are no worked examples (e.g., "Here is how you would evaluate a vendor's benchmark claims using the framework from this section"). |
| Summary/TL;DR | 4 | Lines 481–501: "Bottom Line" section at the end provides a clear 5-point summary. However, there is no top-of-page TL;DR. The tip callout is absent at the top; readers must scroll to line 481 to get the summary. |

---

## HIPAA Compliance

**File:** `src/content/guides/hipaa-compliance.mdx`
**Composite Score:** 4.6

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | No issues. Plain language throughout, well-formatted with headers, numbered lists, callouts, and concrete examples. Scannable even at 887 lines. |
| Actionability | 5 | No issues. Nearly every section gives the reader a concrete action: the decision flowchart (lines 186–221), the do's and don'ts (lines 225–269), the scenario walkthroughs (lines 325–430), and the quick reference section (lines 814–869). |
| Navigation | 4 | Lines 1–887: 14-part structure with descriptive headers is strong, but the guide is 887 lines with no table of contents or anchor-linked outline at the top. A reader looking for "vendor evaluation" or "what to do when things go wrong" has to scroll or search. |
| Audience Fit | 5 | No issues. Written explicitly for clinicians ("You are not a compliance officer. You should not have to be one."), with appropriate depth on legal frameworks for those who need it. |
| Freshness | 5 | No issues. References 2025–2026 enforcement actions, proposed HHS rulemaking, state-level AI legislation. lastUpdated 2026-03-18. |
| Cross-linking | 3 | Lines 1–887: the guide is largely self-contained. It does not link to the LLMs in Clinical Care 101 guide (which teaches the de-identification workflow this guide references), the Prompting 101 guide, or any templates on the site. A guide about safe LLM use should link to the practical tools that help readers implement that safety. |
| Structure | 5 | No issues. 14 well-defined parts with clear progression: definitions, then architecture, then decision flowchart, then practical scenarios, then vendor evaluation, then policy, then technical mitigations, then incident response, then penalties, then misconceptions, then quick reference. Excellent chunking. |
| Practical Examples | 5 | No issues. Ten clinical scenarios (lines 325–440) with compliant and non-compliant paths. The sample policy skeleton (lines 509–569) is a ready-to-use artifact. |
| Summary/TL;DR | 5 | No issues. The one-line rule at the top of the guide (line 15) functions as a TL;DR. The quick reference section (Part 14, lines 814–869) provides condensed essentials. Both top-of-page and end-of-page summaries are present. |

---

## Which LLM for Clinical Reasoning? A Head-to-Head Comparison

**File:** `src/content/guides/llm-clinical-reasoning-comparison.mdx`
**Composite Score:** 4.2

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | No issues. Clean prose, well-formatted comparisons, effective use of the OutputComparison and PerformanceMatrix components. Each comparison section is clearly delineated with a task description, winner declaration, and analysis. |
| Actionability | 5 | No issues. "The Verdict" section (lines 239–255) gives explicit model-to-task recommendations. The HIPAA callout at the end (lines 253–255) directs the reader to de-identify. |
| Navigation | 5 | No issues. The tip callout at line 17 provides a skip link to "The Verdict" for readers who just want the bottom line. Sections are clearly numbered (Comparison 1–5) with descriptive titles. |
| Audience Fit | 4 | Lines 47–81: the OutputComparison component for Comparison 1 contains very long model outputs (the o3 output alone is ~40 lines of clinical text). While this is excellent for a physician evaluating model quality, it may overwhelm a reader who is new to LLMs and just wants to know which model to try. The guide works primarily for an intermediate-to-advanced audience. |
| Freshness | 5 | No issues. Testing dates March 10–15, 2026. lastUpdated 2026-03-19. Model versions explicitly stated. Re-testing commitment documented. |
| Cross-linking | 3 | Lines 1–278: only one internal link (to the HIPAA compliance guide at line 254). No links to Prompting 101 (relevant for readers who want to improve their own prompting after seeing model comparisons), no links to templates that use these models, no links to the Evidence Landscape guide. |
| Structure | 4 | Lines 86–170: Comparisons 2–5 use prose summaries rather than the OutputComparison component used in Comparison 1. This creates an uneven depth: Comparison 1 shows full receipts while Comparisons 2–5 summarize without showing output. The structure is good but inconsistent in its depth across sections. |
| Practical Examples | 5 | No issues. The entire guide is built around a concrete clinical case with real model outputs. The test case (lines 27–36) is a well-constructed PE vignette. Full model outputs are shown for Comparison 1; summaries with specific details for the rest. |
| Summary/TL;DR | 3 | Lines 13–19: the opening paragraphs set up the guide's purpose, and the tip callout offers a skip link to "The Verdict," which functions as a partial TL;DR. However, there is no dedicated TL;DR or summary section at the top listing key takeaways (e.g., "o3 for DDx, Claude for synthesis, Perplexity for literature"). The reader must navigate to "The Verdict" at line 239 to get the bottom line. |

---

## LLMs in Clinical Care 101

**File:** `src/content/guides/llms-in-clinical-care-101.mdx`
**Composite Score:** 4.8

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | No issues. Exceptionally clear writing. Short paragraphs, direct language, numbered steps, a timing table (lines 139–151). Written like a colleague explaining something at the workstation. |
| Actionability | 5 | No issues. Every section gives the reader something to do: copy-paste de-identification steps, a discharge summary template to save, a review checklist, and a "Getting Started Today" section (lines 172–179) with four concrete steps. |
| Navigation | 5 | No issues. Clean three-step structure (De-identify, Prompt, Review) announced at lines 20–26 and then walked through in order. Descriptive headers throughout. The guide is 202 lines, which is the right length for a 101-level guide. |
| Audience Fit | 5 | No issues. Written for a clinician who has never used an LLM. Assumes no prior AI knowledge. Provides platform-specific setup instructions (Claude Projects, ChatGPT Custom Instructions). |
| Freshness | 5 | No issues. lastUpdated 2026-03-21. References current tools and platforms. Academic references include 2025–2026 publications. |
| Cross-linking | 4 | Lines 49, 158: links to the HIPAA Compliance guide. However, no links to Prompting 101 (the natural next-read after this guide), no links to specific templates beyond the inline discharge summary template, and no links to the clinical reasoning comparison guide. |
| Structure | 5 | No issues. Three-step workflow presented linearly with supporting detail. Each step is self-contained. "The Complete Workflow in Practice" (lines 135–153) ties it all together with a timing table. |
| Practical Examples | 5 | No issues. Includes a full discharge summary template (lines 82–99), a list of common template types (lines 103–109), a step-by-step de-identification walkthrough with specific keystrokes (lines 38–46), and a complete workflow timing table. |
| Summary/TL;DR | 4 | Lines 12–14 function as a summary ("This guide teaches you the practical, day-to-day workflow...If you read one guide on this site, make it this one."). Lines 20–26 provide the three-step overview. This is close to a TL;DR but is woven into the introduction rather than presented as a distinct, scannable summary box. |

---

## Prompting 101 for Clinicians

**File:** `src/content/guides/prompting-101.mdx`
**Composite Score:** 3.8

| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 5 | No issues. Clean, concise writing. Good use of before/after examples and callouts. |
| Actionability | 4 | Lines 69–82: the "Iterate" section provides useful follow-up patterns but could be more concrete — it lists generic correction phrases without showing a full iteration example (prompt, response, correction, improved response). |
| Navigation | 4 | Lines 1–96: the guide is only 96 lines, so navigation is inherently easy. However, the four sections are numbered generically ("1. Set the Role", "2. Provide Context", etc.) without a top-level overview or mini-TOC. For a short guide this is acceptable but not excellent. |
| Audience Fit | 5 | No issues. Written for beginners with no AI experience. Clinical examples throughout. |
| Freshness | 4 | Lines 1–96: the guide contains no dated references, model versions, or study citations. The evidence callout at line 46 references "studies" without citing any. This makes freshness hard to evaluate, but the content itself is evergreen prompting advice. lastUpdated 2026-03-18. Minor gap: no mention of current model-specific behaviors. |
| Cross-linking | 1 | Lines 1–96: zero internal links to any other content on the site. No links to templates (which are the natural application of prompting skills), no link to the Clinical Care 101 guide (which is the companion workflow guide), no link to the HIPAA compliance guide (relevant when prompting with clinical data), and no link to the clinical reasoning comparison guide. This is a standalone island. |
| Structure | 4 | Lines 1–96: four sections plus a "Putting It Together" conclusion. The sections are well-organized but shallow — each principle gets roughly 15 lines of content. The guide feels like it ends abruptly; there is no "What's Next" or "Further Reading" section to guide the reader forward. |
| Practical Examples | 3 | Lines 19–23, 41–43, 62–63, 88–95: examples are present but minimal. The "Set the Role" section has one before/after pair. "Provide Context" has one example. "Be Specific About Format" has one format instruction example. "Putting It Together" has one before/after. All examples use the same pattern (weak prompt vs. strong prompt) without showing model output or clinical outcomes. No worked-through scenario showing a full prompt-response-review cycle. |
| Summary/TL;DR | 1 | Lines 1–96: no TL;DR, no summary section, no key takeaways list. The guide opens with a one-sentence introduction (line 11) and ends with a before/after example (lines 88–95). A reader who wants to quickly recall the four principles has no reference point to return to. |

---

## Cross-File Observations

### Patterns Across All 5 Guides

1. **Cross-linking is consistently weak.** This is the lowest-scoring dimension across the board. Prompting 101 has zero internal links (score: 1). Evidence Landscape has essentially none (score: 2). Even the strongest guides (Clinical Care 101, HIPAA Compliance) only link to one other guide. None of the guides link to templates, tools, or workflows on the site. The guides function as standalone articles rather than interconnected resources.

2. **TL;DR / Summary sections are inconsistent.** Only the HIPAA Compliance guide has a clear, well-positioned summary (one-line rule at top + quick reference at bottom). The Evidence Landscape has a bottom-of-page summary but nothing at the top. The Clinical Reasoning Comparison has a skip-link but no true TL;DR. Prompting 101 has no summary at all. There is no site-wide convention for how guides should present their key takeaways.

3. **Actionability varies with guide purpose.** The workflow-oriented guides (Clinical Care 101, HIPAA Compliance) score 5 on actionability because they are inherently procedural. The knowledge-oriented guides (Evidence Landscape, Prompting 101) score lower because they present information without consistently converting it into steps the reader can take. A site-wide convention of ending each major section with a "What to do with this" callout would help.

4. **Practical examples are strong in clinical guides, weak in meta-guides.** The HIPAA Compliance guide (10 clinical scenarios), the Clinical Reasoning Comparison (full model outputs on a PE case), and the Clinical Care 101 guide (step-by-step de-identification and template) all score 5. The Evidence Landscape and Prompting 101 guides score 3 because their examples are either absent (Evidence Landscape) or minimal (Prompting 101).

5. **Freshness is uniformly strong.** All 5 guides have lastUpdated dates in March 2026 and reference current tools, models, and studies. This is a strength of the content library.

6. **No guide has a table of contents.** For the shorter guides (Prompting 101 at 96 lines, Clinical Care 101 at 202 lines), this is acceptable. For the longer guides (HIPAA Compliance at 887 lines, Evidence Landscape at 502 lines), a TOC would significantly improve navigation.

7. **Clarity and audience fit are consistently strong.** All 5 guides are well-written, use plain language, and are appropriately targeted for their intended audiences. The writing quality across the guide collection is high.

### Composite Score Summary

| Guide | Composite Score |
|-------|----------------|
| LLMs in Clinical Care 101 | 4.8 |
| HIPAA Compliance | 4.6 |
| LLM Clinical Reasoning Comparison | 4.2 |
| Evidence Landscape 2025 | 4.1 |
| Prompting 101 | 3.8 |

**Collection Average:** 4.3
