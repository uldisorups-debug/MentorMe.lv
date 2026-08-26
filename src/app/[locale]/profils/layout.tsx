import { setRequestLocale } from 'next-intl/server'
import { SiteShell } from '@/components/site-shell'

/**
 * setRequestLocale arī ligzdotajā izkārtojumā — bez tā next-intl
 * uzskata renderēšanu par dinamisku, un visa koka statiskā ģenerēšana
 * pazūd. Tas ir viegli palaist garām: kļūda neparādās, tikai lapas
 * klusi kļūst lēnākas.
 */
export default async function CoachLayout({
  children,
  params,
}: LayoutProps<'/[locale]/profils'>) {
  const { locale } = await params
  setRequestLocale(locale)

  return <SiteShell>{children}</SiteShell>
}
