import type { CertLevel, CoachProfile, PriceTier } from '@/types/database'

/**
 * Kartītei vajadzīgais kouča datu apjoms + reitings no coach_ratings skata.
 * Apzināti šaurāks par pilno CoachProfile — saraksta lapa nevelk bio un galeriju.
 */
export type CoachCardData = Pick<
  CoachProfile,
  | 'id'
  | 'slug'
  | 'full_name'
  | 'tagline'
  | 'avatar_url'
  | 'certification'
  | 'is_verified'
  | 'years_experience'
  | 'session_languages'
  | 'price_tier'
  | 'price_from'
  | 'price_to'
  | 'niches'
> & {
  avg_rating: number | null
  review_count: number
}

export type CoachFilters = {
  query: string
  niche: string
  certification: string
  priceTier: string
  language: string
}

export const EMPTY_FILTERS: CoachFilters = {
  query: '',
  niche: 'all',
  certification: 'all',
  priceTier: 'all',
  language: 'all',
}

/** Cenu līmeņu secība — vajadzīga € simbolu skaita noteikšanai. */
export const PRICE_TIER_STEPS: Record<PriceTier, number> = {
  free: 0,
  affordable: 1,
  mid: 2,
  premium: 3,
}

/** Sertifikācijas īsais apzīmējums uz kartītes. Null = nerādīt nekā. */
export function certLabel(cert: CertLevel | null): string | null {
  switch (cert) {
    case 'acc':
      return 'ICF ACC'
    case 'pcc':
      return 'ICF PCC'
    case 'mcc':
      return 'ICF MCC'
    case 'metacoach':
      return 'MetaCoach'
    case 'other':
      return 'Sertificēts'
    default:
      return null
  }
}

/**
 * Klientpuses filtrēšana pār jau ielādētu sarakstu.
 *
 * Kad kouču skaits pāraugs pāris simtus, šī loģika jāpārceļ uz Supabase
 * pusi (GIN indeksi nišām un valodām jau ir uzlikti migrācijā).
 */
export function filterCoaches(
  coaches: CoachCardData[],
  filters: CoachFilters
): CoachCardData[] {
  const query = filters.query.trim().toLowerCase()

  return coaches.filter((coach) => {
    if (query) {
      const haystack = `${coach.full_name} ${coach.tagline ?? ''}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (filters.niche !== 'all' && !coach.niches.includes(filters.niche)) {
      return false
    }

    if (filters.certification !== 'all') {
      const cert = coach.certification ?? 'none'
      if (cert !== filters.certification) return false
    }

    if (filters.priceTier !== 'all' && coach.price_tier !== filters.priceTier) {
      return false
    }

    if (
      filters.language !== 'all' &&
      !coach.session_languages.includes(filters.language)
    ) {
      return false
    }

    return true
  })
}

/**
 * DEMONSTRĀCIJAS DATI.
 *
 * Šie profili ir izdomāti — datubāzē kouču vēl nav. Kad coach_profiles
 * tabulā parādīsies pirmie publicētie ieraksti, šo masīvu var izmest un
 * page.tsx vietā to vilkt no Supabase (struktūra ir identiska).
 */
export const DEMO_COACHES: CoachCardData[] = [
  {
    id: 'demo-1',
    slug: 'ilze-berzina',
    full_name: 'Ilze Bērziņa',
    tagline: 'Vadītājiem, kas nonākuši pie sienas ar savu komandu',
    avatar_url: null,
    certification: 'mcc',
    is_verified: true,
    years_experience: 14,
    session_languages: ['lv', 'en'],
    price_tier: 'premium',
    price_from: 120,
    price_to: 180,
    niches: ['bizness', 'karjera'],
    avg_rating: 4.9,
    review_count: 37,
  },
  {
    id: 'demo-2',
    slug: 'maris-ozols',
    full_name: 'Māris Ozols',
    tagline: 'Bijušais bankas vadītājs. Tagad palīdzu sākt savu.',
    avatar_url: null,
    certification: 'pcc',
    is_verified: true,
    years_experience: 9,
    session_languages: ['lv', 'en', 'ru'],
    price_tier: 'mid',
    price_from: 70,
    price_to: 95,
    niches: ['bizness', 'finanses'],
    avg_rating: 4.7,
    review_count: 21,
  },
  {
    id: 'demo-3',
    slug: 'anna-kalnina',
    full_name: 'Anna Kalniņa',
    tagline: 'Izdegšana, trauksme un ceļš atpakaļ pie sevis',
    avatar_url: null,
    certification: 'metacoach',
    is_verified: true,
    years_experience: 7,
    session_languages: ['lv', 'ru'],
    price_tier: 'mid',
    price_from: 55,
    price_to: 75,
    niches: ['mental', 'attiecibas'],
    avg_rating: 5,
    review_count: 44,
  },
  {
    id: 'demo-4',
    slug: 'juris-lacis',
    full_name: 'Juris Lācis',
    tagline: '18 gadi aiz restēm. Sagatavoju tos, kam tas priekšā.',
    avatar_url: null,
    certification: 'none',
    is_verified: false,
    years_experience: 5,
    session_languages: ['lv', 'ru'],
    price_tier: 'free',
    price_from: null,
    price_to: null,
    niches: ['cietums', 'dzive'],
    avg_rating: 4.8,
    review_count: 12,
  },
  {
    id: 'demo-5',
    slug: 'elina-vitola',
    full_name: 'Elīna Vītola',
    tagline: 'Olimpiskā atlēte. Disciplīna, ko var iemācīties.',
    avatar_url: null,
    certification: 'none',
    is_verified: true,
    years_experience: 6,
    session_languages: ['lv', 'en'],
    price_tier: 'affordable',
    price_from: 35,
    price_to: 50,
    niches: ['sports', 'dzive'],
    avg_rating: 4.6,
    review_count: 18,
  },
  {
    id: 'demo-6',
    slug: 'raimonds-krastins',
    full_name: 'Raimonds Krastiņš',
    tagline: 'Vācu pirmās prakses stundas. Tāpēc bez maksas.',
    avatar_url: null,
    certification: 'acc',
    is_verified: false,
    years_experience: 1,
    session_languages: ['lv'],
    price_tier: 'free',
    price_from: null,
    price_to: null,
    niches: ['karjera', 'lidz'],
    avg_rating: null,
    review_count: 0,
  },
  {
    id: 'demo-7',
    slug: 'sanita-liepa',
    full_name: 'Sanita Liepa',
    tagline: 'Vecākiem, kuriem mājās aug pusaudzis',
    avatar_url: null,
    certification: 'pcc',
    is_verified: true,
    years_experience: 11,
    session_languages: ['lv', 'ru'],
    price_tier: 'affordable',
    price_from: 40,
    price_to: 60,
    niches: ['vecaki', 'attiecibas'],
    avg_rating: 4.9,
    review_count: 29,
  },
  {
    id: 'demo-8',
    slug: 'andrejs-zvaigzne',
    full_name: 'Andrejs Zvaigzne',
    tagline: 'Meditācija bez ezotērikas. 20 gadi praksē.',
    avatar_url: null,
    certification: 'other',
    is_verified: false,
    years_experience: 20,
    session_languages: ['lv', 'en', 'ru'],
    price_tier: 'mid',
    price_from: 60,
    price_to: 80,
    niches: ['garigs', 'mental'],
    avg_rating: 4.5,
    review_count: 16,
  },
]
