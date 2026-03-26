import { useState, useMemo } from 'preact/hooks';

interface Template {
  id: string;
  title: string;
  category: string;
  targetTool: string;
  tags: string[];
  lastUpdated: string;
}

interface Props {
  templates: Template[];
  categories: string[];
  targetTools: string[];
}

type SortKey = 'alpha' | 'category' | 'updated';

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

function formatTargetTool(tool: string): string {
  return tool === 'any' ? 'Any LLM' : tool;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export default function TemplateList({ templates, categories, targetTools }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTargetTool, setActiveTargetTool] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('category');

  const filtered = useMemo(() => {
    let result = templates;

    if (activeCategory !== 'All') {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (activeTargetTool !== 'All') {
      result = result.filter((t) => t.targetTool === activeTargetTool);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [templates, activeCategory, activeTargetTool, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'alpha') {
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      }
      if (sortKey === 'category') {
        const ai = categoryOrder.indexOf(a.category);
        const bi = categoryOrder.indexOf(b.category);
        if (ai !== bi) return ai - bi;
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      }
      // updated: newest first
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
  }, [filtered, sortKey]);

  const isFiltered = activeCategory !== 'All' || activeTargetTool !== 'All' || search.trim() !== '';

  // Group by category when sort is "category" and no specific category filter is active
  const showGrouped = sortKey === 'category' && activeCategory === 'All';

  const grouped = useMemo(() => {
    if (!showGrouped) return null;
    const groups: Record<string, Template[]> = {};
    for (const t of sorted) {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    }
    return categoryOrder.filter((cat) => groups[cat]).map((cat) => ({
      category: cat,
      label: categoryLabels[cat] ?? cat,
      templates: groups[cat],
    }));
  }, [sorted, showGrouped]);

  const allCategoryButtons = ['All', ...categories];

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'alpha', label: 'A\u2013Z' },
    { key: 'category', label: 'Category' },
    { key: 'updated', label: 'Updated' },
  ];

  function clearFilters() {
    setSearch('');
    setActiveCategory('All');
    setActiveTargetTool('All');
  }

  function renderCard(tmpl: Template) {
    return (
      <li key={tmpl.id}>
        <a
          href={`/templates/${tmpl.id}`}
          class="block p-4 rounded-lg border border-clinical-200 dark:border-clinical-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all group bg-white dark:bg-clinical-800"
        >
          <h3 class="font-semibold text-clinical-900 dark:text-clinical-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
            {tmpl.title}
          </h3>
          <p class="text-xs text-clinical-500 dark:text-clinical-400 mb-2">
            For {formatTargetTool(tmpl.targetTool)} · Updated {formatDate(tmpl.lastUpdated)}
          </p>
          {tmpl.tags.length > 0 && (
            <div class="flex flex-wrap gap-1">
              {tmpl.tags.slice(0, 3).map((tag) => (
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
        {/* Search */}
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          class="w-full px-3 py-2 rounded-md border border-clinical-300 dark:border-clinical-600 bg-white dark:bg-clinical-800 text-clinical-900 dark:text-clinical-100 placeholder-clinical-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Category pills */}
        <div class="flex flex-wrap gap-2">
          {allCategoryButtons.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              class={[
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 hover:bg-clinical-200 dark:hover:bg-clinical-600',
              ].join(' ')}
            >
              {cat === 'All' ? 'All' : categoryLabels[cat] ?? cat}
            </button>
          ))}
        </div>

        <div class="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <div class="flex items-center gap-1">
            <span class="text-xs font-medium text-clinical-500 dark:text-clinical-400 mr-1">Sort:</span>
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

          {/* Target tool filter */}
          <select
            value={activeTargetTool}
            onChange={(e) => setActiveTargetTool((e.target as HTMLSelectElement).value)}
            class="px-2.5 py-1 rounded text-xs font-medium bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 border-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All LLMs</option>
            {targetTools.map((tool) => (
              <option key={tool} value={tool}>
                {formatTargetTool(tool)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Count */}
      <p class="text-xs text-clinical-400 dark:text-clinical-500 mb-4">
        {sorted.length} {sorted.length === 1 ? 'template' : 'templates'}
        {isFiltered && ' (filtered)'}
      </p>

      {/* Template grid */}
      {sorted.length === 0 ? (
        <div class="text-center py-12 text-clinical-500 dark:text-clinical-400">
          <p class="text-sm">No templates match your filters.</p>
          <button
            onClick={clearFilters}
            class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : showGrouped && grouped ? (
        <div class="space-y-12">
          {grouped.map((group) => (
            <section key={group.category} id={group.category}>
              <h2 class="font-heading text-xl font-semibold text-clinical-800 dark:text-clinical-200 mb-4 pb-2 border-b border-clinical-200 dark:border-clinical-700">
                {group.label}
              </h2>
              <ul class="grid sm:grid-cols-2 gap-4">
                {group.templates.map(renderCard)}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul class="grid sm:grid-cols-2 gap-4">
          {sorted.map(renderCard)}
        </ul>
      )}
    </div>
  );
}
