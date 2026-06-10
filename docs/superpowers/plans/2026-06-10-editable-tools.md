# Editable Tools Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the site owner control Tools display order via an `order` frontmatter field, and make the existing web editor safe for tool edits (rating clamped 0–5, server-side validation so bad values can't break the auto-deploy build).

**Architecture:** A new pure comparator in `src/lib/tool-sort.ts` replaces the inline sort in `ComparisonTable.tsx` and breaks rating ties by `order` (ascending, missing last), then name. The tools schema gains an optional `order` number, backfilled into all 14 tool files as 10, 20, 30... matching today's display order. `validateContent` in `src/lib/mdx-file.ts` gains tools-specific range checks.

**Tech Stack:** Astro 6, Preact, TypeScript, vitest, `yaml` package. Tests run with `npx vitest run <file>`.

**Spec:** `docs/superpowers/specs/2026-06-10-editable-tools-design.md`

---

### Task 1: Tie-break comparator (`src/lib/tool-sort.ts`)

**Files:**
- Create: `src/lib/tool-sort.ts`
- Test: `src/lib/tool-sort.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/tool-sort.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { compareTools, type SortableTool } from './tool-sort';

function tool(name: string, rating: number, order?: number, pricing = 'Free'): SortableTool {
  return { name, rating, pricing, order };
}

describe('compareTools, rating sort (default)', () => {
  it('sorts by rating descending', () => {
    const sorted = [tool('A', 3), tool('B', 5)].sort((a, b) => compareTools(a, b, 'rating', 'desc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });

  it('breaks rating ties by order ascending', () => {
    const sorted = [tool('A', 4, 50), tool('B', 4, 30)].sort((a, b) => compareTools(a, b, 'rating', 'desc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });

  it('sorts tools without an order after tools with one, within the same rating', () => {
    const sorted = [tool('A', 4), tool('B', 4, 90)].sort((a, b) => compareTools(a, b, 'rating', 'desc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });

  it('falls back to name when rating and order are equal', () => {
    const sorted = [tool('Zed', 4, 10), tool('Abe', 4, 10)].sort((a, b) => compareTools(a, b, 'rating', 'desc'));
    expect(sorted.map((t) => t.name)).toEqual(['Abe', 'Zed']);
  });

  it('keeps editorial order ascending even when rating sort is ascending', () => {
    const sorted = [tool('A', 4, 50), tool('B', 4, 30)].sort((a, b) => compareTools(a, b, 'rating', 'asc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });
});

describe('compareTools, other sort keys', () => {
  it('sorts by name without consulting order', () => {
    const sorted = [tool('B', 1, 10), tool('A', 5, 20)].sort((a, b) => compareTools(a, b, 'name', 'asc'));
    expect(sorted.map((t) => t.name)).toEqual(['A', 'B']);
  });

  it('sorts by pricing string', () => {
    const sorted = [tool('A', 1, 10, 'b-plan'), tool('B', 5, 20, 'a-plan')].sort((a, b) => compareTools(a, b, 'pricing', 'asc'));
    expect(sorted.map((t) => t.name)).toEqual(['B', 'A']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/tool-sort.test.ts`
Expected: FAIL — cannot resolve `./tool-sort`

- [ ] **Step 3: Write the implementation**

Create `src/lib/tool-sort.ts`:

```ts
export type SortKey = 'name' | 'rating' | 'pricing';
export type SortDir = 'asc' | 'desc';

export interface SortableTool {
  name: string;
  rating: number;
  pricing: string;
  order?: number;
}

// Rating ties resolve by editorial order (always ascending, regardless of
// sortDir), then name, so equal-rated tools appear in a deliberate sequence.
export function compareTools(a: SortableTool, b: SortableTool, sortKey: SortKey, sortDir: SortDir): number {
  let valA: string | number;
  let valB: string | number;

  if (sortKey === 'name') {
    valA = a.name.toLowerCase();
    valB = b.name.toLowerCase();
  } else if (sortKey === 'rating') {
    valA = a.rating;
    valB = b.rating;
  } else {
    valA = a.pricing.toLowerCase();
    valB = b.pricing.toLowerCase();
  }

  if (valA < valB) return sortDir === 'asc' ? -1 : 1;
  if (valA > valB) return sortDir === 'asc' ? 1 : -1;

  if (sortKey === 'rating') {
    const orderA = a.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.order ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0;
  }
  return 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/tool-sort.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/tool-sort.ts src/lib/tool-sort.test.ts
git commit -m "feat(tools): comparator with order tiebreak for rating sort"
```

---

### Task 2: Wire comparator into the table and pass `order` through

**Files:**
- Modify: `src/components/ComparisonTable.tsx` (interface at top, sort block around lines 49–67)
- Modify: `src/pages/tools/index.astro` (toolsData mapping, lines 9–17)

- [ ] **Step 1: Update ComparisonTable to use the shared comparator**

In `src/components/ComparisonTable.tsx`, add the import at the top:

```ts
import { compareTools, type SortKey, type SortDir } from '../lib/tool-sort';
```

Add `order` to the local `Tool` interface:

```ts
interface Tool {
  name: string;
  slug: string;
  rating: number;
  hasBaa: boolean;
  pricing: string;
  verdict: string;
  categories: string[];
  order?: number;
}
```

Delete the local type aliases (they now come from the import):

```ts
type SortKey = 'name' | 'rating' | 'pricing';
type SortDir = 'asc' | 'desc';
```

Replace the entire inline sort callback:

```ts
  const sorted = [...filtered].sort((a, b) => {
    let valA: string | number;
    let valB: string | number;

    if (sortKey === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortKey === 'rating') {
      valA = a.rating;
      valB = b.rating;
    } else {
      valA = a.pricing.toLowerCase();
      valB = b.pricing.toLowerCase();
    }

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
```

with:

```ts
  const sorted = [...filtered].sort((a, b) => compareTools(a, b, sortKey, sortDir));
```

- [ ] **Step 2: Pass `order` from the tools index page**

In `src/pages/tools/index.astro`, add one line to the `toolsData` mapping:

```ts
const toolsData = allTools.map((t) => ({
  name: t.data.title,
  slug: t.id,
  rating: t.data.rating,
  hasBaa: t.data.hasBaa,
  pricing: t.data.pricing,
  verdict: t.data.verdict,
  categories: t.data.categories,
  order: t.data.order,
}));
```

Note: `t.data.order` will not exist on the schema until Task 3; that is fine for commit ordering because Step 3 below only type-checks after Task 3. If you prefer strict ordering, do Task 3 first — both orderings work, but then run the build check (Task 3, Step 3) after both tasks are done.

- [ ] **Step 3: Run the existing test suite**

Run: `npx vitest run`
Expected: PASS (no regressions; the comparator behavior for non-tied values is identical to the old inline sort)

- [ ] **Step 4: Commit**

```bash
git add src/components/ComparisonTable.tsx src/pages/tools/index.astro
git commit -m "feat(tools): use shared comparator, pass order to comparison table"
```

---

### Task 3: Schema field and backfill

**Files:**
- Modify: `src/content.config.ts` (tools schema, lines 48–62)
- Modify: all 14 files in `src/content/tools/*.mdx`

- [ ] **Step 1: Add `order` to the tools schema**

In `src/content.config.ts`, inside the tools `z.object`, add after the `rating` line:

```ts
    rating: z.number().min(0).max(5),
    order: z.number().optional(),
```

- [ ] **Step 2: Backfill `order` into all 14 tool files**

The values mirror today's display order (rating descending, then filename order), in steps of 10 so a tool can be inserted between two others later. Insert each `order:` line directly under the `rating:` line:

```bash
cd ~/CodingProjects/llmsfordoctors
set -e
i=10
for f in claude dragon-copilot abridge doximity nabla openai suki augmedix deepscribe gemini openevidence perplexity epic-ai microsoft-copilot; do
  sed -i '' "/^rating:/a\\
order: $i
" "src/content/tools/$f.mdx"
  i=$((i + 10))
done
grep -H "^order:" src/content/tools/*.mdx
```

Expected `order` values: claude 10, dragon-copilot 20, abridge 30, doximity 40, nabla 50, openai 60, suki 70, augmedix 80, deepscribe 90, gemini 100, openevidence 110, perplexity 120, epic-ai 130, microsoft-copilot 140.

- [ ] **Step 3: Build to verify schema and pages compile**

Run: `npm run build`
Expected: build completes with no content schema errors.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/content/tools/
git commit -m "feat(tools): optional order field, backfilled to current display order"
```

---

### Task 4: Server-side validation guardrails

**Files:**
- Modify: `src/lib/mdx-file.ts` (`validateContent`, near the end of the file)
- Test: `src/lib/mdx-file.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/mdx-file.test.ts` (top-level, alongside the existing `describe` blocks):

```ts
describe('validateContent, tools guardrails', () => {
  const toolFm = (over: Record<string, unknown> = {}) => ({
    title: 'T',
    slug: 't',
    vendor: 'V',
    rating: 4,
    verdict: 'v',
    pricing: 'Free',
    hasBaa: true,
    categories: ['general'],
    lastUpdated: '2026-06-10',
    ...over,
  });

  it('accepts a valid tool with an order field', () => {
    expect(validateContent('tools', toolFm({ order: 30 }), 'Body')).toEqual([]);
  });

  it('accepts a valid tool without an order field', () => {
    expect(validateContent('tools', toolFm(), 'Body')).toEqual([]);
  });

  it('rejects a rating above 5', () => {
    expect(validateContent('tools', toolFm({ rating: 7 }), 'Body').join(' ')).toMatch(/rating/);
  });

  it('rejects a negative rating', () => {
    expect(validateContent('tools', toolFm({ rating: -1 }), 'Body').join(' ')).toMatch(/rating/);
  });

  it('rejects a non-numeric rating', () => {
    expect(validateContent('tools', toolFm({ rating: '4' }), 'Body').join(' ')).toMatch(/rating/);
  });

  it('rejects a non-numeric order', () => {
    expect(validateContent('tools', toolFm({ order: 'first' }), 'Body').join(' ')).toMatch(/order/);
  });
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx vitest run src/lib/mdx-file.test.ts`
Expected: FAIL on `rejects a rating above 5`, `rejects a negative rating`, `rejects a non-numeric rating`, `rejects a non-numeric order` (the two `accepts` tests already pass).

- [ ] **Step 3: Implement the checks**

In `src/lib/mdx-file.ts`, inside `validateContent`, after the required-fields loop and before the em-dash check, add:

```ts
  if (collection === 'tools') {
    const rating = frontmatter.rating;
    if (rating !== undefined && (typeof rating !== 'number' || Number.isNaN(rating) || rating < 0 || rating > 5)) {
      errors.push('rating must be a number between 0 and 5');
    }
    const order = frontmatter.order;
    if (order !== undefined && (typeof order !== 'number' || !Number.isFinite(order))) {
      errors.push('order must be a number');
    }
  }
```

(The `rating !== undefined` guard avoids double-reporting when rating is missing; the required-fields loop already covers that case.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/mdx-file.test.ts`
Expected: PASS (all tests, old and new)

- [ ] **Step 5: Commit**

```bash
git add src/lib/mdx-file.ts src/lib/mdx-file.test.ts
git commit -m "feat(editor): validate tools rating range and order type server-side"
```

---

### Task 5: Clamp the rating input in the editor

**Files:**
- Modify: `src/components/AdminEditor.tsx` (the `typeof v === 'number'` branch of `renderField`, around lines 67–77)

- [ ] **Step 1: Add min/max attributes and clamping for the rating field**

Replace the number branch of `renderField`:

```tsx
    if (typeof v === 'number') {
      return (
        <label class="text-sm">
          <span class="block text-clinical-500 mb-1">{k}</span>
          <input type="number"
            class="w-full rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm"
            value={String(v)}
            onInput={(e) => { const n = Number((e.target as HTMLInputElement).value); setField(k, Number.isNaN(n) ? v : n); }} />
        </label>
      );
    }
```

with:

```tsx
    if (typeof v === 'number') {
      const isRating = k === 'rating' && collection === 'tools';
      return (
        <label class="text-sm">
          <span class="block text-clinical-500 mb-1">{k}</span>
          <input type="number"
            min={isRating ? 0 : undefined}
            max={isRating ? 5 : undefined}
            class="w-full rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-2 py-1 text-sm"
            value={String(v)}
            onInput={(e) => {
              const n = Number((e.target as HTMLInputElement).value);
              if (Number.isNaN(n)) { setField(k, v); return; }
              setField(k, isRating ? Math.min(5, Math.max(0, n)) : n);
            }} />
        </label>
      );
    }
```

- [ ] **Step 2: Type-check and run the suite**

Run: `npx astro check && npx vitest run`
Expected: no new type errors; all tests pass. (If `astro check` reports pre-existing errors elsewhere, confirm none mention `AdminEditor.tsx`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/AdminEditor.tsx
git commit -m "feat(editor): clamp tools rating input to 0-5"
```

---

### Task 6: Date round-trip regression test

The editor loads a tool, parses YAML, and re-serializes it. `lastUpdated: 2026-03-18` must not come back quoted, retyped, or shifted. Pin this with a test before relying on the editor for tools.

**Files:**
- Test: `src/lib/mdx-file.test.ts`

- [ ] **Step 1: Write the test**

Add to `src/lib/mdx-file.test.ts`:

```ts
describe('tools file round-trip', () => {
  const TOOL_SAMPLE = `---
title: "Claude for Clinical Practice"
slug: claude
vendor: Anthropic
rating: 5
order: 10
verdict: "Best-in-class"
pricing: "Free tier + $20/mo Pro"
hasBaa: true
categories: [note-writing, general]
lastUpdated: 2026-03-18
---

Body text.
`;

  it('preserves lastUpdated through parse and serialize', () => {
    const { frontmatter, body } = parseMdx(TOOL_SAMPLE);
    const out = serializeMdx(frontmatter, body);
    expect(out).toMatch(/^lastUpdated: 2026-03-18$/m);
    const again = parseMdx(out);
    expect(again.frontmatter.rating).toBe(5);
    expect(again.frontmatter.order).toBe(10);
    expect(again.frontmatter.hasBaa).toBe(true);
    expect(again.frontmatter.categories).toEqual(['note-writing', 'general']);
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run src/lib/mdx-file.test.ts`
Expected: PASS. If `lastUpdated` comes back quoted or as a datetime string instead of `2026-03-18`, the `yaml` stringify options in `serializeMdx` need fixing; adjust `serializeMdx` until the assertion passes and the Astro schema (`z.date()`) still accepts the output (verify with `npm run build` if changed).

- [ ] **Step 3: Commit**

```bash
git add src/lib/mdx-file.test.ts
git commit -m "test(editor): pin tools frontmatter date round-trip"
```

---

### Task 7: Deploy and verify end to end

**Files:** none (operational)

- [ ] **Step 1: Full suite and build**

Run: `npx vitest run && npm run build`
Expected: all tests pass, build succeeds.

- [ ] **Step 2: Push and deploy**

```bash
git push origin main
npm run deploy
```

(Per CLAUDE.md: always `npm run deploy`, never bare `wrangler deploy`. Pushing alone does not deploy code changes.)

- [ ] **Step 3: Verify the live tools page order**

Visit https://llmsfordoctors.com/tools — order should match the backfilled sequence (Claude, Dragon Copilot, Abridge, Doximity, Nabla, OpenAI, Suki, Augmedix, DeepScribe, Gemini, OpenEvidence, Perplexity, Epic, Microsoft Copilot).

- [ ] **Step 4: Owner verifies the edit flow**

This step needs the admin password, so the owner does it: log in, open any tool review, click the floating Edit button, change the rating and a line of body text, set a different `order`, Publish. Confirm the commit lands, the auto-deploy completes, and the live page and table order reflect the change. Revert via another edit if the change was only a test.

---

## Self-Review Notes

- Spec coverage: order field (Task 3), sort tiebreak (Tasks 1–2), validation guardrails (Tasks 4–5), edit-path verification including date round-trip (Tasks 6–7). All sections covered.
- Tie-break direction deliberately ignores `sortDir` (spec says "order ascending"); pinned by a test in Task 1.
- Task 2 references `t.data.order` before the schema exists in Task 3; noted inline, build check happens in Task 3.
