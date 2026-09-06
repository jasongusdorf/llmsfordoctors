export type BriefSeriesId = 'news' | 'synopsis' | 'trials-digest' | 'abim';

/**
 * Which briefs section a series belongs to. The AI briefs live at /briefs; the
 * clinical ones at /education/briefs, under Medical Education (Non-AI). Content
 * files stay in src/content/briefs/<series>/ either way, because the ABIM cron
 * publishes into that path and routing should not dictate where it writes.
 */
export type BriefTrack = 'ai' | 'clinical';

export interface BriefSeriesMeta {
  id: BriefSeriesId;
  track: BriefTrack;
  label: string;
  blurb: string;
  cadence: string;
  /** Show each entry's description beneath its title in the series listing. */
  showDescriptionInList?: boolean;
}

export const BRIEF_SERIES: BriefSeriesMeta[] = [
  {
    id: 'news',
    track: 'ai',
    label: 'Daily News Brief',
    blurb:
      'A morning read of what moved in health policy, medicine, and the wider world, with the AI-in-medicine thread pulled out.',
    cadence: 'Daily',
  },
  {
    id: 'synopsis',
    track: 'ai',
    label: 'AI & Medicine Weekly Synopsis',
    blurb:
      'The week in AI and clinical medicine: new papers, regulatory movement, and what actually changed versus what was announced.',
    cadence: 'Weekly, Fridays',
  },
  {
    id: 'trials-digest',
    track: 'ai',
    label: 'Medical Trials Digest',
    blurb:
      'Major trials and reviews published in the last week in the top-tier journals, with the finding stated plainly.',
    cadence: 'Daily',
  },
  {
    id: 'abim',
    track: 'clinical',
    label: 'ABIM Daily Tips',
    blurb:
      'Ten high-yield internal medicine facts a day, board-style, written for recall rather than for reading.',
    cadence: 'Daily',
    // Every issue covers roughly the same ten specialties, so a per-entry
    // description reads as noise under the title. Titles are dated and enough.
    showDescriptionInList: false,
  },
];

export const briefSeriesFor = (track: BriefTrack): BriefSeriesMeta[] =>
  BRIEF_SERIES.filter((s) => s.track === track);

/** Where a series is published. Keep every link and redirect derived from this. */
export const briefBasePath = (track: BriefTrack): string =>
  track === 'ai' ? '/briefs' : '/education/briefs';

export const BRIEF_SERIES_BY_ID: Record<BriefSeriesId, BriefSeriesMeta> =
  Object.fromEntries(BRIEF_SERIES.map((s) => [s.id, s])) as Record<
    BriefSeriesId,
    BriefSeriesMeta
  >;
