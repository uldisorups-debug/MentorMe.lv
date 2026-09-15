'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/supabase/config'

export type InviteResult =
  | { ok: true; name: string; email: string }
  | { ok: false; error: string }

/** Tie paši griesti, kas datubāzes pārbaudēs — kļūda te ir saprotamāka. */
const LIMITS = { name: 80, tagline: 120, city: 80 } as const

function field(form: FormData, key: string): string {
  const value = form.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Uzaicina cilvēku un uzreiz izveido viņam profilu.
 *
 * Kāpēc caur uzaicinājumu, nevis vienkārši ierakstu datubāzē: profils
 * bez konta ir profils, ko tas cilvēks nekad nevar ne labot, ne noņemt.
 * Šeit viņam vispirms rodas konts, un profils no pirmās sekundes pieder
 * viņam, nevis mums.
 *
 * Un tāpēc arī is_published paliek false. Mēs ievadām datus par svešu
 * cilvēku; publisks tas kļūst tikai tad, kad viņš pats atver un nospiež
 * publicēt. Citādi tā būtu svešu datu publicēšana bez ziņas — tieši tas,
 * ko neviens negrib ne saņemt, ne skaidrot.
 */
export async function inviteCoach(form: FormData): Promise<InviteResult> {
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

  // ---- ievade ----
  const email = field(form, 'email').toLowerCase()
  const fullName = field(form, 'full_name')
  const tagline = field(form, 'tagline')
  const city = field(form, 'city')

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: 'E-pasta adrese neizskatās pareiza.' }
  }
  if (fullName.length < 2 || fullName.length > LIMITS.name) {
    return { ok: false, error: `Vārdam jābūt no 2 līdz ${LIMITS.name} rakstzīmēm.` }
  }
  if (tagline.length > LIMITS.tagline) {
    return { ok: false, error: `Īsais apraksts nedrīkst pārsniegt ${LIMITS.tagline} rakstzīmes.` }
  }
  if (city.length > LIMITS.city) {
    return { ok: false, error: `Pilsētas nosaukums nedrīkst pārsniegt ${LIMITS.city} rakstzīmes.` }
  }

  const admin = createAdminClient()

  /*
   * Saite ved uz paroles uzstādīšanu, ne uzreiz uz profilu. Uzaicinātam
   * kontam paroles vēl nav, un bez tās cilvēks otrreiz iekšā vairs
   * netiktu — viņam katru reizi būtu jālūdz jauna vēstule.
   */
  const next = encodeURIComponent('/auth/jauna-parole?next=/dashboard/profile')
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${SITE_URL}/auth/callback?next=${next}`,
    })

  if (inviteError || !invited?.user) {
    const message = inviteError?.message ?? ''
    console.error('Uzaicinājums neizdevās:', message)

    if (/already been registered|already exists|already registered/i.test(message)) {
      return {
        ok: false,
        error: `${email} jau ir reģistrēts. Šis cilvēks profilu var izveidot pats — nosūti viņam parasto saiti uz mentorme.lv.`,
      }
    }
    return { ok: false, error: `Vēstuli nosūtīt neizdevās: ${message}` }
  }

  // ---- profils ----
  const { error: profileError } = await admin.from('coach_profiles').insert({
    user_id: invited.user.id,
    full_name: fullName,
    tagline: tagline || null,
    city: city || null,
    is_published: false,
  })

  if (profileError) {
    /*
     * Profils neizdevās, bet konts jau ir. Ja to atstātu, cilvēks
     * saņemtu vēstuli, ienāktu un atrastu tukšumu. Tāpēc ņemam nost —
     * tas ir tikko izveidots konts, tur nekā sava vēl nav.
     */
    await admin.auth.admin.deleteUser(invited.user.id)
    console.error('Profila izveide neizdevās:', profileError.message)
    return { ok: false, error: `Profilu izveidot neizdevās: ${profileError.message}` }
  }

  // Loma seko profilam: cilvēkam ar coach_profiles rindu tā ir 'coach'
  await admin.from('profiles').update({ role: 'coach' }).eq('id', invited.user.id)

  await supabase.from('admin_actions').insert({
    admin_id: user.id,
    admin_name: me.display_name,
    action: 'invite_coach',
    target_table: 'coach_profiles',
    target_id: invited.user.id,
    target_label: fullName,
    reason: email,
  })

  revalidatePath('/[locale]/admin/uzaicinajumi', 'page')
  revalidatePath('/[locale]/admin/profili', 'page')

  return { ok: true, name: fullName, email }
}
