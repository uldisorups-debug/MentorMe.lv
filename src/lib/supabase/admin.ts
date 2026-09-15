import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { SUPABASE_URL } from './config'

/**
 * Klients ar servisa atslēgu — iet garām RLS un drīkst veidot kontus.
 *
 * Šis ir vienīgais klients lapā, kas nevienam neprasa atļauju. Tāpēc
 * divi noteikumi.
 *
 * Pirmais: atslēgu lasām funkcijas iekšienē, ne faila augšā. config.ts
 * ievelk arī pārlūks, un jebkurš mainīgais bez NEXT_PUBLIC_ prefiksa
 * tur ir tukšs — moduļa līmeņa pārbaude sabruktu klientā, kaut tur šo
 * failu neviens nesauc.
 *
 * Otrais: to drīkst izsaukt tikai pēc tam, kad jau ir pārbaudīts, ka
 * cilvēks ir administrators. Pati atslēga to nepārbauda ne par gramu.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY

  if (!key) {
    throw new Error(
      'Trūkst SUPABASE_SECRET_KEY. Bez tās uzaicinājumus izsūtīt nevar.'
    )
  }

  return createSupabaseClient<Database>(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
