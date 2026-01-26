import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for production deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to succeed despite TypeScript errors
    ignoreBuildErrors: true,
  },
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