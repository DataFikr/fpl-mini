# Draft — Post 1 of 2 (Gameweek batch, GW1 reactive)

- **Beat:** Reactive — fallout from the gameweek just played
- **Primary long-tail phrase:** `FPL gameweek 1 review 2026/27`
- **Secondary:** `who scored the most defcon points in gameweek 1`, `Haaland blank GW1`, `De Cuyper FPL out of position`
- **Competitor gap:** LiveFPL/FPLGameweek hold the ownership + EO data but publish nothing crawlable — this post puts GW1 ownership analysis into an indexable page.
- **Status:** awaiting review. Nothing written to `src/`.

---

```ts
{
  slug: 'fpl-gameweek-1-review-2026-27',
  title: 'FPL Gameweek 1 Review 2026/27: Why Cheap DEFCON Defenders Beat the Template',
  summary:
    'FPL Gameweek 1 of 2026/27 punished the template and rewarded the bargain bin. Haaland, owned by 68% of managers and captained by more than anyone else, returned two points. The gameweek was instead won by Maxim De Cuyper (17), Jack Hinshelwood (16) and two £4.0m Hull City defenders, with defensive contribution points doing much of the heavy lifting. The average score was 50 and the highest was 131.',
  description:
    'FPL Gameweek 1 review 2026/27: Haaland blanked, the template collapsed, and cheap DEFCON defenders won the week. Full data breakdown.',
  date: '2026-08-27',
  category: 'Analysis',
  gameweek: 1,
  kitTeams: ['BHA'],
  sections: [
    {
      heading: 'The Gameweek 1 scoreboard: average 50, highest 131',
      body: [
        'The opening gameweek of 2026/27 finished with an average entry score of 50 and a top score of 131 — an unusually wide spread for a week in which almost everyone owned the same forward. That gap is the story of Gameweek 1: the managers at the top were not the managers who nailed the captain, because nobody nailed the captain.',
        'Erling Haaland (£15.5m) was both the most-selected and the most-captained player in the game, sitting in 68% of squads. Manchester City beat Bournemouth 2-1 and Haaland played all 90 minutes without scoring, returning two points. Doubled, that is four — and 250,816 managers went further and played their Triple Captain chip in Gameweek 1, turning the single most popular pick in Fantasy into six points. A further 814,606 managers burned a Bench Boost on the opening weekend.',
        'The rest of the template followed him down. Bruno Fernandes (£12.0m, 48.6% owned) and Bryan Mbeumo (£8.0m, 36.1%) both took two points as Manchester United lost 2-0 away at newly promoted Hull City. Antoine Semenyo (24.4%), Nico O’Reilly (21.0%) and Antonin Kinsky (22.8%) each managed two. Dominic Calvert-Lewin (28.9%) got one.',
      ],
    },
    {
      heading: 'Who actually won Gameweek 1',
      body: [
        'Every one of the top five scores in Gameweek 1 came from a player owned by fewer than one manager in ten. Four of the five cost £6.0m or less.',
        'Maxim De Cuyper (Brighton, £4.6m, 7.5% owned) top-scored with 17 points in Brighton’s 4-0 win over Aston Villa. He is classified as a defender in Fantasy but was deployed on the left wing, which is how a player who started the season at £4.5m ends up with a goal, an assist, a clean sheet and bonus in the same match. Jack Hinshelwood (Brighton, £6.0m, 2.6%) scored twice from midfield in the same game for 16 points.',
        'Then came Hull City. Beating Manchester United 2-0 handed the promoted side three of the week’s standout returns: Mendy (£4.0m, 3.4% owned) took 15 points, Ajayi (£4.0m, 1.7%) 14, and goalkeeper Tzolakis (£4.5m) 10. Mamadou Sangare (Brentford, £5.6m) added 14 points from two assists as Brentford beat Tottenham 3-0, and Anton Stach (Leeds, £6.0m, 2.2%) took 13 in a 1-0 win at Nottingham Forest.',
        'The one premium who delivered was Cole Palmer (Chelsea, £9.5m, 15.2% owned): a goal and an assist in Chelsea’s 3-2 win at Fulham, and a gameweek-high 60 BPS. If you want to see how those returns moved your own mini-league table rather than the global one, the [mini-league ranker](/) breaks the week down by effective ownership and captaincy.',
      ],
    },
    {
      heading: 'Defensive contributions were the deciding mechanic',
      body: [
        'Defensive contribution points — DEFCON — decided more of Gameweek 1 than goals did. A defender earns two points for reaching 10 combined clearances, blocks, interceptions and tackles in a match; a midfielder or forward needs 12, with ball recoveries also counting. The award is capped at two points per match, and the Premier League confirmed in July 2026 that the mechanic carries into 2026/27 unchanged.',
        'Egan (Hull, £4.0m) racked up 21 defensive contributions, the highest in the gameweek, and finished on eight points. O’Shea (Ipswich, £4.0m) had 18. Richards (Crystal Palace), Armstrong (Everton), Stach (Leeds) and Senesi (Tottenham) all hit 16.',
        'The lesson is not "buy the highest DEFCON score". It is that DEFCON compresses the gap between a £4.0m defender and a £6.0m one. Mendy and Stach both cleared their threshold and both added an attacking return on top — that combination, not the defensive points alone, is what produced 15 and 13. A player who only ever hits the threshold is a reliable four-point floor, which is exactly what you want from a bench-adjacent enabler and exactly not what you want from a starting midfielder.',
      ],
    },
    {
      heading: 'The non-starters that cost managers more than the blanks',
      body: [
        'Three widely owned players recorded zero minutes. Viktor Gyokeres (Arsenal, 7.1% owned) was an unused substitute as Kai Havertz started and scored in a 3-0 win over Coventry. Ollie Watkins (Aston Villa, 8.1%) did not feature. Pedro Porro (Tottenham, 13.6%) did not play.',
        'A blank costs you the difference between two points and a haul. A non-starter costs you the whole slot, and an autosub can only rescue it if your bench played. Both Gyokeres and Watkins have since dropped in price, along with Gabriel Martinelli and Max Dowman.',
        'The transfer market has already reacted: Porro is the most-sold player in the game ahead of Gameweek 2 with roughly 293,000 moves out, followed by Morgan Gibbs-White and Watkins.',
      ],
    },
    {
      heading: 'What this actually changes for your season',
      body: [
        'Less than one bad gameweek feels like it should. Haaland took five shots against Bournemouth; the underlying process was intact and the finish was not. One blank is a weak reason to sell a £15.5m forward in Gameweek 2, and the managers who react hardest to opening-weekend variance tend to spend the next month paying hits to undo it.',
        'What Gameweek 1 does justify is a structural check. If your budget defence is made of £4.5m players who do not take set pieces, do not play advanced and do not hit DEFCON thresholds, they are dead slots — and Gameweek 1 showed there is a tier of £4.0m–£4.6m defenders who are none of those things. That is a squad-shape problem, and it is best fixed with a Wildcard once minutes have settled, not with a -4 in Gameweek 2.',
        'For a gameweek-by-gameweek read on which of your own players are actually earning their slot, the [Rank My Team verdict](/) grades your XI on form, minutes and fixtures rather than on a single week of luck. The follow-up to this post, [FPL Gameweek 2 captain picks and transfer targets](/blog/fpl-gameweek-2-captain-transfer-targets-2026-27), covers what to do with the armband next.',
      ],
    },
  ],
  faq: [
    {
      question: 'What was the average score in FPL Gameweek 1 of 2026/27?',
      answer:
        'The average entry score in Gameweek 1 was 50 points and the highest score was 131. That spread was unusually wide because the most-owned and most-captained player, Erling Haaland, returned only two points, so the top of the table was set by differentials rather than by the captain.',
    },
    {
      question: 'Who was the top FPL scorer in Gameweek 1 2026/27?',
      answer:
        'Maxim De Cuyper of Brighton top-scored with 17 points, from a goal, an assist, a clean sheet and bonus in the 4-0 win over Aston Villa. He is priced as a defender at £4.6m but was deployed on the left wing, and he was owned by only 7.5% of managers.',
    },
    {
      question: 'Who scored the most DEFCON points in Gameweek 1?',
      answer:
        'Egan of Hull City recorded 21 defensive contributions, the most of any player in Gameweek 1, followed by O’Shea of Ipswich on 18. Defenders earn two points for 10 combined clearances, blocks, interceptions and tackles; midfielders and forwards need 12, with ball recoveries included. The award is capped at two points per match.',
    },
    {
      question: 'Should I sell Haaland after his Gameweek 1 blank?',
      answer:
        'Probably not on the basis of one week. Haaland played 90 minutes and took five shots against Bournemouth, so the role and the volume were intact — only the finishing was missing. Selling a £15.5m forward after one blank usually means paying a hit to buy him back, and Manchester City’s fixtures through Gameweek 5 average out at a manageable 2.75 on the official difficulty ratings.',
    },
    {
      question: 'Was it a mistake to play a chip in Gameweek 1?',
      answer:
        'For most of the 250,816 managers who played Triple Captain it was expensive — the overwhelmingly likely target was Haaland, which turned the chip into a six-point return. The 814,606 Bench Boosts were less costly but still early, since bench depth is at its weakest before minutes have settled. Neither chip is recoverable, so the practical response is to plan the remaining ones around a known fixture swing rather than opening-weekend enthusiasm.',
    },
  ],
  mentions: [
    { name: 'Erling Haaland', sameAs: 'https://en.wikipedia.org/wiki/Erling_Haaland' },
    { name: 'Cole Palmer', sameAs: 'https://en.wikipedia.org/wiki/Cole_Palmer' },
    { name: 'Bruno Fernandes', sameAs: 'https://en.wikipedia.org/wiki/Bruno_Fernandes' },
    { name: 'Brighton & Hove Albion F.C.', sameAs: 'https://en.wikipedia.org/wiki/Brighton_%26_Hove_Albion_F.C.' },
    { name: 'Hull City A.F.C.', sameAs: 'https://en.wikipedia.org/wiki/Hull_City_A.F.C.' },
  ],
  sources: [
    'https://fantasy.premierleague.com/api/bootstrap-static/',
    'https://fantasy.premierleague.com/api/event/1/live/',
    'https://www.fantasyfootballscout.co.uk/2026/08/26/two-up-two-down-fpls-first-price-changes-of-2026-27',
    'https://www.premierleague.com/en/news/4361991/whats-new-in-202526-fantasy-defensive-contributions',
    'https://www.premierleague.com/en/news/4689647/who-is-the-best-fpl-captain-for-gameweek-1',
    'https://www.nevermanagealone.com/premier-league-preview/16389/premier-league-gw1-review-7-biggest-takeaways-from-a-stunning-opening-weekend',
    'https://www.fantasyfootballscout.co.uk/2026/08/23/fpl-notes-de-cuyper-hinshelwood-haul-villa-injury-latest',
  ],
}
```

---

## Reviewer notes

- **Every number is from the live FPL API on 2026-08-27**, not from the articles: GW1 live points, ownership, prices, DEFCON counts, chip plays, average and highest score. Ownership figures are *current* (post-GW1) and drift daily — re-check before promoting.
- **First names:** I used full names only where a source spelled them out (De Cuyper, Hinshelwood, Sangare, Stach, Gyokeres, Watkins, Porro, Havertz, Palmer, Haaland, Fernandes, Mbeumo, Semenyo, O'Reilly, Kinsky, Calvert-Lewin, Martinelli, Dowman, Gibbs-White). For Hull/Ipswich/Palace/Everton/Spurs squad players I only had the FPL `web_name`, so they appear surname-only rather than risk a wrong first name — **worth filling in if you want them expanded.**
- `kitTeams: ['BHA']` — Brighton is the club the post centres on. Hull would be the alternative but **HUL is missing from `kitbagPathByShort`** (`src/utils/kitbag-urls.ts`), so it would silently degrade to the base affiliate link.
- Three internal links: mini-league ranker, Rank My Team, and the sibling GW2 post. The first two point at `/` — **swap for the real routes** if those tools live at dedicated paths.
- `category: 'Analysis'` is valid in the `BlogCategory` union and already used by two live posts.
- No `coverImage` — the index shows the category placeholder, per the IP guardrail.
