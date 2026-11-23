import type {NextConfig} from 'next';
import {BASE_PATH} from './src/lib/base-path';

const nextConfig: NextConfig = {
  // Served at ustadbillu.vercel.app/class (the ustadbillu project rewrites /class/* here).
  basePath: BASE_PATH || undefined,
  async redirects() {
    if (!BASE_PATH) return [];
    // Old cheatjs.vercel.app links (no /class) go to the same page on the new address.
    const host = [{ type: 'host' as const, value: 'cheatjs.vercel.app' }];
    return [
      { source: '/', has: host, destination: `https://ustadbillu.vercel.app${BASE_PATH}`, basePath: false as const, permanent: false },
      { source: `/:path((?!${BASE_PATH.slice(1)}(?:/|$)).*)`, has: host, destination: `https://ustadbillu.vercel.app${BASE_PATH}/:path`, basePath: false as const, permanent: false },
    ];
  },
  /* config options here */
  // The AWS v2 pages read their Notion snapshots from content/aws-v2 at runtime.
  outputFileTracingIncludes: {
    '/aws-saa-v2': ['./content/aws-v2/**/*'],
    '/aws-saa-v2/[slug]': ['./content/aws-v2/**/*'],
    '/gen-ai': ['./content/gen-ai/**/*'],
    '/gen-ai/[slug]': ['./content/gen-ai/**/*'],
    '/search-index.json': ['./content/**/*'],
    '/flashcards': ['./content/**/*'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
