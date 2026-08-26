import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DeleteAccount } from '@/components/dashboard/delete-account'
import { ProfileEditor } from './profile-editor'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'

export const metadata: Metadata = {
  title: 'Mans profils',
  robots: { index: false },
}

export default async function DashboardProfilePage() {
  const t = await getTranslations('Editor')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proxy jau sargā /dashboard, bet paļauties tikai uz to nedrīkst
  if (!user) redirect('/auth/login?next=/dashboard/profile')

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
      redirect('/')
    }

    // Loma seko darbībai, nevis anketai
    await supabase.from('profiles').update({ role: 'coach' }).eq('id', user.id)
    coach = created
  }

  const { data: contacts } = await supabase
    .from('coach_contacts')
    .select('*')
    .eq('coach_id', coach.id)
    .maybeSingle()

  const publicClient = createPublicClient()
  const { data: categoryRows } = await publicClient
    .from('categories')
    .select('slug, name_lv')
    .order('sort_order')

  const { data: regionRows } = await publicClient
    .from('regions')
    .select('slug, name_lv')
    .order('sort_order')

  const categories = (categoryRows ?? []).map((row) => ({
    value: row.slug,
    label: row.name_lv,
  }))

  const regions = (regionRows ?? []).map((row) => ({
    value: row.slug,
    label: row.name_lv,
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
        <DeleteAccount />
      </div>
    </div>
  )
}
