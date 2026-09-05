import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';

type Item = { i: number; s: string; w: number; h: number; c: number };
type Cat = { id: string; name: string; group: string; teaching: string };
type Group = { id: string; name: string };

const CHOICES = 4;

function shuffle<T>(a: T[]): T[] {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

export default function EcgQuiz({
  items,
  cats,
  groups,
}: {
  items: Item[];
  cats: Cat[];
  groups: Group[];
}) {
  const [scope, setScope] = useState('all');
  const [q, setQ] = useState<Item | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const pool = useMemo(
    () => (scope === 'all' ? items : items.filter((i) => cats[i.c].group === scope)),
    [items, cats, scope],
  );

  // Distractors come from the same group where possible, so the choice is a real
  // discrimination rather than "which of these is even a rhythm".
  const next = useCallback(() => {
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const me = cats[pick.c];
    const sameGroup = cats.filter((c) => c.group === me.group && c.name !== me.name).map((c) => c.name);
    const others = cats.filter((c) => c.group !== me.group).map((c) => c.name);
    const chosen = [...shuffle(sameGroup), ...shuffle(others)].slice(0, CHOICES - 1);
    setQ(pick);
    setOpts(shuffle([me.name, ...chosen]));
    setPicked(null);
  }, [pool, cats]);

  useEffect(() => {
    next();
  }, [scope]);

  if (!q) return <p class="text-clinical-500">Loading…</p>;

  const cat = cats[q.c];
  const answered = picked !== null;
  const correct = answered && picked === cat.name;

  return (
    <div>
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <label class="text-sm text-clinical-600 dark:text-clinical-400">
          Draw from{' '}
          <select
            value={scope}
            onChange={(e) => setScope((e.target as HTMLSelectElement).value)}
            class="ml-1 px-2 py-1 rounded border border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 text-clinical-900 dark:text-clinical-100"
          >
            <option value="all">every category</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <p class="text-sm text-clinical-600 dark:text-clinical-400" aria-live="polite">
          {score.total > 0
            ? `${score.right} of ${score.total} correct (${Math.round((score.right / score.total) * 100)}%)`
            : 'No answers yet'}
        </p>
      </div>

      <img
        src={q.s}
        width={q.w}
        height={q.h}
        alt="12-lead ECG to interpret"
        class="w-full h-auto rounded-lg border border-clinical-200 dark:border-clinical-700 bg-white"
      />

      <div class="grid sm:grid-cols-2 gap-2 mt-5">
        {opts.map((o) => {
          const isAnswer = o === cat.name;
          let cls =
            'text-left px-4 py-3 rounded-lg border transition-colors font-medium disabled:cursor-default ';
          if (!answered) {
            cls +=
              'border-clinical-300 dark:border-clinical-600 bg-warm-white dark:bg-clinical-800 text-clinical-800 dark:text-clinical-200 hover:border-blue-500 dark:hover:border-blue-400';
          } else if (isAnswer) {
            cls +=
              'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-200';
          } else if (o === picked) {
            cls +=
              'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
          } else {
            cls +=
              'border-clinical-200 dark:border-clinical-700 text-clinical-400 dark:text-clinical-500';
          }
          return (
            <button
              key={o}
              type="button"
              class={cls}
              disabled={answered}
              onClick={() => {
                setPicked(o);
                setScore((s) => ({ right: s.right + (o === cat.name ? 1 : 0), total: s.total + 1 }));
              }}
            >
              {o}
              {answered && isAnswer && <span class="ml-2 text-sm font-normal">correct</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div class="mt-5 p-5 rounded-lg border border-clinical-200 dark:border-clinical-700 bg-warm-white dark:bg-clinical-800">
          <p class="font-heading font-semibold mb-2 text-clinical-900 dark:text-clinical-50">
            {correct ? 'Correct.' : `Not quite. This is ${cat.name.toLowerCase()}.`}
          </p>
          <p class="text-clinical-600 dark:text-clinical-400 mb-3">{cat.teaching}</p>
          <div class="flex flex-wrap gap-4 text-sm">
            <a
              href={`/education/cardiology/ecg/tracing/${q.i}`}
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Full read of record {q.i}
            </a>
            <a
              href={`/education/cardiology/ecg/${cat.id}`}
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              More {cat.name.toLowerCase()}
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={next}
        class="mt-5 w-full sm:w-auto px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        {answered ? 'Next tracing' : 'Skip this one'}
      </button>
    </div>
  );
}
