'use client';

import { useRouter } from 'next/navigation';
import { BLOG, article as findArticle } from '../_lib/screen-data';
import { toast } from './Toast';

export function ArticleScreen({ id }: { id: string }) {
  const router = useRouter();
  const a = findArticle(id);
  const related = BLOG.filter((x) => x.id !== a.id && x.cat === a.cat).slice(0, 2);
  const rel = related.length ? related : BLOG.filter((x) => x.id !== a.id).slice(0, 2);

  return (
    <>
      <div className="art-hero">
        <div className="ph ph--dark"><span>{a.cat.toLowerCase()} · cover</span></div><div className="grad" />
        <span className="tag tab-cut" style={{ paddingRight: 18, background: a.tone, ...(a.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{a.tag}</span>
        <h2>{a.title}</h2>
      </div>
      <div className="art-byline">
        <span className="av">{a.init}</span><span>{a.author}</span>
        <span className="dot-sep">•</span><span>{a.date}</span><span className="dot-sep">•</span><span>{a.read} read</span>
      </div>
      <div className="art-body">
        {a.body.map((b, i) => (typeof b === 'string' ? <p key={i}>{b}</p> : <blockquote className="art-quote" key={i}>{b.q}</blockquote>))}
      </div>
      <button className="s-btn s-btn--ghost hex art-share" onClick={() => toast('Article link copied')}>Share this story</button>

      <div className="lbl-row" style={{ marginTop: 22 }}><span className="l">MORE LIKE THIS</span></div>
      <div className="hl-list">
        {rel.map((x) => (
          <div className="hl-item blog-item" key={x.id} onClick={() => router.push(`/app/blog/${x.id}`)}>
            <div>
              <span className="tag tab-cut" style={{ paddingRight: 16, background: x.tone, ...(x.tone === '#FFD100' ? { color: '#150000' } : {}) }}>{x.tag}</span>
              <h5>{x.title}</h5>
              <div className="blog-by">{x.author} · {x.read}</div>
            </div>
            <div className="ph"><span>shot</span></div>
          </div>
        ))}
      </div>
    </>
  );
}
