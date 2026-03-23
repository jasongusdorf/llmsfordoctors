# Videos Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Videos content collection and `/videos/` index page with client-side sorting by date, priority, and alphabetical.

**Architecture:** New Astro content collection with MDX files (frontmatter-only, no body content), a Preact component for sortable list rendering, and a thin Astro page that passes data to the component. Follows existing patterns from tools/ComparisonTable.

**Tech Stack:** Astro 6, Preact, Tailwind CSS, MDX content collections

**Spec:** `docs/superpowers/specs/2026-03-22-videos-collection-design.md`

---

### Task 1: Add Videos Collection Schema

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Add videoCategories and videos collection to content.config.ts**

Add before the `export const collections` block:

```typescript
const videoCategories = [
  'tutorial',
  'lecture',
  'demo',
  'interview',
] as const;

const videos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    channel: z.string(),
    summary: z.string(),
    category: z.enum(videoCategories),
    llm: z.array(z.string()),
    topic: z.array(z.string()),
    priority: z.number().min(1).max(5),
    dateAdded: z.date(),
  }),
});
```

- [ ] **Step 2: Add videos to the collections export**

Change the export to include `videos`:

```typescript
export const collections = {
  workflows,
  guides,
  tools,
  templates,
  trials,
  courses,
  videos,
};
```

- [ ] **Step 3: Create the content directory**

```bash
mkdir -p /Users/jasongusdorf/CodingProjects/llmsfordoctors/src/content/videos
```

- [ ] **Step 4: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/content.config.ts
git commit -m "feat: add videos content collection schema"
```

---

### Task 2: Create Initial Video Content Files

**Files:**
- Create: `src/content/videos/autoresearch-claude-skills.mdx`
- Create: `src/content/videos/claude-code-animated-sites.mdx`
- Create: `src/content/videos/claude-code-full-course-2026.mdx`
- Create: `src/content/videos/bernie-vs-claude.mdx`

- [ ] **Step 1: Create autoresearch-claude-skills.mdx**

```mdx
---
title: "Stop Fixing Your Claude Skills. Autoresearch Does It For You"
url: "https://www.youtube.com/watch?v=qKU-e0x2EmE"
channel: "Nick Saraev"
summary: "Walkthrough of using Claude's autoresearch capability to automatically fix and improve skills without manual debugging. Shows how to set up self-correcting workflows that save hours of prompt iteration."
category: tutorial
llm: [claude]
topic: [automation, skills]
priority: 2
dateAdded: 2026-03-22
---
```

- [ ] **Step 2: Create claude-code-animated-sites.mdx**

```mdx
---
title: "Claude Code + Nano Banana 2 + Kling = $15K Animated Sites"
url: "https://www.youtube.com/watch?v=ZfYvv-0l9NA"
channel: "Nick Saraev"
summary: "Demo of combining Claude Code with Nano Banana 2 and Kling AI to build premium animated websites. Covers the full pipeline from concept to deployed site, with pricing strategy for selling to clients."
category: demo
llm: [claude]
topic: [web-development, animation]
priority: 1
dateAdded: 2026-03-22
---
```

- [ ] **Step 3: Create claude-code-full-course-2026.mdx**

```mdx
---
title: "Claude Code Full Course 4 Hours: Build & Sell (2026)"
url: "https://www.youtube.com/watch?v=QoQBzR1NIqI"
channel: "Nick Saraev"
summary: "Comprehensive 4-hour course covering Claude Code from basics to advanced workflows. Includes project setup, prompt engineering, agentic patterns, and how to package and sell what you build. The single best starting point for getting productive with Claude Code."
category: tutorial
llm: [claude]
topic: [claude-code, development]
priority: 4
dateAdded: 2026-03-22
---
```

- [ ] **Step 4: Create bernie-vs-claude.mdx**

```mdx
---
title: "Bernie vs. Claude"
url: "https://www.youtube.com/watch?v=h3AtWdeu_G0"
channel: "Senator Bernie Sanders"
summary: "Senator Bernie Sanders engages directly with Claude AI in a conversation about healthcare, inequality, and the role of AI in society. A fascinating look at how a policymaker interacts with and challenges an LLM on real policy questions."
category: interview
llm: [claude]
topic: [ai-policy, ethics]
priority: 1
dateAdded: 2026-03-22
---
```

- [ ] **Step 5: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/content/videos/
git commit -m "feat: add 4 initial video content files"
```

---

### Task 3: Create VideoList Preact Component

**Files:**
- Create: `src/components/VideoList.tsx`

- [ ] **Step 1: Create VideoList.tsx**

This follows the exact pattern of `src/components/ComparisonTable.tsx` — a Preact component that receives data as props and handles sorting via local state.

```tsx
import { useState } from 'preact/hooks';

interface Video {
  title: string;
  url: string;
  channel: string;
  summary: string;
  category: string;
  llm: string[];
  topic: string[];
  priority: number;
  dateAdded: string;
}

interface Props {
  videos: Video[];
}

type SortKey = 'date' | 'priority' | 'alpha';

function PriorityStars({ priority }: { priority: number }) {
  return (
    <span class="shrink-0" aria-label={`Priority ${priority} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          class={star <= priority ? 'text-amber-400' : 'text-clinical-200 dark:text-clinical-700'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function VideoList({ videos }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date');

  const sorted = [...videos].sort((a, b) => {
    if (sortKey === 'date') {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
    if (sortKey === 'priority') {
      return b.priority - a.priority;
    }
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  });

  return (
    <div>
      {/* Sort controls */}
      <div class="flex gap-2 mb-6">
        {([
          ['date', 'Date Added'],
          ['priority', 'Priority'],
          ['alpha', 'A–Z'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            class={[
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              sortKey === key
                ? 'bg-blue-600 text-white'
                : 'bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 hover:bg-clinical-200 dark:hover:bg-clinical-600',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Video list */}
      <ul class="space-y-4">
        {sorted.map((video) => (
          <li
            key={video.url}
            class="p-4 rounded-lg border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-800"
          >
            <div class="flex items-start gap-3">
              <PriorityStars priority={video.priority} />
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h2 class="font-semibold text-clinical-900 dark:text-clinical-50">
                    {video.title}
                  </h2>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    YouTube
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <p class="text-sm text-clinical-600 dark:text-clinical-400 mt-1">
                  {video.summary}
                </p>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {video.category}
                  </span>
                  {video.llm.map((l) => (
                    <span
                      key={l}
                      class="px-2 py-0.5 rounded text-xs bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300"
                    >
                      {l}
                    </span>
                  ))}
                  {video.topic.map((t) => (
                    <span
                      key={t}
                      class="px-2 py-0.5 rounded text-xs bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300"
                    >
                      {t}
                    </span>
                  ))}
                  <span class="text-xs text-clinical-400 dark:text-clinical-500 ml-auto">
                    {video.channel} · {new Date(video.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/components/VideoList.tsx
git commit -m "feat: add VideoList Preact component with sorting"
```

---

### Task 4: Create Videos Index Page

**Files:**
- Create: `src/pages/videos/index.astro`

- [ ] **Step 1: Create the index page**

Follows the tools index pattern: Astro page fetches data, maps to plain objects, passes to Preact component with `client:load`.

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/Breadcrumb.astro';
import VideoList from '../../components/VideoList.tsx';

const allVideos = await getCollection('videos');

const videosData = allVideos.map((v) => ({
  title: v.data.title,
  url: v.data.url,
  channel: v.data.channel,
  summary: v.data.summary,
  category: v.data.category,
  llm: v.data.llm,
  topic: v.data.topic,
  priority: v.data.priority,
  dateAdded: v.data.dateAdded.toISOString(),
}));
---

<BaseLayout
  title="Videos - LLMs for Doctors"
  description="Curated videos on AI in clinical practice. Every video here is worth watching."
>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Videos' }]} />

    <header class="mb-8">
      <h1 class="font-heading text-3xl sm:text-4xl font-bold text-clinical-900 dark:text-clinical-50 mb-3">
        Videos
      </h1>
      <p class="text-lg text-clinical-600 dark:text-clinical-400">
        Curated videos on LLMs and AI in clinical practice.
      </p>
      <p class="text-sm text-clinical-500 dark:text-clinical-400 mt-2 italic">
        Every video here is worth watching. Stars indicate impact — 5 means drop everything, 1 means save for a quiet afternoon.
      </p>
    </header>

    <VideoList client:load videos={videosData} />
  </div>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/pages/videos/index.astro
git commit -m "feat: add videos index page"
```

---

### Task 5: Add Videos to Navigation

**Files:**
- Modify: `src/components/Nav.astro`

- [ ] **Step 1: Add Videos link to navLinks array**

In `src/components/Nav.astro`, add the Videos link between Templates and Community. Change the navLinks array from:

```typescript
  { href: '/templates', label: 'Templates' },
  { href: '/community', label: 'Community' },
```

to:

```typescript
  { href: '/templates', label: 'Templates' },
  { href: '/videos',    label: 'Videos' },
  { href: '/community', label: 'Community' },
```

- [ ] **Step 2: Commit**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
git add src/components/Nav.astro
git commit -m "feat: add Videos to site navigation"
```

---

### Task 6: Build and Verify

- [ ] **Step 1: Run the build**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
npm run build
```

Expected: Build completes without errors. The `/videos/` page is generated with all 4 videos.

- [ ] **Step 2: Preview and verify**

```bash
cd /Users/jasongusdorf/CodingProjects/llmsfordoctors
npm run preview
```

Verify in browser:
- `/videos/` page loads
- All 4 videos are displayed with titles, summaries, priority stars, tags
- Sort buttons work (Date, Priority, A-Z)
- YouTube links open in new tab
- Nav bar shows "Videos" link
- Dark mode works

- [ ] **Step 3: Commit any fixes if needed**

---

## Execution Notes

- Tasks 1-5 are sequential (each depends on the previous)
- Task 6 is the verification step
- Total: 6 tasks, ~15 minutes of work

```
Task 1 (schema) → Task 2 (content) → Task 3 (component) → Task 4 (page) → Task 5 (nav) → Task 6 (verify)
```
