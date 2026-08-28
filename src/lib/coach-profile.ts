import type {
  BookEntry,
  MovieEntry,
  MusicEntry,
} from '@/types/database'
import type { CoachCardData } from '@/lib/coaches'
import { createPublicClient } from '@/lib/supabase/public'

/** Pilnais profila lapas datu apjoms. */
export type CoachDetail = CoachCardData & {
  /** Vajadzīgs, lai koučam nerādītu atsauksmes formu par sevi pašu */
  user_id: string | null
  bio: string | null
  calendly_url: string | null
  cert_other_label: string | null
  cert_proof_url: string | null
  books_top: BookEntry[]
  movies_top: MovieEntry[]
  music_top: MusicEntry[]
  gallery_urls: string[]
  profile_views: number
}

export type ReviewWithAuthor = {
  id: string
  rating: number
  body: string | null
  created_at: string
  /** null, ja autors izvēlējies palikt anonīms */
  author_name: string | null
}

export type CoachPage = {
  coach: CoachDetail
  reviews: ReviewWithAuthor[]
}

/** Visi slug'i, kas jāpāragatavo statiski. */
export async function listCoachSlugs(): Promise<string[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('coach_profiles')
    .select('slug')
    .eq('is_published', true)

  if (error) {
    console.error('Neizdevās ielādēt slug sarakstu:', error.message)
    return []
  }
  return (data ?? []).map((row) => row.slug)
}

/**
 * Ielādē vienu profilu. Vispirms datubāze, tad demonstrācijas dati.
 * Atgriež null, ja tāda slug nav nekur — lapa tad met notFound().
 */
export async function loadCoachPage(slug: string): Promise<CoachPage | null> {
  const supabase = createPublicClient()

  const { data: coach, error } = await supabase
    .from('coach_profiles')
    .select(
      'id, user_id, slug, full_name, tagline, bio, avatar_url, certification, cert_other_label, cert_proof_url, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches, teaching_format, region_slug, city, for_tourists, calendly_url, books_top, movies_top, music_top, gallery_urls, profile_views, created_at'
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) {
    console.error('Neizdevās ielādēt kouča profilu:', error.message)
  }

  if (!coach) return null

  const [{ data: rating }, { data: reviewRows }] = await Promise.all([
    supabase
      .from('coach_ratings')
      .select('avg_rating, review_count')
      .eq('coach_id', coach.id)
      .maybeSingle(),
    /*
     * Skats, ne pamattabula. Tajā client_id nav vispār, un anonīmajiem
     * vārds ir null jau datubāzē. Agrāk vārdu paņēma un izmeta Reactā —
     * tas nozīmēja, ka jebkurš to varēja izvilkt no Supabase tieši.
     */
    supabase
      .from('reviews_public')
      .select('id, rating, body, created_at, author_name')
      .eq('coach_id', coach.id)
      .order('created_at', { ascending: false }),
  ])

  const reviews: ReviewWithAuthor[] = (reviewRows ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    body: row.body,
    created_at: row.created_at,
    author_name: row.author_name,
  }))

  return {
    coach: {
      ...coach,
      books_top: (coach.books_top ?? []) as BookEntry[],
      movies_top: (coach.movies_top ?? []) as MovieEntry[],
      music_top: (coach.music_top ?? []) as MusicEntry[],
      avg_rating: rating?.avg_rating ?? null,
      review_count: rating?.review_count ?? 0,
    },
    reviews,
  }
}
