export type Confidence = 'low' | 'medium' | 'high';

export type CaseProgress = {
  attempts: number;
  correctAnswers: number;
  totalAnswers: number;
  intervalDays: number;
  dueAt: string;
  lastScore: number;
  lastConfidence: Confidence;
  overconfidentErrors: number;
  errorTags: Record<string, number>;
};

export type CaseLabProgress = {
  version: 1;
  cases: Record<string, CaseProgress>;
};

export const EMPTY_PROGRESS: CaseLabProgress = { version: 1, cases: {} };

const DAY = 86_400_000;

export function nextInterval(previousDays: number, score: number): number {
  if (score < 0.6) return 1;
  if (score < 0.8) return Math.max(2, Math.min(3, previousDays + 1));
  if (previousDays <= 1) return 3;
  if (previousDays <= 3) return 7;
  if (previousDays <= 7) return 14;
  return Math.min(60, Math.round(previousDays * 2));
}

export function updateCaseProgress(
  previous: CaseProgress | undefined,
  result: { correctAnswers: number; totalAnswers: number; confidence: Confidence; errorTags: string[] },
  now = new Date(),
): CaseProgress {
  const score = result.totalAnswers ? result.correctAnswers / result.totalAnswers : 0;
  const intervalDays = nextInterval(previous?.intervalDays ?? 0, score);
  const errorTags = { ...(previous?.errorTags ?? {}) };
  for (const tag of result.errorTags) errorTags[tag] = (errorTags[tag] ?? 0) + 1;

  return {
    attempts: (previous?.attempts ?? 0) + 1,
    correctAnswers: (previous?.correctAnswers ?? 0) + result.correctAnswers,
    totalAnswers: (previous?.totalAnswers ?? 0) + result.totalAnswers,
    intervalDays,
    dueAt: new Date(now.getTime() + intervalDays * DAY).toISOString(),
    lastScore: score,
    lastConfidence: result.confidence,
    overconfidentErrors: (previous?.overconfidentErrors ?? 0) + (result.confidence === 'high' && score < 1 ? 1 : 0),
    errorTags,
  };
}

export function isDue(progress: CaseProgress | undefined, now = new Date()): boolean {
  return !progress || new Date(progress.dueAt).getTime() <= now.getTime();
}

export function overallAccuracy(progress: CaseLabProgress): number {
  const rows = Object.values(progress.cases);
  const correct = rows.reduce((sum, row) => sum + row.correctAnswers, 0);
  const total = rows.reduce((sum, row) => sum + row.totalAnswers, 0);
  return total ? correct / total : 0;
}

export function topErrorTags(progress: CaseLabProgress, limit = 3): Array<[string, number]> {
  const totals: Record<string, number> = {};
  for (const row of Object.values(progress.cases)) {
    for (const [tag, count] of Object.entries(row.errorTags)) totals[tag] = (totals[tag] ?? 0) + count;
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, limit);
}
