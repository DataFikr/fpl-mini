'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQS: { q: string; a: React.ReactNode }[] = [
  { q: 'How do I find my FPL team ID?', a: <>Your team ID is the number in your Fantasy Premier League team URL (<code>fantasy.premierleague.com/entry/<b>1234567</b>/…</code>). The <Link href="/app/find-team-id">Find Team ID</Link> guide walks you through it step by step.</> },
  { q: 'What can I do with FPL Ranker?', a: 'Enter your team ID to see your live squad and gameweek points, a Rank My Team verdict, your mini-league standings with ESPN-style headlines and rank analytics, plus tools like the World Cup fatigue tracker and the Kit Hub.' },
  { q: 'Is FPL Ranker free?', a: 'Yes — free forever. We may earn a small commission from official kit links, which keeps the tools free for everyone.' },
  { q: 'How is the Rank My Team verdict calculated?', a: 'It grades your XI on the full 2025/26 season using each player’s points-per-game, form and minutes, then projects upcoming gameweeks from form × fixture difficulty × minutes certainty.' },
  { q: 'Which leagues can I track?', a: 'Any classic FPL mini-league you’re in. Enter your team ID and open the Leagues tab to see them all with your rank and weekly movement.' },
  { q: 'Is this affiliated with the Premier League or FPL?', a: 'No. FPL Ranker is an independent tool and is not affiliated with or endorsed by the Premier League or Fantasy Premier League.' },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-wrap">
      {FAQS.map((f, i) => (
        <div className={`faq-item ${open === i ? 'open' : ''}`} key={i}>
          <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
            {f.q}<span className="ic">{open === i ? '–' : '+'}</span>
          </div>
          {open === i && <div className="faq-a">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
