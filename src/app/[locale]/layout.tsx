import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Inter, Playfair_Display } from 'next/font/google'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { publicMessages } from '@/i18n/client-messages'
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

  // hreflang: pasaka Google, ka šīs ir vienas lapas versijas, nevis
  // dublikāti. Bez tā trīs valodas konkurē savā starpā.
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, l === routing.defaultLocale ? '/' : `/${l}`])
  )

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: '%s — MentorMe.lv' },
    description: t('description'),
    alternates: { canonical: locale === routing.defaultLocale ? '/' : `/${locale}`, languages },
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
        <NextIntlClientProvider messages={publicMessages(messages)}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
