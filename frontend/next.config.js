/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
  // Enable strict mode for better development
  reactStrictMode: true,
  // Optimize images
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig