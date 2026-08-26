import { NextResponse } from 'next/server'
import { safeNext } from '@/lib/safe-next'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase OAuth atgriešanās punkts.
 *
 * Apmaina kodu pret sesiju un ved atpakaļ turp, kur cilvēks bija.
 * Lomu neprasām: kas ienāk, lai izliktu profilu, kļūst par kouču tajā
 * brīdī, kad profilu izveido. Kas ienāk atsauksmes dēļ, paliek klients.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('Koda apmaiņa neizdevās:', error?.message)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  // Vercel aiz proxy — x-forwarded-host ir īstais domēns
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isDev = process.env.NODE_ENV === 'development'
  const base = isDev || !forwardedHost ? origin : `https://${forwardedHost}`

  return NextResponse.redirect(new URL(next, base).toString())
}
