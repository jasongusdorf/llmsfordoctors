export type BriefSeriesId = 'news' | 'synopsis' | 'trials-digest' | 'abim';

export interface BriefSeriesMeta {
  id: BriefSeriesId;
  label: string;
  blurb: string;
  cadence: string;
  /** Show each entry's description beneath its title in the series listing. */
  showDescriptionInList?: boolean;
}

export const BRIEF_SERIES: BriefSeriesMeta[] = [
  {
    id: 'news',
    label: 'Daily News Brief',
    blurb:
      'A morning read of what moved in health policy, medicine, and the wider world, with the AI-in-medicine thread pulled out.',
    cadence: 'Daily',
  },
  {
    id: 'synopsis',
    label: 'AI & Medicine Weekly Synopsis',
    blurb:
      'The week in AI and clinical medicine: new papers, regulatory movement, and what actually changed versus what was announced.',
    cadence: 'Weekly, Fridays',
  },
  {
    id: 'trials-digest',
    label: 'Medical Trials Digest',
    blurb:
      'Major trials and reviews published in the last week in the top-tier journals, with the finding stated plainly.',
    cadence: 'Daily',
  },
  {
    id: 'abim',
    label: 'ABIM Daily Tips',
    blurb:
      'Ten high-yield internal medicine facts a day, board-style, written for recall rather than for reading.',
    cadence: 'Daily',
    // Every issue covers roughly the same ten specialties, so a per-entry
    // description reads as noise under the title. Titles are dated and enough.
    showDescriptionInList: false,
  },
];

export const BRIEF_SERIES_BY_ID: Record<BriefSeriesId, BriefSeriesMeta> =
  Object.fromEntries(BRIEF_SERIES.map((s) => [s.id, s])) as Record<
    BriefSeriesId,
    BriefSeriesMeta
  >;
