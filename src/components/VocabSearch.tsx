import { useMemo, useState } from 'preact/hooks';

type Reading = { title: string; source: string; year?: number; url: string; note?: string };
type Term = {
  id: string;
  term: string;
  aliases?: string[];
  category: string;
  technical: string;
  intuitive: string;
  clinical?: string;
  related?: string[];
  reading?: Reading[];
};

const norm = (s: string) => s.toLowerCase().trim();

export default function VocabSearch({ terms }: { terms: Term[] }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(terms.map((t) => t.category))].sort(),
    [terms],
  );

  // Matching the definition text as well as the name means someone who knows the
  // concept but not the word can still find it.
  const results = useMemo(() => {
    const q = norm(query);
    let pool = cat ? terms.filter((t) => t.category === cat) : terms;
    if (!q) return pool;
    const scored = pool
      .map((t) => {
        const name = norm(t.term);
        const alias = (t.aliases || []).map(norm);
        let score = 0;
        if (name === q) score = 100;
        else if (name.startsWith(q)) score = 80;
        else if (alias.some((a) => a === q || a.startsWith(q))) score = 70;
        else if (name.includes(q)) score = 60;
        else if (alias.some((a) => a.includes(q))) score = 50;
        else if (norm(t.intuitive).includes(q)) score = 30;
        else if (norm(t.technical).includes(q)) score = 25;
        else if (t.clinical && norm(t.clinical).includes(q)) score = 20;
        return { t, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.t.term.localeCompare(b.t.term));
    return scored.map((r) => r.t);
  }, [query, cat, terms]);

  const grouped = useMemo(() => {
    const m = new Map<string, Term[]>();
    for (const t of results) {
      if (!m.has(t.category)) m.set(t.category, []);
      m.get(t.category)!.push(t);
    }
    for (const list of m.values()) list.sort((a, b) => a.term.localeCompare(b.term));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [results]);

  const chip = (on: boolean) =>
    `px-3 py-1.5 rounded-full border text-sm transition-colors ${
      on
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
        : 'border-clinical-300 dark:border-clinical-600 text-clinical-700 dark:text-clinical-300 hover:border-blue-500'
    }`;

  return (
    <div>
      <label class="sr-only" for="vocab-input">Search AI terms</label>
      <input
        id="vocab-input"
        type="search"
        autocomplete="off"
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        placeholder="Search a term, or describe it, for example hallucination or made up citation"
        class="w-full px-4 py-3 text-lg rounded-lg border border-clinical-300 dark:border-clinical-600 bg-white dark:bg-clinical-800 text-clinical-900 dark:text-clinical-50 placeholder:text-clinical-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" class={chip(cat === null)} onClick={() => setCat(null)}>
          All {terms.length}
        </button>
        {categories.map((c) => (
          <button key={c} type="button" class={chip(cat === c)} onClick={() => setCat(cat === c ? null : c)}>
            {c}
          </button>
        ))}
      </div>

      <p class="mt-3 text-sm text-clinical-500 dark:text-clinical-400">
        {results.length} of {terms.length} terms
        {query && results.length === 0 ? '. Nothing matches that word or definition.' : ''}
      </p>

      <div class="mt-6 space-y-10">
        {grouped.map(([category, list]) => (
          <section key={category}>
            <h2 class="font-heading text-sm font-semibold uppercase tracking-wide text-clinical-500 dark:text-clinical-400 border-b border-clinical-200 dark:border-clinical-700 pb-2">
              {category}
            </h2>
            <dl class="mt-4 space-y-5">
              {list.map((t) => (
                <div key={t.id}>
                  <dt class="flex flex-wrap items-baseline gap-2">
                    <a
                      href={`/vocabulary/${t.id}`}
                      class="font-heading text-lg font-semibold text-clinical-900 dark:text-clinical-50 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {t.term}
                    </a>
                    {t.aliases && t.aliases.length > 0 && (
                      <span class="text-sm text-clinical-500 dark:text-clinical-400">
                        {t.aliases.join(', ')}
                      </span>
                    )}
                  </dt>
                  <dd class="mt-1 text-clinical-700 dark:text-clinical-300">{t.intuitive}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
