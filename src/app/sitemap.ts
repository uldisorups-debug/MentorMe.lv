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
 *
 * lastModified ir īsts datums, nevis "tagad".
 *
 * Agrāk te stāvēja new Date(), tātad katrai adresei katrā ģenerēšanā
 * pienāca "labots tikko". Google to pamana: ja visa vietne katru reizi
 * saucas jauna, bet saturs nemainās, tas šim laukam pārstāj ticēt un
 * sāk to ignorēt. Tad arī tā lapa, kas tiešām ir mainījusies, vairs
 * neko nepasaka.
 */
function entry(
  path: string,
  changeFrequency: 'daily' | 'weekly' | 'monthly',
  priority: number,
  lastModified: Date
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, url(locale, path)])
  )

  return routing.locales.map((locale) => ({
    url: url(locale, path),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [coaches, posts] = await Promise.all([
    listCoachSlugs(),
    listPostSlugs(),
  ])

  /*
   * Saraksta lapas ir tik jaunas, cik jaunākais ieraksts tajās. Ja vēl
   * nav neviena, ņemam šodienu — tukšai vietnei datums neko nemaina.
   */
  const newest = [...coaches, ...posts]
    .map((row) => new Date(row.updatedAt).getTime())
    .reduce((a, b) => Math.max(a, b), 0)
  const listsModified = newest > 0 ? new Date(newest) : new Date()

  // Statiskās lapas mainās tikai tad, kad mēs pašas tās pārrakstām
  const staticModified = new Date('2026-09-16')

  return [
    ...entry('/', 'daily', 1, listsModified),
    ...entry('/blog', 'daily', 0.9, listsModified),
    ...entry('/ka-tas-darbojas', 'monthly', 0.7, staticModified),
    ...coaches.flatMap((coach) =>
      entry(`/${coach.slug}`, 'weekly', 0.8, new Date(coach.updatedAt))
    ),
    ...posts.flatMap((post) =>
      entry(`/blog/${post.slug}`, 'monthly', 0.7, new Date(post.updatedAt))
    ),
  ]
}
