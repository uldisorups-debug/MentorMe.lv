import { CoachDirectory } from '@/components/coach-directory'
import { ForCoaches } from '@/components/for-coaches'
import { HeroSection } from '@/components/hero-section'
import { HowItWorks } from '@/components/how-it-works'
import type { CoachCardData } from '@/lib/coaches'
import { createPublicClient } from '@/lib/supabase/public'

// ISR — lapa tiek pārbūvēta ne biežāk kā reizi minūtē.
export const revalidate = 60

async function loadDirectory() {
  const supabase = createPublicClient()

  const [spheresResult, categoriesResult, regionsResult, coachesResult, ratingsResult] =
    await Promise.all([
    supabase.from('spheres').select('slug, name_lv, icon').order('sort_order'),
    supabase
      .from('categories')
      .select('slug, name_lv, sphere_slug')
      .order('sort_order'),
    supabase.from('regions').select('slug, name_lv').order('sort_order'),
    supabase
      .from('coach_profiles')
      // Viena virkne bez salīmēšanas — citādi PostgREST tipi neizvelk kolonnas
      .select(
        'id, slug, full_name, tagline, avatar_url, certification, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches, teaching_format, region_slug, city, for_tourists'
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    supabase.from('coach_ratings').select('coach_id, avg_rating, review_count'),
  ])

  if (categoriesResult.error) {
    console.error('Neizdevās ielādēt kategorijas:', categoriesResult.error.message)
  }
  if (coachesResult.error) {
    console.error('Neizdevās ielādēt kouču sarakstu:', coachesResult.error.message)
  }

  const taxonomy = {
    spheres: (spheresResult.data ?? []).map((s) => ({
      value: s.slug,
      label: s.name_lv,
      icon: s.icon,
    })),
    groups: (categoriesResult.data ?? []).map((c) => ({
      value: c.slug,
      label: c.name_lv,
      sphere: c.sphere_slug,
    })),
    regions: (regionsResult.data ?? []).map((r) => ({
      value: r.slug,
      label: r.name_lv,
    })),
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

export default async function HomePage() {
  const { taxonomy, coaches } = await loadDirectory()

  return (
    <>
      <HeroSection
        coachCount={coaches.length}
        sphereCount={taxonomy.spheres.length}
      />
      <CoachDirectory coaches={coaches} taxonomy={taxonomy} />
      <HowItWorks />
      <ForCoaches />
    </>
  )
}
