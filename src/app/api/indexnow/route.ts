import { NextResponse } from 'next/server'
import sitemap from '@/app/sitemap'
import { createClient } from '@/lib/supabase/server'
import { submitToIndexNow } from '@/lib/indexnow'

/**
 * Paziņo IndexNow visas sitemap adreses vienā reizē.
 *
 * Profilus un rakstus redaktors paziņo pats, saglabājot. Bet raksti,
 * kas ievietoti tieši datubāzē, tēmu lapas un viss, kas mainījies pa
 * izvietošanām, līdz šim gaidīja, kad Bing pats atnāks pa sitemap. Ar
 * šo administrators var paziņot visu uzreiz. No Bing indeksa strādā
 * arī ChatGPT meklēšana un Copilot.
 *
 * Tikai administratoram: citādi jebkurš varētu likt mūsu vārdā sūtīt
 * pieprasījumus ārējam servisam.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile?.is_admin) return NextResponse.json({ ok: false }, { status: 403 })

  const entries = await sitemap()
  const result = await submitToIndexNow(entries.map((entry) => entry.url))

  const accepted = result.status === 200 || result.status === 202
  return NextResponse.json({ ok: accepted, ...result })
}
