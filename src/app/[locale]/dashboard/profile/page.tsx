import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { localePath, nameColumn } from '@/i18n/routing'
import { getLocale, getTranslations } from 'next-intl/server'
import { DeleteAccount } from '@/components/dashboard/delete-account'
import { LinkButton } from '@/components/link-button'
import { ProfileEditor } from './profile-editor'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'

export const metadata: Metadata = {
  title: 'Mans profils',
  robots: { index: false },
}

export default async function DashboardProfilePage() {
  const locale = await getLocale()
  const t = await getTranslations('Editor')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proxy jau sargā /dashboard, bet paļauties tikai uz to nedrīkst
  if (!user) redirect(localePath(locale, '/auth/login?next=/dashboard/profile'))

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  const loaded = await supabase
    .from('coach_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (loaded.error) {
    console.error('Neizdevās ielādēt kouča profilu:', loaded.error.message)
  }

  let coach = loaded.data

  // Lomas jautājuma vairs nav: kas atnāk uz šo lapu, tas grib izlikt
  // profilu. Ja tā vēl nav, izveidojam tukšu melnrakstu — tas nav
  // publicēts, tāpēc neviens to neredz, kamēr pats to neieslēdz.
  //
  // profiles.role šeit vairs netiek mainīta. Lapas atvēršana nav
  // izvēle kļūt par meistaru; to nosaka publicēšana redaktorā.
  if (!coach) {
    const fallbackName =
      profile?.display_name ?? user.email?.split('@')[0] ?? 'Koučs'

    const { data: created, error: createError } = await supabase
      .from('coach_profiles')
      .insert({ user_id: user.id, full_name: fallbackName })
      .select('*')
      .single()

    if (createError || !created) {
      console.error('Kouča profila izveide neizdevās:', createError?.message)
      redirect(localePath(locale, '/'))
    }

    coach = created
  }

  const { data: contacts } = await supabase
    .from('coach_contacts')
    .select('*')
    .eq('coach_id', coach.id)
    .maybeSingle()

  /*
   * Redaktors līdz šim vienmēr rādīja latviskos nosaukumus, arī angļu
   * un krievu versijā. Tas pats nameColumn, ko lieto visa pārējā lapa.
   */
  const publicClient = createPublicClient()
  const column = nameColumn(locale)

  const [categoryResult, regionResult] = await Promise.all([
    publicClient.from('categories').select(`slug, name_lv, ${column}`).order('sort_order'),
    publicClient.from('regions').select(`slug, name_lv, ${column}`).order('sort_order'),
  ])

  if (categoryResult.error) {
    console.error('Neizdevās ielādēt tēmas:', categoryResult.error.message)
  }
  if (regionResult.error) {
    console.error('Neizdevās ielādēt reģionus:', regionResult.error.message)
  }

  const localName = (row: Record<string, unknown>) =>
    (row[column] as string | null) || (row.name_lv as string)

  const categories = (categoryResult.data ?? []).map((row) => ({
    value: row.slug,
    label: localName(row),
  }))

  const regions = (regionResult.data ?? []).map((row) => ({
    value: row.slug,
    label: localName(row),
  }))

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl">{t('title')}</h1>
      <p className="mt-2 text-mist">{t('lead')}</p>

      <div className="mt-8">
        <ProfileEditor
          userId={user.id}
          coach={coach}
          contacts={contacts ?? null}
          categories={categories}
          regions={regions}
        />
      </div>

      <div className="mt-10">
        <LinkButton href="/dashboard/raksti" variant="outline" className="h-11">
          {t('myPosts')}
        </LinkButton>
      </div>

      <div className="mt-10">
        <DeleteAccount />
      </div>
    </div>
  )
}
