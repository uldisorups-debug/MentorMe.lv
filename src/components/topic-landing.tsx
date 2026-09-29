import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localePath, pageAlternates } from '@/i18n/routing'
import { CoachCard } from '@/components/coach-card'
import { LinkButton } from '@/components/link-button'
import { SITE_URL } from '@/lib/supabase/config'
import {
  decodeSlug,
  topicPath,
  type TopicEntry,
  type TopicKind,
} from '@/lib/topic-index'
import { loadTopicIndex, loadTopicPage } from '@/lib/topics'
import { routing } from '@/i18n/routing'

/**
 * Tēmas, nozares un vietas lapa — viena veidne visām trim.
 *
 * Katra ir sava adrese ar savu virsrakstu, aprakstu un H1, kurā ir tieši
 * tie vārdi, ko cilvēks raksta Google: "Biznesa koučings mentori",
 * "koučs Rīga", "Microsoft 365 Excel kursi". Saturs ir īsts — profilu
 * kartītes ar viņu pašu aprakstiem — plus saites uz blakus tēmām, lai
 * lapas veidotu tīklu, ne salu.
 */

export async function topicStaticParams(kind: TopicKind) {
  const index = await loadTopicIndex(routing.defaultLocale)
  const list =
    kind === 'tema' ? index.groups : kind === 'nozare' ? index.spheres : index.regions
  return routing.locales.flatMap((locale) =>
    list.map((e) => ({ locale, slug: e.slug }))
  )
}

export async function topicMetadata(
  kind: TopicKind,
  rawSlug: string,
  locale: string
): Promise<Metadata> {
  const slug = decodeSlug(rawSlug)
  const [page, t] = await Promise.all([
    loadTopicPage(kind, slug, locale),
    getTranslations({ locale, namespace: 'Topics' }),
  ])
  if (!page) return { title: t('notFound'), robots: { index: false } }

  const vars = { topic: page.topic.label, count: page.topic.count }
  const title = kind === 'vieta' ? t('metaTitlePlace', vars) : t('metaTitleTopic', vars)
  const description =
    kind === 'vieta' ? t('metaDescPlace', vars) : t('metaDescTopic', vars)

  return {
    title,
    description,
    alternates: pageAlternates(locale, topicPath(kind, slug)),
    openGraph: { title, description, type: 'website' },
  }
}

function ChipList({ entries }: { entries: TopicEntry[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {entries.map((e) => (
        <li key={`${e.kind}-${e.slug}`}>
          <Link
            href={topicPath(e.kind, e.slug)}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-sm text-mist transition-colors hover:border-gold/40 hover:text-cream"
          >
            {e.label}
            <span className="text-xs text-mist/60">{e.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export async function TopicLanding({
  kind,
  slug: rawSlug,
  locale,
}: {
  kind: TopicKind
  slug: string
  locale: string
}) {
  const slug = decodeSlug(rawSlug)
  const page = await loadTopicPage(kind, slug, locale)
  if (!page) notFound()

  const t = await getTranslations('Topics')
  const { topic, parent, coaches, related, children } = page
  const vars = { topic: topic.label, count: topic.count }

  const url = (path: string) => `${SITE_URL}${localePath(locale, path)}`
  const crumbs = [
    { name: t('home'), path: '/' },
    ...(parent ? [{ name: parent.label, path: topicPath(parent.kind, parent.slug) }] : []),
    { name: topic.label, path: topicPath(kind, slug) },
  ]

  /*
   * CollectionPage ar ItemList — Google saprot, ka šī ir saraksta lapa
   * ar konkrētiem cilvēkiem, nevis teksts. BreadcrumbList rezultātā
   * rāda ceļu "MentorMe.lv › Koučings › Biznesa koučings" garas adreses
   * vietā.
   */
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: kind === 'vieta' ? t('h1Place', vars) : t('h1Topic', vars),
      url: url(topicPath(kind, slug)),
      inLanguage: locale,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: coaches.length,
        itemListElement: coaches.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: url(`/${c.slug}`),
          name: c.full_name,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: url(c.path),
      })),
    },
  ]

  const childrenTitle =
    kind === 'nozare'
      ? t('childrenSphere')
      : kind === 'vieta'
        ? t('childrenPlace')
        : t('childrenTopic')

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label={t('breadcrumb')} className="text-sm text-mist">
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">›</span>}
              {i === crumbs.length - 1 ? (
                <span className="text-cream">{c.name}</span>
              ) : (
                <Link href={c.path} className="hover:text-cream">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <h1 className="rule-gold mt-6 font-display text-4xl text-balance sm:text-5xl">
        {kind === 'vieta' ? t('h1Place', vars) : t('h1Topic', vars)}
      </h1>
      <p className="mt-5 max-w-3xl leading-relaxed text-mist">
        {kind === 'vieta' ? t('leadPlace', vars) : t('leadTopic', vars)}
      </p>

      <h2 className="mt-12 font-display text-2xl">
        {t('profilesTitle', { count: coaches.length })}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <li key={coach.id} className="grid">
            <CoachCard
              coach={coach}
              nicheNames={page.nicheNames}
              regionNames={page.regionNames}
            />
          </li>
        ))}
      </ul>

      <div className="mt-14 flex flex-col gap-8 border-t border-hairline pt-10">
        {children.length > 0 && (
          <section>
            <h2 className="font-display text-xl">{childrenTitle}</h2>
            <ChipList entries={children} />
          </section>
        )}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-xl">{t('relatedTitle')}</h2>
            <ChipList entries={related} />
          </section>
        )}
      </div>

      <section className="mt-14 rounded-2xl border border-hairline bg-surface p-8 text-center">
        <h2 className="font-display text-2xl">{t('ctaTitle', vars)}</h2>
        <p className="mx-auto mt-3 max-w-xl text-mist">{t('ctaBody')}</p>
        <LinkButton
          href="/auth/login?next=%2Fdashboard%2Fprofile"
          className="mt-6 h-11 px-6"
        >
          {t('ctaButton')}
        </LinkButton>
      </section>
    </div>
  )
}
