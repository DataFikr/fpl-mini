/**
 * Manager photography for headline cards.
 *
 * Ten owned images: five of a manager in a good moment, five in a bad one. A
 * story's tone picks the set, so a captaincy haul never gets a devastated
 * manager and a bench disaster never gets a celebrating one.
 *
 * Used by every headline surface: the /app league Headlines tab
 * (`LeagueDetailClient`), the /league page (`enhanced-league-storytelling`),
 * the share/OG card, and the subscriber newsletter — so the pools live here,
 * not in any one of them.
 *
 * Two encodings of each image ship in /public/images/headlines:
 *   .webp (1200px) — the web app. Small, and every browser we target reads it.
 *   .jpg  (600px)  — email and the OG card. Outlook's Word rendering engine
 *                    does not support WebP, and satori (next/og) does not
 *                    decode it reliably, so those two surfaces need JPEG.
 * Use `toJpeg()` / `absoluteHeadlineUrl()` rather than hardcoding either.
 */

export type StoryTone = 'positive' | 'negative';

export const HEADLINE_IMAGES: Record<StoryTone, string[]> = {
  positive: [
    '/images/headlines/positive-1-tactical-sideline-vindication.webp',
    '/images/headlines/positive-2-post-match-media-relief.webp',
    '/images/headlines/positive-3-quiet-genius-press-conference.webp',
    '/images/headlines/positive-4-pitch-side-unbridled-ecstasy.webp',
    '/images/headlines/positive-5-calculated-executive-handclap.webp',
  ],
  negative: [
    '/images/headlines/negative-6-sideline-devastation-shock.webp',
    '/images/headlines/negative-7-furious-media-wall-outburst.webp',
    '/images/headlines/negative-8-press-conference-exhaustion.webp',
    '/images/headlines/negative-9-stunned-media-glare.webp',
    '/images/headlines/negative-10-pitch-side-anxious-pacing.webp',
  ],
};

/** Describes the photo, not the story — the headline text is already in the DOM. */
export const HEADLINE_IMAGE_ALT: Record<string, string> = {
  'positive-1-tactical-sideline-vindication': 'Manager on the touchline, vindicated by a tactical call',
  'positive-2-post-match-media-relief': 'Manager showing relief in a post-match media interview',
  'positive-3-quiet-genius-press-conference': 'Composed manager fielding questions at a press conference',
  'positive-4-pitch-side-unbridled-ecstasy': 'Manager celebrating wildly pitch-side',
  'positive-5-calculated-executive-handclap': 'Manager applauding calmly from the touchline',
  'negative-6-sideline-devastation-shock': 'Devastated manager on the sideline',
  'negative-7-furious-media-wall-outburst': 'Furious manager remonstrating in front of the media wall',
  'negative-8-press-conference-exhaustion': 'Exhausted manager slumped at a press conference',
  'negative-9-stunned-media-glare': 'Stunned manager staring into the media lights',
  'negative-10-pitch-side-anxious-pacing': 'Anxious manager pacing the technical area',
};

export interface HeadlineImage {
  src: string;
  alt: string;
}

function altFor(src: string): string {
  const key = src.split('/').pop()!.replace(/\.(webp|jpg|png)$/, '');
  return HEADLINE_IMAGE_ALT[key] ?? 'Football manager reacting on the touchline';
}

/** The 600px JPEG twin of a headline image, for email and the OG card. */
export function toJpeg(src: string): string {
  return src.replace(/\.webp$/, '.jpg');
}

/**
 * Fully-qualified JPEG URL. Email clients and satori both fetch over the wire,
 * so neither can resolve a root-relative path.
 */
export function absoluteHeadlineUrl(src: string, baseUrl?: string): string {
  const base = (baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://fplranker.com').replace(/\/$/, '');
  return `${base}${toJpeg(src)}`;
}

/** Chip labels that read as bad news (headlines engine + OG card). */
export const NEGATIVE_TAGS = new Set([
  'BENCH NIGHTMARE', 'CAPTAIN CALAMITY', 'CLONE WARS', 'BOTTLE JOB', 'PANIC MERCHANT', 'FALLER',
]);

/** Story-type slugs that read as bad news (storytelling API + newsletter). */
export const NEGATIVE_TYPES = new Set([
  'disaster', 'bench_nightmare', 'bottle_job', 'clone_wars', 'ghost_ship', 'panic_merchant',
]);

/**
 * Best available tone for a story, whatever shape it arrives in.
 *
 * The four producers disagree: the headlines API sends `sentiment`, the
 * storytelling API sends `type`, the share/subscribe payload sends `tag`, and
 * the newsletter's own fallback stories send none of them. Checked in
 * descending order of confidence; anything unrecognised is treated as positive,
 * which is the safe default — a celebrating manager over neutral news reads as
 * upbeat, whereas a devastated one over good news reads as a bug.
 */
export function resolveStoryTone(story: {
  sentiment?: 'pos' | 'neg' | string;
  type?: string;
  tag?: string;
}): StoryTone {
  if (story.sentiment) return story.sentiment === 'neg' ? 'negative' : 'positive';
  if (story.type && NEGATIVE_TYPES.has(story.type)) return 'negative';
  if (story.tag && NEGATIVE_TAGS.has(story.tag.toUpperCase())) return 'negative';
  return 'positive';
}

/**
 * Picks one photo per story, in order.
 *
 * Two guarantees: the photo's mood matches the story's tone, and no photo
 * repeats within a league until that tone's five are used up. The starting
 * offset comes from the league id — and the two tones start at different
 * offsets — so two leagues with the same run of story types still look
 * different from each other.
 *
 * Deterministic: the same league and the same stories always produce the same
 * photos, so the cards don't reshuffle on re-render.
 */
export function pickHeadlineImages(tones: StoryTone[], leagueId: number): HeadlineImage[] {
  const cursor: Record<StoryTone, number> = {
    positive: Math.abs(leagueId),
    negative: Math.abs(leagueId) + 2,
  };

  return tones.map((tone) => {
    const pool = HEADLINE_IMAGES[tone];
    const src = pool[cursor[tone] % pool.length];
    cursor[tone] += 1;
    return { src, alt: altFor(src) };
  });
}
