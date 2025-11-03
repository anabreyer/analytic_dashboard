/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
  
  // Enable strict mode for better development
  reactStrictMode: true,
  
  // Optimize images
  images: {
    domains: ['localhost'],
  },
  
  // CRITICAL: Enable standalone output for Docker
  output: 'standalone',
  
  // Disable telemetry
  telemetry: {
    disabled: true,
  },
}

module.exports = nextConfig
