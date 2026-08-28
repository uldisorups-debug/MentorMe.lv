import { nameColumn } from '@/i18n/routing'
import { createPublicClient } from '@/lib/supabase/public'

export type TaxonomyOption = { value: string; label: string }
export type SphereOption = TaxonomyOption & { icon: string | null }
export type GroupOption = TaxonomyOption & { sphere: string }

/**
 * Sfēras, grupas un reģioni izvēlētajā valodā.
 *
 * Nosaukumi datubāzē glabājas trīs kolonnās (name_lv/en/ru), tāpēc
 * tulkojums nav messages failos — tas nāk līdzi datiem. Ja krievu
 * nosaukums kādreiz iztrūktu, atkāpjamies uz latvisko, nevis rādām tukšu.
 */
export async function loadTaxonomy(locale: string) {
  const supabase = createPublicClient()
  const column = nameColumn(locale)

  const [spheres, groups, regions] = await Promise.all([
    supabase.from('spheres').select(`slug, icon, name_lv, ${column}`).order('sort_order'),
    supabase.from('categories').select(`slug, sphere_slug, name_lv, ${column}`).order('sort_order'),
    supabase.from('regions').select(`slug, name_lv, ${column}`).order('sort_order'),
  ])

  /*
   * Bez šī tukši filtri izskatītos tieši tāpat kā nesekmīgs vaicājums:
   * lapa uzrādītos ar nulli nozarēm, un neviena pazīme neliecinātu,
   * ka kaut kas nogāja greizi.
   */
  for (const [name, result] of [
    ['nozares', spheres],
    ['tēmas', groups],
    ['reģioni', regions],
  ] as const) {
    if (result.error) {
      console.error(`Taksonomija — neizdevās ielādēt ${name}:`, result.error.message)
    }
  }

  const pick = (row: Record<string, unknown>) =>
    (row[column] as string | null) || (row.name_lv as string)

  return {
    spheres: (spheres.data ?? []).map((row) => ({
      value: row.slug as string,
      label: pick(row),
      icon: (row.icon as string | null) ?? null,
    })) as SphereOption[],
    groups: (groups.data ?? []).map((row) => ({
      value: row.slug as string,
      label: pick(row),
      sphere: row.sphere_slug as string,
    })) as GroupOption[],
    regions: (regions.data ?? []).map((row) => ({
      value: row.slug as string,
      label: pick(row),
    })) as TaxonomyOption[],
  }
}

/** Tikai grupu nosaukumi — profila lapai, kur filtru nevajag. */
export async function loadGroupNames(locale: string): Promise<Record<string, string>> {
  const supabase = createPublicClient()
  const column = nameColumn(locale)
  const { data, error } = await supabase
    .from('categories')
    .select(`slug, name_lv, ${column}`)
  if (error) console.error('Neizdevās ielādēt tēmu nosaukumus:', error.message)
  return Object.fromEntries(
    (data ?? []).map((row) => [
      row.slug as string,
      ((row as Record<string, unknown>)[column] as string | null) || (row.name_lv as string),
    ])
  )
}

export async function loadRegionName(
  slug: string | null,
  locale: string
): Promise<string | null> {
  if (!slug) return null
  const supabase = createPublicClient()
  const column = nameColumn(locale)
  const { data, error } = await supabase
    .from('regions')
    .select(`name_lv, ${column}`)
    .eq('slug', slug)
    .maybeSingle()
  if (error) console.error('Neizdevās ielādēt reģiona nosaukumu:', error.message)
  if (!data) return null
  return (
    ((data as Record<string, unknown>)[column] as string | null) ||
    (data.name_lv as string)
  )
}

/**
 * Nozares, kurās ietilpst konkrētās prasmes — profila lapai.
 *
 * Nozare ir pirmais filtrs sarakstā, bet profilā tā līdz šim neparādījās:
 * tur bija tikai tēmas. Cilvēks nevarēja saprast, kāpēc viņu atrada.
 * Divi vaicājumi, nevis viens ar savienojumu — categories un spheres
 * saite database.ts nav deklarēta, un PostgREST bez tās krīt.
 */
export async function loadSphereNames(
  niches: string[],
  locale: string
): Promise<SphereOption[]> {
  if (niches.length === 0) return []

  const supabase = createPublicClient()
  const column = nameColumn(locale)

  const { data: cats, error: catsError } = await supabase
    .from('categories')
    .select('sphere_slug')
    .in('slug', niches)

  if (catsError) {
    console.error('Neizdevās noteikt nozares:', catsError.message)
    return []
  }

  const slugs = [...new Set((cats ?? []).map((row) => row.sphere_slug))]
  if (slugs.length === 0) return []

  const { data, error } = await supabase
    .from('spheres')
    .select(`slug, icon, name_lv, ${column}`)
    .in('slug', slugs)
    .order('sort_order')

  if (error) console.error('Neizdevās ielādēt nozaru nosaukumus:', error.message)

  return (data ?? []).map((row) => ({
    value: row.slug as string,
    label:
      ((row as Record<string, unknown>)[column] as string | null) ||
      (row.name_lv as string),
    icon: (row.icon as string | null) ?? null,
  }))
}
