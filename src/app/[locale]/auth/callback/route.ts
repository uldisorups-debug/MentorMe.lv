import { NextResponse } from 'next/server'
import { isAuthPKCECodeVerifierMissingError, type EmailOtpType } from '@supabase/supabase-js'
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

  /*
   * Reģistrācijas saite atvērta citā pārlūkā, nekā reģistrācija sākta.
   *
   * Telefonā tas ir parasts: cilvēks reģistrējas LinkedIn vai Facebook
   * lietotnes iekšējā pārlūkā, bet saite no Gmail atveras Safari.
   * Drošības "atslēga" (PKCE) glabājas pirmajā pārlūkā, tāpēc otrajā
   * sesiju izveidot nevar — bet Supabase e-pastu jau ir apstiprinājis.
   * Agrāk cilvēks redzēja "Pieteikšanās neizdevās" un domāja, ka
   * reģistrācija nav notikusi. Tagad — pieteikšanās lapa ar ziņu, ka
   * adrese apstiprināta, un atliek ienākt ar paroli.
   *
   * Tikai reģistrācijas saitei (flow=signup): paroles atjaunošanai vai
   * Google/LinkedIn šāds paziņojums būtu nepatiess.
   */
  if (
    error &&
    isAuthPKCECodeVerifierMissingError(error) &&
    searchParams.get('flow') === 'signup'
  ) {
    const login = new URL('/auth/login', origin)
    login.searchParams.set('confirmed', '1')
    login.searchParams.set('next', next)
    return NextResponse.redirect(login.toString())
  }

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
