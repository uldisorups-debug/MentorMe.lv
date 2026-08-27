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
  | 'teaching_format'
  | 'region_slug'
  | 'city'
  | 'for_tourists'
  | 'profile_views'
  | 'created_at'
> & {
  avg_rating: number | null
  review_count: number
}

export type SortKey = 'popular' | 'rated' | 'newest'

export type CoachFilters = {
  query: string
  sort: SortKey
  sphere: string
  niche: string
  region: string
  format: string
  certification: string
  priceTier: string
  language: string
  /** Tikai tie, kas piedāvā pieredzes tūristiem */
  tourists: boolean
}

export const EMPTY_FILTERS: CoachFilters = {
  query: '',
  sort: 'popular',
  sphere: 'all',
  niche: 'all',
  region: 'all',
  format: 'all',
  certification: 'all',
  priceTier: 'all',
  language: 'all',
  tourists: false,
}

/** Sertifikācija ir jēdzīga tikai koučingā — citur to nerādām. */
export const CERT_SPHERE = 'koucings'

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
  filters: CoachFilters,
  /** grupas slug -> sfēras slug; vajadzīgs filtram pēc sfēras */
  nicheToSphere: Record<string, string> = {}
): CoachCardData[] {
  const query = filters.query.trim().toLowerCase()

  return coaches.filter((coach) => {
    if (query) {
      const haystack = `${coach.full_name} ${coach.tagline ?? ''}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (filters.sphere !== 'all') {
      const inSphere = coach.niches.some(
        (niche) => nicheToSphere[niche] === filters.sphere
      )
      if (!inSphere) return false
    }

    if (filters.niche !== 'all' && !coach.niches.includes(filters.niche)) {
      return false
    }

    if (filters.format !== 'all' && coach.teaching_format !== filters.format) {
      return false
    }

    /*
     * Attālinātais skolotājs der jebkuram reģionam — viņam vienalga, kur
     * students sēž. Tāpēc reģiona filtrs viņu neizmet. Ja meklētājs grib
     * tieši klātienē, viņš uzliek arī formāta filtru, un tas nostrādā.
     */
    if (filters.region !== 'all') {
      const sameRegion = coach.region_slug === filters.region
      const worksAnywhere = coach.teaching_format === 'remote'
      if (!sameRegion && !worksAnywhere) return false
    }

    if (filters.tourists && !coach.for_tourists) {
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
 * Saraksta kārtošana.
 *
 * "Populārākie" pēc skatījumiem, bet ar vienu izņēmumu: profili, kas
 * jaunāki par divām nedēļām, tiek pacelti augšā neatkarīgi no skatījumu
 * skaita. Bez tā sanāktu slazds — jauns cilvēks nekad neparādās augšā,
 * tāpēc viņu neviens neredz, tāpēc viņam nav skatījumu, tāpēc viņš nekad
 * neparādās augšā. Divas nedēļas ir logs, kurā viņu vispār var pamanīt.
 */
const NEW_PROFILE_DAYS = 14

function isNew(coach: CoachCardData, now: number): boolean {
  const age = now - new Date(coach.created_at).getTime()
  return age < NEW_PROFILE_DAYS * 24 * 60 * 60 * 1000
}

export function sortCoaches(
  coaches: CoachCardData[],
  sort: SortKey,
  now: number = Date.now()
): CoachCardData[] {
  const list = [...coaches]

  if (sort === 'newest') {
    return list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  if (sort === 'rated') {
    return list.sort((a, b) => {
      // Bez atsauksmēm reitinga nav — tie iet uz beigām, nevis uz augšu
      const scoreA = a.avg_rating === null ? -1 : a.avg_rating
      const scoreB = b.avg_rating === null ? -1 : b.avg_rating
      if (scoreB !== scoreA) return scoreB - scoreA
      return b.review_count - a.review_count
    })
  }

  return list.sort((a, b) => {
    const newA = isNew(a, now)
    const newB = isNew(b, now)
    if (newA !== newB) return newA ? -1 : 1
    if (b.profile_views !== a.profile_views) {
      return b.profile_views - a.profile_views
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}
