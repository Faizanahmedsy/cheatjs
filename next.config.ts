import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
