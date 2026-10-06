import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import {
  TopicLanding,
  topicMetadata,
  topicStaticParams,
} from '@/components/topic-landing'

// Svaigumu nodrošina revalidatePublicPages() pie katras izmaiņas; laiks — tikai drošības tīkls
export const revalidate = 86400

export function generateStaticParams() {
  return topicStaticParams()
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/tema/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  return topicMetadata('tema', slug, locale)
}

export default async function Page({
  params,
}: PageProps<'/[locale]/tema/[slug]'>) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  return <TopicLanding kind="tema" slug={slug} locale={locale} />
}
