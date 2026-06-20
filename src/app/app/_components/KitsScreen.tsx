'use client';

import { getKitShirtUrl } from '@/lib/fpl-images';
import { toast } from './Toast';

export interface KitTeam {
  id: number;
  name: string;
  code: number;     // bootstrap team code (for the official kit image)
  href: string;     // Kitbag affiliate deep-link for the club's page
}

export function KitsScreen({ kits }: { kits: KitTeam[] }) {
  return (
    <>
      <div className="scr-head" style={{ marginBottom: 6 }}>
        <div><div className="scr-title">KIT HUB</div><div className="scr-sub">Official 2025/26 club shirts</div></div>
      </div>
      <p className="kit-intro">Back the clubs your players turn out for. Every shirt links straight to the club&rsquo;s page on Kitbag — a slice of each sale supports FPL Ranker, free forever.</p>

      {kits.length === 0 ? (
        <p className="kit-intro">Couldn&rsquo;t load clubs right now — try again shortly.</p>
      ) : (
        <div className="kit-grid">
          {kits.map((k) => (
            <a
              className="kit-card"
              key={k.id}
              href={k.href}
              target="_blank"
              rel="noopener sponsored"
              onClick={() => toast(`Opening ${k.name} on Kitbag`)}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="shot"><img src={getKitShirtUrl(k.code) || ''} alt={`${k.name} 2025/26 home shirt`} /></div>
              <div className="tm">{k.name}</div>
              <div className="ks">Premier League · Home</div>
              <span className="s-btn s-btn--red hex">Shop on Kitbag</span>
            </a>
          ))}
        </div>
      )}

      <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', marginTop: 16 }}>
        Affiliate links · we may earn a commission
      </p>
    </>
  );
}
