'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlayerIndexRow } from '@/lib/players';

/**
 * In-app player database — the quick-research surface behind the Players tab.
 *
 * Rows expand in place rather than routing to an in-app player page: the 200
 * `/players/[slug]` pages are the site's ranking pSEO cluster, so duplicating
 * them under /app would compete with them. The expanded panel links out instead,
 * which also feeds those pages internal links.
 */

const GROUPS: { type: number; label: string }[] = [
  { type: 0, label: 'All' },
  { type: 4, label: 'FWD' },
  { type: 3, label: 'MID' },
  { type: 2, label: 'DEF' },
  { type: 1, label: 'GKP' },
];

type SortKey = 'xPts' | 'ownership' | 'price' | 'totalPoints';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'xPts', label: 'xPts' },
  { key: 'ownership', label: 'Owned' },
  { key: 'price', label: 'Price' },
  { key: 'totalPoints', label: 'Points' },
];

export function PlayersScreen({ rows }: { rows: PlayerIndexRow[] }) {
  const router = useRouter();
  const [pos, setPos] = useState(0);
  const [sort, setSort] = useState<SortKey>('xPts');
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((p) => (pos === 0 || p.elementType === pos))
      .filter((p) => !needle || p.webName.toLowerCase().includes(needle) || p.teamShort.toLowerCase().includes(needle))
      .sort((a, b) => {
        if (sort === 'price') return b.priceValue - a.priceValue;
        if (sort === 'ownership') return parseFloat(b.ownership) - parseFloat(a.ownership);
        if (sort === 'totalPoints') return b.totalPoints - a.totalPoints;
        return b.xPts - a.xPts;
      });
  }, [rows, pos, sort, q]);

  return (
    <>
      <div className="scr-head" style={{ marginBottom: 10 }}>
        <div>
          <div className="scr-title">PLAYERS</div>
          <div className="scr-sub">{rows.length} most-owned · price, ownership &amp; projected points</div>
        </div>
      </div>

      <label className="id-field pl-search" aria-label="Search players">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text" inputMode="search" placeholder="Search player or team…" autoComplete="off"
          value={q} onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <div className="chip-row">
        {GROUPS.map((g) => (
          <span key={g.type} className={`chip ${pos === g.type ? 'is-active' : ''}`} onClick={() => setPos(g.type)}>{g.label}</span>
        ))}
      </div>
      <div className="chip-row pl-sort">
        {SORTS.map((s) => (
          <span key={s.key} className={`chip ${sort === s.key ? 'is-active' : ''}`} onClick={() => setSort(s.key)}>{s.label}</span>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="panel-empty">No players match “{q}”.</div>
      ) : (
        <div className="pred-tbl">
          <div className="pr-row pr-head">
            <span>Player</span><span>Owned</span><span className="num-right">xPts</span>
          </div>
          {list.map((p) => (
            <div key={p.slug}>
              <div className="pr-row" onClick={() => setOpen(open === p.slug ? null : p.slug)}>
                <span className="pl-who">
                  <span className="nm">{p.webName}</span>
                  <span className="tm">{p.teamShort} · {p.positionShort} · £{p.price}m</span>
                </span>
                <span className="pl-own">{p.ownership}%</span>
                <span className="pl-xp num-right">{p.xPts}</span>
              </div>

              {open === p.slug && (
                <div className="pl-detail">
                  <div className="pl-stats">
                    <div><span className="l">Price</span><span className="v">£{p.price}m</span></div>
                    <div><span className="l">Owned</span><span className="v">{p.ownership}%</span></div>
                    <div><span className="l">Season pts</span><span className="v">{p.totalPoints}</span></div>
                    <div><span className="l">Proj. xPts</span><span className="v pl-hi">{p.xPts}</span></div>
                  </div>
                  <a className="s-btn s-btn--red hex pl-cta" onClick={() => router.push(`/players/${p.slug}`)}>
                    Full player page →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="pl-foot">
        Stats from the official FPL API. xPts is our model&rsquo;s projection for the next gameweek — an estimate, not a guarantee.
      </p>
    </>
  );
}
