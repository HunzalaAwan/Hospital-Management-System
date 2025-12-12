/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:4001',
    APPOINTMENT_API_URL: process.env.NEXT_PUBLIC_APPOINTMENT_API_URL || 'http://localhost:4002',
    NOTIFICATION_API_URL: process.env.NEXT_PUBLIC_NOTIFICATION_API_URL || 'http://localhost:4003',
  },
}

module.exports = nextConfig
