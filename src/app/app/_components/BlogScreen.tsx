'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBlogIndex } from '@/content/blog-index';

// Category → tag-chip colour (falls back to the app accent).
const CAT_TONE: Record<string, string> = {
  Strategy: '#12233F',
  Transfers: '#0B7A3B',
  Tips: '#7A1FA2',
  'Line-ups': '#B4530A',
  Analysis: '#12233F',
  News: '#8A0F2A',
};

const POSTS = getBlogIndex();
const CATS = ['All', ...Array.from(new Set(POSTS.map((p) => p.category)))];

export function BlogScreen() {
  const router = useRouter();
  const [cat, setCat] = useState('All');

  const list = cat === 'All' ? POSTS : POSTS.filter((p) => p.category === cat);
  const feat = cat === 'All' ? list[0] : null; // newest post as the cover
  const rest = feat ? list.slice(1) : list;
  const open = (t: { appHref: string }) => router.push(t.appHref);
  const tone = (c: string) => CAT_TONE[c] ?? '#12233F';

  return (
    <>
      <div className="scr-head" style={{ marginBottom: 12 }}>
        <div><div className="scr-title">BLOG</div><div className="scr-sub">FPL Ranker editorial · {POSTS.length} reads</div></div>
      </div>
      <div className="chip-row blog-chips">
        {CATS.map((c) => <span key={c} className={`chip ${c === cat ? 'is-active' : ''}`} onClick={() => setCat(c)}>{c}</span>)}
      </div>

      {feat && (
        <div className="hl-hero blog-feat" onClick={() => open(feat)}>
          <div className="ph ph--dark">
            {feat.image
              ? <img src={feat.image} alt={feat.imageAlt} loading="eager" />
              : <span>{feat.category.toLowerCase()} · cover</span>}
          </div><div className="grad" />
          <div className="ct">
            <span className="tag tab-cut" style={{ paddingRight: 18, background: tone(feat.category) }}>{feat.category.toUpperCase()}</span>
            <h3>{feat.title}</h3>
            <div className="blog-feat-by">{feat.date}</div>
          </div>
        </div>
      )}

      <div className="hl-list">
        {rest.map((a) => (
          <div className="hl-item blog-item" key={a.appHref} onClick={() => open(a)}>
            <div>
              <span className="tag tab-cut" style={{ paddingRight: 16, background: tone(a.category) }}>{a.category.toUpperCase()}</span>
              <h5>{a.title}</h5>
              <div className="blog-by">{a.date}</div>
            </div>
            <div className="ph">
              {a.image ? <img src={a.image} alt={a.imageAlt} loading="lazy" /> : <span>shot</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
