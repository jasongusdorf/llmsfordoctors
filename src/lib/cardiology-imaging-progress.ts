export type ImagingProgressRow = { attempts:number; correct:number; intervalDays:number; dueAt:string; errors:Record<string,number> };
export type ImagingProgress = { version:1; studies:Record<string,ImagingProgressRow> };
export const EMPTY_IMAGING_PROGRESS: ImagingProgress = { version:1, studies:{} };

export function isImagingDue(row?: ImagingProgressRow, now = new Date()) { return !row || new Date(row.dueAt) <= now; }
export function updateImagingProgress(previous: ImagingProgressRow | undefined, correct:boolean, confidence:'low'|'medium'|'high', errorTag:string, now = new Date()): ImagingProgressRow {
  const attempts = (previous?.attempts ?? 0) + 1;
  const intervalDays = correct ? (confidence === 'high' ? Math.max(3, (previous?.intervalDays ?? 1) * 2) : Math.max(2, previous?.intervalDays ?? 1)) : 1;
  const due = new Date(now); due.setDate(due.getDate() + intervalDays);
  const errors = { ...(previous?.errors ?? {}) };
  if (!correct) errors[errorTag] = (errors[errorTag] ?? 0) + 1;
  return { attempts, correct:(previous?.correct ?? 0) + Number(correct), intervalDays, dueAt:due.toISOString(), errors };
}
