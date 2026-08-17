import redis from '@/lib/redis';
import { parseAtomFeed, selectShorts, type YouTubeVideo } from '@/lib/youtube-feed';

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
   * Never throws and never returns a partial failure — the caller renders this
   * straight onto the landing page, and a decorative band must not be able to
   * take the page down. Every failure path ends at an empty array.
   */
  async getRecentShorts(): Promise<YouTubeVideo[]> {
    if (!this.isConfigured) return [];

    const freshKey = `yt:feed:${this.channelId}`;
    const staleKey = `${freshKey}:last`;

    try {
      const cached = await redis.get(freshKey);
      if (cached) return JSON.parse(cached) as YouTubeVideo[];
    } catch (error) {
      console.warn('YouTube cache read failed:', error);
    }

    let all: YouTubeVideo[];
    try {
      const res = await fetch(`${FEED_BASE}${this.channelId}`, {
        headers: { 'User-Agent': 'FPL-League-Hub/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`YouTube feed error: ${res.status} ${res.statusText}`);
      all = parseAtomFeed(await res.text());
    } catch (error) {
      console.error('YouTube feed error:', error);
      // Serve the last good payload rather than blanking the section because
      // YouTube had a bad minute. This is the whole reason for the second key.
      try {
        const stale = await redis.get(staleKey);
        if (stale) {
          console.warn('YouTube: serving stale feed');
          return JSON.parse(stale) as YouTubeVideo[];
        }
      } catch (staleError) {
        console.warn('YouTube stale cache read failed:', staleError);
      }
      return [];
    }

    let videos = selectShorts(all, { since: this.since, max: this.max });

    // The date cutoff is a freshness preference, not a correctness rule. If it
    // empties an otherwise healthy feed, show the newest Shorts anyway.
    if (videos.length === 0 && all.some((v) => v.isShort)) {
      console.warn(`YouTube: no Shorts since ${this.since}; falling back to newest ${this.max}`);
      videos = selectShorts(all, { max: this.max });
    }

    const payload = JSON.stringify(videos);
    try {
      await redis.setEx(freshKey, FRESH_TTL, payload);
      await redis.setEx(staleKey, STALE_TTL, payload);
    } catch (error) {
      console.warn('YouTube cache write failed:', error);
    }

    return videos;
  }
}
