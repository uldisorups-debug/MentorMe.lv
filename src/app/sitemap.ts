import type { MetadataRoute } from 'next'
import { listCoachSlugs } from '@/lib/coach-profile'
import { SITE_URL } from '@/lib/supabase/config'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await listCoachSlugs()

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/profils/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
