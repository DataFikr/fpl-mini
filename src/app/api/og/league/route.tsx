import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { FPLApiService } from '@/services/fpl-api';

export const runtime = 'nodejs'; // FPL service uses node fetch / redis

const INK = '#150000';
const RED = '#FF5050';
const GREEN = '#7CFB9E';

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

  const size = rows.length;
  const focus = rows.find((r) => r.entry === teamId) || rows[0];
  const top = rows.slice(0, 5);
  const display = (await loadDisplayFont()) || undefined;
  const dFont = display ? 'Bebas Neue' : 'sans-serif';

  const Move = ({ mv }: { mv: number }) =>
    mv > 0 ? <span style={{ color: GREEN }}>▲ {mv}</span>
      : mv < 0 ? <span style={{ color: RED }}>▼ {-mv}</span>
        : <span style={{ color: '#9a8e8e' }}>—</span>;

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', background: INK, color: '#fff', padding: '56px 60px', position: 'relative', fontFamily: 'sans-serif' }}>
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
        <div style={{ display: 'flex', fontFamily: dFont, fontSize: '52px', letterSpacing: '1px', marginTop: '26px', color: '#fff' }}>{leagueName.toUpperCase()}</div>

        {/* body */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '48px', marginTop: '8px' }}>
          {/* hero rank */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '480px' }}>
            <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '20px', letterSpacing: '3px', color: RED, fontWeight: 700 }}>YOUR POSITION</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ display: 'flex', fontFamily: dFont, fontSize: '150px', lineHeight: 1, color: RED }}>{focus ? ordinal(focus.rank) : '—'}</div>
              <div style={{ display: 'flex', fontFamily: dFont, fontSize: '40px', color: '#cfc6c6', marginBottom: '20px' }}>of {size}</div>
            </div>
            <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '30px', fontWeight: 800, marginTop: '6px' }}>{focus ? focus.team : ''}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'sans-serif', fontSize: '24px', color: '#cfc6c6', marginTop: '10px' }}>
              <span style={{ display: 'flex' }}>{focus ? `${focus.total.toLocaleString()} pts` : ''}</span>
              {focus ? <span style={{ display: 'flex' }}><Move mv={focus.move} /></span> : null}
            </div>
          </div>

          {/* top 5 */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'rgba(255,255,255,0.05)', padding: '20px 22px' }}>
            {top.map((r) => {
              const me = focus && r.entry === focus.entry;
              return (
                <div key={r.entry} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 12px', background: me ? RED : 'transparent', color: me ? '#fff' : '#e6dcdc' }}>
                  <div style={{ display: 'flex', fontFamily: dFont, fontSize: '30px', width: '46px', color: me ? '#fff' : RED }}>{r.rank}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '22px', fontWeight: 800 }}>{r.team}</div>
                    <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '15px', opacity: 0.7 }}>{r.mgr}</div>
                  </div>
                  <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: '22px', fontWeight: 700 }}>{r.total.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: '18px' }}>
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
