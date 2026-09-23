import type {
  CoachProfile,
  ExperienceKind,
  PriceTier,
  QualificationLevel,
} from '@/types/database'

/**
 * Kartītei vajadzīgais kouča datu apjoms.
 * Apzināti šaurāks par pilno CoachProfile — saraksta lapa nevelk bio un galeriju.
 */
export type CoachCardData = Pick<
  CoachProfile,
  | 'id'
  | 'slug'
  | 'full_name'
  | 'tagline'
  | 'avatar_url'
  | 'qualification'
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
  | 'experience_kinds'
  | 'is_background'
  | 'avg_rating'
  | 'review_count'
  | 'profile_views'
  | 'created_at'
>

/**
 * 'none' nozīmē, ka cilvēks kārtošanu nav izvēlējies. Tas nav tas pats,
 * kas 'popular' — saraksts tad neizceļ ne skatītākos, ne jaunākos.
 */
export type SortKey = 'none' | 'popular' | 'rated' | 'newest'

/** Bezmaksas, par maksu vai vienalga. */
export type BudgetMode = 'all' | 'free' | 'paid'

export type CoachFilters = {
  query: string
  sort: SortKey
  sphere: string
  region: string
  format: string
  /** 'all' — filtrs nestrādā; 'unknown' — tie, kas nav norādījuši */
  qualification: 'all' | QualificationLevel | 'unknown'
  language: string
  budget: BudgetMode
  /** Meklētāja budžets eiro. Tukša virkne = nav norādīts. */
  budgetFrom: string
  budgetTo: string
  /** 'all' — filtrs nestrādā; citādi viens no četriem veidiem */
  experience: 'all' | ExperienceKind
}

export const EMPTY_FILTERS: CoachFilters = {
  query: '',
  sort: 'none',
  sphere: 'all',
  region: 'all',
  format: 'all',
  qualification: 'all',
  language: 'all',
  budget: 'all',
  budgetFrom: '',
  budgetTo: '',
  experience: 'all',
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

/** Reģions tiem, kas nav piesieti vienai vietai. */
export const COUNTRYWIDE_REGION = 'visa-latvija'

/** Cenu līmeņu secība — vajadzīga € simbolu skaita noteikšanai. */
export const PRICE_TIER_STEPS: Record<PriceTier, number> = {
  free: 0,
  affordable: 1,
  mid: 2,
  premium: 3,
}

/**
 * Teksta atslēga kvalifikācijai. Null = uz kartītes nerādīt nekā.
 *
 * Atslēga, ne gatavs teksts: agrāk šī funkcija atdeva "Sertificēts"
 * latviski, un tieši tā tas stāvēja arī angļu un krievu kartītēs.
 *
 * "Sertifikāta nav" te atgriež null ar nolūku. Tā ir godīga atbilde
 * filtram, bet uz kartītes tā būtu zīmogs — un daudzas prasmes ar
 * sertifikātiem nemaz nemēra.
 */
export function qualificationKey(
  level: QualificationLevel | null
): 'qualCertified' | 'qualStudying' | null {
  switch (level) {
    case 'certified':
      return 'qualCertified'
    case 'studying':
      return 'qualStudying'
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
     *
     * Tas pats attiecas uz "Visa Latvija": kurš brauc uz visurieni,
     * der arī Kurzemei.
     */
    if (filters.region !== 'all') {
      const sameRegion = coach.region_slug === filters.region
      const countrywide = coach.region_slug === COUNTRYWIDE_REGION
      const worksAnywhere = coach.teaching_format === 'remote'
      if (!sameRegion && !countrywide && !worksAnywhere) return false
    }

    if (
      filters.experience !== 'all' &&
      !coach.experience_kinds.includes(filters.experience)
    ) {
      return false
    }

    if (filters.qualification !== 'all') {
      // 'unknown' ir īsta izvēle: tie, kas par to nav neko teikuši
      const level = coach.qualification ?? 'unknown'
      if (level !== filters.qualification) return false
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
 * Jauni profili tiek pacelti augšā neatkarīgi no skatījumu skaita. Bez
 * tā sanāktu slazds — jauns cilvēks nekad neparādās augšā, tāpēc viņu
 * neviens neredz, tāpēc viņam nav skatījumu, tāpēc viņš nekad neparādās
 * augšā. Divdesmit dienas ir logs, kurā viņu vispār var pamanīt.
 */
const NEW_PROFILE_DAYS = 20

/** Vai profils vēl ir tik jauns, ka to vērts izcelt. */
export function isNewProfile(
  createdAt: string,
  now: number = Date.now()
): boolean {
  const age = now - new Date(createdAt).getTime()
  return age < NEW_PROFILE_DAYS * 24 * 60 * 60 * 1000
}

/**
 * Neitrālā kārtība, kad cilvēks kārtošanu nav izvēlējies.
 *
 * Kaut kādā secībā saraksts jāsakārto vienalga, un jebkura pastāvīga
 * secība kādu pieceļ un kādu apraka uz visiem laikiem. Tāpēc secība
 * mainās reizi diennaktī: vienas dienas laikā tā ir nemainīga (lapa
 * pārlādējas — izskatās tāpat), bet nākamajā dienā augšā ir citi.
 * Neviens neapmetas uz pirmās rindas tāpēc, ka tur reiz iekļuva.
 */
function dailyOrderKey(id: string, now: number): number {
  const day = Math.floor(now / 86_400_000)

  // FNV-1a pār id, tad diena iejaukta un izmaisīta. Diena jāsamaisa,
  // nevis jāpieskaita: pieskaitīta tā visiem id-iem mainītos vienādi,
  // un secība paliktu tā pati mūžīgi.
  let hash = 2166136261
  for (let i = 0; i < id.length; i += 1) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 16777619)
  }
  hash = Math.imul(hash ^ day, 2246822507)
  hash ^= hash >>> 13

  return hash >>> 0
}

/**
 * Fona profili vienmēr pēdējie, lai kā saraksts būtu sakārtots.
 *
 * Tie ir mūsu pašu profili, likti iekšā, lai tukša vietne neizskatītos
 * pamesta. Meklētājam tie nav piedāvājumi, un vieta augšā pienākas tiem,
 * kas tiešām gaida klientus. Tāpēc tas ir ārējais slānis pār katru
 * kārtošanu, ne viens gadījums vienā no tām.
 */
function backgroundLast(
  compare: (a: CoachCardData, b: CoachCardData) => number
): (a: CoachCardData, b: CoachCardData) => number {
  return (a, b) => {
    if (a.is_background !== b.is_background) return a.is_background ? 1 : -1
    return compare(a, b)
  }
}

export function sortCoaches(
  coaches: CoachCardData[],
  sort: SortKey,
  now: number = Date.now()
): CoachCardData[] {
  const list = [...coaches]

  if (sort === 'none') {
    /*
     * Neizvēlētā kārtībā jaunie iet pa priekšu. Tā ir vienīgā vieta, kur
     * cilvēks neko nav lūdzis, un tieši tur jaunam profilam ir vienīgā
     * iespēja tikt pamanītam.
     */
    return list.sort(
      backgroundLast((a, b) => {
        const newA = isNewProfile(a.created_at, now)
        const newB = isNewProfile(b.created_at, now)
        if (newA !== newB) return newA ? -1 : 1

        const diff = dailyOrderKey(a.id, now) - dailyOrderKey(b.id, now)
        // id kā rezerve, lai vienādas atslēgas nedotu nejaušu secību
        return diff !== 0 ? diff : a.id.localeCompare(b.id)
      })
    )
  }

  if (sort === 'newest') {
    return list.sort(
      backgroundLast(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    )
  }

  if (sort === 'rated') {
    return list.sort(
      backgroundLast((a, b) => {
        // Bez atsauksmēm reitinga nav — tie iet uz beigām, ne uz augšu
        const scoreA = a.avg_rating === null ? -1 : a.avg_rating
        const scoreB = b.avg_rating === null ? -1 : b.avg_rating
        if (scoreB !== scoreA) return scoreB - scoreA
        return b.review_count - a.review_count
      })
    )
  }

  return list.sort(
    backgroundLast((a, b) => {
      const newA = isNewProfile(a.created_at, now)
      const newB = isNewProfile(b.created_at, now)
      if (newA !== newB) return newA ? -1 : 1
      if (b.profile_views !== a.profile_views) {
        return b.profile_views - a.profile_views
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  )
}

/**
 * Profila meta apraksta saturīgā daļa — tagline plus līdz divas nozares
 * un pilsēta, apgriezta, lai ietilptu Google rādāmajā garumā.
 *
 * Agrāk šī vieta bija viens un tas pats teikums desmit no vienpadsmit
 * profiliem — tikai kvalifikācijas statuss mainījās, tagline un nozare
 * netika lietoti vispār. Meta apraksts ir "vitrīna" Google rezultātos;
 * desmit gandrīz identiski teikumi izskatās pēc automātiski ģenerēta,
 * mazvērtīga satura un nesatur nevienu atslēgvārdu.
 *
 * maxLength ir budžets šai daļai vien — saucējs vēl pieliek "{vārds} — "
 * priekšā un CTA teikumu aiz tās.
 *
 * Rezultāts nekad nebeidzas ar pieturzīmi: veidne aiz tā pati liek
 * punktu. Bez šī tagline, kas beidzās ar punktu, deva "..pielietojumu.."
 * un apgriezta — "…." pirms CTA.
 */
export function assembleProfileDetails({
  tagline,
  niches,
  categoryNames,
  city,
  maxLength,
}: {
  tagline: string
  niches: string[]
  categoryNames: Record<string, string>
  city: string | null
  maxLength: number
}): string {
  const trimEnd = (text: string) => text.replace(/[\s.…!?,;:–—-]+$/u, '')
  const base = trimEnd(tagline)

  const nicheLabels = niches
    .map((slug) => categoryNames[slug])
    .filter((label): label is string => Boolean(label))
    .slice(0, 2)

  const withNichesAndCity = [nicheLabels.join(', '), city]
    .filter(Boolean)
    .join(', ')
  const withNichesOnly = nicheLabels.join(', ')

  // Mēģinām no bagātākā uz vienkāršāko, līdz kāds variants ietilpst
  for (const extra of [withNichesAndCity, withNichesOnly, '']) {
    const details = extra ? `${base}. ${extra}` : base
    if (details.length <= maxLength) return details
  }

  // Pat pati tagline nesatilpst — apgriežam pa vārdu robežu. Bez "…":
  // veidne aiz tā tāpat pieliek punktu, un "…." izskatās pēc kļūdas.
  return trimEnd(base.slice(0, maxLength).replace(/\s+\S*$/, ''))
}
