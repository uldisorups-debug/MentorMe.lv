import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Publisko lapu atsvaidzināšana pēc profila saglabāšanas.
 *
 * Profila lapa un saraksts ir statiski ar ISR — bez šī izmaiņas
 * parādītos tikai pēc minūtes, un cilvēks, kurš tikko saglabāja un
 * uzreiz atvēra savu publisko profilu, redzētu veco versiju un domātu,
 * ka saglabāšana neizdevās.
 *
 * Atsvaidzinām maršrutu, ne konkrētu adresi: ar next-intl viena lapa
 * dzīvo trijās adresēs (/profils/..., /en/profils/..., /ru/...), un
 * uzminēt tās visas ir vairāk vietu, kur kļūdīties.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // Tikai tam, kam profils tiešām ir — citādi šis būtu veids, kā svešs
  // varētu bez apstājas likt serverim pārbūvēt lapas
  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('slug')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!coach) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  revalidatePath('/[locale]/profils/[slug]', 'page')
  revalidatePath('/[locale]', 'page')

  return NextResponse.json({ ok: true, slug: coach.slug })
}
