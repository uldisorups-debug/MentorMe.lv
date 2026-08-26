import { CoachDirectory } from '@/components/coach-directory'
import { ForCoaches } from '@/components/for-coaches'
import { HeroSection } from '@/components/hero-section'
import { HowItWorks } from '@/components/how-it-works'
import { DEMO_COACHES, type CoachCardData } from '@/lib/coaches'
import { createPublicClient } from '@/lib/supabase/public'

// ISR — lapa tiek pārbūvēta ne biežāk kā reizi minūtē.
export const revalidate = 60

async function loadDirectory() {
  const supabase = createPublicClient()

  const [categoriesResult, coachesResult, ratingsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('slug, name_lv')
      .order('sort_order'),
    supabase
      .from('coach_profiles')
      // Viena virkne bez salīmēšanas — citādi PostgREST tipi neizvelk kolonnas
      .select(
        'id, slug, full_name, tagline, avatar_url, certification, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches'
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

  const categories = (categoriesResult.data ?? []).map((category) => ({
    value: category.slug,
    label: category.name_lv,
  }))

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

  // Kamēr neviens koučs nav publicējies, rādām demonstrācijas profilus,
  // lai lapa nav tukša. Ar skaidru brīdinājumu virs saraksta.
  const isDemo = dbCoaches.length === 0

  return {
    categories,
    coaches: isDemo ? DEMO_COACHES : dbCoaches,
    isDemo,
  }
}

export default async function HomePage() {
  const { categories, coaches, isDemo } = await loadDirectory()

  return (
    <>
      <HeroSection coachCount={coaches.length} />
      <CoachDirectory
        coaches={coaches}
        categories={categories}
        isDemo={isDemo}
      />
      <HowItWorks />
      <ForCoaches />
    </>
  )
}
