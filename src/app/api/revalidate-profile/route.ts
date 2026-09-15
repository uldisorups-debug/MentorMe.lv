import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidateProfilePages } from '@/lib/revalidate'

/**
 * Publisko lapu atsvaidzināšana pēc profila saglabāšanas.
 *
 * Profila lapa un saraksts ir statiski ar ISR — bez šī izmaiņas
 * parādītos tikai pēc minūtes, un cilvēks, kurš tikko saglabāja un
 * uzreiz atvēra savu publisko profilu, redzētu veco versiju un domātu,
 * ka saglabāšana neizdevās.
 *
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  /*
   * Tikai tam, kam profils tiešām ir, vai administratoram. Citādi šis
   * būtu veids, kā svešs varētu bez apstājas likt serverim pārbūvēt lapas.
   *
   * Administrators te ir ar nolūku: kad viņš profilu publicē vai noņem,
   * saraksts jāatjauno tieši tāpat. Bez tā angļu un krievu versija
   * palika ar veco skaitu, līdz kāds tās atvēra — un tās atver reti.
   */
  const [{ data: coach }, { data: profile }] = await Promise.all([
    supabase.from('coach_profiles').select('slug').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle(),
  ])

  if (!coach && !profile?.is_admin) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  revalidateProfilePages()

  return NextResponse.json({ ok: true, slug: coach?.slug ?? null })
}
