import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Inter, Playfair_Display } from 'next/font/google'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { publicMessages } from '@/i18n/client-messages'
import { OrganizationSchema } from '@/components/organization-schema'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/supabase/config'

const inter = Inter({
  variable: '--font-inter',
  // latin-ext dēļ ā č ē ģ ī ķ ļ ņ š ū ž, cyrillic dēļ krievu teksts
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Meta' })

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: '%s — MentorMe.lv' },
    description: t('description'),
    keywords: t('keywords').split(',').map((k) => k.trim()),
    /*
     * canonical te apzināti nav. Izkārtojuma alternates manto katra
     * lapa, kas savu neuzliek, — un tad /kontakti teica "īstā ir /".
     * Katra lapa to liek pati caur pageAlternates().
     */
    openGraph: {
      type: 'website',
      locale,
      siteName: 'MentorMe.lv',
      title: t('title'),
      description: t('description'),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Bez šī statiskā ģenerēšana krīt atpakaļ uz dinamisko renderēšanu
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <OrganizationSchema />
        <NextIntlClientProvider messages={publicMessages(messages)}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
