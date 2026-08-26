import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { SiteShell } from '@/components/site-shell'
import { dashboardMessages } from '@/i18n/client-messages'

/**
 * Panelim vajag arī redaktora un konta tekstus. Tos dodam tikai šeit,
 * lai publiskās lapas tos nenestu līdzi.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={dashboardMessages(messages)}>
      <SiteShell>{children}</SiteShell>
    </NextIntlClientProvider>
  )
}
