/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["i.discogs.com"],
  },
  async redirects() {
    return [{ source: '/search', destination: '/', permanent: true }];
  },
};

module.exports = nextConfig;
