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

/** Bezmaksas, par maksu vai vienalga. */
export type BudgetMode = 'all' | 'free' | 'paid'

export type CoachFilters = {
  query: string
  sort: SortKey
  sphere: string
  region: string
  format: string
  certification: string
  language: string
  budget: BudgetMode
  /** Meklētāja budžets eiro. Tukša virkne = nav norādīts. */
  budgetFrom: string
  budgetTo: string
  /** Tikai tie, kas piedāvā meistarklases un pieredzes */
  masterclass: boolean
}

export const EMPTY_FILTERS: CoachFilters = {
  query: '',
  sort: 'popular',
  sphere: 'all',
  region: 'all',
  format: 'all',
  certification: 'all',
  language: 'all',
  budget: 'all',
  budgetFrom: '',
  budgetTo: '',
  masterclass: false,
}

/**
 * Filtri, ko notīra, kad cilvēks sāk rakstīt meklēšanā.
 *
 * Meklēšana ir jauna doma, ne esošās sašaurināšana: ja kāds meklē
 * "kokle", viņam nav jāatceras, ka pirms piecām minūtēm bija uzlicis
 * "Kurzeme, klātienē". Pēc meklēšanas rezultātus var filtrēt no jauna.
 * Kārtošana paliek — tā neko neslēpj.
 */
export function filtersOnNewSearch(query: string): CoachFilters {
  return { ...EMPTY_FILTERS, query }
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
/**
 * Viss, kas par cilvēku ir zināms saraksta lapā, vienā virknē.
 *
 * Meklējot "kokle", cilvēks negrib, lai sakristu tikai vārds vai
 * viena rindiņa — viņš grib, lai sakrīt jebkas: prasme, pilsēta, joma.
 */
function searchHaystack(
  coach: CoachCardData,
  nicheNames: Record<string, string>
): string {
  return [
    coach.full_name,
    coach.tagline ?? '',
    coach.city ?? '',
    coach.region_slug ?? '',
    ...coach.niches.map((n) => nicheNames[n] ?? n),
    ...coach.niches,
  ]
    .join(' ')
    .toLowerCase()
}

export function filterCoaches(
  coaches: CoachCardData[],
  filters: CoachFilters,
  /** grupas slug -> sfēras slug; vajadzīgs filtram pēc nozares */
  nicheToSphere: Record<string, string> = {},
  /** grupas slug -> nosaukums; vajadzīgs meklēšanai pa tekstu */
  nicheNames: Record<string, string> = {}
): CoachCardData[] {
  const query = filters.query.trim().toLowerCase()
  // Katrs vārds jāatrod atsevišķi, lai "kokle Kurzeme" strādā
  const words = query ? query.split(/\s+/) : []

  const budgetFrom = filters.budgetFrom.trim() === '' ? null : Number(filters.budgetFrom)
  const budgetTo = filters.budgetTo.trim() === '' ? null : Number(filters.budgetTo)

  return coaches.filter((coach) => {
    if (words.length > 0) {
      const haystack = searchHaystack(coach, nicheNames)
      if (!words.every((word) => haystack.includes(word))) return false
    }

    if (filters.sphere !== 'all') {
      const inSphere = coach.niches.some(
        (niche) => nicheToSphere[niche] === filters.sphere
      )
      if (!inSphere) return false
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

    if (filters.masterclass && !coach.for_tourists) {
      return false
    }

    if (filters.certification !== 'all') {
      const cert = coach.certification ?? 'none'
      if (cert !== filters.certification) return false
    }

    if (filters.budget === 'free' && coach.price_tier !== 'free') return false
    if (filters.budget === 'paid' && coach.price_tier === 'free') return false

    /*
     * Budžeta diapazons. Cilvēks, kurš neko nav norādījis par cenu,
     * netiek izmests — viņa cena nav zināma, nevis par augstu, un
     * izmešana sodītu par nepabeigtu profilu, ne par dārgumu.
     * Bezmaksas der vienmēr.
     */
    if ((budgetFrom !== null || budgetTo !== null) && coach.price_tier !== 'free') {
      const askFrom = coach.price_from
      const askTo = coach.price_to ?? coach.price_from

      if (askFrom !== null && askTo !== null) {
        const tooExpensive = budgetTo !== null && askFrom > budgetTo
        const tooCheap = budgetFrom !== null && askTo < budgetFrom
        if (tooExpensive || tooCheap) return false
      }
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
