import type { MetadataRoute } from 'next'
import { listCoachSlugs } from '@/lib/coach-profile'
import { listPostSlugs } from '@/lib/posts'
import { SITE_URL } from '@/lib/supabase/config'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, postSlugs] = await Promise.all([
    listCoachSlugs(),
    listPostSlugs(),
  ])

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/par-mums`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/profils/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...postSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
