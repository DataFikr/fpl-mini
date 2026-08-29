'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { HomeData, HomeHeadline } from '../_lib/home-data';
import { pickHeadlineImages } from '@/lib/headline-images';
import { formatRank } from '../_lib/compute';
import { toast } from './Toast';
import { TeamNameSearch } from './TeamNameSearch';
import { extractTeamId } from '@/lib/team-id';

export type HomeNotice = 'not-found' | 'error';

const I = (d: React.ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * The team-ID gate. Home is the landing screen after sign-in, so an anonymous
 * visitor has to be able to start here rather than being bounced to Squad.
 */
function TeamIdPrompt({ notice, teamId }: { notice?: HomeNotice; teamId?: number }) {
  const router = useRouter();
  const [id, setId] = useState('');

  const copy = notice === 'not-found'
    ? {
        kicker: 'Team not found',
        heading: teamId ? `NO FPL TEAM WITH ID ${teamId}` : 'NO FPL TEAM WITH THAT ID',
        body: 'That ID does not match any FPL manager this season. Team IDs are reissued every season, so an old one will not work — check the number and try again.',
      }
    : notice === 'error'
      ? {
          kicker: 'Could not load your hub',
          heading: 'SOMETHING WENT WRONG',
          body: 'The FPL API did not answer in time. Try again in a moment, or load a different team ID.',
        }
      : {
          kicker: 'Your mini-league hub',
          heading: 'FIND YOUR TEAM',
          body: 'Search your team name — no need to go hunting for your team ID. Your leagues, your rank and this week’s headlines, straight from the FPL API.',
        };

  const go = () => {
    const v = extractTeamId(id);
    if (!v) { toast('Enter your team ID, or paste your FPL team link'); return; }
    router.push(`/app/home?teamId=${v}`);
  };

  return (
    <div style={{ marginTop: 18, background: 'var(--ink)', color: '#fff', padding: '22px 18px', clipPath: 'polygon(0 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%)' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{copy.kicker}</div>
      <h3 style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 23, margin: '5px 0 4px' }}>{copy.heading}</h3>
      <p style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: '#cfc6c6', lineHeight: 1.5, margin: '0 0 14px' }}>{copy.body}</p>

      {/* Team name first: the ID is the thing people leave to go and look up. */}
      <TeamNameSearch tone="ink" />

      <details style={{ marginTop: 14 }}>
        <summary style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase', color: '#9a8e8e', cursor: 'pointer' }}>
          Know your team ID? Enter it directly
        </summary>
        <form className="id-field" style={{ display: 'inline-flex', marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); go(); }} noValidate>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>
          <input inputMode="numeric" placeholder="e.g. 6454003 or paste your FPL link" aria-label="FPL team ID" value={id} onChange={(e) => setId(e.target.value)} />
          <button type="submit" className="s-btn s-btn--red hex">Load</button>
        </form>
        <p style={{ fontFamily: 'var(--body)', fontSize: 11, color: '#9a8e8e', margin: '10px 0 0' }}>
          Don&rsquo;t know it? <a href="/app/find-team-id" style={{ color: 'var(--red)', fontWeight: 700 }}>Find your team ID ›</a>
        </p>
      </details>
    </div>
  );
}

function Tile({ href, h4, p, icon }: { href: string; h4: string; p: string; icon: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="tool-tile" style={{ background: '#fff', borderColor: 'var(--line)' }} onClick={() => router.push(href)}>
      <div className="ti">{icon}</div>
      <div><h4 style={{ color: 'var(--ink)' }}>{h4}</h4><p>{p}</p></div>
    </div>
  );
}

export function HomeScreen({ data, teamId, notice }: { data?: HomeData; teamId?: number; notice?: HomeNotice }) {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);

  // Stable identity: `data?.headlines ?? []` would be a fresh array each render,
  // which defeats the photo memo below.
  const headlines = useMemo(() => data?.headlines ?? [], [data]);
  // Deterministic photos, so the feed does not reshuffle on every re-render. The
  // seed is the visitor's team rather than a league id — this feed spans leagues.
  const photos = useMemo(
    () => pickHeadlineImages(headlines.map((h) => (h.sentiment === 'neg' ? 'negative' : 'positive')), teamId ?? 1),
    [headlines, teamId]
  );

  if (!data) {
    return (
      <>
        <div className="hub-hello"><div className="hi">Welcome to FPL Ranker</div><h2>YOUR MINI-LEAGUE HUB</h2></div>
        <TeamIdPrompt notice={notice} teamId={teamId} />
      </>
    );
  }

  const { manager, topLeague, leagues, gw } = data;
  const withTeam = (href: string) => `${href}?teamId=${manager.teamId}`;
  const leagueHref = (id: number) => `/app/league/${id}?teamId=${manager.teamId}`;
  const hero = headlines[0];
  const rest = headlines.slice(1);
  const sel = open != null ? headlines[open] : null;
  const selPhoto = open != null ? photos[open] : null;

  const shareStory = async (s: HomeHeadline) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fplranker.com';
    const url = `${origin}/app/league/${s.leagueId}`;
    const text = `${s.title}\n\n${s.leagueName} on FPL Ranker 👀`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: s.leagueName, text, url }); return; } catch { return; }
    }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); } catch { /* clipboard blocked */ }
    toast('Story + link copied — paste it in the group chat');
  };

  return (
    <>
      <div className="hub-hello">
        <div className="hi">Welcome back{manager.name ? `, ${manager.name.split(' ')[0]}` : ''}</div>
        <h2>{manager.team.toUpperCase()}</h2>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 6 }}>
          Team {manager.teamId} · GW{gw} {manager.gwPoints} pts · {manager.totalPoints} total
          {manager.overallRank > 0 ? ` · OR ${formatRank(manager.overallRank)}` : ''}
        </div>
      </div>

      {topLeague ? (
        <a className="hub-spot" onClick={() => router.push(leagueHref(topLeague.id))}>
          <div className="red-slab" />
          <div className="lbl">Your top league</div>
          <div className="lg">{topLeague.name}</div>
          <div className="rk">
            {topLeague.rank > 0
              ? <>
                  You are <b>{ordinal(topLeague.rank)}</b> of {formatRank(topLeague.size)}
                  {topLeague.move !== 0 && (
                    <b style={{ color: topLeague.move > 0 ? '#7CFB9E' : '#FF8A8A' }}>
                      {' '}{topLeague.move > 0 ? '▲' : '▼'} {formatRank(Math.abs(topLeague.move))}
                    </b>
                  )}
                  {' · '}<span style={{ color: '#7CFB9E' }}>standings, headlines &amp; analytics</span>
                </>
              : <>{formatRank(topLeague.size)} managers · <span style={{ color: '#7CFB9E' }}>opens once GW{gw} is scored</span></>}
          </div>
        </a>
      ) : (
        <div className="hub-spot">
          <div className="red-slab" />
          <div className="lbl">No mini-leagues yet</div>
          <div className="lg">JOIN A LEAGUE</div>
          <div className="rk">{manager.team} has not joined a private mini-league. Once you do, its table and headlines appear here.</div>
        </div>
      )}

      <div className="hub-lbl"><span className="l">JUMP BACK IN</span></div>
      <div className="tool-grid">
        <Tile href={withTeam('/app/squad')} h4="MY SQUAD" p="XI, form & verdict" icon={I(<path d="M8 3l4 2 4-2 4 4-3 2v12H7V9L4 7z" />)} />
        <Tile href={withTeam('/app/leagues')} h4="MY LEAGUES" p={`${leagues.length} mini-league${leagues.length === 1 ? '' : 's'}`} icon={I(<><path d="M6 4h12v3a6 6 0 0 1-12 0z" /><path d="M6 5H4v1a3 3 0 0 0 2 2.8M18 5h2v1a3 3 0 0 1-2 2.8" /><path d="M9 19h6M10 13.5V16a2 2 0 0 1-1 2M14 13.5V16a2 2 0 0 0 1 2" /></>)} />
        <Tile href="/app/blog" h4="BLOG" p="Tips & analysis" icon={I(<><path d="M5 3h11l3 3v15H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></>)} />
        <Tile href="/app/kits" h4="KITBAG" p="26/27 kit drop" icon={I(<path d="M6 2 3 6l3 2v12h12V8l3-2-3-4-4 2a4 4 0 0 1-8 0z" />)} />
      </div>

      {hero ? (
        <>
          <div className="hub-lbl">
            <span className="l">THIS WEEK</span>
            <span className="more" onClick={() => router.push(withTeam('/app/leagues'))}>All leagues ›</span>
          </div>

          <div className="hl-hero" onClick={() => setOpen(0)}>
            <div className="ph" style={{ background: `linear-gradient(135deg, ${hero.tone}33, transparent)` }}>
              {photos[0] && <img src={photos[0].src} alt={photos[0].alt} loading="eager" />}
            </div>
            <div className="grad" />
            <div className="ct">
              <span className="tag tab-cut" style={{ paddingRight: 18, background: hero.tone, ...(hero.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{hero.tag}</span>
              <h3>{hero.title}</h3>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: '#cfc6c6', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 8 }}>{hero.leagueName}</div>
            </div>
          </div>

          <div className="hl-list">
            {rest.map((h, i) => (
              <div key={`${h.leagueId}-${h.tag}-${i}`} className="hl-item" onClick={() => setOpen(i + 1)}>
                <div>
                  <span className="tag tab-cut" style={{ paddingRight: 16, background: h.tone, ...(h.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{h.tag}</span>
                  <h5>{h.title}</h5>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 5 }}>{h.leagueName}</div>
                </div>
                <div className="ph" style={{ background: `linear-gradient(135deg, ${h.tone}33, transparent)` }}>
                  {photos[i + 1] && <img src={photos[i + 1].src} alt={photos[i + 1].alt} loading="lazy" />}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="hub-lbl"><span className="l">THIS WEEK</span></div>
          <p className="kit-intro">
            No headlines yet — they appear as soon as GW{gw} is scored in {leagues.length ? 'your mini-leagues' : 'a mini-league you have joined'}.
          </p>
        </>
      )}

      {sel && (
        <div className="story-backdrop" onClick={() => setOpen(null)}>
          <div className="story-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="story-x" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
            <div className="story-hero">
              {selPhoto && <img src={selPhoto.src} alt={selPhoto.alt} />}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${sel.tone}44, #15000066)` }} />
              <div className="grad" />
              <div className="ct">
                <span className="kicker">{sel.mood === 'neg' ? '💥' : '⚡'} {sel.leagueName}</span>
                <h3>{sel.title}</h3>
              </div>
            </div>
            <div className="story-body">
              <p className="para">{sel.body}</p>
              <div className="foot">
                <div className="who"><div className="nm">{sel.team}</div><div className="mt">{sel.manager}</div></div>
                <div className="pts"><div className="v">{sel.stat}</div><div className="l">{sel.statLabel}</div></div>
              </div>
              <button className="story-share" onClick={() => shareStory(sel)}>Share this story</button>
              <button className="story-copy" onClick={() => { setOpen(null); router.push(leagueHref(sel.leagueId)); }}>Open {sel.leagueName}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
