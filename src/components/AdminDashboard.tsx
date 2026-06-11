import { useEffect, useMemo, useState } from 'preact/hooks';

interface Item {
  collection: string;
  slug: string;
  title: string;
  lastUpdated: string;
}

const COLLECTION_ORDER = ['guides', 'editorials', 'tools', 'trials', 'templates', 'workflows', 'videos'];

export default function AdminDashboard() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/admin/content-index', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const visible = (items ?? []).filter(
      (i) => !q || i.title.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q),
    );
    const map = new Map<string, Item[]>();
    for (const c of COLLECTION_ORDER) map.set(c, []);
    for (const i of visible) {
      if (!map.has(i.collection)) map.set(i.collection, []);
      map.get(i.collection)!.push(i);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : a.lastUpdated > b.lastUpdated ? -1 : 0));
    }
    return map;
  }, [items, filter]);

  return (
    <div>
      <input
        class="w-full mb-6 rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 px-3 py-2 text-sm"
        placeholder="Filter by title or slug..."
        value={filter}
        onInput={(e) => setFilter((e.target as HTMLInputElement).value)}
      />
      {error && <p class="text-sm text-red-600 mb-4">Could not load content list: {error}</p>}
      {!items && !error && <p class="text-sm text-clinical-400">Loading content list...</p>}
      {items && [...grouped.entries()].map(([collection, list]) => (
        <section key={collection} class="mb-8">
          <div class="flex items-baseline justify-between mb-2">
            <h2 class="font-heading text-xl font-semibold capitalize">
              {collection} <span class="text-sm font-normal text-clinical-400">({list.length})</span>
            </h2>
            <a href={`/admin/new/${collection}`} class="text-sm text-blue-600 dark:text-blue-400 underline">
              New {collection.replace(/s$/, '')}
            </a>
          </div>
          {list.length === 0 ? (
            <p class="text-sm text-clinical-400">None{filter ? ' matching filter' : ''}.</p>
          ) : (
            <ul class="divide-y divide-clinical-200 dark:divide-clinical-700 rounded-lg border border-clinical-200 dark:border-clinical-700 bg-warm-white dark:bg-clinical-800">
              {list.map((i) => (
                <li key={`${i.collection}/${i.slug}`}>
                  <a href={`/admin/edit/${i.collection}/${i.slug}`} class="flex items-center justify-between px-4 py-2 hover:bg-clinical-50 dark:hover:bg-clinical-700">
                    <span class="text-sm">{i.title}</span>
                    <span class="text-xs text-clinical-400 ml-4 shrink-0">{i.lastUpdated}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p class="text-xs text-clinical-400 mt-2">
        Articles created in the last minute may not appear until the next rebuild finishes.
      </p>
    </div>
  );
}
