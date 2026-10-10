import { revalidatePath } from 'next/cache'
import { routing } from '@/i18n/routing'
import { createPublicClient } from '@/lib/supabase/public'
import { profilePaths } from '@/lib/revalidate-paths'

/**
 * Pārbūvē visas publiskās lapas: sarakstu, profilus, blogu un sitemap.
 *
 * Plašais variants — tikai tur, kur nav zināms, ko tieši izmaiņa skar
 * (piem., administrators apstiprina jaunu tēmu). Profila, atsauksmes un
 * raksta gadījumā lieto mērķēto revalidateProfile / revalidatePost.
 */
export function revalidatePublicPages(): void {
  /*
   * '/' + 'layout' — viss zem saknes izkārtojuma. Atsevišķi ceļi
   * ('/[locale]', 'page') neatbilda sākumlapai, jo tā dzīvo maršruta
   * grupā (marketing), un Next.js grupu prasa ceļā.
   */
  revalidatePath('/', 'layout')
}

/**
 * Konkrētas adreses visās valodās.
 *
 * next-intl starpslānis /vards pārraksta uz /lv/vards, tāpēc kešs glabājas
 * zem /lv/..., /en/..., /ru/... — tieši tos te arī atsvaidzinām.
 */
function revalidateEverywhere(paths: string[]): void {
  for (const locale of routing.locales) {
    for (const path of paths) {
      revalidatePath(`/${locale}${path === '/' ? '' : path}`)
    }
  }
  revalidatePath('/sitemap.xml')
}

export type ProfileFootprint = {
  slug: string
  niches: string[]
  region_slug: string | null
}

/**
 * Tikai tās lapas, kurās šis profils parādās: viņa paša lapa, sākumlapa
 * un viņa tēmu, nozaru un vietas lapas.
 *
 * Agrāk katra profila saglabāšana (arī melnraksta) atsvaidzināja visas
 * ~250 lapas trijās valodās, un katra no tām, ko pēc tam atvēra robots,
 * bija ISR ieraksts Vercel. Tā tika iztērēts mēneša limits. Tagad
 * tipiski ~10 lapas.
 *
 * Citu profilu "Līdzīgi profili" bloks netiek atsvaidzināts — tas
 * atjaunojas pats dienas laikā, un tas ir pieņemams.
 */
export async function revalidateProfile(
  ...footprints: ProfileFootprint[]
): Promise<void> {
  const niches = [...new Set(footprints.flatMap((f) => f.niches))]

  let spheres: string[] = []
  if (niches.length > 0) {
    const { data, error } = await createPublicClient()
      .from('categories')
      .select('sphere_slug')
      .in('slug', niches)
    if (error) {
      // Nezinām nozares — labāk atsvaidzināt visu nekā atstāt vecu
      console.error('Nozares atsvaidzināšanai:', error.message)
      revalidatePublicPages()
      return
    }
    spheres = [...new Set((data ?? []).map((row) => row.sphere_slug))]
  }

  revalidateEverywhere(profilePaths(footprints, spheres))
}

/** Raksts: blogs un pats raksts. */
export function revalidatePost(slug: string): void {
  revalidateEverywhere(['/blog', `/blog/${slug}`])
}
