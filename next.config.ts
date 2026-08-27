import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

/**
 * Storage hostname nāk no tā paša mainīgā, kas viss pārējais.
 * Cieti iekodēts projekta ID nozīmētu, ka, mainot Supabase projektu,
 * bildes klusi pārstāj ielādēties un neviens nesaprot, kāpēc.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'localhost'

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
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
