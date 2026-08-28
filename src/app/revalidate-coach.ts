'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateProfilePages } from '@/lib/revalidate'

/**
 * Liek pārbūvēt profila lapas pēc atsauksmes.
 *
 * Profila lapa ir ISR ar 60 sekunžu logu. Bez šī cilvēks atstāj
 * atsauksmi, lapa pārlādējas — un viņš joprojām redz veco versiju bez
 * savām zvaigznēm. Tas izskatās, it kā nekas nebūtu saglabājies.
 */
export async function refreshAfterReview(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Atsauksmi var atstāt tikai ielogotais — tas pats attiecas uz šo
  if (!user) return

  revalidateProfilePages()
}
