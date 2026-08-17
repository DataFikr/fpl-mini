import { Landing } from './_components/Landing';
import { VideoBand } from './_components/VideoBand';
import { ToastHost } from './_components/Toast';
import { VideoListStructuredData } from '@/components/seo/structured-data';
import { YouTubeService } from '@/services/youtube-service';
import { YOUTUBE_CHANNEL_URL } from '@/lib/seo';

/**
 * Hourly ISR. This is the first `revalidate` on a page in the repo, and it is
 * deliberate: reading the YouTube feed here makes the route async, which would
 * otherwise flip the site's highest-traffic marketing page from static to
 * dynamic. The service caches in Redis on top of this, so YouTube itself is hit
 * at most twice an hour.
 */
export const revalidate = 1800;

/** Below this the band looks broken rather than sparse, so it is not rendered. */
const MIN_VIDEOS = 2;

export default async function AppLandingPage() {
  const videos = await new YouTubeService().getRecentShorts();
  const showBand = videos.length >= MIN_VIDEOS;

  return (
    <>
      <Landing
        videoSlot={showBand ? <VideoBand videos={videos} channelUrl={YOUTUBE_CHANNEL_URL} /> : null}
      />
      {showBand && <VideoListStructuredData videos={videos} />}
      <ToastHost />
    </>
  );
}
