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
  meta_title: string | null
  meta_description: string | null
  cert_note: string | null
  books_top: BookEntry[]
  movies_top: MovieEntry[]
  music_top: MusicEntry[]
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
 * Ielādē vienu profilu ar tā reitingu un atsauksmēm.
 * Atgriež null, ja tāda slug nav — lapa tad met notFound().
 */
export async function loadCoachPage(slug: string): Promise<CoachPage | null> {
  const supabase = createPublicClient()

  const { data: coach, error } = await supabase
    .from('coach_profiles')
    .select(
      'id, user_id, slug, full_name, tagline, bio, avatar_url, certification, cert_other_label, cert_note, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches, teaching_format, region_slug, city, experience_kinds, avg_rating, review_count, meta_title, meta_description, calendly_url, books_top, movies_top, music_top, profile_views, created_at'
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) {
    console.error('Neizdevās ielādēt kouča profilu:', error.message)
  }

  if (!coach) return null

  /*
   * Reitings nāk līdzi profilam — atsevišķa vaicājuma vairs nav.
   *
   * Atsauksmes lasām no skata, ne pamattabulas: tajā client_id nav
   * vispār, un anonīmajiem vārds ir null jau datubāzē.
   */
  const { data: reviewRows, error: reviewsError } = await supabase
    .from('reviews_public')
    .select('id, rating, body, created_at, author_name')
    .eq('coach_id', coach.id)
    .order('created_at', { ascending: false })

  if (reviewsError) {
    console.error('Neizdevās ielādēt atsauksmes:', reviewsError.message)
  }

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
    },
    reviews,
  }
}
