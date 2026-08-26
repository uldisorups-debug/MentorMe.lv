import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

const handleI18n = createIntlMiddleware(routing)

/**
 * Divas lietas vienā: valodas noteikšana un Supabase sesija.
 *
 * Vispirms next-intl izlemj, kura valoda un vai vajag pāradresāciju,
 * tad uz tās pašas atbildes uzliekam sesijas sīkdatnes. Ja to darītu
 * otrādi, valodas pāradresācija nomestu tikko atjaunotās sīkdatnes.
 */
export async function proxy(request: NextRequest) {
  const intlResponse = handleI18n(request)

  // next-intl pāradresē (piem. /en/ -> /en) — tad sesiju atstājam mierā
  if (intlResponse.headers.get('location')) return intlResponse

  return updateSession(request, intlResponse as NextResponse)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)',
  ],
}
