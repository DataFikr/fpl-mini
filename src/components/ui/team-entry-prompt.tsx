'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractTeamId } from '@/lib/team-id';
import { markSelfEnteredTeamId } from '@/lib/use-account';
import { trackEvent } from '@/lib/analytics';

/**
 * The next click for a search visitor sitting on a content page.
 *
 * The Sep 2026 diagnostic found the content layer ranks and then leaks: the
 * player prices page pulled 68 views at 67.5% bounce, and four blog/player pages
 * bounced at exactly 100%. Meanwhile the app itself retains well — My Leagues
 * 4.5%, My Squad 12.5%. Content was not routing anyone into the part that works.
 *
 * The ask is a team ID rather than a signup or a purchase because that is the
 * step already proven to convert (visitor→account went 1.24% → 2.9% when
 * `e89b81a` made team entry easier) and because it is what the app needs to show
 * anything personal. Content pages previously offered either a link to
 * /app/squad — which asks for the ID one click later — or "Go premium", which
 * asks an anonymous 20-second-old visitor to buy.
 *
 * Styled inline rather than by class: content pages load sportify-pages.css and
 * the app tree loads its own bundle, and `.id-field` exists only in the latter.
 * Every custom property used here is defined in both.
 */
export function TeamEntryPrompt({
  placement,
  kicker,
  heading,
  body,
  cta = 'Show my squad',
}: {
  /** Which content surface this sits on — GA4 `placement`. */
  placement: string;
  kicker: string;
  heading: string;
  body: string;
  cta?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    // Errors render inline instead of via toast(): toast dispatches a window
    // event that only the app shell listens for, so on /players and
    // /players/[slug] an invalid ID would fail completely silently.
    const id = extractTeamId(value);
    if (!id) {
      setError('Enter your team ID, or paste your FPL team link.');
      return;
    }
    setError('');
    trackEvent('content_to_app', { placement });
    // Marks the id as this visitor's own, so the shell does not file it as a
    // browsed/shared team — see markSelfEnteredTeamId.
    markSelfEnteredTeamId(id);
    router.push(`/app/home?teamId=${id}`);
  };

  return (
    <section
      style={{
        marginTop: 26,
        background: 'var(--ink)',
        color: '#fff',
        padding: '22px 24px',
        clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
      }}
    >
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {kicker}
      </div>
      <h2 style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 26, letterSpacing: '.02em', lineHeight: '.95', margin: '6px 0 6px' }}>
        {heading}
      </h2>
      <p style={{ fontFamily: 'var(--body)', fontSize: 13.5, color: '#cfc6c6', lineHeight: 1.55, margin: '0 0 14px' }}>
        {body}
      </p>

      <form
        id={`team-entry-${placement}`}
        name={`team-entry-${placement}`}
        onSubmit={go}
        noValidate
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(''); }}
          placeholder="e.g. 6454003, or paste your FPL link"
          aria-label="Your FPL team ID"
          aria-invalid={!!error}
          autoComplete="off"
          style={{
            flex: '1 1 240px', minWidth: 0, background: '#fff', color: 'var(--ink)',
            border: error ? '2px solid var(--red)' : '2px solid transparent',
            padding: '11px 13px', fontFamily: 'var(--body)', fontSize: 14,
          }}
        />
        <button type="submit" className="s-btn s-btn--red hex">{cta}</button>
      </form>

      {error && (
        <p role="alert" style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: '#ff9b9b', margin: '9px 0 0' }}>
          {error}
        </p>
      )}

      <p style={{ fontFamily: 'var(--body)', fontSize: 11.5, color: '#9a8e8e', margin: '10px 0 0' }}>
        Don&rsquo;t know it?{' '}
        <a href="/app/find-team-id" style={{ color: 'var(--red)', fontWeight: 700 }}>Find your team ID ›</a>
      </p>
    </section>
  );
}
