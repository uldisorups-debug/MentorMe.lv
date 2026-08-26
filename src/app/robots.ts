import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/supabase/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Privātās zonas meklētājiem nav ko indeksēt
      disallow: ['/dashboard/', '/auth/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
