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

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FPL League Hub",
    "description": "Fantasy Premier League mini-league analytics and tracking platform",
    "url": "https://fpl-league-hub.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://fpl-league-hub.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return <StructuredData data={structuredData} />;
}

export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FPL League Hub",
    "description": "Fantasy Premier League mini-league analytics platform",
    "url": "https://fpl-league-hub.vercel.app",
    "logo": "https://fpl-league-hub.vercel.app/logo.png",
    "sameAs": [
      "https://github.com/fpl-league-hub"
    ]
  };

  return <StructuredData data={structuredData} />;
}