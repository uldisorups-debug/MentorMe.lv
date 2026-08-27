import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { SiteShell } from '@/components/site-shell'
import { AdminNav } from '@/components/admin/admin-nav'
import { createClient } from '@/lib/supabase/server'

/**
 * Administratora sadaļa.
 *
 * Nav administrators — notFound(), nevis pāradresācija uz pieteikšanos.
 * Pāradresācija pateiktu svešiniekam, ka šī lapa eksistē; 404 nepasaka
 * neko. Datubāzes pusē to tāpat sargā RLS, šis ir otrs slānis.
 *
 * Panelis ir latviski. Tas ir iekšējs rīks vienam cilvēkam, un trīs
 * valodas tam nozīmētu 150 tulkojumu bez ieguvuma.
 */
export default async function AdminLayout({
  children,
  params,
}: LayoutProps<'/[locale]/admin'>) {
  const { locale } = await params
  setRequestLocale(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin) notFound()

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <AdminNav />
        <div className="mt-8">{children}</div>
      </div>
    </SiteShell>
  )
}
