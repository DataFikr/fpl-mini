'use client';

import { getPlayerPhotoUrl } from '@/lib/fpl-images';
import { getKitbagUrlByShort } from '@/utils/kitbag-urls';
import type { PitchPlayer } from '../_lib/squad-data';
import { toast } from './Toast';

const POS: Record<number, string> = { 1: 'Goalkeeper', 2: 'Defender', 3: 'Midfielder', 4: 'Forward' };

export function PlayerCard({ player, onClose }: { player: PitchPlayer; onClose: () => void }) {
  const photo = getPlayerPhotoUrl(player.code);
  const gwPts = player.points * (player.multiplier || 1);
  const stats: [string | number, string][] = [
    [`£${player.price.toFixed(1)}`, 'Price'],
    [player.totalPoints, 'Total pts'],
    [player.ppg.toFixed(1), 'Pts / game'],
    [player.form.toFixed(1), 'Form'],
    [`${player.ownership.toFixed(1)}%`, 'Owned'],
    [gwPts, 'This GW'],
  ];

  return (
    <>
      <div className="pcard-backdrop" onClick={onClose} />
      <div className="pcard" role="dialog" aria-modal="true">
        <div className="pc-top">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pc-photo" src={photo} alt={player.name} onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
          ) : (
            <div className="pc-photo" style={{ display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', color: '#fff' }}>{player.teamShort}</div>
          )}
          <div>
            <div className="pc-name">{player.name}</div>
            <div className="pc-meta">{player.team} · {POS[player.pos]}</div>
            {player.isCaptain && <span className="pc-cap">CAPTAIN</span>}
            {player.isVice && !player.isCaptain && <span className="pc-cap" style={{ background: '#cfd8e3' }}>VICE</span>}
          </div>
          <button className="pc-x" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="pc-stats">
          {stats.map(([v, l]) => <div className="pc-stat" key={l}><div className="v">{v}</div><div className="l">{l}</div></div>)}
        </div>

        <div className="pc-foot">
          <a
            className="s-btn s-btn--red hex"
            href={getKitbagUrlByShort(player.teamShort)}
            target="_blank"
            rel="noopener sponsored"
            onClick={() => toast(`Opening ${player.team} on Kitbag`)}
            style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
          >
            Shop {player.teamShort} kit
          </a>
        </div>
      </div>
    </>
  );
}
