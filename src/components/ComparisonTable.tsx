import { useState } from 'preact/hooks';

interface Tool {
  name: string;
  slug: string;
  rating: number;
  hasBaa: boolean;
  pricing: string;
  verdict: string;
  categories: string[];
}

interface Props {
  tools: Tool[];
  categories: string[];
}

type SortKey = 'name' | 'rating' | 'pricing';
type SortDir = 'asc' | 'desc';

function StarRating({ rating }: { rating: number }) {
  const isWarning = rating === 0;
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          class={star <= Math.round(rating) ? 'text-amber-400' : isWarning ? 'text-red-400/50' : 'text-clinical-200'}
        >
          ★
        </span>
      ))}
      <span class={`ml-1 text-xs ${isWarning ? 'text-red-500 font-semibold' : 'text-clinical-500'}`}>{rating.toFixed(1)}</span>
    </span>
  );
}

export default function ComparisonTable({ tools, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const allCategories = ['All', ...categories];

  const filtered = activeCategory === 'All'
    ? tools
    : tools.filter((t) => t.categories.includes(activeCategory));

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

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span class="ml-1 text-clinical-300">↕</span>;
    return <span class="ml-1 text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div class="w-full">
      {/* Category filter tabs */}
      <div class="flex flex-wrap gap-2 mb-4">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            class={[
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-clinical-100 text-clinical-600 hover:bg-clinical-200',
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div class="overflow-x-auto rounded-lg border border-clinical-200">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-clinical-800 text-clinical-100">
            <tr>
              <th class="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('name')}
                  class="font-semibold hover:text-white flex items-center"
                >
                  Tool <SortIndicator col="name" />
                </button>
              </th>
              <th class="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('rating')}
                  class="font-semibold hover:text-white flex items-center"
                >
                  Rating <SortIndicator col="rating" />
                </button>
              </th>
              <th class="text-left px-4 py-3">BAA</th>
              <th class="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('pricing')}
                  class="font-semibold hover:text-white flex items-center"
                >
                  Pricing <SortIndicator col="pricing" />
                </button>
              </th>
              <th class="text-left px-4 py-3">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} class="px-4 py-8 text-center text-clinical-400">
                  No tools found for this category.
                </td>
              </tr>
            ) : (
              sorted.map((tool, i) => (
                <tr
                  key={tool.slug}
                  class={`${i % 2 === 0 ? 'bg-warm-white' : 'bg-clinical-50'} ${tool.rating === 0 ? 'border-l-2 border-l-red-500' : ''}`}
                >
                  <td class="px-4 py-3 font-medium">
                    <a
                      href={`/tools/${tool.slug}`}
                      class="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {tool.name}
                    </a>
                  </td>
                  <td class="px-4 py-3">
                    <StarRating rating={tool.rating} />
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class={[
                        'px-2 py-0.5 rounded text-xs font-semibold',
                        tool.hasBaa
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600',
                      ].join(' ')}
                    >
                      {tool.hasBaa ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-clinical-600">{tool.pricing}</td>
                  <td class="px-4 py-3 text-clinical-700 max-w-xs">
                    <span class="line-clamp-2">{tool.verdict}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
