'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TeamMatch {
  teamId: number;
  teamName: string;
  managerName: string;
}

/**
 * Find your squad by its team name instead of by ID.
 *
 * Nobody memorises a 7-digit FPL team ID, but everyone knows what they called
 * their team — so this is the primary way in, with the ID field kept as the
 * fallback.
 *
 * Team name, not manager name: a manager name is usually a real name, which
 * people are reluctant to type into a search box, and a name-queryable index
 * would be a people-finder rather than a mini-league shortcut. The manager name
 * still appears on a result so two squads called "FIFABOY" can be told apart.
 *
 * The index only covers teams that share a league with a previous visitor (see
 * src/lib/manager-index.ts), so "no results" has to read as a gap in our
 * coverage rather than "your team doesn't exist".
 *
 * `tone="ink"` is for the dark home-screen card; the default suits light panels.
 */
export function TeamNameSearch({
  tone = 'light',
  autoFocus = false,
  onFallback,
}: {
  tone?: 'ink' | 'light';
  autoFocus?: boolean;
  /** Rendered under the results — normally the "use my team ID instead" escape. */
  onFallback?: React.ReactNode;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<TeamMatch[] | null>(null);
  const [indexed, setIndexed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const term = q.trim();
    if (term.length < 2) {
      setError('Type at least 2 characters of your team name');
      setResults(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Search failed');
      setResults(data.teams ?? []);
      setIndexed(typeof data.indexed === 'number' ? data.indexed : null);
      // Move focus to the results so keyboard and screen-reader users land there.
      requestAnimationFrame(() => listRef.current?.focus());
    } catch {
      setError('Search is unavailable right now — enter your team ID instead');
      setResults(null);
    } finally {
      setBusy(false);
    }
  };

  const pick = (m: TeamMatch) => router.push(`/app/home?teamId=${m.teamId}`);

  return (
    <div className={`mgr-search${tone === 'ink' ? ' on-ink' : ''}`}>
      <form id="team-name-search" name="team-name-search" className="id-field" onSubmit={search} noValidate>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => { setQ(e.target.value); setError(null); }}
          placeholder="Your team name, e.g. FIFABOY"
          aria-label="Search for your FPL team name"
          autoComplete="off"
        />
        <button type="submit" className="s-btn s-btn--red hex" disabled={busy}>
          {busy ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="ms-msg ms-err" role="alert">{error}</p>}

      {results !== null && !error && (
        results.length > 0 ? (
          <>
            <p className="ms-msg">
              {results.length} match{results.length === 1 ? '' : 'es'} — pick your team
            </p>
            <ul className="ms-list" ref={listRef} tabIndex={-1} aria-label="Search results">
              {results.map((m) => (
                <li key={m.teamId}>
                  <button type="button" className="ms-row" onClick={() => pick(m)}>
                    <span className="ms-names">
                      <span className="ms-team">{m.teamName}</span>
                      <span className="ms-mgr">{m.managerName}</span>
                    </span>
                    <span className="ms-id">{m.teamId}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="ms-msg ms-empty">
            No team called &ldquo;{q.trim()}&rdquo; yet. We can only find teams that share a
            mini-league with someone who has used FPL Ranker
            {indexed ? ` — ${indexed.toLocaleString()} indexed so far` : ''}. Enter your team ID
            below and yours will be searchable for your league-mates.
          </p>
        )
      )}

      {onFallback && <div className="ms-fallback">{onFallback}</div>}
    </div>
  );
}
