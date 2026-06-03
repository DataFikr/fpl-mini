import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FPL 2026/27 World Cup Fatigue Tracker & Official New Kit Guide',
  description:
    'Track FPL player burnout from the 2026 World Cup alongside official 2026/2027 Premier League kit releases. Buy the new Arsenal, Man City, and Man United kits online.',
  openGraph: {
    title: 'FPL 2026/27 World Cup Fatigue Tracker & Official New Kit Guide',
    description:
      'Is your GW1 draft a trap? Check the player fatigue matrix and explore the newly released 2026/2027 kits for top Premier League clubs.',
    url: 'https://fplranker.com/blog/world-cup-fatigue',
    type: 'article',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://fplranker.com/blog/world-cup-fatigue',
  },
  headline: 'FPL World Cup Fatigue Risk Matrix & GW1 Player Analysis',
  description:
    'A comprehensive data analysis evaluating Fantasy Premier League player fatigue, pre-season recovery windows, and rotation risks for the 2026/27 season following the 2026 FIFA World Cup.',
  abstract:
    'TL;DR: The close proximity of the 2026 World Cup final to the Premier League kickoff creates an unprecedented fatigue trap for premium FPL assets. Heavily owned stars including Erling Haaland, Bukayo Saka, and Martin Ødegaard face severe early-season rest or rotation profiles, making a strategy focused on fresh alternatives or strict pre-season tracking essential for GW1 success.',
  inLanguage: 'en-US',
  author: {
    '@type': 'Organization',
    name: 'FPLRanker',
    url: 'https://fplranker.com',
  },
  about: [
    {
      '@type': 'Event',
      name: '2026 FIFA World Cup',
      sameAs: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup',
    },
    {
      '@type': 'Game',
      name: 'Fantasy Premier League',
      sameAs: 'https://en.wikipedia.org/wiki/Fantasy_Premier_League',
    },
  ],
  mentions: [
    { '@type': 'Person', name: 'Erling Haaland', sameAs: 'https://en.wikipedia.org/wiki/Erling_Haaland' },
    { '@type': 'Person', name: 'Bukayo Saka', sameAs: 'https://en.wikipedia.org/wiki/Bukayo_Saka' },
    { '@type': 'Person', name: 'Martin Ødegaard', sameAs: 'https://en.wikipedia.org/wiki/Martin_%C3%98degaard' },
    { '@type': 'Person', name: 'Bruno Fernandes', sameAs: 'https://en.wikipedia.org/wiki/Bruno_Fernandes' },
    { '@type': 'Person', name: 'Virgil van Dijk', sameAs: 'https://en.wikipedia.org/wiki/Virgil_van_Dijk' },
    { '@type': 'Person', name: 'Florian Wirtz', sameAs: 'https://en.wikipedia.org/wiki/Florian_Wirtz' },
    { '@type': 'Person', name: 'Ollie Watkins', sameAs: 'https://en.wikipedia.org/wiki/Ollie_Watkins' },
    { '@type': 'Person', name: 'Cody Gakpo', sameAs: 'https://en.wikipedia.org/wiki/Cody_Gakpo' },
  ],
  mentionsOption: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'High Risk - Fade Early',
        description: 'Erling Haaland, Bukayo Saka, Martin Ødegaard, Bruno Fernandes, Virgil van Dijk, Florian Wirtz.',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Medium Risk - Monitor',
        description: 'Declan Rice, Ollie Watkins, Cody Gakpo.',
      },
    ],
  },
};

export default function WorldCupFatigueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
