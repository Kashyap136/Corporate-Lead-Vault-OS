/** @type {import('next').NextConfig} */
// API backend base URL. Set NEXT_PUBLIC_API_URL when the frontend is deployed
// (e.g. the Render backend URL) so the API is not hardcoded to localhost.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: '/exports/:path*',
        destination: `${API_URL}/exports/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;