import { useState, useMemo, useRef } from 'preact/hooks';

interface Qualifier {
  id: string; name: string; domain: string; definition: string;
}
interface Diagnosis {
  id: string; name: string; specialty: string; cluster: string[];
  clusterTags: (string | null)[]; tags: string[]; why: string; mimic: string;
}
interface Props {
  qualifiers: Qualifier[];
  diagnoses: Diagnosis[];
  idf: Record<string, number>;
  opposites: Record<string, string[]>;
}

type Mode = 'disease' | 'term';

const norm = (s: string) => s.toLowerCase().trim();

export default function QualifierSearch({ qualifiers, diagnoses, idf, opposites }: Props) {
  const [mode, setMode] = useState<Mode>('term');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [openDx, setOpenDx] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const qById = useMemo(() => Object.fromEntries(qualifiers.map((q) => [q.id, q])), [qualifiers]);

  // the page passes only qualifiers that appear in at least one cluster
  const searchable = qualifiers;
  const dupeNames = useMemo(() => {
    const c: Record<string, number> = {};
    qualifiers.forEach((q) => { c[norm(q.name)] = (c[norm(q.name)] || 0) + 1; });
    return c;
  }, [qualifiers]);

  const diseaseMatches = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return diagnoses
      .filter((d) => norm(d.name).includes(q) || norm(d.specialty).includes(q))
      .slice(0, 12);
  }, [query, diagnoses]);

  const termMatches = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return searchable
      .filter((t) => !picked.includes(t.id) && norm(t.name).includes(q))
      .sort((a, b) => norm(a.name).indexOf(q) - norm(b.name).indexOf(q))
      .slice(0, 10);
  }, [query, searchable, picked]);

  const differential = useMemo(() => {
    if (!picked.length) return [];
    return diagnoses
      .map((d) => {
        const hits = picked.filter((p) => d.tags.includes(p));
        const pending = d.cluster.filter((_, i) => {
          const tag = d.clusterTags[i];
          return !tag || !picked.includes(tag);
        });
        const fit = hits.length / Math.max(1, d.cluster.length);
        return { d, hits, pending, fit, score: hits.reduce((s, h) => s + (idf[h] || 0), 0) };
      })
      .filter((r) => r.hits.length > 0)
      .sort(
        (a, b) => b.hits.length - a.hits.length || b.score - a.score || b.fit - a.fit,
      );
  }, [picked, diagnoses, idf]);

  const SHOWN = 12;
  const shown = differential.slice(0, SHOWN);
  const maxScore = differential.length ? differential[0].score : 1;
  const bestCoverage = differential.length ? differential[0].hits.length : 0;

  // A result matching one of several selected qualifiers is a lookup, not a differential.
  const weak = picked.length >= 2 && bestCoverage < 2;

  // Ties are common and were previously presented as if they were a ranking.
  const tiedAtTop = differential.filter(
    (r) => r.hits.length === bestCoverage && Math.abs(r.score - maxScore) < 1e-9,
  ).length;

  // Mutually exclusive selections, for example acute together with chronic.
  const conflicts = useMemo(() => {
    const names = picked.map((p) => norm(qById[p]?.name || ''));
    const out: string[][] = [];
    names.forEach((n, i) => {
      (opposites[n] || []).forEach((o) => {
        const j = names.indexOf(o);
        if (j > i) out.push([qById[picked[i]].name, qById[picked[j]].name]);
      });
    });
    return out;
  }, [picked, qById, opposites]);

  // What separates the two leading candidates. Computed rather than read from the
  // curated "closest mimic" field, because that names one fixed pairing and the
  // search produces arbitrary ones. The curated line is shown only when it agrees.
  const separator = useMemo(() => {
    if (differential.length < 2) return null;
    const [a, b] = differential;
    const ta = new Set(a.d.tags);
    const tb = new Set(b.d.tags);
    const onlyA = a.d.tags.filter((t) => !tb.has(t)).map((t) => qById[t]?.name).filter(Boolean);
    const onlyB = b.d.tags.filter((t) => !ta.has(t)).map((t) => qById[t]?.name).filter(Boolean);
    if (!onlyA.length && !onlyB.length) return null;
    const curatedMatches = a.d.mimic.toLowerCase().includes(b.d.name.toLowerCase().split(',')[0]);
    return { a: a.d, b: b.d, onlyA, onlyB, curated: curatedMatches ? a.d.mimic : null };
  }, [differential, qById]);

  function selectMode(m: Mode) {
    setMode(m); setQuery(''); setPicked([]); setOpenDx(null);
    inputRef.current?.focus();
  }

  const btn = (active: boolean) =>
    [
      'flex-1 px-4 py-2.5 text-sm font-medium rounded-md border transition-colors',
      active
        ? 'bg-blue-600 border-blue-600 text-white'
        : 'bg-white dark:bg-clinical-800 border-clinical-300 dark:border-clinical-600 text-clinical-700 dark:text-clinical-300 hover:border-blue-500',
    ].join(' ');

  return (
    <div>
      <label class="sr-only" for="sq-input">
        {mode === 'disease' ? 'Search for a diagnosis' : 'Search for a semantic qualifier'}
      </label>
      <input
        id="sq-input"
        ref={inputRef}
        type="search"
        autocomplete="off"
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        placeholder={
          mode === 'disease'
            ? 'Enter a diagnosis, for example pulmonary embolism'
            : 'Enter a qualifier, for example painless'
        }
        class="w-full px-4 py-3 text-lg rounded-lg border border-clinical-300 dark:border-clinical-600 bg-white dark:bg-clinical-800 text-clinical-900 dark:text-clinical-50 placeholder:text-clinical-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div class="mt-3 flex gap-3">
        <button type="button" class={btn(mode === 'disease')} onClick={() => selectMode('disease')}>
          Search by disease
        </button>
        <button type="button" class={btn(mode === 'term')} onClick={() => selectMode('term')}>
          Search by term
        </button>
      </div>

      <p class="mt-3 text-sm text-clinical-500 dark:text-clinical-400">
        {mode === 'disease'
          ? 'Returns the coupled qualifier cluster for a diagnosis, with its nearest mimic.'
          : 'Add two or more qualifiers. Results are ranked by how discriminating each one is, not by how common the disease is.'}
      </p>

      {/* selected qualifier chips */}
      {mode === 'term' && picked.length > 0 && (
        <div class="mt-4 flex flex-wrap gap-2">
          {picked.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPicked(picked.filter((p) => p !== id))}
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 text-sm"
            >
              {qById[id]?.name}
              {dupeNames[norm(qById[id]?.name || '')] > 1 && (
                <span class="text-blue-500 dark:text-blue-400">({qById[id]?.domain})</span>
              )}
              <span aria-hidden="true" class="ml-0.5 text-blue-400">&times;</span>
              <span class="sr-only">Remove</span>
            </button>
          ))}
        </div>
      )}

      {/* term autocomplete */}
      {mode === 'term' && termMatches.length > 0 && (
        <ul class="mt-3 border border-clinical-200 dark:border-clinical-700 rounded-lg divide-y divide-clinical-100 dark:divide-clinical-700 overflow-hidden">
          {termMatches.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                class="w-full text-left px-4 py-2.5 hover:bg-clinical-50 dark:hover:bg-clinical-800"
                onClick={() => { setPicked([...picked, t.id]); setQuery(''); inputRef.current?.focus(); }}
              >
                <span class="font-medium text-clinical-900 dark:text-clinical-50">{t.name}</span>
                <span class="ml-2 text-xs uppercase tracking-wide text-clinical-500 dark:text-clinical-400">
                  {t.domain}
                </span>
                <span class="block text-sm text-clinical-600 dark:text-clinical-400">{t.definition}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* differential */}
      {mode === 'term' && picked.length > 0 && (
        <div class="mt-8">
          <h2 class="font-heading text-xl font-semibold text-clinical-900 dark:text-clinical-50 mb-1">
            Differential
          </h2>
          <p class="text-sm text-clinical-500 dark:text-clinical-400 mb-4">
            {differential.length === 0
              ? `No diagnosis in this set carries any of those. The set covers ${diagnoses.length} diagnoses.`
              : `Ranked by how many of your ${picked.length} qualifier${picked.length === 1 ? '' : 's'} each diagnosis carries, then by how discriminating those are.`}
          </p>

          {conflicts.length > 0 && (
            <div class="mb-4 p-4 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30">
              <p class="text-sm text-amber-900 dark:text-amber-200">
                <strong class="font-semibold">Mutually exclusive selections.</strong>{' '}
                {conflicts.map((c) => `${c[0]} and ${c[1]}`).join('; ')}. A single problem is rarely
                both. If you meant to describe a problem with two tempos, that is worth naming as
                acute on chronic rather than selecting both.
              </p>
            </div>
          )}

          {weak && (
            <div class="mb-4 p-4 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30">
              <p class="text-sm text-amber-900 dark:text-amber-200">
                <strong class="font-semibold">Weak match, read with caution.</strong> No catalogued
                diagnosis carries more than one of your {picked.length} qualifiers. What follows is
                closer to {picked.length} separate lookups than to a differential. The likeliest
                explanation is that the presentation you have in mind is not among the{' '}
                {diagnoses.length} diagnoses catalogued here.
              </p>
            </div>
          )}

          {!weak && tiedAtTop > 1 && (
            <p class="mb-4 text-sm text-clinical-600 dark:text-clinical-400">
              The top {tiedAtTop} results are tied. Their order below is arbitrary.
            </p>
          )}
          {separator && (
            <div class="mb-5 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30">
              <h3 class="font-heading font-semibold text-blue-900 dark:text-blue-100 mb-2">
                What separates the top two
              </h3>
              <div class="grid sm:grid-cols-2 gap-3 text-sm">
                <p class="text-blue-900 dark:text-blue-100">
                  <span class="font-medium">{separator.a.name}</span> alone carries:{' '}
                  {separator.onlyA.length ? separator.onlyA.join(', ') : 'nothing uniquely tagged'}
                </p>
                <p class="text-blue-900 dark:text-blue-100">
                  <span class="font-medium">{separator.b.name}</span> alone carries:{' '}
                  {separator.onlyB.length ? separator.onlyB.join(', ') : 'nothing uniquely tagged'}
                </p>
              </div>
              {separator.curated && (
                <p class="mt-2 text-sm text-blue-800 dark:text-blue-200">
                  <span class="font-medium">Documented discriminator:</span> {separator.curated}
                </p>
              )}
            </div>
          )}
          <ol class="space-y-3">
            {shown.map(({ d, hits, pending, score }) => (
              <li
                key={d.id}
                class="p-4 rounded-lg border border-clinical-200 dark:border-clinical-700"
              >
                <div class="flex items-baseline justify-between gap-3">
                  <h3 class="font-heading font-semibold text-clinical-900 dark:text-clinical-50">
                    {d.name}
                  </h3>
                  <span class="shrink-0 text-xs uppercase tracking-wide text-clinical-500 dark:text-clinical-400">
                    {d.specialty}
                  </span>
                </div>
                <div class="mt-2 flex items-center gap-3">
                  <div class="h-1.5 flex-1 rounded bg-clinical-100 dark:bg-clinical-800">
                    <div
                      class={`h-1.5 rounded ${hits.length >= 2 ? 'bg-blue-500' : 'bg-clinical-400'}`}
                      style={{ width: `${Math.max(4, (score / maxScore) * 100)}%` }}
                    />
                  </div>
                  <span class="shrink-0 text-xs text-clinical-500 dark:text-clinical-400">
                    matched {hits.length} of {picked.length}
                  </span>
                </div>
                <p class="mt-2 text-sm text-clinical-600 dark:text-clinical-400">
                  <span class="font-medium">Matched on:</span>{' '}
                  {hits.map((h, i) => (
                    <span key={h}>
                      {i > 0 && ', '}
                      <a
                        href={`/qualifiers/${h}`}
                        class="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {qById[h]?.name}
                      </a>
                    </span>
                  ))}
                </p>
                {pending.length > 0 && (
                  <p class="mt-1 text-sm text-amber-800 dark:text-amber-300">
                    <span class="font-medium">Not yet established:</span> {pending.join(', ')}
                  </p>
                )}
                <p class="mt-1 text-sm text-clinical-700 dark:text-clinical-300">{d.why}</p>
                <p class="mt-1 text-sm text-clinical-600 dark:text-clinical-400">
                  <span class="font-medium">Closest mimic:</span> {d.mimic}
                </p>
              </li>
            ))}
          </ol>
          {differential.length > SHOWN && (
            <p class="mt-4 text-sm text-clinical-500 dark:text-clinical-400">
              Showing {SHOWN} of {differential.length} matching diagnoses. Add another qualifier to
              narrow this; a long list means the combination you entered is not yet discriminating.
            </p>
          )}
        </div>
      )}

      {/* disease results */}
      {mode === 'disease' && query && (
        <div class="mt-6">
          {diseaseMatches.length === 0 ? (
            <p class="text-clinical-500 dark:text-clinical-400">
              No catalogued diagnosis matches that. The set covers {diagnoses.length} common diagnoses.
            </p>
          ) : (
            <ol class="space-y-3">
              {diseaseMatches.map((d) => (
                <li key={d.id} class="rounded-lg border border-clinical-200 dark:border-clinical-700">
                  <button
                    type="button"
                    class="w-full text-left p-4"
                    onClick={() => setOpenDx(openDx === d.id ? null : d.id)}
                  >
                    <div class="flex items-baseline justify-between gap-3">
                      <h3 class="font-heading font-semibold text-clinical-900 dark:text-clinical-50">
                        {d.name}
                      </h3>
                      <span class="shrink-0 text-xs uppercase tracking-wide text-clinical-500 dark:text-clinical-400">
                        {d.specialty}
                      </span>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-1.5">
                      {d.cluster.map((c) => (
                        <span
                          key={c}
                          class="px-2 py-0.5 rounded bg-clinical-100 dark:bg-clinical-800 text-clinical-700 dark:text-clinical-300 text-sm"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </button>
                  {openDx === d.id && (
                    <div class="px-4 pb-4 -mt-1 space-y-2">
                      <p class="text-sm text-clinical-700 dark:text-clinical-300">
                        <span class="font-medium">Why the cluster is discriminating:</span> {d.why}
                      </p>
                      <p class="text-sm text-clinical-600 dark:text-clinical-400">
                        <span class="font-medium">Closest mimic:</span> {d.mimic}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
