/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const { withAxiom } = require('next-axiom');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["i.discogs.com"],
  },
  async redirects() {
    return [{ source: '/search', destination: '/', permanent: true }];
  },
};

module.exports = withSentryConfig(withAxiom(nextConfig), {
  silent: true,
  hideSourceMaps: true,
});
