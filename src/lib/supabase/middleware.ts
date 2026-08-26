import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config'

/** Ceļi, kuros bez sesijas nav ko darīt (bez valodas prefiksa). */
const PROTECTED_PREFIXES = ['/dashboard']

/** Nogriež /en vai /ru no ceļa sākuma, lai sargus var rakstīt vienreiz. */
function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|ru)(\/.*)?$/)
  return match ? (match[2] ?? '/') : pathname
}

/**
 * Atsvaidzina Supabase sesiju un sargā /dashboard.
 *
 * Saņem `base` — atbildi, ko jau sagatavojis next-intl middleware —
 * un uzliek uz tās sesijas sīkdatnes. Tā abi strādā vienā piegājienā,
 * nevis cīnās par to, kurš atbild.
 *
 * Svarīgi: starp klienta izveidi un getUser() nedrīkst likt citu loģiku.
 */
export async function updateSession(request: NextRequest, base: NextResponse) {
  const response = base

  const pathname = stripLocale(request.nextUrl.pathname)
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  // Anonīmam nav ko atsvaidzināt — bez šīs pārbaudes katrs publiskās
  // lapas skatījums izsauktu getUser() uz Supabase
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-'))

  if (!hasAuthCookie) {
    if (needsAuth) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('next', request.nextUrl.pathname)
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
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value)
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
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}
