import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import {
  TopicLanding,
  topicMetadata,
  topicStaticParams,
} from '@/components/topic-landing'

export const revalidate = 600

export function generateStaticParams() {
  return topicStaticParams('vieta')
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
