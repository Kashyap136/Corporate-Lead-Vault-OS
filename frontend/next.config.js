/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      {
        source: '/exports/:path*',
        destination: 'http://localhost:5000/exports/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
