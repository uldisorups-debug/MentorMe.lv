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
> & {
  avg_rating: number | null
  review_count: number
}

export type CoachFilters = {
  query: string
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
