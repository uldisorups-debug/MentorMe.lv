import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Construction } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Mans profils',
  robots: { index: false },
}

export default async function DashboardProfilePage() {
  const t = await getTranslations('Dashboard')

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

  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('slug, full_name, is_published')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl">{t('title')}</h1>
      <p className="mt-2 text-mist">
        {t('greeting', { name: profile?.display_name ?? coach?.full_name ?? '' })}
      </p>

      <div className="mt-8 rounded-2xl border border-hairline bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs tracking-widest text-mist uppercase">
            {t('stubStatus')}
          </span>
          <Badge variant={coach?.is_published ? 'default' : 'outline'}>
            {coach?.is_published ? t('published') : t('notPublished')}
          </Badge>
        </div>

        <div className="mt-6 flex gap-4 border-t border-hairline pt-6">
          <Construction className="mt-0.5 size-5 shrink-0 text-gold" />
          <div>
            <h2 className="font-medium">{t('stubTitle')}</h2>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              {t('stubBody')}
            </p>
          </div>
        </div>
      </div>

      <LinkButton href="/" variant="outline" className="mt-8 h-10">
        {t('backHome')}
      </LinkButton>
    </div>
  )
}
