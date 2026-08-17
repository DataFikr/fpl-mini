import raw from './data/fr01-headlines.json';
import tagsRaw from './data/fr01-tags.json';

/**
 * FR-01's data boundary. Same role as `data.ts` for FR-08, but sourced from a
 * captured API payload rather than a live import — see `data/README.md`.
 */

export interface Story {
  tag: string;
  tone: string;
  title: string;
  sentiment: 'pos' | 'neg';
  score?: number;
  detail?: {
    subhead: string;
    body: string;
    team: string;
    /** Never rendered — see the names constraint in data/README.md. */
    manager: string;
    stat: number;
    statLabel: string;
  };
}

const payload = raw as unknown as { hero: Story; list: Story[] };

/** Every story the engine produced, hero first — exactly as the app orders them. */
export const stories: Story[] = [payload.hero, ...(payload.list ?? [])];

/** The full tag vocabulary the engine can emit (10 of them). */
export const allTags = tagsRaw as { tag: string; tone: string; sentiment: 'pos' | 'neg' }[];

export const heroStory = stories[0];

/** The strongest positive story — the tone flip at 45s. */
export const positiveStory =
  stories.find((s) => s.sentiment === 'pos' && s.tone === '#009C54') ??
  stories.find((s) => s.sentiment === 'pos') ??
  stories[stories.length - 1];

/** The league name, read off the payload rather than hard-coded. */
export const leagueName =
  stories.find((s) => s.tag === 'CLONE WARS')?.detail?.team ?? 'your mini-league';

/**
 * Headline titles embed the team name, which is the joke. Chip colours come
 * straight from the engine's TONE map so a card can never show a colour the
 * product wouldn't.
 */
export const chipTextColor = (tone: string) => (tone === '#FFD100' ? '#150000' : '#FFFFFF');
