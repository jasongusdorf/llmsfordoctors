import { useState, useMemo } from 'preact/hooks';

interface Article {
  id: string;
  title: string;
  description: string;
  tags: string[];
  lastUpdated: string;
  featured: boolean;
}

interface Props {
  articles: Article[];
  basePath: string;
  tags: string[];
}

type SortKey = 'updated' | 'alpha';

export default function ArticleList({ articles, basePath, tags }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [filterTag, setFilterTag] = useState('All');

  const filtered = useMemo(() => {
    if (filterTag === 'All') return articles;
    return articles.filter((a) => a.tags.includes(filterTag));
  }, [articles, filterTag]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'updated') {
        return b.lastUpdated.localeCompare(a.lastUpdated);
      }
      return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    });
  }, [filtered, sortKey]);

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'updated', label: 'Updated' },
    { key: 'alpha', label: 'A\u2013Z' },
  ];

  return (
    <div>
      {/* Controls */}
      <div class="flex flex-wrap items-center gap-3 mb-6">
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

        {/* Tag filter */}
        <select
          value={filterTag}
          onChange={(e) => setFilterTag((e.target as HTMLSelectElement).value)}
          class="px-2.5 py-1 rounded text-xs font-medium bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300 border-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p class="text-xs text-clinical-400 dark:text-clinical-500 mb-4">
        {sorted.length} {sorted.length === 1 ? 'article' : 'articles'}
        {filterTag !== 'All' && ' (filtered)'}
      </p>

      {/* Article list */}
      {sorted.length === 0 ? (
        <div class="text-center py-12 text-clinical-500 dark:text-clinical-400">
          <p class="text-sm">No articles match your filters.</p>
          <button
            onClick={() => setFilterTag('All')}
            class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul class="space-y-4">
          {sorted.map((article) => (
            <li key={article.id}>
              <a
                href={`${basePath}/${article.id}`}
                class="block p-5 rounded-lg border border-clinical-200 dark:border-clinical-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all group bg-warm-white dark:bg-clinical-800"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h2 class="font-semibold text-clinical-900 dark:text-clinical-50 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {article.title}
                      </h2>
                      {article.featured && (
                        <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          Featured
                        </span>
                      )}
                    </div>
                    {article.description && (
                      <p class="text-sm text-clinical-600 dark:text-clinical-400 mb-2 line-clamp-2">
                        {article.description}
                      </p>
                    )}
                    <div class="flex flex-wrap items-center gap-3 text-xs text-clinical-500 dark:text-clinical-400">
                      <time datetime={new Date(article.lastUpdated).toISOString()}>
                        Updated{' '}
                        {new Date(article.lastUpdated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      {article.tags.length > 0 && (
                        <div class="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              class="px-2 py-0.5 rounded bg-clinical-100 dark:bg-clinical-700 text-clinical-600 dark:text-clinical-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span class="text-clinical-400 group-hover:text-blue-500 transition-colors shrink-0 mt-1">
                    →
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
