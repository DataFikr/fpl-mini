import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

export const runtime = 'nodejs'; // FPL service uses node fetch / redis

const INK = '#150000';
const RED = '#FF5050';
const GREEN = '#7CFB9E';

// Celebrating vs dejected manager photos, matched to story sentiment.
const HL_POS = ['positive_carrick_fist', 'positive_howie_fist', 'positive_iraola_celebrating', 'positive_maresca_celebrating', 'positive_unai_fist_cheer'];
const HL_NEG = ['negative_carrick_disapoint', 'negative_howie_disapointed', 'negative_iraola_frust', 'negative_maresca_scratch_head', 'negative_unai_disapointed'];

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

interface OgStory { tag: string; tone: string; title: string; img: string }

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Best-effort display font (Bebas Neue). Falls back to the built-in sans if the
// fetch fails, so the card always renders.
async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/BebasNeue-Regular.ttf',
      { cache: 'force-cache' }
    );
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '');
  const teamId = parseInt(searchParams.get('teamId') || '');

  let leagueName = 'Mini-League';
  let gw = 38;
  let rows: { entry: number; team: string; mgr: string; rank: number; total: number; move: number }[] = [];

  try {
    const fpl = new FPLApiService();
    const [standings, currentGw] = await Promise.all([
      fpl.getLeagueStandings(id),
      fpl.getCurrentGameweek().catch(() => 38),
    ]);
    gw = currentGw;
    leagueName = standings.league?.name || leagueName;
    rows = (standings.standings?.results || []).map((r: any) => ({
      entry: r.entry,
      team: r.entry_name,
      mgr: r.player_name,
      rank: r.rank,
      total: r.total,
      move: (r.last_rank || r.rank) - r.rank,
    }));
  } catch {
    // fall through to a generic card
  }

  const focus = rows.find((r) => r.entry === teamId) || rows[0];
  const top = rows.slice(0, 5);
  const display = (await loadDisplayFont()) || undefined;
  const dFont = display ? 'Bebas Neue' : 'sans-serif';

  // ---- storylines + next-GW teaser, derived from standings movement ----
  const leader = rows[0];
  const second = rows[1];
  const gap = leader && second ? leader.total - second.total : 0;
  const climber = rows.filter((r) => r.move > 0).sort((a, b) => b.move - a.move)[0];
  const faller = rows.filter((r) => r.move < 0).sort((a, b) => a.move - b.move)[0];

  const YELLOW = '#FFD100';
  const stories: { tag: string; tone: string; text: string }[] = [];
  if (leader) stories.push({ tag: 'LEADER', tone: GREEN, text: `${leader.team} tops the table on ${leader.total.toLocaleString()} pts` });
  if (climber) stories.push({ tag: 'RISER', tone: GREEN, text: `${climber.team} surges ${climber.move} to ${ordinal(climber.rank)}` });
  if (faller) stories.push({ tag: 'FALLER', tone: RED, text: `${faller.team} tumbles ${-faller.move} place${-faller.move > 1 ? 's' : ''}` });
  if (stories.length < 3 && leader && second) stories.push({ tag: 'RACE', tone: YELLOW, text: `Only ${gap} pts split 1st and 2nd` });
  const topStories = stories.slice(0, 3);

  const nextGw = gw < 38 ? gw + 1 : null;
  const teaser = nextGw
    ? gap <= 5 && second
      ? `GW${nextGw}: just ${gap} pts splits the top two — the title is wide open`
      : `GW${nextGw}: ${leader ? leader.team : 'the leaders'} ${gap} pts clear — can anyone reel them in?`
    : `Season done — ${leader ? leader.team : 'your champion'} takes the crown. Who dethrones them in 2026/27?`;

  // ---- 5 top storylines pulled from the headlines engine (3 positive, 2 negative, with pictures) ----
  const origin = new URL(request.url).origin;
  let headlineStories: OgStory[] = [];
  try {
    const res = await fetch(`${origin}/api/leagues/${id}/headlines?gw=${gw}`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const hj = await res.json();
      const pool = [hj.hero, ...(hj.list || [])].filter(Boolean) as { tag: string; tone: string; title: string; sentiment: 'pos' | 'neg' }[];
      const pos = pool.filter((s) => s.sentiment === 'pos');
      const neg = pool.filter((s) => s.sentiment === 'neg');
      const picked = [...pos.slice(0, 3), ...neg.slice(0, 2)];
      for (const s of pool) { if (picked.length >= 5) break; if (!picked.includes(s)) picked.push(s); }
      let pi = id % HL_POS.length;
      let ni = (Math.floor(id / HL_POS.length) + 1) % HL_NEG.length;
      headlineStories = picked.slice(0, 5).map((s) => {
        const name = s.sentiment === 'neg' ? HL_NEG[ni++ % HL_NEG.length] : HL_POS[pi++ % HL_POS.length];
        return { tag: s.tag, tone: s.tone, title: s.title, img: `${origin}/images/headlines/${name}.png` };
      });
    }
  } catch { /* fall back to standings-derived storylines */ }

  const Move = ({ mv }: { mv: number }) =>
    mv > 0 ? <span style={{ color: GREEN }}>▲ {mv}</span>
      : mv < 0 ? <span style={{ color: RED }}>▼ {-mv}</span>
        : <span style={{ color: '#9a8e8e' }}>—</span>;

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', background: INK, color: '#fff', padding: '40px 56px', position: 'relative', fontFamily: 'sans-serif' }}>
        {/* red slab */}
        <div style={{ position: 'absolute', top: '-80px', right: '-120px', width: '460px', height: '460px', background: RED, opacity: 0.16, display: 'flex', transform: 'skewX(-12deg)' }} />

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '36px', height: '36px', background: RED, display: 'flex', clipPath: 'polygon(48% 0,100% 0,52% 42%,100% 42%,20% 100%,42% 52%,0 52%)' }} />
            <div style={{ fontFamily: dFont, fontSize: '34px', letterSpacing: '2px' }}>FPL RANKER</div>
          </div>
          <div style={{ display: 'flex', fontFamily: dFont, fontSize: '26px', letterSpacing: '2px', background: 'rgba(255,255,255,0.1)', padding: '8px 18px' }}>GW{gw} · 2025/26</div>
        </div>

        {/* league name */}
        <div style={{ display: 'flex', fontFamily: dFont, fontSize: '46px', letterSpacing: '1px', marginTop: '14px', color: '#fff' }}>{leagueName.toUpperCase()}</div>

        {/* body: table toppers + storylines */}
        <div style={{ display: 'flex', flex: 1, gap: '40px', marginTop: '8px' }}>
          {/* top 5 table */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '560px' }}>
            <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '18px', letterSpacing: '3px', color: RED, fontWeight: 700, marginBottom: '6px' }}>TABLE TOPPERS</div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 16px' }}>
              {top.map((r) => {
                const me = focus && r.entry === focus.entry;
                return (
                  <div key={r.entry} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '7px 10px', background: me ? RED : 'transparent', color: me ? '#fff' : '#e6dcdc' }}>
                    <div style={{ display: 'flex', fontFamily: dFont, fontSize: '28px', width: '42px', color: me ? '#fff' : RED }}>{r.rank}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '21px', fontWeight: 800 }}>{r.team}</div>
                      <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '14px', opacity: 0.7 }}>{r.mgr}</div>
                    </div>
                    <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '15px', width: '52px', justifyContent: 'center' }}><Move mv={r.move} /></div>
                    <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '22px', fontWeight: 700, width: '64px', justifyContent: 'flex-end' }}>{r.total.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* storylines — top 5 from the headlines engine (3 positive, 2 negative, with pictures) */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '18px', letterSpacing: '3px', color: RED, fontWeight: 700, marginBottom: '6px' }}>THE STORYLINES</div>
            {headlineStories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
                {headlineStories.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.img} width={58} height={58} style={{ objectFit: 'cover', flexShrink: 0 }} alt="" />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex' }}>
                        {(() => {
                          // Ink-tone chips are invisible on the dark card — promote them to yellow.
                          const chipBg = s.tone === INK ? '#FFD100' : s.tone;
                          const chipText = chipBg === '#FFD100' ? INK : '#fff';
                          return <div style={{ display: 'flex', fontFamily: dFont, fontSize: '17px', letterSpacing: '1px', color: chipText, background: chipBg, padding: '2px 9px' }}>{s.tag}</div>;
                        })()}
                      </div>
                      <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '17px', fontWeight: 600, lineHeight: 1.2, color: '#fff', marginTop: '4px' }}>{trunc(s.title, 68)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
                {topStories.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', fontFamily: dFont, fontSize: '22px', letterSpacing: '1px', color: s.tone === YELLOW ? INK : '#fff', background: s.tone, padding: '6px 12px' }}>{s.tag}</div>
                    <div style={{ display: 'flex', flex: 1, fontFamily: 'sans-serif', fontSize: '22px', fontWeight: 600, lineHeight: 1.25, color: '#fff' }}>{s.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* next-GW teaser banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,80,80,0.16)', borderLeft: `5px solid ${RED}`, padding: '13px 18px', marginTop: '6px' }}>
          <div style={{ display: 'flex', fontFamily: dFont, fontSize: '23px', letterSpacing: '2px', color: RED }}>NEXT UP</div>
          <div style={{ display: 'flex', flex: 1, fontFamily: 'sans-serif', fontSize: '22px', fontWeight: 700, color: '#fff' }}>{teaser}</div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '22px', fontWeight: 700, color: '#fff' }}>fplranker.com</div>
          <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '20px', color: '#9a8e8e' }}>Rank your mini-league free · can you beat me?</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(display ? { fonts: [{ name: 'Bebas Neue', data: display, style: 'normal', weight: 400 }] } : {}),
      headers: { 'Cache-Control': 'public, max-age=600, s-maxage=600' },
    }
  );
}
