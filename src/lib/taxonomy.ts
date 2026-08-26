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
  const { data } = await supabase.from('categories').select(`slug, name_lv, ${column}`)
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
  const { data } = await supabase
    .from('regions')
    .select(`name_lv, ${column}`)
    .eq('slug', slug)
    .maybeSingle()
  if (!data) return null
  return (
    ((data as Record<string, unknown>)[column] as string | null) ||
    (data.name_lv as string)
  )
}
