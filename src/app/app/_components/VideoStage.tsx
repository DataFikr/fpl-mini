'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { THUMB_CHAIN, embedUrl, watchUrl, type YouTubeVideo } from '@/lib/youtube-feed';
import { trackEvent } from '@/lib/analytics';

/**
 * Centre-stage carousel for the landing page's Shorts.
 *
 * Three cards are on screen: the active one at full size in the middle, and the
 * previous and next dimmed and scaled back either side. One card at a time
 * carries the eye, which is the point — these covers *are* the hook (`THE TABLE
 * ONLY SHOWS YOU THE LAST ONE`, `+3 - 4 = -1`), and a held cover keeps that
 * legible for as long as someone looks at it.
 *
 * Deliberately not autoplaying. A live embed costs ~1.3 MB across ~22 requests,
 * which is the cost this section was built to avoid; and the first second of
 * playback replaces the cover, taking the hook with it. Click to play instead.
 * If motion is ever wanted, gate it on an IntersectionObserver rather than page
 * load so it cannot touch LCP.
 *
 * Positions wrap, so there is never an empty slot at either end. Each card is
 * absolutely centred and offset by `--vs-step` times its distance from the
 * active index, which keeps the responsive sizing entirely in CSS.
 */

let preconnected = false;
function preconnect() {
  if (preconnected || typeof document === 'undefined') return;
  preconnected = true;
  for (const [href, cors] of [
    ['https://www.youtube-nocookie.com', true],
    ['https://i.ytimg.com', false],
  ] as const) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (cors) link.crossOrigin = '';
    document.head.appendChild(link);
  }
}

/**
 * Step through the thumbnail candidates on 404. A counter rather than a
 * comparison so it can never loop, and the last step hides the image to leave
 * the ink card and its play hexagon — never a broken-image icon.
 */
function advanceThumb(img: HTMLImageElement) {
  const id = img.dataset.vid;
  if (!id) return;
  const step = Number(img.dataset.fb ?? '0') + 1;
  const chain = THUMB_CHAIN(id);
  img.dataset.fb = String(step);
  if (step < chain.length) img.src = chain[step];
  else img.style.display = 'none';
}

/** UTC so the server and client agree — a local-time format would mismatch. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

const SWIPE_PX = 40;

export function VideoStage({ videos }: { videos: YouTubeVideo[] }) {
  const n = videos.length;
  const [active, setActive] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  /**
   * Distance from the active card, wrapped so it is always the shortest way
   * round. 0 is centre, -1 and 1 are the visible flanks, anything further is
   * parked off-stage at zero opacity.
   */
  const half = Math.floor(n / 2);
  const relOf = (i: number) => ((i - active + half + n * 2) % n) - half;

  const go = useCallback(
    (delta: number) => {
      setPlayingId(null); // never leave a video playing off-centre
      setActive((a) => (a + delta + n) % n);
    },
    [n]
  );

  // Catch thumbnails that already failed before hydration: the band is
  // server-rendered, so the browser starts fetching these before React attaches
  // onError, and a missed image `error` is never replayed.
  useEffect(() => {
    stageRef.current?.querySelectorAll<HTMLImageElement>('img.vs-thumb').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) advanceThumb(img);
    });
  }, []);

  // The button that had focus is unmounted when the iframe replaces it.
  useEffect(() => {
    if (playingId) frameRef.current?.focus();
  }, [playingId]);

  const play = (v: YouTubeVideo, index: number) => {
    setPlayingId(v.id);
    trackEvent('video_play', {
      video_id: v.id,
      video_title: v.title,
      position: String(index + 1),
      placement: 'landing_shorts_stage',
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
  };

  return (
    <div
      className="vs-stage-wrap"
      role="group"
      aria-roledescription="carousel"
      aria-label="FPL Ranker Shorts"
      onKeyDown={onKeyDown}
    >
      <button className="vs-arrow vs-arrow--prev" type="button" aria-label="Previous video" onClick={() => go(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 4 7 12l8 8" />
        </svg>
      </button>

      <div
        className="vs-stage"
        ref={stageRef}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        }}
      >
        {videos.map((v, i) => {
          const rel = relOf(i);
          const onStage = Math.abs(rel) <= 1;
          const isCentre = rel === 0;
          const isPlaying = playingId === v.id;

          return (
            <div
              key={v.id}
              className={`vs-card${isCentre ? ' is-centre' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              // Off-stage cards are hidden from AT and unreachable by Tab
              // (the button below takes tabIndex -1), which keeps them out of
              // the reading and focus order without needing `inert`.
              aria-hidden={onStage ? undefined : true}
              style={{
                transform: `translate(-50%, -50%) translateX(calc(var(--vs-step) * ${rel})) scale(${isCentre ? 1 : 0.84})`,
                opacity: onStage ? (isCentre ? 1 : 0.7) : 0,
                zIndex: isCentre ? 2 : 1,
                pointerEvents: onStage ? 'auto' : 'none',
              }}
            >
              {isPlaying ? (
                <iframe
                  ref={frameRef}
                  className="vs-frame"
                  src={embedUrl(v.id)}
                  title={`${v.title} — YouTube Short`}
                  allow="autoplay; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <>
                  <button
                    type="button"
                    className="vs-play-btn"
                    // Off-centre cards bring themselves forward rather than
                    // playing, so a click never starts a video the viewer
                    // cannot properly see.
                    aria-label={isCentre ? `Play: ${v.title} — YouTube Short` : `Show: ${v.title}`}
                    onClick={() => (isCentre ? play(v, i) : setActive(i))}
                    onPointerEnter={preconnect}
                    onFocus={preconnect}
                    tabIndex={onStage ? undefined : -1}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="vs-thumb"
                      src={THUMB_CHAIN(v.id)[0]}
                      data-vid={v.id}
                      data-fb="0"
                      onError={(e) => advanceThumb(e.currentTarget)}
                      width={268}
                      height={480}
                      loading={Math.abs(rel) <= 1 ? 'eager' : 'lazy'}
                      decoding="async"
                      // The covers are almost entirely text, so the title is the
                      // real alternative. Not announced twice: the button's
                      // explicit aria-label wins the name computation.
                      alt={v.title}
                    />
                    {isCentre && <span className="vs-play" aria-hidden="true" />}
                  </button>
                  {isCentre && (
                    <div className="vs-meta">
                      <a
                        className="vs-title"
                        href={watchUrl(v)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {v.title}
                      </a>
                      <span className="vs-date">{shortDate(v.publishedAt)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <button className="vs-arrow vs-arrow--next" type="button" aria-label="Next video" onClick={() => go(1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 4 8 8-8 8" />
        </svg>
      </button>

      <p className="vs-live" aria-live="polite">{`Video ${active + 1} of ${n}: ${videos[active]?.title ?? ''}`}</p>

      <div className="vs-dots" role="tablist" aria-label="Choose a video">
        {videos.map((v, i) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show video ${i + 1}: ${v.title}`}
            className={`vs-dot${i === active ? ' is-on' : ''}`}
            onClick={() => { setPlayingId(null); setActive(i); }}
          />
        ))}
      </div>
    </div>
  );
}
