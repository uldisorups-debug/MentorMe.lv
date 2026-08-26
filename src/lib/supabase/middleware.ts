import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config'

/** Ceļi, kuros bez sesijas nav ko darīt. */
const PROTECTED_PREFIXES = ['/dashboard', '/auth/onboarding']

/**
 * Atsvaidzina Supabase sesiju katrā pieprasījumā un aizsargā /dashboard.
 *
 * Svarīgi: starp klienta izveidi un `getUser()` izsaukumu nedrīkst likt
 * nekādu citu loģiku — citādi sesija var izkrist neparedzamā veidā.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const { pathname } = request.nextUrl
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  // Anonīmam apmeklētājam nav ko atsvaidzināt. Bez šīs pārbaudes katrs
  // publiskās lapas skatījums izsauktu getUser() — lieks tīkla brauciens
  // uz Supabase pie katra pieprasījuma.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'))

  if (!hasAuthCookie) {
    if (needsAuth) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (needsAuth && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}
