import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import {
  TopicLanding,
  topicMetadata,
  topicStaticParams,
} from '@/components/topic-landing'

// Svaigumu nodrošina revalidatePublicPages() pie katras izmaiņas; laiks — tikai drošības tīkls
// Nedēļa: izmaiņas atsvaidzina revalidateProfile/revalidatePost uzreiz
export const revalidate = 604800

export function generateStaticParams() {
  return topicStaticParams()
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/vieta/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  return topicMetadata('vieta', slug, locale)
}

export default async function Page({
  params,
}: PageProps<'/[locale]/vieta/[slug]'>) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  return <TopicLanding kind="vieta" slug={slug} locale={locale} />
}
