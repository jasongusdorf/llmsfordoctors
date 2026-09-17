import { useEffect, useMemo, useState } from 'preact/hooks';
import type { CardiologyCase, CaseMode } from '../data/cardiology-cases';
import {
  EMPTY_PROGRESS,
  isDue,
  overallAccuracy,
  topErrorTags,
  updateCaseProgress,
  type CaseLabProgress,
  type Confidence,
} from '../lib/cardiology-case-progress';

const STORAGE_KEY = 'llmsfordoctors-cardiology-case-lab-v1';

type StageAnswer = { picked: number; confidence: Confidence; correct: boolean };

const modeCopy: Record<CaseMode, { label: string; description: string }> = {
  board: { label: 'Board mode', description: 'Full diagnostic and management sequence' },
  bedside: { label: 'Bedside mode', description: 'Physiology, stability, and next-action decisions' },
  rapid: { label: 'Rapid fire', description: 'One decisive tracing or sound per case' },
};

function readProgress(): CaseLabProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (parsed?.version === 1 && parsed?.cases) return parsed;
  } catch {}
  return EMPTY_PROGRESS;
}

function saveProgress(progress: CaseLabProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function formatDue(iso: string) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return 'Due now';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

export default function CardiologyCaseLab({ cases }: { cases: CardiologyCase[] }) {
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<CaseLabProgress>(EMPTY_PROGRESS);
  const [mode, setMode] = useState<CaseMode>('board');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, StageAnswer>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence>('medium');
  const [complete, setComplete] = useState(false);
  const [session, setSession] = useState({ cases: 0, correct: 0, total: 0 });

  useEffect(() => {
    setProgress(readProgress());
    setHydrated(true);
  }, []);

  const active = cases.find((item) => item.id === activeId) ?? null;
  const stages = active?.stages.filter((stage) => !stage.modes || stage.modes.includes(mode)) ?? [];
  const stage = stages[stageIndex];
  const answered = stageIndex in answers;
  const dueCount = cases.filter((item) => isDue(progress.cases[item.id])).length;
  const attemptedCount = Object.keys(progress.cases).length;
  const accuracy = overallAccuracy(progress);
  const errors = topErrorTags(progress);

  const queue = useMemo(() => {
    return [...cases].sort((a, b) => {
      const ap = progress.cases[a.id];
      const bp = progress.cases[b.id];
      const ad = isDue(ap) ? 0 : 1;
      const bd = isDue(bp) ? 0 : 1;
      if (ad !== bd) return ad - bd;
      if (!ap && bp) return -1;
      if (ap && !bp) return 1;
      return (ap?.lastScore ?? 0) - (bp?.lastScore ?? 0);
    });
  }, [cases, progress]);

  const startCase = (id: string) => {
    setActiveId(id);
    setStageIndex(0);
    setAnswers({});
    setPicked(null);
    setConfidence('medium');
    setComplete(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishCase = (nextAnswers: Record<number, StageAnswer>) => {
    if (!active) return;
    const rows = Object.values(nextAnswers);
    const correctAnswers = rows.filter((row) => row.correct).length;
    const highConfidenceMiss = rows.some((row) => row.confidence === 'high' && !row.correct);
    const wrongTags = stages.filter((_, index) => nextAnswers[index] && !nextAnswers[index].correct).map((item) => item.errorTag);
    const updated = updateCaseProgress(progress.cases[active.id], {
      correctAnswers,
      totalAnswers: rows.length,
      confidence: highConfidenceMiss ? 'high' : confidence,
      errorTags: wrongTags,
    });
    const nextProgress = { version: 1 as const, cases: { ...progress.cases, [active.id]: updated } };
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setSession((value) => ({ cases: value.cases + 1, correct: value.correct + correctAnswers, total: value.total + rows.length }));
    setComplete(true);
  };

  const commit = () => {
    if (picked === null || !stage) return;
    const nextAnswers = { ...answers, [stageIndex]: { picked, confidence, correct: picked === stage.answer } };
    setAnswers(nextAnswers);
  };

  const advance = () => {
    if (stageIndex === stages.length - 1) finishCase(answers);
    else {
      setStageIndex((value) => value + 1);
      setPicked(null);
      setConfidence('medium');
    }
  };

  if (!hydrated) return <div class="rounded-xl border border-clinical-200 p-6 text-clinical-500 dark:border-clinical-700">Loading your case queue…</div>;

  if (!active) {
    return (
      <div>
        <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Learning dashboard">
          {[
            ['Due now', dueCount.toString()],
            ['Cases attempted', `${attemptedCount}/${cases.length}`],
            ['Answer accuracy', attemptedCount ? `${Math.round(accuracy * 100)}%` : '—'],
            ['Session', session.total ? `${session.correct}/${session.total}` : 'Not started'],
          ].map(([label, value]) => (
            <div class="rounded-xl border border-clinical-200 bg-warm-white p-4 dark:border-clinical-700 dark:bg-clinical-800">
              <p class="text-xs font-semibold uppercase tracking-wide text-clinical-500">{label}</p>
              <p class="mt-1 font-heading text-2xl font-bold text-clinical-900 dark:text-clinical-50">{value}</p>
            </div>
          ))}
        </section>

        <section class="mt-6 rounded-xl border border-clinical-200 bg-warm-white p-5 dark:border-clinical-700 dark:bg-clinical-800">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 class="font-heading text-xl font-semibold text-clinical-900 dark:text-clinical-50">Choose a training mode</h2>
              <p class="mt-1 text-sm text-clinical-600 dark:text-clinical-300">Progress is stored only in this browser. Missed cases return sooner.</p>
            </div>
            <div class="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Training mode">
              {(Object.keys(modeCopy) as CaseMode[]).map((key) => (
                <button type="button" role="radio" aria-checked={mode === key} onClick={() => setMode(key)} class={`rounded-lg border px-3 py-2 text-left text-sm ${mode === key ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100' : 'border-clinical-200 text-clinical-700 dark:border-clinical-700 dark:text-clinical-200'}`}>
                  <span class="block font-semibold">{modeCopy[key].label}</span>
                  <span class="mt-0.5 block text-xs opacity-75">{modeCopy[key].description}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => startCase(queue[0].id)} class="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto">
            Start recommended case →
          </button>
        </section>

        {errors.length > 0 && (
          <section class="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <h2 class="font-semibold text-amber-950 dark:text-amber-100">Recurring error patterns</h2>
            <div class="mt-2 flex flex-wrap gap-2">{errors.map(([tag, count]) => <span class="rounded-full bg-white px-3 py-1 text-sm text-amber-900 dark:bg-clinical-900 dark:text-amber-100">{tag} · {count}</span>)}</div>
          </section>
        )}

        <section class="mt-8">
          <div class="mb-4 flex items-end justify-between gap-4">
            <div><h2 class="font-heading text-2xl font-semibold text-clinical-900 dark:text-clinical-50">Case queue</h2><p class="mt-1 text-sm text-clinical-500">Due, unseen, and lower-scoring cases rise to the top.</p></div>
            {attemptedCount > 0 && <button type="button" class="text-sm text-red-600 hover:underline dark:text-red-400" onClick={() => { if (confirm('Reset all Cardiology Case Lab progress on this browser?')) { setProgress(EMPTY_PROGRESS); saveProgress(EMPTY_PROGRESS); } }}>Reset progress</button>}
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            {queue.map((item) => {
              const row = progress.cases[item.id];
              return (
                <button type="button" onClick={() => startCase(item.id)} class="rounded-xl border border-clinical-200 bg-warm-white p-5 text-left hover:border-blue-500 hover:shadow-sm dark:border-clinical-700 dark:bg-clinical-800 dark:hover:border-blue-400">
                  <div class="flex items-start justify-between gap-4">
                    <div><p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{item.category} · {item.difficulty}</p><h3 class="mt-1 font-heading text-lg font-semibold text-clinical-900 dark:text-clinical-50">{item.title}</h3></div>
                    <span class={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${isDue(row) ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' : 'bg-clinical-100 text-clinical-600 dark:bg-clinical-700 dark:text-clinical-200'}`}>{row ? formatDue(row.dueAt) : 'New'}</span>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-clinical-600 dark:text-clinical-300">{item.opening}</p>
                  <p class="mt-3 text-xs text-clinical-500">~{item.estimatedMinutes} min{row ? ` · Last score ${Math.round(row.lastScore * 100)}%` : ''}</p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (complete) {
    const rows = Object.values(answers);
    const right = rows.filter((row) => row.correct).length;
    const row = progress.cases[active.id];
    return (
      <article>
        <button type="button" onClick={() => setActiveId(null)} class="mb-5 text-sm text-blue-600 hover:underline dark:text-blue-400">← Back to case queue</button>
        <div class="rounded-2xl border border-clinical-200 bg-warm-white p-6 dark:border-clinical-700 dark:bg-clinical-800 sm:p-8">
          <p class="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Case complete · {right}/{rows.length} correct</p>
          <h2 class="mt-2 font-heading text-3xl font-bold text-clinical-900 dark:text-clinical-50">{active.title}</h2>
          <p class="mt-4 text-lg leading-8 text-clinical-700 dark:text-clinical-200">{active.synthesis}</p>
          <h3 class="mt-6 font-heading text-xl font-semibold text-clinical-900 dark:text-clinical-50">Keep these</h3>
          <ul class="mt-3 space-y-2 text-clinical-700 dark:text-clinical-200">{active.takeaways.map((item) => <li class="flex gap-2"><span class="text-blue-500">•</span><span>{item}</span></li>)}</ul>
          <div class="mt-6 rounded-lg bg-clinical-50 p-4 text-sm dark:bg-clinical-900"><strong>Spaced repetition:</strong> {formatDue(row.dueAt)}. Current interval: {row.intervalDays} day{row.intervalDays === 1 ? '' : 's'}.</div>
          <div class="mt-6"><h3 class="text-sm font-semibold uppercase tracking-wide text-clinical-500">Guidelines</h3><div class="mt-2 flex flex-wrap gap-2">{active.guidelineLinks.map((link) => <a href={link.href} class="rounded-full border border-clinical-200 px-3 py-1.5 text-sm text-blue-600 hover:border-blue-500 dark:border-clinical-700 dark:text-blue-400">{link.label}</a>)}</div></div>
          <div class="mt-6"><h3 class="text-sm font-semibold uppercase tracking-wide text-clinical-500">Textbook references</h3><ul class="mt-2 space-y-1 text-sm leading-6 text-clinical-600 dark:text-clinical-300">{active.textbookReferences.map((reference) => <li>• {reference}</li>)}</ul></div>
          <div class="mt-7 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => { const next = queue.find((item) => item.id !== active.id && isDue(progress.cases[item.id])) ?? queue.find((item) => item.id !== active.id); if (next) startCase(next.id); }} class="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Next recommended case</button>
            <button type="button" onClick={() => startCase(active.id)} class="rounded-lg border border-clinical-300 px-5 py-3 font-semibold text-clinical-700 hover:border-blue-500 dark:border-clinical-600 dark:text-clinical-200">Repeat now</button>
          </div>
        </div>
      </article>
    );
  }

  const answer = answers[stageIndex];
  return (
    <article>
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setActiveId(null)} class="text-sm text-blue-600 hover:underline dark:text-blue-400">← Exit to queue</button>
        <p class="text-sm text-clinical-500">{modeCopy[mode].label} · Stage {stageIndex + 1}/{stages.length}</p>
      </div>
      <div class="mb-3 h-2 overflow-hidden rounded-full bg-clinical-100 dark:bg-clinical-700"><div class="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${((stageIndex + (answered ? 1 : 0)) / stages.length) * 100}%` }} /></div>
      <section class="rounded-2xl border border-clinical-200 bg-warm-white p-6 dark:border-clinical-700 dark:bg-clinical-800 sm:p-8">
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">{active.category} · {active.difficulty}</p>
        <h1 class="mt-2 font-heading text-2xl font-bold text-clinical-900 dark:text-clinical-50 sm:text-3xl">{active.title}</h1>
        <p class="mt-4 leading-7 text-clinical-700 dark:text-clinical-200">{stageIndex === 0 ? active.opening : stage.reveal}</p>
      </section>

      {stage.media && (
        <section class="mt-5 rounded-xl border border-clinical-200 bg-white p-4 dark:border-clinical-700 dark:bg-clinical-900">
          {stage.media.type === 'ecg' ? <img src={stage.media.src} alt={stage.media.alt} class="h-auto w-full rounded-lg" /> : <audio controls preload="metadata" class="w-full"><source src={stage.media.src} type="audio/mpeg" />Your browser does not support audio playback.</audio>}
          <div class="mt-2 flex items-center justify-between gap-3 text-xs text-clinical-500"><span>Representative teaching media; not from the synthetic vignette patient.</span>{stage.media.href && <a href={stage.media.href} target="_blank" class="shrink-0 text-blue-600 hover:underline dark:text-blue-400">Full read ↗</a>}</div>
        </section>
      )}

      <section class="mt-5 rounded-xl border border-clinical-200 bg-warm-white p-5 dark:border-clinical-700 dark:bg-clinical-800 sm:p-6">
        <p class="text-xs font-semibold uppercase tracking-wide text-clinical-500">{stage.title}</p>
        <h2 class="mt-2 font-heading text-xl font-semibold text-clinical-900 dark:text-clinical-50">{stage.prompt}</h2>
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          {stage.options.map((option, index) => {
            const isCorrect = index === stage.answer;
            let classes = 'rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ';
            if (!answered) classes += picked === index ? 'border-blue-600 bg-blue-50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-100' : 'border-clinical-300 text-clinical-800 hover:border-blue-500 dark:border-clinical-600 dark:text-clinical-200';
            else if (isCorrect) classes += 'border-green-600 bg-green-50 text-green-950 dark:bg-green-950/40 dark:text-green-100';
            else if (answer?.picked === index) classes += 'border-red-500 bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100';
            else classes += 'border-clinical-200 text-clinical-400 dark:border-clinical-700 dark:text-clinical-500';
            return <button type="button" disabled={answered} onClick={() => setPicked(index)} class={classes}><span class="mr-2 opacity-60">{String.fromCharCode(65 + index)}.</span>{option}</button>;
          })}
        </div>

        {!answered && (
          <div class="mt-5 flex flex-col gap-4 border-t border-clinical-200 pt-4 dark:border-clinical-700 sm:flex-row sm:items-end sm:justify-between">
            <fieldset><legend class="mb-2 text-xs font-semibold uppercase tracking-wide text-clinical-500">Confidence before reveal</legend><div class="flex gap-2">{(['low', 'medium', 'high'] as Confidence[]).map((value) => <button type="button" onClick={() => setConfidence(value)} class={`rounded-full border px-3 py-1.5 text-sm capitalize ${confidence === value ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100' : 'border-clinical-300 text-clinical-600 dark:border-clinical-600 dark:text-clinical-300'}`}>{value}</button>)}</div></fieldset>
            <button type="button" disabled={picked === null} onClick={commit} class="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">Commit answer</button>
          </div>
        )}

        {answered && (
          <div class={`mt-5 rounded-lg border p-4 ${answer.correct ? 'border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/30' : 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30'}`} aria-live="polite">
            <p class={`font-heading font-semibold ${answer.correct ? 'text-green-950 dark:text-green-100' : 'text-red-950 dark:text-red-100'}`}>{answer.correct ? 'Correct.' : `Not quite. The best answer is ${stage.options[stage.answer].toLowerCase()}.`}</p>
            <p class="mt-2 text-sm leading-6 text-clinical-700 dark:text-clinical-200">{stage.explanation}</p>
            <p class="mt-2 text-xs text-clinical-500">Your confidence: {answer.confidence}</p>
            <button type="button" onClick={advance} class="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">{stageIndex === stages.length - 1 ? 'Finish case' : 'Reveal next stage →'}</button>
          </div>
        )}
      </section>
    </article>
  );
}
