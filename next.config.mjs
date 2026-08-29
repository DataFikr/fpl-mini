import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve the new responsive app at the root domain. Temporary (307) so it's
  // easily reversible; switch to permanent once fully cut over.
  async redirects() {
    return [
      { source: '/', destination: '/app', permanent: false },

      // Old marketing-theme pages are retired — everything lives in the Sportify
      // app shell now. Permanent (308) so search engines transfer the ranking
      // signal from the old URLs rather than treating these as temporary.
      // Order matters: the /blog/:slug rule must precede the bare /blog rule.
      { source: '/blog/:slug', destination: '/app/blog/:slug', permanent: true },
      { source: '/blog', destination: '/app/blog', permanent: true },
      { source: '/find-team-id', destination: '/app/find-team-id', permanent: true },

      // The pre-Sportify team/league dashboards. August 2026 analytics found
      // ~10% of pageviews still landing on their old titles ("FPL League Hub",
      // "FPL Dashboard | FPLRanker") alongside the current pages — two
      // generations of the same content competing in search, in the channel
      // supplying 70% of all traffic. 308 so the ranking signal transfers.
      //
      // The legacy league URL carried the manager as `?team=`; the app reads
      // `?teamId=`. The `has` rule captures and renames it, so old shared links
      // keep highlighting the right manager — it must precede the bare rule,
      // which otherwise matches first and drops the parameter.
      {
        source: '/league/:id',
        has: [{ type: 'query', key: 'team', value: '(?<legacyTeam>.*)' }],
        destination: '/app/league/:id?teamId=:legacyTeam',
        permanent: true,
      },
      { source: '/league/:id', destination: '/app/league/:id', permanent: true },
      { source: '/team/:id', destination: '/app/squad?teamId=:id', permanent: true },
    ];
  },
  eslint: {
    // Disable ESLint during builds for production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to succeed despite TypeScript errors
    ignoreBuildErrors: true,
  },
  // NOTE: demo mode (FPL_DEMO_SEASON) used to require bundling the 2025/26
  // snapshot cache into every serverless function. Dropped 2026-08-18 — the live
  // 2026/27 season is running, so nothing reads those files at runtime. Restore
  // `outputFileTracingIncludes` for scripts/fpl-predictor/.cache if demo mode is
  // ever deployed again.
  images: {
    domains: [
      'fantasy.premierleague.com',
      'resources.premierleague.com',
      'fplranker.com',
      'fpl-league-hub.vercel.app',
      'fpl-mini.vercel.app',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fantasy.premierleague.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'resources.premierleague.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fplranker.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fpl-league-hub.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fpl-mini.vercel.app',
        pathname: '/**',
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Basic fallback configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        buffer: false,
        util: false,
      };
    }

    // Exclude Redis and related Node.js modules from client-side bundle
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'redis': 'redis',
        'net': 'net',
        'tls': 'tls',
        '@redis/client': '@redis/client'
      });
    }

    return config;
  },
};

export default nextConfig;