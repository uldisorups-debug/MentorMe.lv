import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config'

/**
 * Supabase klients servera pusē (Server Components, Route Handlers,
 * Server Actions). Next 16 `cookies()` ir asinhrona, tāpēc arī šī funkcija.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Component nedrīkst rakstīt cookies. Tas ir gaidīts —
          // sesiju atsvaidzina middleware, tāpēc šeit droši klusējam.
        }
      },
    },
  })
}
