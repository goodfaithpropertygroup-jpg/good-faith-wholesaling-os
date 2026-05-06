/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['goodfaithpropertygroup.vercel.app', 'localhost:3000'],
    },
  },
  images: {
    domains: ['images.unsplash.com', 'goodfaithpropertygroup.vercel.app'],
  },
}

module.exports = nextConfig
