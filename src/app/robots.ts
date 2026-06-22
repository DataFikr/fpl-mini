import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Answer-engine + AI crawlers we explicitly welcome (training corpora and
// real-time retrieval that power ChatGPT, Claude, Perplexity, Gemini, Copilot).
const AI_AGENTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended',
  'CCBot', 'Amazonbot', 'Bingbot',
];

const DISALLOW = ['/api/', '/admin/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
