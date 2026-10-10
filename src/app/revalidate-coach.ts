'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateProfile } from '@/lib/revalidate'

/**
 * Liek pārbūvēt profila lapas pēc atsauksmes.
 *
 * Profila lapa ir ISR ar 60 sekunžu logu. Bez šī cilvēks atstāj
 * atsauksmi, lapa pārlādējas — un viņš joprojām redz veco versiju bez
 * savām zvaigznēm. Tas izskatās, it kā nekas nebūtu saglabājies.
 */
export async function refreshAfterReview(coachId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Atsauksmi var atstāt tikai ielogotais — tas pats attiecas uz šo
  if (!user) return

  // Tikai šī profila lapas — reitings mainās viņa lapā un kartītēs
  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('slug, niches, region_slug')
    .eq('id', coachId)
    .maybeSingle()
  if (coach) await revalidateProfile(coach)
}
