import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { safeNext } from '@/lib/safe-next'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase atgriešanās punkts — gan Google, gan e-pasta saitei.
 *
 * Apmaina kodu pret sesiju un ved atpakaļ turp, kur cilvēks bija.
 * Lomu neprasām: kas ienāk, lai izliktu profilu, kļūst par kouču tajā
 * brīdī, kad profilu izveido. Kas ienāk atsauksmes dēļ, paliek klients.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // E-pasta saite atkarībā no vēstules veidnes atnāk vai nu ar kodu,
  // vai ar token_hash. Pieņemam abus, lai veidnes maiņa neko nesalauž.
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNext(searchParams.get('next'))

  const supabase = await createClient()

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { data: { user: null }, error: null }

  if (error || !data.user) {
    console.error('Pieteikšanās neizdevās:', error?.message)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  // Vercel aiz proxy — x-forwarded-host ir īstais domēns
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isDev = process.env.NODE_ENV === 'development'
  const base = isDev || !forwardedHost ? origin : `https://${forwardedHost}`

  return NextResponse.redirect(new URL(next, base).toString())
}
