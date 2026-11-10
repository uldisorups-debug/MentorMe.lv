import type { Metadata } from 'next'
import { CoachDirectory } from '@/components/coach-directory'
import { ForCoaches } from '@/components/for-coaches'
import { HeroSection } from '@/components/hero-section'
import type { CoachCardData } from '@/lib/coaches'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { loadTaxonomy } from '@/lib/taxonomy'
import { createPublicClient } from '@/lib/supabase/public'
import { localePath, pageAlternates } from '@/i18n/routing'
import { jsonLdHtml } from '@/lib/json-ld'
import { SITE_URL } from '@/lib/supabase/config'
import { TopicLinks } from '@/components/topic-links'
import { buildTopicIndex } from '@/lib/topic-index'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  return { alternates: pageAlternates(locale, '/') }
}

/*
 * Cik profilu sākumlapa ievelk vienā piegājienā.
 *
 * Filtrēšana notiek pārlūkā, pār jau ielādētu sarakstu — pie šāda
 * profilu skaita tas ir ātrāks un patīkamāks par pieprasījumu uz katru
 * filtra maiņu. Kad šis griestus sāk sist, filtrēšana un lappuses
 * jāpārceļ uz servera pusi; zemāk esošais brīdinājums to pateiks.
 */
const DIRECTORY_LIMIT = 500

// ISR — lapa tiek pārbūvēta ne biežāk kā reizi minūtē.
// Stunda, ne minūte: izmaiņas atsvaidzina revalidatePublicPages() uzreiz
export const revalidate = 86400

async function loadDirectory(locale: string) {
  const supabase = createPublicClient()

  const [taxonomy, coachesResult] = await Promise.all([
    loadTaxonomy(locale),
    supabase
      .from('coach_profiles')
      // Viena virkne bez salīmēšanas — citādi PostgREST tipi neizvelk kolonnas
      .select(
        'id, slug, full_name, tagline, avatar_url, qualification, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches, teaching_format, region_slug, city, experience_kinds, is_background, avg_rating, review_count, profile_views, created_at'
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(DIRECTORY_LIMIT),
  ])

  if (coachesResult.error) {
    console.error('Neizdevās ielādēt kouču sarakstu:', coachesResult.error.message)
  }

  if ((coachesResult.data?.length ?? 0) >= DIRECTORY_LIMIT) {
    console.warn(
      `Sākumlapa sasniedza ${DIRECTORY_LIMIT} profilu griestus — laiks filtrēšanu pārcelt uz servera pusi.`
    )
  }

  // Reitings tagad nāk līdzi pašam profilam — bez otrā vaicājuma un
  // bez visas atsauksmju tabulas agregēšanas katrā pārbūvē
  const dbCoaches: CoachCardData[] = coachesResult.data ?? []

  return { taxonomy, coaches: dbCoaches }
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  setRequestLocale(locale)

  const { taxonomy, coaches } = await loadDirectory(locale)
  const t = await getTranslations('Meta')

  /*
   * Sākumlapa ir saraksts — un to tā arī pasaka. Profilu kartītes
   * Google redz kā tekstu; ItemList tās nosauc par sarakstu ar adresēm,
   * un AI rīki no šejienes uzreiz zina, kas vietnē ir. Fona profili
   * (mūsu pašu, ne piedāvājumi) sarakstā neiet.
   */
  const listed = coaches.filter((c) => !c.is_background).slice(0, 30)
  const homeUrl = `${SITE_URL}${localePath(locale, '/')}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('title'),
    description: t('description'),
    url: homeUrl,
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/#site` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listed.length,
      itemListElement: listed.map((coach, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: coach.full_name,
        url: `${SITE_URL}${localePath(locale, `/${coach.slug}`)}`,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <HeroSection
        coachCount={coaches.length}
        sphereCount={taxonomy.spheres.length}
      />
      <CoachDirectory coaches={coaches} taxonomy={taxonomy} />
      {/*
        Nozaru kvadrāti augšā ir pogas — tās filtrē pārlūkā, un Google
        pa tām nekur neaiziet. Šīs ir parastas saites uz tēmu lapām, lai
        katra tēma, kurā kāds ir, ir sasniedzama no sākumlapas.
      */}
      <TopicLinks index={buildTopicIndex(coaches, taxonomy)} />
      <ForCoaches />
    </>
  )
}
