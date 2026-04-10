import { useState, useMemo } from 'preact/hooks';

interface Trial {
  id: string;
  title: string;
  journal: string;
  year: number;
  keyFinding: string;
  tags: string[];
  lastUpdated: string;
}

interface Props {
  trials: Trial[];
  journals: string[];
  tags: string[];
}

type SortKey = 'year' | 'journal' | 'title' | 'updated';
type SortDir = 'asc' | 'desc';

export default function TrialList({ trials, journals, tags }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterJournal, setFilterJournal] = useState('All');
  const [filterTag, setFilterTag] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = trials;
    if (filterJournal !== 'All') {
      result = result.filter((t) => t.journal === filterJournal);
    }
    if (filterTag !== 'All') {
      result = result.filter((t) => t.tags.includes(filterTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.keyFinding.toLowerCase().includes(q) ||
          t.journal.toLowerCase().includes(q),
      );
    }
    return result;
  }, [trials, filterJournal, filterTag, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;
      if (sortKey === 'year') {
        valA = a.year;
        valB = b.year;
      } else if (sortKey === 'journal') {
        valA = a.journal.toLowerCase();
        valB = b.journal.toLowerCase();
      } else if (sortKey === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else {
        valA = a.lastUpdated;
        valB = b.lastUpdated;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'title' || key === 'journal' ? 'asc' : 'desc');
    }
  }

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'year', label: 'Year' },
    { key: 'journal', label: 'Journal' },
    { key: 'title', label: 'A\u2013Z' },
    { key: 'updated', label: 'Updated' },
  ];

  return (
    <div>
      {/* Controls */}
      <div class="mb-6 space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search trials..."
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          class="w-full px-3 py-2 rounded-md border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 text-clinical-900 dark:text-clinical-100 placeholder-clinical-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div class="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <div class="flex items-center gap-1">
            <span class="text-xs font-medium text-clinical-500 dark:text-clinical-400 mr-1">Sort:</span>
            {sortButtons.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                class={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  sortKey === key
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 hover:bg-clinical-200 dark:hover:bg-clinical-600'
                }`}
              >
                {label}
                {sortKey === key && (
                  <span class="ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>

          {/* Journal filter */}
          <select
            value={filterJournal}
            onChange={(e) => setFilterJournal((e.target as HTMLSelectElement).value)}
            class="px-2.5 py-1 rounded text-xs font-medium bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 border-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All journals</option>
            {journals.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>

          {/* Tag filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag((e.target as HTMLSelectElement).value)}
            class="px-2.5 py-1 rounded text-xs font-medium bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 border-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Count */}
      <p class="text-xs text-clinical-400 dark:text-clinical-500 mb-4">
        {sorted.length} {sorted.length === 1 ? 'trial' : 'trials'}
        {(filterJournal !== 'All' || filterTag !== 'All' || search) && ' (filtered)'}
      </p>

      {/* Trial list */}
      {sorted.length === 0 ? (
        <div class="text-center py-12 text-clinical-500 dark:text-clinical-400">
          <p class="text-sm">No trials match your filters.</p>
          <button
            onClick={() => {
              setFilterJournal('All');
              setFilterTag('All');
              setSearch('');
            }}
            class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul class="space-y-4">
          {sorted.map((trial) => (
            <li key={trial.id}>
              <a
                href={`/trials/${trial.id}`}
                class="block p-5 rounded-lg border border-clinical-200 dark:border-clinical-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all group bg-warm-white dark:bg-clinical-800"
              >
                <div class="flex items-start gap-4">
                  <div class="shrink-0 text-center min-w-[3.5rem]">
                    <span class="block text-2xl font-bold text-clinical-800 dark:text-clinical-200 leading-none">
                      {trial.year}
                    </span>
                    <span class="block text-xs text-clinical-500 dark:text-clinical-400 truncate max-w-[5rem]">
                      {trial.journal.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h2 class="font-semibold text-clinical-900 dark:text-clinical-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                      {trial.title}
                    </h2>
                    <p class="text-sm text-clinical-600 dark:text-clinical-400 mb-2 line-clamp-2">
                      {trial.keyFinding}
                    </p>
                    {trial.tags.length > 0 && (
                      <div class="flex flex-wrap gap-1">
                        {trial.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            class="px-2 py-0.5 rounded text-xs bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span class="text-clinical-400 group-hover:text-blue-500 transition-colors shrink-0 mt-1">→</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
