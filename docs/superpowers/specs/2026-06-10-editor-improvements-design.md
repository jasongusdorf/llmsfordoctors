# Web Editor Improvements

**Date:** 2026-06-10
**Status:** Approved

## Goal

Three improvements to the GitHub-backed admin editor: a real admin dashboard with creation for every collection, minimal-diff saving with purpose-built field inputs, and a preview that looks like the live site.

## Background

The current editor (built 2026-06) works but has rough edges observed in production use:

- The admin hub at `/admin` offers only "new guide" and "new editorial"; finding an existing article means navigating the public site and clicking the floating Edit button.
- Creation is gated to guides and editorials (`CREATABLE` in `src/pages/api/admin/save.ts`).
- Saving re-serializes the entire frontmatter block through `yamlStringify`, so a one-field edit rewrites every line (quote style, array layout, line wrapping). A real one-field edit on 2026-06-10 reformatted the whole block and caused a merge conflict with a concurrent local change.
- All fields render as generic inputs inferred from value type: rating is a bare number box, socialPost is a one-line input, categories is comma-separated text.
- The preview renders Callout and PromptPlayground as `> **[Callout]**` placeholders and uses generic browser typography.

## Design

### 1. Admin dashboard (`/admin`)

**New endpoint** `src/pages/api/admin/content-index.ts`:
- Auth-gated like the other admin APIs (`isAuthed`).
- Calls `getCollection` for all 7 collections and returns JSON: `[{ collection, slug, title, lastUpdated }]`.
- Data is as of the last deploy. Content pushes auto-deploy in about a minute, so the index trails a new article briefly; this is acceptable and noted in the UI.

**Rebuilt page** `src/pages/admin/index.astro` + a Preact island `src/components/AdminDashboard.tsx`:
- Groups articles by collection, sorted by lastUpdated descending within each group.
- Client-side text filter across title and slug.
- Each row links to `/admin/edit/{collection}/{slug}`.
- A "New" button per collection links to `/admin/new/{collection}`.
- Log out button retained.

### 2. Creation for every collection

- Remove the `CREATABLE` gate in `src/pages/api/admin/save.ts`; `create` is allowed for all 7 collections. Slug and content validation unchanged.
- New module `src/lib/field-templates.ts`: blank starting frontmatter per collection with required fields pre-filled with sensible defaults. Tools default to `rating: 3` and include an `order` field with the multiples-of-10 convention surfaced as help text in the editor.
- `src/pages/admin/new/[collection].astro` uses the template for any collection instead of its current guides/editorials-only frontmatter.

### 3. Minimal-diff saving

- New function `patchMdx(originalRaw: string, frontmatter: Record<string, unknown>, body: string): string` in `src/lib/mdx-file.ts`.
- Uses the `yaml` package's `parseDocument` on the original frontmatter block, then sets only keys whose values differ from the original, deletes keys removed by the editor, and serializes with `doc.toString()`. Untouched keys keep their original quote style, array formatting, and line wrapping.
- The body is replaced wholesale (it is the editor's textarea content).
- `src/pages/api/admin/save.ts` already refetches the existing file to obtain its SHA; the edit path now passes that file's text to `patchMdx` instead of calling `serializeMdx`. The create path keeps using `serializeMdx`.
- Regression test reproduces the 2026-06-10 incident: change one frontmatter field on a tools file with quoted strings, flow arrays, and a wrapped multi-line `socialPost`; assert every untouched line is byte-identical.

### 4. Purpose-built field inputs

- New module `src/lib/field-config.ts` mapping collection + field name to an input type:
  - `rating` (tools): star picker, integers 0 to 5
  - `categories` (tools, videos): toggle chips constrained to the schema enums
  - `tags`: free-form chip input
  - `socialPost`, `verdict`, `description`, `summary`, `keyFinding`: textarea with character count
  - `lastUpdated`, `dateAdded`: date input
  - `order`, `priority`, `timeToRead`, `year`: number input (with min/max where the schema has them)
  - `slug`: read-only in edit mode
  - Unlisted fields fall back to the current type-inferred rendering.
- Field rendering moves out of `AdminEditor.tsx` into a new `src/components/FieldInput.tsx` component that takes the field name, value, config entry, and an onChange callback. `AdminEditor.tsx` keeps layout, publish, and preview.
- `lastUpdated` auto-sets to today when the editor loads in edit mode, shown in the date input so it can be overridden before publishing.

### 5. Real preview

- New module `src/lib/preview-styles.ts` exporting a CSS string carrying the site's reading typography: font stack, heading scale, link, code, blockquote, and table styles to match the live article pages. (A constant rather than a stylesheet file because the preview is injected via iframe `srcdoc`, matching the existing `renderPreviewDoc` pattern.)
- The preview renderer in `AdminEditor.tsx` replaces placeholder blocks with faithful replicas:
  - `<Callout type="hipaa|tip|pitfall|evidence">` renders as a styled box with the same color scheme and icon as the live component.
  - `<PromptPlayground>` renders as a styled prompt box showing its inner content.
- Preview remains client-side markdown (marked + DOMPurify, sandboxed iframe). No Astro component execution; fidelity is visual, not functional.

## Out of Scope

- Drafts, autosave, and crash recovery.
- Conflict-diff UI (the 409 "reload and retry" flow stays).
- Image upload.
- Multi-user editing coordination.

## Testing

- vitest: `patchMdx` formatting preservation (single scalar change, key addition, key deletion, multiline value change, the OpenEvidence regression fixture), field templates produce frontmatter passing `validateContent` for every collection.
- vitest: field-config lookups return expected types; fallback path for unknown fields.
- Manual UAT: dashboard lists and filters all collections; create a tool and a trial end to end; verify a one-field edit produces a one-line diff on GitHub; visually compare preview against a live article.
