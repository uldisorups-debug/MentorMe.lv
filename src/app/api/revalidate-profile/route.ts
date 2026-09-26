import { after, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePublicPages } from '@/lib/revalidate'
import { allLocaleUrls, submitToIndexNow } from '@/lib/indexnow'

/**
 * Ko paziņot IndexNow pēc atsvaidzināšanas. Tukšs ķermenis — neko.
 *
 * Agrāk maršruts vienmēr ziņoja par izsaucēja paša profilu. Tas bija
 * pareizi tikai profila redaktoram: administratoram, kuram pašam ir
 * profils, katra atsauksmes paslēpšana vai raksta dzēšana pingoja viņa
 * paša lapu, bet profils, ko viņš tikko publicēja, palika nepaziņots.
 * Raksti netika paziņoti nekad — redaktors pingoja autora profilu.
 */
type Body = {
  ownProfile?: boolean
  profileId?: string
  postId?: string
}

async function readBody(request: Request): Promise<Body> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' ? (body as Body) : {}
  } catch {
    return {}
  }
}

/**
 * Publisko lapu atsvaidzināšana pēc profila saglabāšanas.
 *
 * Profila lapa un saraksts ir statiski ar ISR — bez šī izmaiņas
 * parādītos tikai pēc minūtes, un cilvēks, kurš tikko saglabāja un
 * uzreiz atvēra savu publisko profilu, redzētu veco versiju un domātu,
 * ka saglabāšana neizdevās.
 *
 */
export async function POST(request: Request) {
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
  const [{ data: coach }, { data: profile }, body] = await Promise.all([
    supabase.from('coach_profiles').select('id, slug, is_published').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle(),
    readBody(request),
  ])

  const isAdmin = Boolean(profile?.is_admin)
  if (!coach && !isAdmin) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  revalidatePublicPages()

  const paths = await pathsToAnnounce(supabase, body, user.id, coach, isAdmin)

  /*
   * Publicēta lapa — paziņojam meklētājiem uzreiz, nevis gaidām, kad
   * tie paši atnāks pa sitemap. after() izpilda to pēc atbildes
   * nosūtīšanas: cilvēks nesagaida IndexNow atbildi, saglabājot profilu.
   */
  if (paths.length > 0) {
    after(() => submitToIndexNow(paths.flatMap(allLocaleUrls)))
  }

  return NextResponse.json({ ok: true, slug: coach?.slug ?? null })
}

/**
 * Publiskie ceļi, par kuriem ziņot. Tikai publicētas lapas, un tikai
 * savas — vai jebkuras, ja izsaucējs ir administrators.
 */
async function pathsToAnnounce(
  supabase: Awaited<ReturnType<typeof createClient>>,
  body: Body,
  userId: string,
  coach: { id: string; slug: string; is_published: boolean } | null,
  isAdmin: boolean
): Promise<string[]> {
  const paths: string[] = []

  if (body.ownProfile && coach?.is_published) {
    paths.push(`/${coach.slug}`)
  }

  if (typeof body.profileId === 'string') {
    const { data } = await supabase
      .from('coach_profiles')
      .select('slug, is_published, user_id')
      .eq('id', body.profileId)
      .maybeSingle()
    if (data?.is_published && (isAdmin || data.user_id === userId)) {
      paths.push(`/${data.slug}`)
    }
  }

  if (typeof body.postId === 'string') {
    const { data } = await supabase
      .from('posts')
      .select('slug, status, author_id')
      .eq('id', body.postId)
      .maybeSingle()
    if (data?.status === 'published' && (isAdmin || data.author_id === coach?.id)) {
      paths.push(`/blog/${data.slug}`)
    }
  }

  return paths
}
