# Editable Tools Section

**Date:** 2026-06-10
**Status:** Approved

## Goal

Make the Tools section editable through the existing web editor the same way guides and editorials are: change ratings, control display order, and edit review text.

## Current State

Most of this already exists. Tool review pages render `AdminEditButton`, the edit page (`/admin/edit/tools/<slug>`) accepts any collection, and `/api/admin/save` permits edits (not creation) to every collection. The editor renders each frontmatter field by inferred type: number input for `rating`, checkbox for `hasBaa`, comma list for `categories`.

Two gaps remain:

1. **No order control.** `ComparisonTable.tsx` sorts by rating descending; ties fall back to filename order. Equal-rated tools cannot be reordered.
2. **No server-side range validation.** The build schema enforces `rating` 0–5, but the editor commits straight to GitHub and content pushes auto-deploy. A rating of 7 would commit cleanly, then fail the deploy build with no feedback to the editor.

## Design

### 1. `order` field

- Add `order: z.number().optional()` to the tools schema in `src/content.config.ts`.
- Backfill all 14 files in `src/content/tools/` with `order: 10, 20, 30, ...` matching the current display order (rating descending, then filename). Gaps allow inserting between two tools without renumbering.
- Because the editor renders whatever frontmatter exists, backfilling makes `order` appear on every tool's Edit page with no editor changes.

### 2. Sort logic

- `src/pages/tools/index.astro` passes `order` through in `toolsData`.
- In `ComparisonTable.tsx`, when `sortKey === 'rating'`, break ties by `order` ascending (missing `order` sorts last), then by name. Other sort keys unchanged.
- Extract the comparator into a new `src/lib/tool-sort.ts` so it can be unit-tested; `ComparisonTable.tsx` imports it.

### 3. Validation guardrails

- In `validateContent` (`src/lib/mdx-file.ts`), add tools-specific checks: `rating` must be a number between 0 and 5; `order`, if present, must be a finite number.
- In `AdminEditor.tsx`, give the `rating` number input `min=0 max=5` so mistakes surface while typing, not at commit.

### 4. Verify existing edit path

- Test the full flow end to end on a tool: open Edit, change rating and body text, publish, confirm the commit and that the rebuilt page reflects the change.
- Specifically confirm `lastUpdated` (a YAML date) round-trips through `parseMdx`/`serializeMdx` without corruption.
- Fix anything found broken; the fix is in scope.

## Out of Scope

- No new admin pages or reorder UI.
- Creation gating unchanged: new tools are still added in the local repo, not the web editor.
- No changes to other collections.

## Testing

- Unit tests (vitest) for the new `validateContent` rules: rating out of range, non-numeric rating, non-numeric order, valid cases.
- Unit tests for the tie-break comparator: equal ratings ordered by `order`; missing `order` sorts last; name as final tiebreaker; non-rating sort keys unaffected.
- Manual end-to-end pass per section 4.
