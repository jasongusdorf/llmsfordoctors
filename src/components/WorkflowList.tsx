import { useState, useMemo } from 'preact/hooks';

interface Workflow {
  id: string;
  title: string;
  category: string;
  timeToRead: number;
  tags: string[];
  lastUpdated: string;
}

interface Props {
  workflows: Workflow[];
}

type SortKey = 'category' | 'alpha' | 'time' | 'updated';

const categoryLabels: Record<string, string> = {
  'note-writing': 'Note Writing',
  'clinical-reasoning': 'Clinical Reasoning',
  'patient-education': 'Patient Education',
  'literature-review': 'Literature Review',
  'admin-billing': 'Admin & Billing',
  'board-prep': 'Board Prep',
};

const categoryOrder = [
  'note-writing',
  'clinical-reasoning',
  'patient-education',
  'literature-review',
  'admin-billing',
  'board-prep',
];

function labelFor(cat: string): string {
  return categoryLabels[cat] ?? cat;
}

export default function WorkflowList({ workflows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('category');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = [...new Set(workflows.map((w) => w.category))];
    return cats.sort((a, b) => {
      const ai = categoryOrder.indexOf(a);
      const bi = categoryOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [workflows]);

  const filtered = useMemo(() => {
    if (filterCategory === 'All') return workflows;
    return workflows.filter((w) => w.category === filterCategory);
  }, [workflows, filterCategory]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'category') {
        const ai = categoryOrder.indexOf(a.category);
        const bi = categoryOrder.indexOf(b.category);
        const catCmp = (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        if (catCmp !== 0) return catCmp;
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      }
      if (sortKey === 'alpha') {
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      }
      if (sortKey === 'time') {
        return a.timeToRead - b.timeToRead;
      }
      // updated: newest first
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
  }, [filtered, sortKey]);

  // Group by category when sorting by category
  const grouped = useMemo(() => {
    if (sortKey !== 'category') return null;
    const groups: Record<string, typeof sorted> = {};
    for (const wf of sorted) {
      if (!groups[wf.category]) groups[wf.category] = [];
      groups[wf.category].push(wf);
    }
    return groups;
  }, [sorted, sortKey]);

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'category', label: 'Category' },
    { key: 'alpha', label: 'A\u2013Z' },
    { key: 'time', label: 'Read time' },
    { key: 'updated', label: 'Updated' },
  ];

  function renderCard(wf: typeof workflows[0]) {
    return (
      <li key={wf.id}>
        <a
          href={`/workflows/${wf.id}`}
          class="block p-4 rounded-lg border border-clinical-200 dark:border-clinical-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all group bg-white dark:bg-clinical-800"
        >
          <h3 class="font-semibold text-clinical-900 dark:text-clinical-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
            {wf.title}
          </h3>
          <p class="text-xs text-clinical-500 dark:text-clinical-400">
            {wf.timeToRead} min · Updated{' '}
            {new Date(wf.lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
            })}
          </p>
          {wf.tags.length > 0 && (
            <div class="flex flex-wrap gap-1 mt-2">
              {wf.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  class="px-2 py-0.5 rounded text-xs bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </a>
      </li>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div class="mb-6 space-y-3">
        {/* Category filter pills */}
        <div class="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory('All')}
            class={[
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              filterCategory === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 hover:bg-clinical-200 dark:hover:bg-clinical-600',
            ].join(' ')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              class={[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                filterCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 hover:bg-clinical-200 dark:hover:bg-clinical-600',
              ].join(' ')}
            >
              {labelFor(cat)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div class="flex items-center gap-1">
          <span class="text-xs font-medium text-clinical-500 dark:text-clinical-400 mr-1">
            Sort:
          </span>
          {sortButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              class={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                sortKey === key
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 hover:bg-clinical-200 dark:hover:bg-clinical-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p class="text-xs text-clinical-400 dark:text-clinical-500 mb-4">
        {sorted.length} {sorted.length === 1 ? 'workflow' : 'workflows'}
        {filterCategory !== 'All' && ' (filtered)'}
      </p>

      {/* Workflow list */}
      {sorted.length === 0 ? (
        <div class="text-center py-12 text-clinical-500 dark:text-clinical-400">
          <p class="text-sm">No workflows match your filters.</p>
          <button
            onClick={() => setFilterCategory('All')}
            class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : grouped ? (
        <div class="space-y-10">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <h2 class="font-heading text-xl font-semibold text-clinical-800 dark:text-clinical-200 mb-4 pb-2 border-b border-clinical-200 dark:border-clinical-700">
                {labelFor(cat)}
              </h2>
              <ul class="grid sm:grid-cols-2 gap-4">
                {items.map((wf) => renderCard(wf))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul class="grid sm:grid-cols-2 gap-4">
          {sorted.map((wf) => renderCard(wf))}
        </ul>
      )}
    </div>
  );
}
