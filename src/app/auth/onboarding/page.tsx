import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { RolePicker } from './role-picker'
import { safeNext } from '@/lib/safe-next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Kas tu esi?',
  robots: { index: false },
}

export default async function OnboardingPage({
  searchParams,
}: PageProps<'/auth/onboarding'>) {
  const params = await searchParams
  const t = await getTranslations('Onboarding')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const next = safeNext(typeof params.next === 'string' ? params.next : null)

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarded_at')
    .eq('id', user.id)
    .maybeSingle()

  // Kas jau izvēlējies, šeit vairs nav ko darīt
  if (profile?.onboarded_at) redirect(next)

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-3xl">{t('title')}</h1>
      <p className="mt-3 text-mist">{t('lead')}</p>

      <div className="mt-8">
        <RolePicker
          userId={user.id}
          displayName={profile?.display_name ?? user.email?.split('@')[0] ?? 'Koučs'}
          next={next}
        />
      </div>
    </div>
  )
}
