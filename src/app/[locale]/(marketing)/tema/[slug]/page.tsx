import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import {
  TopicLanding,
  topicMetadata,
  topicStaticParams,
} from '@/components/topic-landing'

export const revalidate = 600

export function generateStaticParams() {
  return topicStaticParams('tema')
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
