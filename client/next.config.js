/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  transpilePackages: ['@t3-oss/env-nextjs', '@t3-oss/env-core'],
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: fileLoaderRule.issuer,
      resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
      use: ['@svgr/webpack']
    });

    fileLoaderRule.exclude = /\.svg$/i;

    config.resolve.alias.canvas = false;

    return config;
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api']
  }
};
module.exports = nextConfig;
