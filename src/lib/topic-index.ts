import type { CoachCardData } from '@/lib/coaches'

/**
 * Tēmu, nozaru un vietu lapas — tīrā daļa, bez datubāzes.
 *
 * Katra tēma, nozare un reģions, kurā ir vismaz viens publicēts profils,
 * saņem savu adresi: /tema/biznesa-..., /nozare/koucings, /vieta/riga.
 * Tā no 21 profila top ap simts indeksējamu lapu, katra ar savu
 * virsrakstu un atslēgvārdiem ("Biznesa koučings — mentori un kouči"),
 * un visas savā starpā sasaistītas. Google šādu tīklu atrod un saprot
 * daudz labāk nekā vienu sākumlapu ar filtriem, kas strādā tikai pārlūkā.
 *
 * Tukšām tēmām lapas nav apzināti: lapa bez neviena profila ir tieši tas
 * "plānais saturs", ko Google atzīmē kā "Crawled — currently not indexed".
 */

export type TopicKind = 'tema' | 'nozare' | 'vieta'

export type TopicEntry = {
  kind: TopicKind
  slug: string
  label: string
  count: number
  /** Tēmai — nozare, kurā tā ietilpst */
  sphere?: string
}

export type TopicIndex = {
  spheres: TopicEntry[]
  groups: TopicEntry[]
  regions: TopicEntry[]
}

type Option = { value: string; label: string }

export type TopicTaxonomy = {
  spheres: Option[]
  groups: (Option & { sphere: string })[]
  regions: Option[]
}

/** "Cits" ir atkritne, ne joma — tai lapa nav vajadzīga */
const EXCLUDED = new Set(['cits', 'cits-prasme'])

export function topicPath(kind: TopicKind, slug: string): string {
  return `/${kind}/${slug}`
}

/** Vai profils pieder šai tēmai, nozarei vai vietai. */
export function coachMatches(
  coach: Pick<CoachCardData, 'niches' | 'region_slug'>,
  kind: TopicKind,
  slug: string,
  nicheToSphere: Record<string, string>
): boolean {
  if (kind === 'tema') return coach.niches.includes(slug)
  if (kind === 'nozare') return coach.niches.some((n) => nicheToSphere[n] === slug)
  return coach.region_slug === slug
}

export function nicheToSphereMap(taxonomy: TopicTaxonomy): Record<string, string> {
  return Object.fromEntries(taxonomy.groups.map((g) => [g.value, g.sphere]))
}

/**
 * Visas tēmas ar vismaz vienu profilu un to skaitu.
 * Secība — taksonomijas secība, ne skaits: tā saites nelec, kad kāds
 * profils pievienojas.
 */
export function buildTopicIndex(
  coaches: Pick<CoachCardData, 'niches' | 'region_slug'>[],
  taxonomy: TopicTaxonomy
): TopicIndex {
  const nicheToSphere = nicheToSphereMap(taxonomy)

  const count = (kind: TopicKind, slug: string) =>
    coaches.filter((c) => coachMatches(c, kind, slug, nicheToSphere)).length

  const build = (
    kind: TopicKind,
    options: (Option & { sphere?: string })[]
  ): TopicEntry[] =>
    options
      .filter((o) => !EXCLUDED.has(o.value))
      .map((o) => ({
        kind,
        slug: o.value,
        label: o.label,
        count: count(kind, o.value),
        ...(o.sphere ? { sphere: o.sphere } : {}),
      }))
      .filter((e) => e.count > 0)

  return {
    spheres: build('nozare', taxonomy.spheres),
    groups: build('tema', taxonomy.groups),
    regions: build('vieta', taxonomy.regions),
  }
}

export function findTopic(
  index: TopicIndex,
  kind: TopicKind,
  slug: string
): TopicEntry | null {
  const list =
    kind === 'tema' ? index.groups : kind === 'nozare' ? index.spheres : index.regions
  return list.find((e) => e.slug === slug) ?? null
}

/**
 * Tēmas, kas sastopamas šīs lapas profilos — "Saistītās tēmas".
 *
 * Tieši tas veido tīklu: no "Biznesa koučings" uz "Finanses", no
 * turienes uz "Grāmatvedība" un tā tālāk. Katru lapu var sasniegt pa
 * saitēm, un katrai ir vairāki ienākoši ceļi, ne tikai sitemap.
 */
export function relatedTopics(
  coaches: Pick<CoachCardData, 'niches'>[],
  index: TopicIndex,
  exclude: string,
  limit = 12
): TopicEntry[] {
  const seen = new Map<string, number>()
  for (const coach of coaches) {
    for (const niche of coach.niches) {
      if (niche === exclude) continue
      seen.set(niche, (seen.get(niche) ?? 0) + 1)
    }
  }
  return index.groups
    .filter((g) => seen.has(g.slug))
    .sort((a, b) => (seen.get(b.slug) ?? 0) - (seen.get(a.slug) ?? 0))
    .slice(0, limit)
}

/**
 * Līdzīgi profili profila lapā — pēc kopīgām tēmām, tad nozarēm, tad vietas.
 *
 * Profils bez saitēm uz citiem ir strupceļš: Google tajā ienāk un tālāk
 * neiet. Ar šo katrs profils sasaista vēl dažus, un jauns profils tiek
 * atrasts caur jau indeksētajiem, negaidot sitemap.
 */
export function similarCoaches<T extends CoachCardData>(
  coach: Pick<CoachCardData, 'id' | 'niches' | 'region_slug'>,
  all: T[],
  nicheToSphere: Record<string, string>,
  limit = 6
): T[] {
  const spheres = new Set(coach.niches.map((n) => nicheToSphere[n]).filter(Boolean))

  const score = (other: T) => {
    const sharedNiches = other.niches.filter((n) => coach.niches.includes(n)).length
    const sharedSpheres = new Set(
      other.niches.map((n) => nicheToSphere[n]).filter((s) => s && spheres.has(s))
    ).size
    const sameRegion =
      coach.region_slug !== null && other.region_slug === coach.region_slug ? 1 : 0
    return sharedNiches * 4 + sharedSpheres * 2 + sameRegion
  }

  return all
    .filter((other) => other.id !== coach.id)
    .map((other) => ({ other, s: score(other) }))
    .sort((a, b) => {
      if (a.other.is_background !== b.other.is_background) {
        return a.other.is_background ? 1 : -1
      }
      if (b.s !== a.s) return b.s - a.s
      return a.other.id.localeCompare(b.other.id)
    })
    .slice(0, limit)
    .map(({ other }) => other)
}

/** Next.js parametrs var nākt gan kodēts, gan ne ("val-angļu"). */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}
