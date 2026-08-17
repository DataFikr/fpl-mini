/**
 * Parsing for the public YouTube channel Atom feed.
 *
 * Pure and I/O-free on purpose — `youtube-service.ts` owns the fetching and
 * caching, so this half can be exercised from a node one-liner when the feed
 * shape changes. Same split as `lib/fpl-images.ts` vs the route that calls it.
 *
 * Why regex rather than an XML parser: the producer is a single machine-
 * generated Google template, and six scalar singleton fields are read out of it
 * — no recursion, no repeated siblings, no mixed content. Adding the repo's
 * first XML dependency for ~60 lines of logic isn't a trade worth making. If
 * the shape ever does change, `parseAtomFeed` returning [] on a non-empty body
 * is the signal, and swapping in `fast-xml-parser` behind this same signature
 * is a contained change.
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  /** ISO 8601 with offset, exactly as the feed gives it. */
  publishedAt: string;
  /** True when the canonical link is /shorts/ rather than /watch?v=. */
  isShort: boolean;
  views: number | null;
}

/** Watch page. Shorts get the /shorts/ URL so the vertical player opens. */
export const watchUrl = (v: YouTubeVideo) =>
  v.isShort ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;

/**
 * Privacy-preserving embed. `playsinline=1` stops iOS Safari hijacking the
 * whole screen; the -nocookie host means no third-party cookie is set until
 * someone has actually asked for the video, which is the only way a click-to-
 * load facade is consistent with the site's cookie banner.
 */
export const embedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;

/** Canonical embed URL for JSON-LD — the real host, not the -nocookie alias. */
export const canonicalEmbedUrl = (id: string) => `https://www.youtube.com/embed/${id}`;

/**
 * Thumbnail candidates, best first. Measured against this channel's own Shorts:
 *
 *   frame0.jpg        268x480   true 9:16, full frame     ~14 KB   <- use this
 *   maxresdefault.jpg 1280x720  16:9, vertical pillarboxed ~132 KB
 *   hqdefault.jpg     480x360   4:3, vertical pillarboxed  ~14 KB
 *   oardefault.jpg    404 on this channel — do not use
 *
 * `oardefault` serves a real 1080x1920 on some channels, which is why it looks
 * like the obvious answer, but it is absent here — so it is no good as a
 * thumbnail *or* as the Shorts classifier it sometimes gets used for. The feed's
 * own /shorts/ link is the reliable flag; see `isShort`.
 *
 * The fallbacks need no special casing in CSS: `object-fit:cover` on a 9/16 box
 * fits frame0 exactly and crops the other two down to their centred vertical
 * column, which is the same picture.
 */
export const THUMB_CHAIN = (id: string) => [
  `https://i.ytimg.com/vi/${id}/frame0.jpg`,
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
];

/** Largest available, for JSON-LD only — never fetched by a browser. */
export const posterUrl = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

/**
 * XML entity decoding. Skipping this is the single most likely bug here: the
 * feed escapes ampersands, so an untouched title renders literally as
 * "Haaland &amp; Salah" on the page.
 *
 * `&amp;` must be decoded LAST — doing it first turns "&amp;lt;" into "<"
 * instead of the literal "&lt;" the feed meant.
 */
export function decodeXmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => safeCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeCodePoint(Number(dec)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function safeCodePoint(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) return '';
  try {
    return String.fromCodePoint(n);
  } catch {
    return '';
  }
}

const stripCdata = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

/**
 * Drop the trailing hashtag run from a title.
 *
 * Every upload ends with something like "#fpl #fantasypremierleague
 * #fplcommunity" — discovery metadata for YouTube's algorithm, not part of the
 * title. Left in, it eats both lines of the card's clamp and pushes the actual
 * title out of view. Only a trailing run is removed, so a hashtag used mid-
 * sentence survives.
 */
export function stripTrailingHashtags(title: string): string {
  return title.replace(/(?:\s+#[\p{L}\p{N}_]+)+\s*$/u, '').trim() || title.trim();
}

const field = (chunk: string, re: RegExp): string => {
  const m = chunk.match(re);
  return m ? decodeXmlEntities(stripCdata(m[1])).trim() : '';
};

/** Guards against a pathological body; the real feed is ~50 KB. */
const MAX_BODY = 1_000_000;
/** Entries to consider before filtering. The feed itself caps around 15. */
const MAX_ENTRIES = 40;

/**
 * Turn a feed body into videos. Throws on anything that isn't an Atom feed —
 * notably, a bad channel ID or an @handle returns a full HTML error page, which
 * would otherwise regex-parse to zero entries and look like an empty channel.
 */
export function parseAtomFeed(xml: string): YouTubeVideo[] {
  if (xml.length > MAX_BODY) {
    throw new Error(`YouTube feed unexpectedly large (${xml.length} bytes)`);
  }
  if (!xml.includes('<feed')) {
    throw new Error('YouTube feed response was not an Atom feed');
  }

  // The first chunk is the channel header, not an entry.
  const chunks = xml.split('<entry>').slice(1, MAX_ENTRIES + 1);

  return chunks
    .map((chunk): YouTubeVideo | null => {
      const id = field(chunk, /<yt:videoId>([^<]+)<\/yt:videoId>/);
      // `<media:title>` cannot match `<title>` — the preceding char is ':'.
      const title = field(chunk, /<title>([\s\S]*?)<\/title>/);
      const publishedAt = field(chunk, /<published>([^<]+)<\/published>/);
      if (!id || !title || !publishedAt) return null;

      const href = field(chunk, /<link[^>]*\shref="([^"]+)"/);
      const viewsRaw = field(chunk, /<media:statistics\s+views="(\d+)"/);

      return {
        id,
        title: stripTrailingHashtags(title),
        description: field(chunk, /<media:description>([\s\S]*?)<\/media:description>/),
        publishedAt,
        isShort: href.includes('/shorts/'),
        views: viewsRaw ? Number(viewsRaw) : null,
      };
    })
    .filter((v): v is YouTubeVideo => v !== null);
}

/**
 * Newest first, Shorts only, published on/after `since`.
 *
 * `since` is a content-freshness preference rather than a correctness rule, so
 * the caller is expected to fall back to unfiltered results if this empties an
 * otherwise healthy feed — a band of slightly older Shorts beats no band.
 */
export function selectShorts(
  videos: YouTubeVideo[],
  opts: { since?: string; max: number }
): YouTubeVideo[] {
  const cutoff = opts.since ? Date.parse(opts.since) : NaN;
  return videos
    .filter((v) => v.isShort)
    .filter((v) => (Number.isNaN(cutoff) ? true : Date.parse(v.publishedAt) >= cutoff))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, opts.max);
}
