/**
 * Refreshes the committed YouTube feed snapshot.
 *
 *   npx tsx scripts/capture-youtube-fallback.mts
 *
 * Run this after publishing a video. See the note in
 * src/services/youtube-service.ts for why a committed snapshot exists at all:
 * the Atom endpoint refuses datacenter egress, and the landing page reads the
 * feed during static generation, where there is no warm cache to fall back to.
 *
 * Stores the WHOLE parsed feed, not a selected slice, so YOUTUBE_MAX_VIDEOS and
 * YOUTUBE_VIDEOS_SINCE still apply on read.
 */
import { writeFileSync } from 'node:fs';
import { parseAtomFeed, type YouTubeVideo } from '../src/lib/youtube-feed';

const channelId = (process.env.YOUTUBE_CHANNEL_ID || 'UCeWphzmBA0I5TToVpPViqSQ').trim();
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

/** The endpoint fails roughly half the time even from a residential IP. */
const ATTEMPTS = 12;

let all: YouTubeVideo[] | null = null;
for (let a = 0; a < ATTEMPTS && !all; a++) {
  if (a > 0) await new Promise((r) => setTimeout(r, 400));
  try {
    const res = await fetch(FEED, { headers: { 'User-Agent': 'FPL-League-Hub/1.0' } });
    if (!res.ok) {
      console.log(`  attempt ${a + 1}/${ATTEMPTS}: ${res.status}`);
      continue;
    }
    all = parseAtomFeed(await res.text());
  } catch (error) {
    console.log(`  attempt ${a + 1}/${ATTEMPTS}: ${(error as Error).message}`);
  }
}

if (!all || all.length === 0) {
  // Never overwrite a good snapshot with nothing — it is the last resort.
  throw new Error(`Feed unavailable after ${ATTEMPTS} attempts; snapshot left unchanged.`);
}

const payload = {
  channelId,
  capturedAt: new Date().toISOString(),
  videos: all,
};

writeFileSync(
  new URL('../src/data/youtube-fallback.json', import.meta.url),
  JSON.stringify(payload, null, 2) + '\n',
);

console.log(`\ncaptured ${all.length} entries (${all.filter((v) => v.isShort).length} Shorts) for ${channelId}`);
all.slice(0, 8).forEach((v, i) =>
  console.log(`  ${i + 1}. ${v.isShort ? 'SHORT' : 'video'} ${v.publishedAt.slice(0, 10)} ${v.title.slice(0, 50)}`),
);
