import { NextResponse } from 'next/server'
import { safeNext } from '@/lib/safe-next'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase OAuth atgriešanās punkts.
 *
 * Šeit apmaina koda parametru pret sesiju un izlemj, kur cilvēku sūtīt:
 * ja loma vēl nav izvēlēta — uz onboarding, citādi turp, kur viņš gribēja.
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarded_at')
    .eq('id', data.user.id)
    .maybeSingle()

  // Vercel aiz proxy — x-forwarded-host ir īstais domēns
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isDev = process.env.NODE_ENV === 'development'
  const base = isDev || !forwardedHost ? origin : `https://${forwardedHost}`

  if (!profile?.onboarded_at) {
    const onboarding = new URL('/auth/onboarding', base)
    onboarding.searchParams.set('next', next)
    return NextResponse.redirect(onboarding.toString())
  }

  // Koučus sūtām uz viņu profilu, ja vien viņi negāja kaut kur konkrēti
  const target =
    profile.role === 'coach' && next === '/' ? '/dashboard/profile' : next

  return NextResponse.redirect(new URL(target, base).toString())
}
