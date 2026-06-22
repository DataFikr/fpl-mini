import { SITE_URL, SITE_NAME, SITE_TAGLINE, SOCIAL_LINKS, absUrl } from '@/lib/seo';

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ---------------- Sitewide entity (inject once, in the root layout) ---------------- */

export function WebsiteStructuredData() {
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        description: `${SITE_NAME} — ${SITE_TAGLINE}. Track and analyse your FPL mini-league free.`,
        url: SITE_URL,
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/team/{search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function OrganizationStructuredData() {
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        description: `${SITE_NAME} is a free Fantasy Premier League mini-league analytics tool.`,
        url: SITE_URL,
        logo: absUrl('/icon.png'),
        sameAs: SOCIAL_LINKS,
      }}
    />
  );
}

export function WebApplicationStructuredData() {
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#webapp`,
        name: SITE_NAME,
        description:
          'Free Fantasy Premier League mini-league analytics: live standings, ESPN-style headlines, rank progression, effective ownership, captaincy and chip tracking.',
        url: SITE_URL,
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': `${SITE_URL}/#organization` },
      }}
    />
  );
}

/* ---------------- Per-page builders ---------------- */

/** Breadcrumb trail. Pass items as { name, path } in order, root → current. */
export function BreadcrumbStructuredData({ items }: { items: { name: string; path: string }[] }) {
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: it.name,
          item: absUrl(it.path),
        })),
      }}
    />
  );
}

export function ArticleStructuredData({
  title,
  description,
  path,
  datePublished,
  dateModified,
  author = SITE_NAME,
  image,
}: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        url: absUrl(path),
        mainEntityOfPage: absUrl(path),
        ...(image ? { image: absUrl(image) } : {}),
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified || datePublished ? { dateModified: dateModified || datePublished } : {}),
        author: { '@type': 'Organization', name: author },
        publisher: { '@id': `${SITE_URL}/#organization` },
      }}
    />
  );
}

/** FAQPage from question/answer pairs. Answers must also be present in the DOM. */
export function FaqStructuredData({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((it) => ({
          '@type': 'Question',
          name: it.question,
          acceptedAnswer: { '@type': 'Answer', text: it.answer },
        })),
      }}
    />
  );
}

/** Glossary of FPL terms — high citation value for answer engines. */
export function DefinedTermSetStructuredData({
  name,
  path,
  terms,
}: {
  name: string;
  path: string;
  terms: { term: string; definition: string }[];
}) {
  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': `${absUrl(path)}#glossary`,
        name,
        url: absUrl(path),
        hasDefinedTerm: terms.map((t) => ({
          '@type': 'DefinedTerm',
          name: t.term,
          description: t.definition,
          inDefinedTermSet: `${absUrl(path)}#glossary`,
        })),
      }}
    />
  );
}
