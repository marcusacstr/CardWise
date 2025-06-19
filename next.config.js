/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    domains: ['localhost', 'supabase.co'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  async rewrites() {
    return [
      // Handle subdomain routing for partner portals
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\\.cardwise-preview\\.com',
          },
        ],
        destination: '/portal/:subdomain',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\\.cardwise-preview\\.com',
          },
        ],
        destination: '/portal/:subdomain/:path*',
      },
    ];
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Cache static assets
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Compression and optimization
  compress: true,
  
  // Disable experimental features that may cause issues
  experimental: {
    scrollRestoration: true,
    missingSuspenseWithCSRBailout: false,
  },

  // Add generateBuildId for consistent deployments
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA ?? 'development'
  },

  // Add custom webpack config to handle environment variables better
  webpack: (config, { isServer }) => {
    // Ignore certain modules during build to prevent errors
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig 