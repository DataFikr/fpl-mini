'use client';

import { useState } from 'react';
import { Share2, Link2, Download, Check } from 'lucide-react';
import { FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import { trackEvent } from '@/lib/analytics';
import { toast } from './Toast';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface Props {
  leagueId: number;
  leagueName: string;
  teamId?: number | null;
  rank?: number;
  size?: number;
}

export function ShareLeagueButton({ leagueId, leagueName, teamId, rank, size }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const qs = teamId ? `?teamId=${teamId}` : '';
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/app/league/${leagueId}${qs}` : '';
  const ogUrl = `/api/og/league?id=${leagueId}${teamId ? `&teamId=${teamId}` : ''}`;
  const text = rank && size
    ? `I'm ${ordinal(rank)} of ${size} in ${leagueName} on FPL Ranker 👀 can you beat me?`
    : `${leagueName} on FPL Ranker — track your mini-league free 👀`;

  const track = (method: string) => trackEvent('share_league', { league_id: String(leagueId), method });

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: leagueName, text, url: shareUrl }); track('native'); setOpen(false); }
      catch { /* cancelled */ }
    }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch { /* ignore */ }
    setCopied(true); track('copy'); toast('Link copied');
    setTimeout(() => { setCopied(false); setOpen(false); }, 1400);
  };
  const whatsapp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`, '_blank'); track('whatsapp'); setOpen(false); };
  const x = () => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank'); track('x'); setOpen(false); };
  const saveCard = () => { window.open(ogUrl, '_blank'); track('save_image'); setOpen(false); };

  const canNative = typeof navigator !== 'undefined' && !!(navigator as any).share;

  return (
    <>
      <button className="share-btn" onClick={() => setOpen(true)} aria-label="Share league">
        <Share2 size={15} /><span>Share</span>
      </button>

      {open && (
        <>
          <div className="share-backdrop" onClick={() => setOpen(false)} />
          <div className="share-sheet" role="dialog" aria-modal="true">
            <div className="ss-head"><span>Share {leagueName}</span><button className="ss-x" aria-label="Close" onClick={() => setOpen(false)}>✕</button></div>
            <div className="ss-grid">
              {canNative && (
                <button className="ss-opt" onClick={nativeShare}><span className="ss-ic" style={{ background: 'var(--ink)' }}><Share2 size={18} /></span>Share</button>
              )}
              <button className="ss-opt" onClick={whatsapp}><span className="ss-ic" style={{ background: '#25D366' }}><FaWhatsapp size={18} /></span>WhatsApp</button>
              <button className="ss-opt" onClick={x}><span className="ss-ic" style={{ background: '#000' }}><FaXTwitter size={16} /></span>Post on X</button>
              <button className="ss-opt" onClick={copy}><span className="ss-ic" style={{ background: 'var(--navy)' }}>{copied ? <Check size={18} /> : <Link2 size={18} />}</span>{copied ? 'Copied' : 'Copy link'}</button>
              <button className="ss-opt" onClick={saveCard}><span className="ss-ic" style={{ background: 'var(--red)' }}><Download size={18} /></span>Save card</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
