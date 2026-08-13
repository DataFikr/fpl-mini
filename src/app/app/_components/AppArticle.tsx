'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPost } from '@/content/blog-posts';
import { getBlogIndex, formatPostDate } from '@/content/blog-index';
import { LineupPitch } from '@/components/blog/lineup-pitch';
import { FatigueScreen } from './FatigueScreen';
import { AffiliateLink } from '@/components/ui/affiliate-link';
import { getKitbagUrlByShort } from '@/utils/kitbag-urls';
import { toast } from './Toast';

// Category → tag-chip colour, matching the in-app blog list.
const CAT_TONE: Record<string, string> = {
  Strategy: '#12233F',
  Transfers: '#0B7A3B',
  Tips: '#7A1FA2',
  'Line-ups': '#B4530A',
  Analysis: '#12233F',
  News: '#8A0F2A',
};

export function AppArticle({ slug }: { slug: string }) {
  const router = useRouter();
  const post = getPost(slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!post) {
    return (
      <div className="art-body" style={{ paddingTop: 24 }}>
        <p>Sorry, we couldn&rsquo;t find that article. <a onClick={() => router.push('/app/blog')} style={{ color: 'var(--red)', fontWeight: 700, cursor: 'pointer' }}>Back to the blog</a>.</p>
      </div>
    );
  }

  const tone = CAT_TONE[post.category] ?? '#12233F';
  const dateDisplay = formatPostDate(post.date);
  const related = getBlogIndex().filter((t) => t.slug !== post.slug).slice(0, 2);

  return (
    <>
      {/* Hero */}
      <div className="art-hero">
        <div className="ph ph--dark">
          {post.coverImage
            ? <img src={post.coverImage} alt={post.coverAlt || post.title} loading="eager" />
            : <span>{post.category.toLowerCase()} · cover</span>}
        </div><div className="grad" />
        <span className="tag tab-cut" style={{ paddingRight: 18, background: tone }}>{post.category.toUpperCase()}</span>
        <h2>{post.title}</h2>
      </div>

      {/* Byline */}
      <div className="art-byline">
        <span className="av">FR</span><span>FPL Ranker</span>
        <span className="dot-sep">•</span><span>{dateDisplay}</span>
      </div>

      {/* Body */}
      <div className="art-body">
        {/* AI-extraction summary as the lead */}
        <p className="art-lead">{post.summary}</p>

        {post.sections.map((s, i) => (
          <section key={i}>
            <h3>{s.heading}</h3>
            {s.body.map((para, j) => <p key={j}>{para}</p>)}
          </section>
        ))}
      </div>

      {/* Interactive block — a post that is genuinely a tool, not prose */}
      {post.embed === 'wc-fatigue' && (
        <div className="art-embed">
          <div className="lbl-row"><span className="l">THE TRACKER</span><span className="live"><span className="dot" />Full-time</span></div>
          <FatigueScreen embedded />
        </div>
      )}

      {/* Suggested line-ups on a pitch */}
      {post.lineups && post.lineups.length > 0 && (
        <div className="art-lineups">
          {post.lineups.map((l, i) => <LineupPitch key={i} lineup={l} />)}
        </div>
      )}

      {/* Ranked lists (e.g. Top 5) with outbound links */}
      {post.lists?.map((list, li) => (
        <div className="art-list" key={li}>
          <div className="lbl-row"><span className="l">{list.heading}</span></div>
          {list.intro && <p className="art-list-intro">{list.intro}</p>}
          <ol>
            {list.items.map((item, ii) => (
              <li key={ii}>
                <span className="rank">{ii + 1}</span>
                <div>
                  {item.url
                    ? <a href={item.url} target="_blank" rel="noopener">{item.name} ↗</a>
                    : <span className="nm">{item.name}</span>}
                  <p>{item.blurb}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}

      {/* Contextual Kitbag CTA */}
      {post.kitTeams && post.kitTeams.length > 0 && (
        <div className="art-kit">
          <div className="art-kit-lbl">Back your club — shop the official 2026/27 kit</div>
          <div className="art-kit-btns">
            {post.kitTeams.map((team) => (
              <AffiliateLink
                key={team}
                href={getKitbagUrlByShort(team)}
                placement={`app-blog-${post.slug}`}
                item={team}
                className="s-btn s-btn--red hex"
                onClick={() => toast(`Opening ${team} on Kitbag`)}
              >
                Shop {team} on Kitbag
              </AffiliateLink>
            ))}
          </div>
          <div className="art-kit-disc">Affiliate links · a commission is earned on purchases.</div>
        </div>
      )}

      {/* FAQ */}
      {post.faq.length > 0 && (
        <div className="art-faq">
          <div className="lbl-row"><span className="l">FAQ</span></div>
          <div className="faq-wrap">
            {post.faq.map((f, i) => (
              <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.question}<span className="ic">{openFaq === i ? '–' : '+'}</span>
                </div>
                {openFaq === i && <div className="faq-a">{f.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="s-btn s-btn--ghost hex art-share" onClick={() => toast('Article link copied')}>Share this story</button>

      {/* More like this */}
      {related.length > 0 && (
        <>
          <div className="lbl-row" style={{ marginTop: 22 }}><span className="l">MORE LIKE THIS</span></div>
          <div className="hl-list">
            {related.map((x) => (
              <div className="hl-item blog-item" key={x.appHref} onClick={() => router.push(x.appHref)}>
                <div>
                  <span className="tag tab-cut" style={{ paddingRight: 16, background: CAT_TONE[x.category] ?? '#12233F' }}>{x.category.toUpperCase()}</span>
                  <h5>{x.title}</h5>
                  <div className="blog-by">{x.date}</div>
                </div>
                <div className="ph">
                  {x.image ? <img src={x.image} alt={x.imageAlt} loading="lazy" /> : <span>shot</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
