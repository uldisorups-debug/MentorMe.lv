import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
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
    .select('display_name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile && profile.role !== 'coach') redirect('/')

  const { data: coach, error } = await supabase
    .from('coach_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) console.error('Neizdevās ielādēt kouča profilu:', error.message)

  // Profils tiek izveidots lomas izvēles brīdī. Ja tā nav — kaut kas
  // gājis greizi, un sūtām cauri onboarding vēlreiz.
  if (!coach) redirect('/auth/onboarding?next=/dashboard/profile')

  const publicClient = createPublicClient()
  const { data: categoryRows } = await publicClient
    .from('categories')
    .select('slug, name_lv')
    .order('sort_order')

  const categories = (categoryRows ?? []).map((row) => ({
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
          categories={categories}
        />
      </div>
    </div>
  )
}
