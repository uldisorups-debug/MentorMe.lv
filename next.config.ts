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
  /*
   * Vecās adreses nedrīkst vienkārši pazust: Google tām jau var būt
   * piešķīris svaru, un tās var būt kaut kur izsūtītas. 301 to pārnes,
   * 404 to izmestu.
   *
   * /coach/ sūtām uzreiz uz galamērķi, nevis caur /profils/. Divas
   * pāradresācijas pēc kārtas Google seko, bet katrā solī daļa svara
   * paliek ceļā, un pārlūkam tas ir divi papildu turp-atpakaļ.
   */
  async redirects() {
    const koucs = [
      { source: '/profils/:slug', destination: '/:slug', permanent: true },
      { source: '/coach/:slug', destination: '/:slug', permanent: true },
    ]

    return [
      ...koucs,
      ...koucs.map((r) => ({
        source: `/:locale(en|ru)${r.source}`,
        destination: `/:locale${r.destination}`,
        permanent: true,
      })),
      // "Par mums" saplūda ar "Kā tas darbojas"
      { source: '/par-mums', destination: '/ka-tas-darbojas', permanent: true },
      { source: '/:locale(en|ru)/par-mums', destination: '/:locale/ka-tas-darbojas', permanent: true },
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
