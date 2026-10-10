/**
 * Kuras adreses rāda šo profilu — tīrā daļa, bez Next.js un datubāzes,
 * lai to var pārbaudīt testos.
 */

/** Tikai drošas slug vērtības — tās nāk arī no pārlūka. */
const SAFE = /^[\p{L}\p{N}-]{1,80}$/u

export function profilePaths(
  footprints: { slug: string; niches: string[]; region_slug: string | null }[],
  spheres: string[]
): string[] {
  const paths = new Set<string>(['/'])
  for (const f of footprints) {
    if (SAFE.test(f.slug)) paths.add(`/${f.slug}`)
    for (const niche of f.niches) {
      if (SAFE.test(niche)) paths.add(`/tema/${niche}`)
    }
    if (f.region_slug && SAFE.test(f.region_slug)) {
      paths.add(`/vieta/${f.region_slug}`)
    }
  }
  for (const sphere of spheres) {
    if (SAFE.test(sphere)) paths.add(`/nozare/${sphere}`)
  }
  return [...paths]
}

/** Pārlūka atsūtītais iepriekšējais stāvoklis — nepārbaudīts, tāpēc šauri. */
export function parsePrevious(value: unknown):
  | { slug: string; niches: string[]; region_slug: string | null }
  | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  if (typeof v.slug !== 'string') return null
  const niches = Array.isArray(v.niches)
    ? v.niches.filter((n): n is string => typeof n === 'string').slice(0, 10)
    : []
  const region = typeof v.region_slug === 'string' ? v.region_slug : null
  return { slug: v.slug, niches, region_slug: region }
}
