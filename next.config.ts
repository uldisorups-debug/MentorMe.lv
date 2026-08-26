import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  // Adrese mainīta no /coach/ uz /profils/. 301 tāpēc, ka Google
  // vecajai saitei jau var būt piešķīris svaru — pāradresācija to
  // pārnes, 404 to izmestu.
  async redirects() {
    return [
      { source: '/coach/:slug', destination: '/profils/:slug', permanent: true },
    ]
  },

  images: {
    remotePatterns: [
      // Supabase Storage — avatāri un galerijas
      {
        protocol: 'https',
        hostname: 'azqbrudrskcyhcbgxihx.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
