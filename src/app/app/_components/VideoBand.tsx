import { VideoStage } from './VideoStage';
import type { YouTubeVideo } from '@/lib/youtube-feed';

/**
 * The landing page's "watch it work" band, between the hero and the features
 * grid.
 *
 * It replaced a 12.85 MB muted MP4 that autoplayed in the hero's second column.
 * Two reasons it moved out of the hero rather than swapping in place: the hero's
 * one job is the Team ID form, and a row of cards beside it competes with that;
 * and `.lp .hero` is `overflow:hidden`, so a scrolling rail could not live
 * inside it anyway.
 *
 * Rendered from the server so the titles, links and dates are in the initial
 * HTML — Bingbot, GPTBot, ClaudeBot and PerplexityBot don't execute JS, and
 * this site's whole SEO posture depends on them seeing the content.
 */
export function VideoBand({ videos, channelUrl }: { videos: YouTubeVideo[]; channelUrl: string }) {
  return (
    <section className="vids">
      <div className="wrap">
        <div className="sec-head vs-head">
          <div>
            <span className="kicker">Watch it work</span>
            <h2>60 seconds of your league, on video</h2>
          </div>
          <a className="vs-all" href={channelUrl} target="_blank" rel="noopener noreferrer">
            All Shorts on YouTube &rarr;
          </a>
        </div>
        <VideoStage videos={videos} />
      </div>
    </section>
  );
}
