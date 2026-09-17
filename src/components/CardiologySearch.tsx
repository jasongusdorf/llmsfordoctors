import { useMemo, useState } from 'preact/hooks';

type SearchItem = {
  title: string;
  description: string;
  href: string;
  section: string;
  terms: string[];
};

export default function CardiologySearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalized) return [];
    const words = normalized.split(/\s+/).filter(Boolean);
    return items
      .map((item) => {
        const haystack = [item.title, item.description, item.section, ...item.terms].join(' ').toLowerCase();
        const score = words.reduce((total, word) => {
          if (item.title.toLowerCase().includes(word)) return total + 5;
          if (item.terms.some((term) => term.toLowerCase().includes(word))) return total + 3;
          return haystack.includes(word) ? total + 1 : -100;
        }, 0);
        return { item, score };
      })
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, 12)
      .map(({ item }) => item);
  }, [items, normalized]);

  return (
    <div class="relative">
      <label for="cardiology-search" class="sr-only">Search cardiology education</label>
      <div class="flex items-center gap-3 rounded-xl border border-clinical-300 bg-white px-4 py-3 shadow-sm dark:border-clinical-600 dark:bg-clinical-800">
        <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-clinical-400" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="cardiology-search"
          type="search"
          value={query}
          onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
          placeholder="Search a symptom, finding, test, diagnosis, or guideline"
          class="w-full bg-transparent text-base text-clinical-900 outline-none placeholder:text-clinical-400 dark:text-clinical-50"
          autocomplete="off"
        />
      </div>
      {normalized && (
        <div class="absolute z-30 mt-2 max-h-[28rem] w-full overflow-y-auto rounded-xl border border-clinical-200 bg-white p-2 shadow-xl dark:border-clinical-700 dark:bg-clinical-900">
          {results.length ? (
            <ul>
              {results.map((result) => (
                <li>
                  <a href={result.href} class="block rounded-lg px-3 py-2.5 hover:bg-clinical-50 dark:hover:bg-clinical-800">
                    <span class="block font-medium text-clinical-900 dark:text-clinical-50">{result.title}</span>
                    <span class="mt-0.5 block text-xs font-medium uppercase tracking-wide text-clinical-500 dark:text-clinical-400">{result.section}</span>
                    <span class="mt-1 block text-sm text-clinical-600 dark:text-clinical-300">{result.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p class="px-3 py-4 text-sm text-clinical-600 dark:text-clinical-300">No matching lesson or guideline yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
