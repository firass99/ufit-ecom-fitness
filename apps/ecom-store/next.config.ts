import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
//const checkEnvVariables = require('./check-env-variables');

//checkEnvVariables();

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disabled to prevent duplicate requests in development
  swcMinify: true,
  productionBrowserSourceMaps: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // ✅ External placeholder and image domains
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'www.technosporttunisie.com',
      },
      {
        protocol: 'https',
        hostname: 'i5.walmartimages.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'workout.eu',
      },
      {
        protocol: 'https',
        hostname: '*',
        port: '',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'medusa-server-testing.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'medusa-server-testing.s3.us-east-1.amazonaws.com',
      },
    ],
  },
  experimental: {
    // ⛔️ Prevent Next.js from trying to externalize these hook-based packages
    serverComponentsExternalPackages: [
      'import-in-the-middle',
      'require-in-the-middle',
    ],
  },
};

export default withNextIntl(nextConfig);
