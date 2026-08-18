import redis from '@/lib/redis';
import { parseAtomFeed, selectShorts, type YouTubeVideo } from '@/lib/youtube-feed';
import fallback from '@/data/youtube-fallback.json';

/**
 * The FPL Ranker YouTube channel's recent Shorts, for the landing page band.
 *
 * Uses the public Atom feed rather than the Data API. That is deliberate: no API
 * key, no Google Cloud project, no quota, nothing to rotate. The costs are that
 * it returns only the ~15 newest videos and carries no duration.
 *
 * Switch to Data API v3 when either of those actually bites — i.e. more than 15
 * videos need showing, or `duration` is wanted for VideoObject rich results:
 *   1. GET /youtube/v3/channels?part=contentDetails&id={channelId}
 *      -> contentDetails.relatedPlaylists.uploads  (stable; cache indefinitely)
 *   2. GET /youtube/v3/playlistItems?part=snippet&playlistId={uploads}&maxResults=50
 *      -> 1 quota unit, against a 10,000/day free allowance
 *   3. GET /youtube/v3/videos?part=contentDetails&id={ids}
 *      -> 1 unit; `duration` is already ISO 8601 (PT47S) and drops straight
 *         into JSON-LD, and doubles as an exact Shorts test
 * Keep `YouTubeVideo` and the parser signature unchanged and only the fetch
 * layer moves — the component, CSS and JSON-LD stay as they are.
 */

const FEED_BASE = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

/** A channel ID is always `UC` plus 22 URL-safe chars. An @handle 404s the feed. */
const CHANNEL_ID_RE = /^UC[\w-]{22}$/;

const FRESH_TTL = 1800; // 30 min — the feed itself sends max-age=900
const STALE_TTL = 604800; // 7 days

/**
 * The feed endpoint fails sporadically — measured 2026-08-17 at roughly half of
 * requests for a *valid* channel, mixing 404 and 500 in no particular order
 * (12 sequential attempts: 6x200, 4x404, 2x500). Both codes are lies: the
 * channel exists and the next attempt usually succeeds.
 *
 * So a 404 here must never be read as "channel not found", and a single attempt
 * is a coin flip that would blank the band for a whole TTL.
 *
 * Five attempts, not three: a measured run hit 404, 404, 500 before succeeding
 * on the fourth, so a 3-attempt policy still fails in practice. Failures return
 * in ~20ms rather than hanging, so the cost in the bad case is the backoff
 * (~2.6s worst case), not the timeout.
 *
 * Retrying is not sufficient on its own, though. Those odds are measured from a
 * residential IP; from Vercel's build infrastructure all five attempts return
 * 404, which reads as datacenter egress being refused rather than transient
 * failure. Retries cannot beat that, which is why `youtube-fallback.json` is
 * committed and consulted last — see the snapshot note in getRecentShorts.
 */
const FETCH_ATTEMPTS = 5;
const ATTEMPT_TIMEOUT = 6000;
const RETRY_BACKOFF = [200, 400, 800, 1200];

export class YouTubeService {
  private readonly channelId: string;
  private readonly since?: string;
  private readonly max: number;
  readonly isConfigured: boolean;

  constructor() {
    this.channelId = (process.env.YOUTUBE_CHANNEL_ID || '').trim();
    this.since = process.env.YOUTUBE_VIDEOS_SINCE?.trim() || undefined;
    this.max = Number(process.env.YOUTUBE_MAX_VIDEOS) || 6;
    this.isConfigured = CHANNEL_ID_RE.test(this.channelId);

    if (!this.isConfigured) {
      console.warn(
        this.channelId
          ? `YouTube: YOUTUBE_CHANNEL_ID "${this.channelId}" is not a UC… channel ID (an @handle will not work). Video band disabled.`
          : 'YouTube: YOUTUBE_CHANNEL_ID not set. Video band disabled.'
      );
    }
  }

  /**
   * One feed read, retried past the endpoint's sporadic 404s and 500s. Throws
   * only once every attempt has failed; the caller turns that into the stale
   * cache or an empty band.
   */
  private async fetchFeed(): Promise<YouTubeVideo[]> {
    let last: unknown;

    for (let attempt = 0; attempt < FETCH_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, RETRY_BACKOFF[attempt - 1] ?? 900));
      }

      try {
        const res = await fetch(`${FEED_BASE}${this.channelId}`, {
          headers: { 'User-Agent': 'FPL-League-Hub/1.0' },
          signal: AbortSignal.timeout(ATTEMPT_TIMEOUT),
        });
        if (!res.ok) throw new Error(`YouTube feed error: ${res.status} ${res.statusText}`);

        const parsed = parseAtomFeed(await res.text());
        if (attempt > 0) console.warn(`YouTube: feed recovered on attempt ${attempt + 1}`);
        return parsed;
      } catch (error) {
        last = error;
        console.warn(`YouTube: feed attempt ${attempt + 1}/${FETCH_ATTEMPTS} failed:`, error);
      }
    }

    throw last;
  }

  /**
   * Never throws and never returns a partial failure — the caller renders this
   * straight onto the landing page, and a decorative band must not be able to
   * take the page down. Every failure path ends at an empty array.
   */
  async getRecentShorts(): Promise<YouTubeVideo[]> {
    if (!this.isConfigured) return [];

    // Keyed on the channel alone, and holding the WHOLE parsed feed rather than
    // the selected slice. Caching the slice meant `YOUTUBE_MAX_VIDEOS` and
    // `YOUTUBE_VIDEOS_SINCE` could not take effect until the TTL expired — a
    // 7th upload plus a config bump looked like a no-op for up to 30 minutes,
    // and the stale copy kept the old slice for 7 days. Selection is cheap and
    // now happens on every read, so config changes apply immediately while the
    // stale fallback survives them.
    const freshKey = `yt:feed:v2:${this.channelId}`;
    const staleKey = `${freshKey}:last`;

    let all: YouTubeVideo[] | null = null;

    try {
      const cached = await redis.get(freshKey);
      if (cached) all = JSON.parse(cached) as YouTubeVideo[];
    } catch (error) {
      console.warn('YouTube cache read failed:', error);
    }

    if (!all) {
      try {
        all = await this.fetchFeed();

        const payload = JSON.stringify(all);
        try {
          await redis.setEx(freshKey, FRESH_TTL, payload);
          // An empty parse of a 200 means the feed's shape changed, not that the
          // channel emptied — see the note on parseAtomFeed. Letting that reach
          // the 7-day key would destroy the only good fallback, so the stale
          // copy is only ever replaced by a feed that actually had entries.
          if (all.length > 0) await redis.setEx(staleKey, STALE_TTL, payload);
          else console.warn('YouTube: feed parsed to 0 entries; stale copy kept');
        } catch (error) {
          console.warn('YouTube cache write failed:', error);
        }
      } catch (error) {
        console.error('YouTube feed error:', error);
        // Serve the last good feed rather than blanking the section because
        // YouTube had a bad minute. This is the whole reason for the second key.
        try {
          const stale = await redis.get(staleKey);
          if (stale) {
            console.warn('YouTube: serving stale feed');
            all = JSON.parse(stale) as YouTubeVideo[];
          }
        } catch (staleError) {
          console.warn('YouTube stale cache read failed:', staleError);
        }
      }
    }

    // Last resort: the committed snapshot. This is what actually keeps the band
    // up, because the two paths above cannot help during static generation —
    // the build has no warm cache (and with no REDIS_URL the cache is a
    // per-process Map, so it is empty in every build worker), while the live
    // feed refuses datacenter egress. Without this the band renders empty into
    // the prerendered HTML and stays that way for a full revalidate window.
    if (!all && fallback.channelId === this.channelId) {
      console.warn(`YouTube: serving committed snapshot from ${fallback.capturedAt}`);
      all = fallback.videos as YouTubeVideo[];
    }

    if (!all) return [];

    let videos = selectShorts(all, { since: this.since, max: this.max });

    // The date cutoff is a freshness preference, not a correctness rule. If it
    // empties an otherwise healthy feed, show the newest Shorts anyway.
    if (videos.length === 0 && all.some((v) => v.isShort)) {
      console.warn(`YouTube: no Shorts since ${this.since}; falling back to newest ${this.max}`);
      videos = selectShorts(all, { max: this.max });
    }

    return videos;
  }
}
