import type { MetadataRoute } from 'next'
import { listCoachSlugs } from '@/lib/coach-profile'
import { listPostSlugs } from '@/lib/posts'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/supabase/config'

export const revalidate = 3600

/** Latviešu paliek uz saknes, pārējām valodām prefikss. */
function url(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
  return `${SITE_URL}${prefix}${path === '/' ? '' : path}` || SITE_URL
}

/**
 * Katram ceļam viens ieraksts katrā valodā, un katram ierakstam
 * alternates.languages — tā Google saprot, ka trīs versijas ir viena
 * lapa, nevis trīs dublikāti, kas savā starpā konkurē.
 */
function entry(
  path: string,
  changeFrequency: 'daily' | 'weekly' | 'monthly',
  priority: number
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, url(locale, path)])
  )

  return routing.locales.map((locale) => ({
    url: url(locale, path),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [coachSlugs, postSlugs] = await Promise.all([
    listCoachSlugs(),
    listPostSlugs(),
  ])

  return [
    ...entry('/', 'daily', 1),
    ...entry('/blog', 'daily', 0.9),
    ...entry('/ka-tas-darbojas', 'monthly', 0.7),
    ...coachSlugs.flatMap((slug) => entry(`/profils/${slug}`, 'weekly', 0.8)),
    ...postSlugs.flatMap((slug) => entry(`/blog/${slug}`, 'monthly', 0.7)),
  ]
}
