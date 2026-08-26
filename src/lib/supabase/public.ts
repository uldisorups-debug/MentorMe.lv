import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config'

/**
 * Klients publiskiem datiem — bez sesijas un bez cookies.
 *
 * Tas ir būtiski: `server.ts` klients pieskaras cookies(), un tas padara
 * lapu dinamisku. Šis to nedara, tāpēc saraksta lapas var kešot ar ISR
 * un datubāze netiek aiztikta katrā apmeklējumā.
 *
 * Redz tikai to, ko atļauj RLS anonīmajam lietotājam — publicētos kouču
 * profilus, redzamās atsauksmes un kategorijas.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
