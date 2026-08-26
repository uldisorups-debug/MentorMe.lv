import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { SITE_URL } from '@/lib/supabase/config'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  // latin-ext ir obligāts — bez tā ā č ē ģ ī ķ ļ ņ š ū ž krīt uz fallback fontu
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Meta')

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t('title'),
      template: '%s — MentorMe.lv',
    },
    description: t('description'),
    openGraph: {
      type: 'website',
      locale: 'lv_LV',
      siteName: 'MentorMe.lv',
      title: t('title'),
      description: t('description'),
    },
  }
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const messages = await getMessages()

  // Klientam sūtām tikai tās grupas, ko lieto client komponentes.
  // Pārējais (Meta, Nav, Hero, HowItWorks, ForCoaches, Footer, Coach,
  // Culture) tiek atrenderēts serverī un bundlē nav vajadzīgs.
  const clientMessages = {
    Filters: messages.Filters,
    Coaches: messages.Coaches,
    Price: messages.Price,
    Reviews: messages.Reviews,
    Auth: messages.Auth,
    Nav: messages.Nav,
    Editor: messages.Editor,
  }

  return (
    <html
      lang="lv"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={clientMessages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
