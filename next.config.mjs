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