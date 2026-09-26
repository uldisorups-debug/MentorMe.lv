import { CoachDirectory } from '@/components/coach-directory'
import { ForCoaches } from '@/components/for-coaches'
import { HeroSection } from '@/components/hero-section'
import type { CoachCardData } from '@/lib/coaches'
import { setRequestLocale } from 'next-intl/server'
import { loadTaxonomy } from '@/lib/taxonomy'
import { createPublicClient } from '@/lib/supabase/public'

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
export const revalidate = 60

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

  return (
    <>
      <HeroSection
        coachCount={coaches.length}
        sphereCount={taxonomy.spheres.length}
      />
      <CoachDirectory coaches={coaches} taxonomy={taxonomy} />
      <ForCoaches />
    </>
  )
}
