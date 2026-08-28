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

  const [taxonomy, coachesResult, ratingsResult] = await Promise.all([
    loadTaxonomy(locale),
    supabase
      .from('coach_profiles')
      // Viena virkne bez salīmēšanas — citādi PostgREST tipi neizvelk kolonnas
      .select(
        'id, slug, full_name, tagline, avatar_url, certification, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches, teaching_format, region_slug, city, for_tourists, profile_views, created_at'
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(DIRECTORY_LIMIT),
    supabase.from('coach_ratings').select('coach_id, avg_rating, review_count'),
  ])

  if (coachesResult.error) {
    console.error('Neizdevās ielādēt kouču sarakstu:', coachesResult.error.message)
  }

  if (ratingsResult.error) {
    console.error('Neizdevās ielādēt reitingus:', ratingsResult.error.message)
  }

  if ((coachesResult.data?.length ?? 0) >= DIRECTORY_LIMIT) {
    console.warn(
      `Sākumlapa sasniedza ${DIRECTORY_LIMIT} profilu griestus — laiks filtrēšanu pārcelt uz servera pusi.`
    )
  }

  const ratings = new Map(
    (ratingsResult.data ?? []).map((row) => [row.coach_id, row])
  )

  const dbCoaches: CoachCardData[] = (coachesResult.data ?? []).map((coach) => {
    const rating = ratings.get(coach.id)
    return {
      ...coach,
      avg_rating: rating?.avg_rating ?? null,
      review_count: rating?.review_count ?? 0,
    }
  })

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
