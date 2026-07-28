'use client';

import { useRouter } from 'next/navigation';
import { DEMO_LEAGUE } from '../_lib/screen-data';

const tile = (router: ReturnType<typeof useRouter>, href: string, h4: string, p: string, icon: React.ReactNode, live?: boolean) => (
  <div className="tool-tile" style={{ background: '#fff', borderColor: 'var(--line)' }} onClick={() => router.push(href)}>
    {live && <span className="live-pin" />}
    <div className="ti">{icon}</div>
    <div><h4 style={{ color: 'var(--ink)' }}>{h4}</h4><p>{p}</p></div>
  </div>
);

export function HomeScreen() {
  const router = useRouter();
  const I = (d: React.ReactNode) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

  return (
    <>
      <div className="hub-hello"><div className="hi">Welcome back</div><h2>YOUR MINI-LEAGUE</h2></div>

      <a className="hub-spot" onClick={() => router.push(`/app/league/${DEMO_LEAGUE}`)}>
        <div className="red-slab" />
        <div className="lbl">Your top league</div>
        <div className="lg">Best Man League</div>
        <div className="rk">Open the live table · <span style={{ color: '#7CFB9E' }}>standings, headlines &amp; analytics</span></div>
      </a>

      <div className="hub-lbl"><span className="l">JUMP BACK IN</span></div>
      <div className="tool-grid">
        {tile(router, '/app/squad', 'MY SQUAD', 'XI, form & verdict', I(<><path d="M8 3l4 2 4-2 4 4-3 2v12H7V9L4 7z" /></>))}
        {tile(router, '/app/leagues', 'MY LEAGUES', 'Standings & rivals', I(<><path d="M6 4h12v3a6 6 0 0 1-12 0z" /><path d="M6 5H4v1a3 3 0 0 0 2 2.8M18 5h2v1a3 3 0 0 1-2 2.8" /><path d="M9 19h6M10 13.5V16a2 2 0 0 1-1 2M14 13.5V16a2 2 0 0 0 1 2" /></>))}
        {tile(router, '/app/blog', 'BLOG', 'Tips & analysis', I(<><path d="M5 3h11l3 3v15H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></>))}
      </div>

      <div className="hub-lbl"><span className="l">THIS WEEK</span><span className="more" onClick={() => router.push(`/app/league/${DEMO_LEAGUE}`)}>All headlines ›</span></div>
      <div className="hl-hero" onClick={() => router.push(`/app/league/${DEMO_LEAGUE}`)}>
        <div className="ph" style={{ background: 'linear-gradient(135deg, #FF505033, transparent)' }} /><div className="grad" />
        <div className="ct"><span className="tag tab-cut" style={{ paddingRight: 18, background: '#FF5050' }}>THIS GW · TOP STORY</span><h3>OPEN YOUR LEAGUE FOR THE LATEST HEADLINES</h3></div>
      </div>
    </>
  );
}
