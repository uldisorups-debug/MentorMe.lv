'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SaveSiteCodeResult = { ok: true } | { ok: false; error: string }

/** Tie paši griesti, kas datubāzē — kļūda te ir saprotamāka. */
const MAX_LENGTH = 20000

/**
 * Saglabā <head> un <body> kodu un atsvaidzina visas lapas.
 *
 * Kods dzīvo izkārtojumā, tātad katras lapas kešotajā versijā — bez
 * atsvaidzināšanas jaunais kods parādītos tikai pēc dienas.
 */
export async function saveSiteCode(input: {
  head: string
  body: string
  needsConsent: boolean
}): Promise<SaveSiteCodeResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sesija beigusies. Ienāc no jauna.' }

  const { data: me } = await supabase
    .from('profiles')
    .select('is_admin, display_name')
    .eq('id', user.id)
    .maybeSingle()
  if (!me?.is_admin) return { ok: false, error: 'Nav tiesību.' }

  const head = input.head.trim()
  const body = input.body.trim()
  if (head.length > MAX_LENGTH || body.length > MAX_LENGTH) {
    return { ok: false, error: `Katrā laukā ne vairāk par ${MAX_LENGTH} rakstzīmēm.` }
  }

  const { error } = await supabase
    .from('site_code')
    .update({
      head_html: head,
      body_html: body,
      needs_consent: input.needsConsent,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', 1)
  if (error) return { ok: false, error: error.message }

  // Žurnāls ir blakusefekts — ja neizdodas, saglabāšana tik un tā notikusi
  const { error: logError } = await supabase.from('admin_actions').insert({
    admin_id: user.id,
    admin_name: me.display_name ?? null,
    action: 'update_site_code',
    target_table: 'site_code',
    target_id: null,
    target_label: 'Vietnes kods',
    reason: null,
  })
  if (logError) console.error('Žurnāla ieraksts neizdevās:', logError.message)

  revalidatePath('/', 'layout')
  return { ok: true }
}
