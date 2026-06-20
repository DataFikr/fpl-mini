'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BLOG, BLOG_CATS } from '../_lib/screen-data';

export function BlogScreen() {
  const router = useRouter();
  const [cat, setCat] = useState('All');

  const list = cat === 'All' ? BLOG : BLOG.filter((a) => a.cat === cat);
  const feat = cat === 'All' ? BLOG.find((a) => a.feat) : null;
  const rest = feat ? list.filter((a) => a.id !== feat.id) : list;
  const open = (id: string) => router.push(`/app/blog/${id}`);

  return (
    <>
      <div className="scr-head" style={{ marginBottom: 12 }}>
        <div><div className="scr-title">BLOG</div><div className="scr-sub">FPL Ranker editorial · {BLOG.length} reads</div></div>
      </div>
      <div className="chip-row blog-chips">
        {BLOG_CATS.map((c) => <span key={c} className={`chip ${c === cat ? 'is-active' : ''}`} onClick={() => setCat(c)}>{c}</span>)}
      </div>

      {feat && (
        <div className="hl-hero blog-feat" onClick={() => open(feat.id)}>
          <div className="ph ph--dark"><span>{feat.cat.toLowerCase()} · cover</span></div><div className="grad" />
          <div className="ct">
            <span className="tag tab-cut" style={{ paddingRight: 18, background: feat.tone, ...(feat.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{feat.tag}</span>
            <h3>{feat.title}</h3>
            <div className="blog-feat-by">{feat.author} · {feat.date} · {feat.read} read</div>
          </div>
        </div>
      )}

      <div className="hl-list">
        {rest.map((a) => (
          <div className="hl-item blog-item" key={a.id} onClick={() => open(a.id)}>
            <div>
              <span className="tag tab-cut" style={{ paddingRight: 16, background: a.tone, ...(a.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{a.tag}</span>
              <h5>{a.title}</h5>
              <div className="blog-by">{a.author} · {a.date} · {a.read}</div>
            </div>
            <div className="ph"><span>shot</span></div>
          </div>
        ))}
      </div>
    </>
  );
}
