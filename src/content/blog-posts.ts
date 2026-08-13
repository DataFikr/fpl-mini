/**
 * Data-driven public blog registry.
 *
 * Every post is a single object in BLOG_POSTS, rendered by the shared route
 * `src/app/app/blog/[id]/page.tsx` via `AppArticle` in the Sportify theme, so
 * adding a post never touches JSX.
 *
 * The three formerly bespoke posts (world-cup-fatigue, fdr-tools,
 * beyond-the-points) were migrated in on 2026-08-09 with their original publish
 * dates preserved. Their old `/blog/*` routes are gone and 308-redirect here.
 */

/** One <h2> section: a heading followed by one or more paragraphs. */
export interface BlogSection {
  heading: string;
  body: string[];
}

/** A question/answer pair — rendered as a visible accordion AND FAQPage schema. */
export interface BlogFaq {
  question: string;
  answer: string;
}

/** One entry in a ranked list (e.g. a "Top 5 tools" listicle). */
export interface BlogListItem {
  name: string;
  /** Outbound link — opens in a new tab as an editorial (dofollow) link. */
  url?: string;
  blurb: string;
}

/**
 * A ranked list block. Powers the recurring monthly "Top 5" competitor/tools
 * listicles whose outbound links are the point (backlink-earning content).
 */
export interface BlogList {
  heading: string;
  intro?: string;
  /** Ordered (numbered) by default; set false for an unordered list. */
  ordered?: boolean;
  items: BlogListItem[];
}

/** One player in a suggested line-up. `team` is an FPL short_name (e.g. "ARS"). */
export interface LineupPlayer {
  name: string;
  team: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  isCaptain?: boolean;
}

/**
 * A suggested Gameweek XI from a named source, rendered on a pitch with
 * copyright-clean generic jerseys. `sourceUrl` links out to the original pick.
 */
export interface BlogLineup {
  source: string;
  sourceUrl: string;
  formation?: string;
  note?: string;
  players: LineupPlayer[];
}

export type BlogCategory =
  | 'Transfers'
  | 'Tips'
  | 'Line-ups'
  | 'Injuries'
  | 'Strategy'
  | 'Analysis'
  | 'News';

/**
 * An interactive block a post can embed between its prose and its FAQ.
 * Used where a post is genuinely a tool rather than an article — the World Cup
 * fatigue tracker is the live minutes table, not a description of one.
 */
export type BlogEmbed = 'wc-fatigue';

export interface BlogPost {
  /** URL segment: /blog/<slug>. Kebab-case, unique. */
  slug: string;
  /** <title> + <h1>. Lead with the primary long-tail keyword. */
  title: string;
  /** 50–80 word answer paragraph rendered directly under the H1 (AI-extraction target). */
  summary: string;
  /** Meta description (~150 chars). */
  description: string;
  /** ISO date published, e.g. "2026-08-01". */
  date: string;
  /** ISO date last modified (optional; defaults to `date`). */
  updated?: string;
  category: BlogCategory;
  /** Optional cover under /public/images/blog/*. */
  coverImage?: string;
  coverAlt?: string;
  /** Body sections (each an <h2> + paragraphs). */
  sections: BlogSection[];
  /** 3–5 FAQ pairs. Answers stay in the DOM for answer engines. */
  faq: BlogFaq[];
  /** Optional suggested line-ups, each rendered on a pitch (e.g. GW1 draft posts). */
  lineups?: BlogLineup[];
  /** Optional ranked lists (e.g. monthly "Top 5 tools" listicles with outbound links). */
  lists?: BlogList[];
  /** Optional interactive block rendered after the prose (see `BlogEmbed`). */
  embed?: BlogEmbed;
  /** Team short_names (e.g. ["ARS","LIV"]) → contextual Kitbag CTA. */
  kitTeams?: string[];
  /** Players/clubs referenced → schema.org `mentions`. */
  mentions?: { name: string; sameAs: string }[];
  /** Provenance for gameweek batches. */
  gameweek?: number;
  /** Research source URLs (not rendered; kept for provenance). */
  sources?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-rank-your-fpl-mini-league',
    title: 'How to Rank Your FPL Mini-League and Win the Bragging Rights',
    summary:
      'To rank your FPL mini-league on FPL Ranker, enter any manager’s team ID to load live standings, gameweek points and rank movement. You get ESPN-style headlines, effective ownership, captaincy and chip tracking, plus a Rank My Team verdict — everything you need to see who is really winning your mini-league and why, updated with official Fantasy data every gameweek.',
    description:
      'Enter your FPL team ID to rank your mini-league with live standings, headlines, rank movement and a Rank My Team verdict. Free forever.',
    date: '2026-07-20',
    category: 'Strategy',
    coverImage: '/images/blog/how-to-rank-your-fpl-mini-league.webp',
    coverAlt: 'Empty podium lit in red — ranking a mini-league',
    sections: [
      {
        heading: 'What you need to rank your mini-league',
        body: [
          'All you need is a Fantasy Premier League team ID — the number in your team URL at fantasy.premierleague.com/entry/1234567. Enter it once and FPL Ranker pulls your live squad, your gameweek points and every classic mini-league you belong to.',
          'There is no login and nothing to install. The tools are free forever; a small commission from official kit links keeps them that way.',
        ],
      },
      {
        heading: 'Reading the standings like an analyst',
        body: [
          'The standings table goes beyond rank and total points. Rank movement shows who climbed and who fell this gameweek, effective ownership reveals which popular picks actually moved the table, and captaincy tracking shows where the big hauls came from.',
          'ESPN-style headlines turn the raw numbers into a story — the manager who nailed the captain, the bench disaster, the differential that swung the week.',
        ],
      },
      {
        heading: 'Using the Rank My Team verdict',
        body: [
          'The Rank My Team verdict grades your XI on the season using points-per-game, form and minutes, then projects upcoming gameweeks from form, fixture difficulty and minutes certainty. Use it to decide who to bench, who to captain and when to spend a transfer.',
        ],
      },
    ],
    faq: [
      {
        question: 'How do I find my FPL team ID?',
        answer:
          'Your team ID is the number in your Fantasy Premier League team URL: fantasy.premierleague.com/entry/1234567/. The Find Team ID guide walks you through it step by step.',
      },
      {
        question: 'Is FPL Ranker free?',
        answer:
          'Yes — FPL Ranker is free forever. A small commission from official kit links keeps the tools free for everyone.',
      },
      {
        question: 'Is FPL Ranker affiliated with the Premier League or FPL?',
        answer:
          'No. FPL Ranker is an independent tool and is not affiliated with or endorsed by the Premier League or Fantasy Premier League.',
      },
    ],
    mentions: [
      {
        name: 'Fantasy Premier League',
        sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League',
      },
    ],
  },

  // ─── Preseason 2026/27 batch (fpl-blog skill, 2026-07-26) ───────────────

  {
    slug: 'gw1-template-without-world-cup-players',
    title: 'FPL GW1 Template & World Cup Fatigue Guide 2026/27',
    summary:
      'The best FPL GW1 template for 2026/27 balances the near-essential premiums against World Cup fatigue. Haaland (≈71% owned) remains the default captain and forward, but managers who went deep into the summer tournament face a compressed pre-season and rotation risk. Build around fresh, nailed assets, exploit Manchester United’s soft opening fixtures, use £4.0m promoted-team defenders as enablers, and hold your Wildcard until GW2–GW4 once minutes settle.',
    description:
      'The FPL 2026/27 GW1 template and World Cup fatigue guide — most-owned picks, who to fade, captaincy and the smart Wildcard window.',
    date: '2026-07-26',
    category: 'Strategy',
    coverImage: '/images/blog/gw1-template-without-world-cup-players.webp',
    coverAlt: 'Identical template figures with one player showing World Cup fatigue',
    sections: [
      {
        heading: 'The GW1 template: who’s essential in 2026/27',
        body: [
          'Early ownership points to a clear premium core: Erling Haaland (≈71%), Bruno Fernandes (≈46%), João Pedro (≈46%), Dominik Szoboszlai (≈38%) and Morgan Rogers (≈37%) are the five most-owned players.',
          'Haaland is the one near-mandatory pick — his ownership sits more than 25 percentage points clear of anyone else, so leaving him out is a genuine rank gamble in GW1.',
          'Managers currently agree far more on the premium attackers than on goalkeepers and defenders, so the cheap end of your squad is where you can find an edge.',
        ],
      },
      {
        heading: 'World Cup fatigue: who to fade',
        body: [
          'The 2026 World Cup final was played only weeks before kickoff, and players involved in the latter stages got roughly three weeks away from club football — so late returners carry real rotation risk in GW1.',
          'Even Haaland is not risk-free: Norway’s run to the quarter-finals means his pre-season is compressed, so watch Manchester City’s team news before committing the armband.',
          'The flip side is fresh legs: England left Cole Palmer and Phil Foden at home, so both come into the season with a full pre-season behind them.',
        ],
      },
      {
        heading: 'Turn fatigue into a GW1 edge',
        body: [
          'Spend up where minutes are certain and save where they are not. Exploit soft opening fixtures — Manchester United open against promoted Hull and Ipswich, which is why Bruno Fernandes and Matheus Cunha appear in so many early drafts.',
          'Use £4.0m promoted-team defenders (all Coventry, Hull and Ipswich defenders are priced at £4.0m) as enablers so the money flows to nailed premium attackers.',
          'Do not chase a fatigued £12m+ midfielder you will captain nervously — a fresh, nailed mid-priced attacker with a full pre-season is often the better GW1 points source.',
        ],
      },
      {
        heading: 'When to Wildcard after the World Cup',
        body: [
          'The community splits between GW2, GW3 and GW4, with GW3 the popular pick. Waiting lets you see who is actually rotated before you spend the chip.',
          'Practical rule: draft a GW1 team you would happily run for three weeks, then Wildcard around GW3 once rotation patterns and early price rises reveal the true template. Avoid Wildcarding in GW1 — you would be spending your most powerful chip on incomplete information.',
        ],
      },
    ],
    faq: [
      {
        question: 'What is the best FPL GW1 template for 2026/27?',
        answer:
          'A premium core of Haaland plus two of Bruno Fernandes, João Pedro, Szoboszlai and Morgan Rogers, funded by £4.0m promoted-team defenders and mid-priced nailed attackers. Haaland is the one near-essential pick; the defence is where managers disagree and you can find an edge.',
      },
      {
        question: 'Is it worth going without Haaland in GW1?',
        answer:
          'It is risky. Haaland is ≈71% owned — more than 25 points clear of anyone else — so if he hauls and you do not own him, you drop percentile rank fast. The one caveat is Norway’s deep World Cup run, so check Man City team news for rotation before the deadline.',
      },
      {
        question: 'Which players should I avoid in GW1 2026/27?',
        answer:
          'Watch late World Cup returners with rotation risk (Spain, Argentina and England players who reached the final weekend). Cole Palmer, by contrast, was left out of England’s squad, so fatigue is not the concern with him — his question is form under new management.',
      },
      {
        question: 'When should I use my Wildcard after the World Cup?',
        answer:
          'Most managers target GW2–GW4, with GW3 the popular choice. Draft a GW1 side you can hold for three weeks, then Wildcard once rotation and fitness patterns are clear. Do not burn it in GW1 on incomplete information.',
      },
    ],
    mentions: [
      { name: 'Fantasy Premier League', sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League' },
      { name: '2026 FIFA World Cup', sameAs: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup' },
      { name: 'Erling Haaland', sameAs: 'https://en.wikipedia.org/wiki/Erling_Haaland' },
      { name: 'Bruno Fernandes', sameAs: 'https://en.wikipedia.org/wiki/Bruno_Fernandes' },
    ],
  },

  {
    slug: 'best-new-signings-fpl-2026-27',
    title: 'Best New Signings to Buy in FPL 2026/27',
    summary:
      'The best new signings to buy in FPL 2026/27 are led by Morgan Rogers, whose club-record £118.7m move from Aston Villa to Chelsea already makes him a top-five owned midfielder. Elliot Anderson’s British-record switch to Manchester City is the standout budget-midfield enabler, while Chelsea’s attacking arrivals offer differentials. Judge every signing on nailed minutes and role, not transfer fee — reputation prices don’t guarantee FPL points.',
    description:
      'The best new signings to buy in FPL 2026/27 — Morgan Rogers, Elliot Anderson and the Chelsea arrivals, ranked on minutes, role and value.',
    date: '2026-07-26',
    category: 'Transfers',
    coverImage: '/images/blog/best-new-signings-fpl-2026-27.webp',
    coverAlt: 'Kit bag and boots in a tunnel lit by green light — new signings arriving',
    kitTeams: ['CHE'],
    sections: [
      {
        heading: 'Morgan Rogers — the new signing who’s already template',
        body: [
          'Rogers completed a club-record £118.7m move from Aston Villa to Chelsea, the biggest known fee of the window, and has already climbed to roughly 37% ownership — a top-five most-owned player before a ball is kicked.',
          'The FPL appeal is role: an attacking midfielder stepping into a Chelsea side alongside João Pedro, with the goal-and-assist profile that scores in FPL. If his price and minutes hold up, he is a genuine mid-price template pick rather than a reputation punt.',
        ],
      },
      {
        heading: 'Elliot Anderson — the budget-midfield enabler',
        body: [
          'Anderson moved from Nottingham Forest to Manchester City for a reported €135m, a British-record fee — but the FPL angle is his likely budget price tag, seen around £5.5m in early drafts.',
          'A nailed City midfielder at that price is an ideal enabler: it frees funds for Haaland while banking minutes and the odd attacking return. Watch his role under rotation — City’s depth means his security of starts is the key question.',
        ],
      },
      {
        heading: 'Chelsea’s attacking arrivals — the differential pool',
        body: [
          'Beyond Rogers, Chelsea have been the summer’s busiest attacking market — arrivals such as Emmanuel Emegha up front and Alejandro Garnacho on loan add low-owned differential options if they nail starting roles.',
          'Differentials from a big spender can swing your mini-league if they start, but a crowded Chelsea front line makes minutes the deciding factor — wait for pre-season line-ups before buying. The safest Chelsea route into your squad remains Rogers or João Pedro until the newer names show their minutes.',
        ],
      },
    ],
    faq: [
      {
        question: 'Who is the best new signing to buy in FPL 2026/27?',
        answer:
          'Morgan Rogers is the standout. His £118.7m move to Chelsea makes him a top-five owned midfielder with a goal-and-assist role in a strong attack. He is the new signing most likely to be genuine template rather than a reputation pick.',
      },
      {
        question: 'Is Elliot Anderson worth it in FPL 2026/27?',
        answer:
          'As a budget-midfield enabler, yes — a nailed Manchester City midfielder around £5.5m frees money for premiums like Haaland. The risk is rotation, so check his security of starts in pre-season before committing.',
      },
      {
        question: 'Should I buy Chelsea’s new forwards in FPL?',
        answer:
          'Treat them as differentials, not certainties. Chelsea’s crowded front line means minutes are the deciding factor. Wait for confirmed pre-season line-ups; until then, Rogers or João Pedro are the safer Chelsea picks.',
      },
      {
        question: 'How should I value a new signing with no Premier League history?',
        answer:
          'Ignore the fee and judge nailed minutes and role. FPL prices are set on reputation and expected demand, not output, so back players with a clear starting spot and goal or assist involvement over expensive names with uncertain minutes.',
      },
    ],
    mentions: [
      { name: 'Morgan Rogers', sameAs: 'https://en.wikipedia.org/wiki/Morgan_Rogers_(footballer)' },
      { name: 'Elliot Anderson', sameAs: 'https://en.wikipedia.org/wiki/Elliot_Anderson' },
      { name: 'Chelsea F.C.', sameAs: 'https://en.wikipedia.org/wiki/Chelsea_F.C.' },
      { name: 'Fantasy Premier League', sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League' },
    ],
  },

  {
    slug: 'best-4-5m-defenders-promoted-teams-2026-27',
    title: 'Best £4.0m Defenders in FPL 2026/27: Promoted-Team Budget Enablers',
    summary:
      'The best £4.0m defenders in FPL 2026/27 come from the promoted trio — Coventry, Hull and Ipswich — whose entire defences are priced at the floor. Bobby Thomas (Coventry), Charlie Hughes (Hull) and Milan van Ewijk (Coventry) stand out for clean-sheet and defensive-contribution (DEFCON) potential. Prioritise nailed starters with set-piece or attacking threat so the saved budget funds your premiums — a benched £4.0m “bargain” quietly wrecks a squad.',
    description:
      'The best £4.0m FPL defenders for 2026/27 — Bobby Thomas, Charlie Hughes and the promoted-team enablers that free budget for your premiums.',
    date: '2026-07-26',
    category: 'Tips',
    coverImage: '/images/blog/best-4-5m-defenders-promoted-teams-2026-27.webp',
    coverAlt: 'A defensive wall of plain blocks — budget defenders from promoted teams',
    sections: [
      {
        heading: 'Why £4.0m defenders decide your whole squad',
        body: [
          'Budget structure lives or dies on cheap enablers. FPL has priced every defender from the three promoted clubs at £4.0m — 26 of the 46 cheapest defenders in the game come from Coventry, Hull and Ipswich.',
          'Finding two or three £4.0m defenders who actually start is what lets you afford Haaland plus two other premiums instead of trimming your attack.',
          'The catch: “cheapest” is not “nailed”. A benched £4.0m defender is the most common budget mistake — cross-check pre-season line-ups, not last season’s Championship role.',
        ],
      },
      {
        heading: 'The standout £4.0m picks',
        body: [
          'Bobby Thomas (Coventry City) — perhaps the best of the lot. Frank Lampard’s Coventry kept 17 clean sheets last season, and Thomas chipped in three goals and four assists while racking up defensive-contribution (DEFCON) points.',
          'Charlie Hughes (Hull City) — the DEFCON king: he averaged 11.8 defensive contributions per 90 in the Championship, more than any other promoted defender, and features in the official Scout Selection.',
          'Milan van Ewijk (Coventry City) — an attacking full-back whose crossing and overlaps give assist upside on top of the occasional clean sheet.',
        ],
      },
      {
        heading: 'How to pick your enablers',
        body: [
          'Nailed minutes first. A confirmed £4.0m starter beats a cheaper rotation risk every time.',
          'Chase defensive contributions. The DEFCON points system rewards tackles, interceptions and blocks — ball-winning defenders and busy full-backs bank points even without a clean sheet.',
          'Spread the risk. Pair one Coventry defender with a Hull or Ipswich starter rather than tripling up on one promoted defence, and prioritise soft opening fixtures for early clean-sheet potential.',
        ],
      },
    ],
    faq: [
      {
        question: 'Who are the best £4.0m defenders in FPL 2026/27?',
        answer:
          'Bobby Thomas (Coventry), Charlie Hughes (Hull) and Milan van Ewijk (Coventry) are the standouts. Every promoted-team defender is priced at £4.0m, so target the nailed starters with defensive-contribution or attacking threat and confirm the XI from pre-season line-ups.',
      },
      {
        question: 'Are promoted-team defenders worth it in FPL 2026/27?',
        answer:
          'Yes, when nailed. FPL priced all Coventry, Hull and Ipswich defenders at £4.0m, and several offer clean sheets plus defensive-contribution (DEFCON) points. They are the main source of budget enablers — just prioritise confirmed starters over the cheapest name.',
      },
      {
        question: 'What are defensive contribution (DEFCON) points?',
        answer:
          'FPL awards points to defenders and midfielders for reaching a threshold of defensive actions — tackles, interceptions, clearances and blocks — in a match. It rewards busy, ball-winning players even when their team does not keep a clean sheet.',
      },
      {
        question: 'Coventry, Hull or Ipswich — whose defenders should I target?',
        answer:
          'Target the nailed individual, not the club. Coventry’s Bobby Thomas and Hull’s Charlie Hughes are the current front-runners for starts and defensive-contribution points; confirm roles from pre-season friendlies before committing.',
      },
    ],
    mentions: [
      { name: 'Coventry City F.C.', sameAs: 'https://en.wikipedia.org/wiki/Coventry_City_F.C.' },
      { name: 'Hull City A.F.C.', sameAs: 'https://en.wikipedia.org/wiki/Hull_City_A.F.C.' },
      { name: 'Ipswich Town F.C.', sameAs: 'https://en.wikipedia.org/wiki/Ipswich_Town_F.C.' },
      { name: 'Fantasy Premier League', sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League' },
    ],
  },

  {
    slug: 'fpl-gw1-team-reveals-2026-27',
    title: 'FPL GW1 Team Reveals 2026/27: Official Scout Pick + Creator Drafts',
    summary:
      'These FPL GW1 team reveals for 2026/27 gather the official Premier League Scout Selection alongside leading content-creator drafts, each rendered on a pitch. The picks agree on a spine of Haaland, Bruno Fernandes and Gabriel, then diverge on formation, budget defenders and differentials. Use them to sanity-check your own Gameweek 1 draft — follow each source link for the full reasoning behind every XI.',
    description:
      'FPL GW1 team reveals for 2026/27 — the official Scout Selection plus content-creator drafts, each shown on a pitch, with links to every pick.',
    date: '2026-07-26',
    category: 'Line-ups',
    coverImage: '/images/blog/fpl-gw1-team-reveals-2026-27.webp',
    coverAlt: 'Overhead tactics board with eleven discs in formation',
    sections: [
      {
        heading: 'What the GW1 drafts agree on',
        body: [
          'A premium spine recurs across almost every reveal: Erling Haaland up top, Bruno Fernandes in midfield and Gabriel in defence, with Manchester United assets boosted by a soft opening run against promoted sides.',
          'Promoted-team £4.0m defenders (Charlie Hughes, Bobby Thomas) show up as budget enablers in multiple squads.',
          'The disagreement is in shape and differentials — 4-4-2 vs 3-4-3, and which mid-priced attacker to back — which is exactly where you can find your edge.',
        ],
      },
      {
        heading: 'How to use these line-ups',
        body: [
          'Treat the official Scout Selection as the baseline, then see where the creators deviate and why. Each pitch links to the original pick so you can read the full reasoning.',
          'Do not copy a draft wholesale — align it with your own captaincy plan and mini-league position. A differential that suits a rank-chaser may not suit a leader protecting a lead.',
        ],
      },
    ],
    lineups: [
      {
        source: 'Official FPL — Early Scout Selection',
        sourceUrl:
          'https://www.premierleague.com/en/news/4681112/early-scout-selection-the-best-fantasy-squad-for-202627',
        formation: '4-4-2',
        note: 'Attacks Man United’s soft opener (Hull, Ipswich) and uses £4.0m promoted defenders as enablers.',
        players: [
          { name: 'Kinsky', team: 'TOT', position: 'GK' },
          { name: 'Gabriel', team: 'ARS', position: 'DEF' },
          { name: 'Maguire', team: 'MUN', position: 'DEF' },
          { name: 'Calafiori', team: 'ARS', position: 'DEF' },
          { name: 'Hughes', team: 'HUL', position: 'DEF' },
          { name: 'B. Fernandes', team: 'MUN', position: 'MID' },
          { name: 'Cunha', team: 'MUN', position: 'MID' },
          { name: 'Stach', team: 'LEE', position: 'MID' },
          { name: 'Xhaka', team: 'SUN', position: 'MID' },
          { name: 'Haaland', team: 'MCI', position: 'FWD', isCaptain: true },
          { name: 'João Pedro', team: 'CHE', position: 'FWD' },
        ],
      },
      {
        source: 'Onside Arena — FPL Cheat Sheet 2026/27',
        sourceUrl: 'https://onsidearena.com/tips/fpl-cheat-sheet-2026-27',
        formation: '4-4-2',
        note: 'Captain Haaland; differential Isak; flags Palmer as a trap.',
        players: [
          { name: 'Roefs', team: 'SUN', position: 'GK' },
          { name: 'Gabriel', team: 'ARS', position: 'DEF' },
          { name: 'Robinson', team: 'FUL', position: 'DEF' },
          { name: 'Tarkowski', team: 'EVE', position: 'DEF' },
          { name: 'Murillo', team: 'NFO', position: 'DEF' },
          { name: 'Saka', team: 'ARS', position: 'MID' },
          { name: 'B. Fernandes', team: 'MUN', position: 'MID' },
          { name: 'Semenyo', team: 'BOU', position: 'MID' },
          { name: 'Rogers', team: 'CHE', position: 'MID' },
          { name: 'Haaland', team: 'MCI', position: 'FWD', isCaptain: true },
          { name: 'Watkins', team: 'AVL', position: 'FWD' },
        ],
      },
      {
        source: 'Fantasy Football Fix — Dan Bennett’s draft',
        sourceUrl: 'https://www.fantasyfootballfix.com/blog-index/best-fpl-gameweek-1-team-expert-draft/',
        formation: '3-4-3',
        note: 'Captain Haaland; Anderson as a budget-mid enabler. Full XI and reasoning at the source.',
        players: [
          { name: 'Verbruggen', team: 'BHA', position: 'GK' },
          { name: 'Gabriel', team: 'ARS', position: 'DEF' },
          { name: 'Mosquera', team: 'ARS', position: 'DEF' },
          { name: 'Shaw', team: 'MUN', position: 'DEF' },
          { name: 'B. Fernandes', team: 'MUN', position: 'MID' },
          { name: 'Anderson', team: 'MCI', position: 'MID' },
          { name: 'Xhaka', team: 'ARS', position: 'MID' },
          { name: 'Haaland', team: 'MCI', position: 'FWD', isCaptain: true },
          { name: 'João Pedro', team: 'CHE', position: 'FWD' },
          { name: 'Calvert-Lewin', team: 'EVE', position: 'FWD' },
        ],
      },
    ],
    faq: [
      {
        question: 'What is the official FPL Scout Selection for GW1 2026/27?',
        answer:
          'A 4-4-2 built around Haaland, Bruno Fernandes and Gabriel, using £4.0m promoted-team defenders (like Hull’s Charlie Hughes) as enablers and leaning on Manchester United’s soft opening fixtures. See the full XI and reasoning via the Premier League link.',
      },
      {
        question: 'Which FPL content creators have published GW1 2026/27 drafts?',
        answer:
          'Fantasy Football Fix, Onside Arena and Fantasy Football Scout writers (FPL General, Dan Wright) have all shared early drafts. This page renders the accessible ones on a pitch and links out to each pick, including the member-only reveals.',
      },
      {
        question: 'What do the GW1 drafts have in common?',
        answer:
          'A premium spine of Haaland, Bruno Fernandes and Gabriel, plus £4.0m promoted-team defenders as budget enablers. They differ mainly on formation (4-4-2 vs 3-4-3) and which mid-priced attacker and differentials to back.',
      },
      {
        question: 'Should I copy a creator’s FPL team?',
        answer:
          'Use them as a sanity check, not a template. Align any draft with your own captaincy plan and mini-league position — a differential that suits a rank-chaser can be the wrong call for a leader protecting a lead.',
      },
    ],
    mentions: [
      { name: 'Fantasy Premier League', sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League' },
      { name: 'Erling Haaland', sameAs: 'https://en.wikipedia.org/wiki/Erling_Haaland' },
      { name: 'Bruno Fernandes', sameAs: 'https://en.wikipedia.org/wiki/Bruno_Fernandes' },
    ],
  },

  {
    slug: 'best-fpl-tools-2026-27',
    title: 'Top 5 Fantasy Premier League Tools for 2026/27 (and How to Use Them)',
    summary:
      'The best Fantasy Premier League tools for 2026/27 each solve a different job: the official FPL site for the game itself, Fantasy Football Scout for Opta stats, LiveFPL for live rank and effective ownership, Fantasy Football Fix for fixture planning, and FPL Page for a live matchday dashboard. Understanding the newer scoring systems — BPS and defensive contributions (DEFCON) — and pairing a transfer planner with a mini-league tracker is what turns raw data into rank.',
    description:
      'The top 5 FPL tools for 2026/27 compared — official FPL, Fantasy Football Scout, LiveFPL, Fantasy Football Fix and FPL Page — plus BPS & DEFCON explained.',
    date: '2026-07-26',
    category: 'Strategy',
    coverImage: '/images/blog/best-fpl-tools-2026-27.webp',
    coverAlt: 'Five precision instruments arranged on dark slate — the top FPL tools',
    sections: [
      {
        heading: 'What makes a great FPL tool in 2026/27',
        body: [
          'The best setup is not one site — it is a stack. You want live rank and effective ownership on matchday, Opta-grade underlying stats for transfer decisions, a fixture planner for the medium term, and a mini-league tracker for the bragging rights.',
          'Two scoring systems now shape picks. The Bonus Point System (BPS) decides the 1–3 bonus points per match from a blend of on-ball actions, while defensive contributions (DEFCON) reward defenders and midfielders for tackles, interceptions and blocks — making busy ball-winners viable budget picks.',
          'A transfer planner ties it together: mapping two or three gameweeks ahead against fixtures and predicted price changes is how you avoid wasted hits.',
        ],
      },
      {
        heading: 'How this list works (and why we link out)',
        body: [
          'This is an honest, tool-by-tool comparison — we link straight to each site so you can try them. We rebuild this list regularly with a fresh angle as tools ship new features.',
          'No tool does everything, so we have noted the single job each one is best at, plus where FPL Ranker fits into the stack.',
        ],
      },
    ],
    lists: [
      {
        heading: 'The top 5 FPL tools for 2026/27',
        intro: 'Ranked by how essential each is to a complete workflow — official game first, then the specialists.',
        ordered: true,
        items: [
          {
            name: 'Official Fantasy Premier League',
            url: 'https://fantasy.premierleague.com/',
            blurb:
              'The game itself, plus the official Scout picks, price changes and the definitive player prices and status flags. Your source of truth before any third-party tool.',
          },
          {
            name: 'Fantasy Football Scout',
            url: 'https://www.fantasyfootballscout.co.uk/',
            blurb:
              'Opta-powered stats, predicted line-ups and a large community, with a season ticker and projections behind membership. Best for deep, data-led transfer decisions.',
          },
          {
            name: 'LiveFPL',
            url: 'https://livefpl.net/',
            blurb:
              'The gold standard for live rank estimation and effective ownership during matches, plus chip-impact analysis. Best for tracking exactly where you stand on matchday.',
          },
          {
            name: 'Fantasy Football Fix',
            url: 'https://www.fantasyfootballfix.com/',
            blurb:
              'Opta statistics, a fixture planner and an AI-assisted team optimiser. Best for medium-term planning and stat-sandbox exploration.',
          },
          {
            name: 'FPL Page',
            url: 'https://fpl.page/',
            blurb:
              'A clean live dashboard covering live rank, bonus, defensive contributions, price changes, xG/xA and effective ownership in one view. Best for an at-a-glance matchday cockpit.',
          },
        ],
      },
    ],
    faq: [
      {
        question: 'What is the best FPL tool for 2026/27?',
        answer:
          'There is no single best — it is a stack. Use the official FPL site for prices and status, Fantasy Football Scout or Fantasy Football Fix for Opta stats and planning, LiveFPL for live rank and effective ownership, and FPL Page for a matchday dashboard. FPL Ranker adds the mini-league layer.',
      },
      {
        question: 'What is the difference between BPS and defensive contributions (DEFCON)?',
        answer:
          'BPS (Bonus Point System) decides the 1–3 bonus points awarded each match from a blend of on-ball actions. Defensive contributions (DEFCON) are a separate scoring route that rewards defenders and midfielders for hitting a threshold of tackles, interceptions and blocks — even without a clean sheet.',
      },
      {
        question: 'Do I need a paid FPL tool?',
        answer:
          'No. The official site, LiveFPL and FPL Page cover most needs for free. Paid tiers (Fantasy Football Scout, Fantasy Football Fix) add Opta projections, team reveals and planners that serious managers value, but you can compete at a high level on free tools alone.',
      },
      {
        question: 'What is the best free FPL transfer planner?',
        answer:
          'Several tools offer free multi-gameweek planners; look for one that overlays fixtures and predicted price changes so you can plan two or three gameweeks ahead and avoid unnecessary points hits. Try a couple from this list and keep the one whose workflow fits yours.',
      },
    ],
    mentions: [
      { name: 'Fantasy Premier League', sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League' },
    ],
  },

  // ─── Migrated from bespoke /blog routes (2026-08-09) ────────────────────
  // These three predate the registry and had hand-built pages in the old
  // marketing theme. Content is unchanged; original publish dates preserved so
  // they sort correctly in the newest-first index.

  {
    slug: 'world-cup-fatigue',
    title: 'World Cup Fatigue Watch: Which FPL Stars Came Back With the Heaviest Legs',
    summary:
      'The 2026 World Cup is over — Spain beat Argentina in the final, England reached the semis and Norway stunned Brazil on the way to the quarters. The tracker below shows each FPL-relevant Premier League star’s actual tournament minutes and the Gameweek 1 burnout risk that follows. Tap any player to see every match they played.',
    description:
      'Live World Cup 2026 minutes tracker for FPL-relevant Premier League stars, with Gameweek 1 burnout risk for each player.',
    date: '2026-06-02',
    updated: '2026-07-27',
    category: 'Analysis',
    coverImage: '/images/blog/world-cup-fatigue.webp',
    coverAlt: 'A spent athlete on a bench after a deep World Cup run',
    sections: [
      {
        heading: 'Why tournament minutes matter for Gameweek 1',
        body: [
          'A deep World Cup run costs a player three things at once: the minutes themselves, the recovery weeks that should have been pre-season, and the truncated build-up with their club. Managers who went far — and especially those who played every knockout round — arrive at the opening weekend short of club-specific sharpness even when they look fit.',
          'The pattern from previous tournaments is consistent: the heaviest-loaded players are rotated, benched, or eased in during the opening month. That is a Gameweek 1 problem for anyone who spent big on a premium asset who lifted the trophy three weeks earlier.',
        ],
      },
      {
        heading: 'How to read the tracker',
        body: [
          'Each row shows a player’s nation, their tournament result, and their total minutes across the finals. The bar is relative load — how much of the available tournament football they actually played. The risk chip is the resulting Gameweek 1 burnout risk: High, Medium or Low.',
          'Tap any player to expand their full tournament: every match, the scoreline, and the exact minutes they played in it, including the games they sat out entirely.',
        ],
      },
    ],
    embed: 'wc-fatigue',
    faq: [
      {
        question: 'Should I avoid World Cup players in Gameweek 1?',
        answer:
          'Not categorically — avoid the ones with high load. A player who exited in the group stage got a near-normal pre-season. A player who started every match to the final did not. Use the minutes column rather than the badge on the shirt.',
      },
      {
        question: 'How long does World Cup fatigue actually last?',
        answer:
          'The measurable dip is usually concentrated in the opening four to six gameweeks, and shows up as rotation and reduced minutes more often than as a drop in per-90 output. Deep runners are frequently eased in from the bench before starting regularly.',
      },
      {
        question: 'Where do these minutes come from?',
        answer:
          'They are the actual minutes played in the 2026 World Cup finals, match by match, for Premier League players who are relevant to Fantasy Premier League squads.',
      },
    ],
    mentions: [
      { name: '2026 FIFA World Cup', sameAs: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup' },
      { name: 'Fantasy Premier League', sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League' },
    ],
  },

  {
    slug: 'fdr-tools',
    title: 'Master Your Long-Term Planning: Top 5 FPL Fixture Difficulty (FDR) Tools',
    summary:
      'The official FPL site gives you a basic 1–5 difficulty scale, but those ratings are based on last season’s standing and lag real-world form. These five Fixture Difficulty Rating tools — Fantasy Football Fix, Fantasy Football Hub, FPL Ranker, FPL.Team and FPL Analytics — let you spot green runs, blank gameweeks and fixture swings before your rivals do.',
    description:
      'Compare the top 5 FPL Fixture Difficulty Rating tools for long-term planning: rotation planners, xG-based tickers and interactive fixture solvers.',
    date: '2026-02-17',
    category: 'Analysis',
    coverImage: '/images/blog/fdr-tools.webp',
    coverAlt: 'Grid of red-to-green tiles with a run of green sweeping through — fixture difficulty',
    sections: [
      {
        heading: 'Why the official FDR is not enough',
        body: [
          'In Fantasy Premier League information is power, but visualisation is king. The official 1–5 scale is built largely on where a team finished last season, so it is slow to react when a promoted side starts well or a traditional big six team leaks goals.',
          'To navigate blank gameweeks, double gameweeks and the dreaded fixture turn, you want a dedicated FDR tool that reacts to form — ideally one built on expected goals rather than reputation.',
        ],
      },
      {
        heading: 'What to look for in an FDR tool',
        body: [
          'Three things separate a useful FDR tool from a pretty chart. First, the underlying model: is difficulty derived from xG and recent form, or just from the table? Second, split ratings: attacking and defensive difficulty are not the same, and a leaky top-half side is a green fixture for forwards and a red one for defenders. Third, planning depth: can you actually plan transfers and chips forward, or only look at a static grid?',
        ],
      },
    ],
    lists: [
      {
        heading: 'The five tools',
        intro:
          'Ranked by how much they change your planning, not by traffic. Each link opens the tool directly.',
        ordered: true,
        items: [
          {
            name: 'Fantasy Football Fix — the defensive specialist',
            url: 'https://www.fantasyfootballfix.com/planner',
            blurb:
              'Famous for its Rotation Planner. Pick two budget defenders and see their combined best fixture each week — the simplest way to never start a defender against Manchester City. The Stats Sandbox adds a heat-map FDR built on clean-sheet probability, and the AI assistant rates your squad out of 100 on the next five gameweeks.',
          },
          {
            name: 'Fantasy Football Hub — the AI-powered ticker',
            url: 'https://www.fantasyfootballhub.co.uk/fixture-ticker',
            blurb:
              'The heavy hitter for data-backed projections. Difficulty is derived from Opta stats and expected goals rather than league position, so a big team defending badly shows green for opposition attackers even while sitting top of the table. Sort the ticker by attack, defence or overall, and it reflects blank and double gameweek news faster than anywhere else.',
          },
          {
            name: 'FPL Ranker — the banter-first insight tool',
            url: 'https://fplranker.com',
            blurb:
              'Built to bridge hard data and league rivalry. The Fixture FDR key is a high-contrast 1–5 grid designed for clarity: at a glance you see which managers in your mini-league are about to hit a fixture wall and which have a clear run. Combined with the transfer history view, you can see not just where a rival is heading but whether their past disasters came from ignoring fixtures in the first place.',
          },
          {
            name: 'FPL.Team — the planner’s paradise',
            url: 'https://fpl.team/fdr',
            blurb:
              'The gold standard for managers who like to tinker. Less a static chart than a playable board: make transfers, change captains and play chips up to 38 weeks ahead, with FDR shown directly under every player’s shirt in your mock draft. It syncs your real team automatically, so your own squad’s next ten weeks are one glance away.',
          },
          {
            name: 'FPL Analytics — the strategic deep-dive',
            url: 'https://www.fplanalytics.com/fdr.html',
            blurb:
              'For anyone who wants every team’s schedule in one expansive grid. It shows fixture swings more clearly than almost anywhere else, and the difficulty slider lets you weight home advantage and recent form yourself. Minimalist and data-heavy — ideal if you love a spreadsheet.',
          },
        ],
      },
    ],
    faq: [
      {
        question: 'What is FDR in FPL?',
        answer:
          'FDR stands for Fixture Difficulty Rating — a score, usually 1 to 5, estimating how hard a team’s upcoming fixture is. Lower is easier. The official FPL version is based largely on last season’s finishing position; third-party tools recalculate it from current form and expected goals.',
      },
      {
        question: 'Is the official FPL fixture difficulty rating accurate?',
        answer:
          'It is a reasonable starting point but it lags. Because it leans on previous-season standing, it is slow to downgrade a struggling big side or upgrade a promoted team in good form. Tools built on xG react within a few gameweeks.',
      },
      {
        question: 'What is a fixture swing?',
        answer:
          'A fixture swing is the point where a team moves from a difficult run to an easy one, or vice versa. Transferring in a player just before a swing to green — and out before a swing to red — is one of the highest-value uses of a free transfer.',
      },
      {
        question: 'Should attackers and defenders use the same FDR?',
        answer:
          'No. Attacking and defensive difficulty diverge often. A team that scores freely but concedes just as freely is a green fixture for opposition attackers and a red one for their own defenders. Any tool that splits the two is more useful than one overall number.',
      },
    ],
    mentions: [
      { name: 'Fantasy Premier League', sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League' },
      { name: 'Expected goals', sameAs: 'https://en.wikipedia.org/wiki/Expected_goals' },
    ],
  },

  {
    slug: 'beyond-the-points',
    title: 'Beyond the Points: How FPL Ranker Turns Your Mini-League into a Premier League Experience',
    summary:
      'Fantasy Premier League is 10% picking players and 90% bragging to your friends — but mini-league group chats go quiet as the season drags on. FPL Ranker gives every mini-league the Sky Sports treatment: table progression charts, ESPN-style headlines, rival scouting, a weekly newsletter and community polls, all built to keep the banter running from Gameweek 1 to 38.',
    description:
      'How FPL Ranker turns your mini-league into a Premier League experience: progression charts, headlines, rival watch, newsletters and polls.',
    date: '2026-01-05',
    category: 'News',
    coverImage: '/images/blog/beyond-the-points.webp',
    coverAlt: 'A broadcast microphone lit in crimson in front of a floodlit amateur pitch',
    sections: [
      {
        heading: 'Watch the drama unfold: league table progression',
        body: [
          'Generic tables show you where you are now. The progression chart shows you how you got there, tracking every position change across every gameweek of the season.',
          'Nothing says bottler like a line plummeting from 1st to 7th over three weeks. Use it to identify the climbers and the divers in your league — and to call them out in the group chat.',
        ],
      },
      {
        heading: 'ESPN-style headlines for your league',
        body: [
          'Why read about the pros when you can read about your friends? The Top Headlines engine turns your league’s actual gameweek into news-style stories: the captaincy masterclass, the bench nightmare, the differential that swung the week.',
          'Did someone just pull off a masterstroke with a 96-point haul? Is there a title race brewing between 2nd and 3rd? Every gameweek gets written up like it matters, because in your league it does.',
        ],
      },
      {
        heading: 'Rival watch: the ultimate scouting report',
        body: [
          'To beat your rivals you need to know their every move. Rival Watch and the performance analysis tabs break down every team’s squad composition, captaincy choices and effective ownership.',
          'Use it to spot the differential that could ruin someone’s weekend — or to highlight the manager who survived the week purely on a Haaland captaincy.',
        ],
      },
      {
        heading: 'Never miss a beat: the league newsletter',
        body: [
          'You do not even have to open the site to stay informed. Subscribe to your league newsletter and the week’s top headlines plus a full rival analysis land in your inbox twice a gameweek — a pre-deadline reminder and a post-gameweek summary.',
          'It is the perfect mid-week pain report to drop into the group chat and remind everyone who is boss.',
        ],
      },
      {
        heading: 'Vote on the chaos: community polls',
        body: [
          'Engagement is a two-way street. The community poll settles debates, predicts the next flop, and gives the quieter managers in your league something to argue about between deadlines.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is FPL Ranker free?',
        answer:
          'Yes — the mini-league tools are free. A small commission from official kit links keeps them that way.',
      },
      {
        question: 'Do I need an account to use it?',
        answer:
          'No. Enter any Fantasy Premier League team ID and your leagues load straight away. There is nothing to install and no login required to view standings and headlines.',
      },
      {
        question: 'How often do the headlines update?',
        answer:
          'Headlines regenerate from live Fantasy data every gameweek, and subscribers receive them by email twice per gameweek — a pre-deadline reminder and a post-gameweek summary.',
      },
      {
        question: 'Is FPL Ranker affiliated with the Premier League?',
        answer:
          'No. FPL Ranker is an independent tool and is not affiliated with or endorsed by the Premier League or Fantasy Premier League.',
      },
    ],
    mentions: [
      { name: 'Fantasy Premier League', sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League' },
    ],
  },
];

/** Look up a single post by slug. */
export const getPost = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find((p) => p.slug === slug);

/** All posts, newest first. */
export const getAllPosts = (): BlogPost[] =>
  [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
