import { ogLocale } from '@/lib/seo-title'
import { topicGuide } from '@/content/topic-guides'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localePath, pageAlternates } from '@/i18n/routing'
import { CoachCard } from '@/components/coach-card'
import { LinkButton } from '@/components/link-button'
import { jsonLdHtml } from '@/lib/json-ld'
import { SITE_URL } from '@/lib/supabase/config'
import {
  decodeSlug,
  topicPath,
  type TopicEntry,
  type TopicKind,
} from '@/lib/topic-index'
import { loadTopicPage } from '@/lib/topics'

/**
 * Tēmas, nozares un vietas lapa — viena veidne visām trim.
 *
 * Katra ir sava adrese ar savu virsrakstu, aprakstu un H1, kurā ir tieši
 * tie vārdi, ko cilvēks raksta Google: "Biznesa koučings mentori",
 * "koučs Rīga", "Microsoft 365 Excel kursi". Saturs ir īsts — profilu
 * kartītes ar viņu pašu aprakstiem — plus saites uz blakus tēmām, lai
 * lapas veidotu tīklu, ne salu.
 */

/**
 * Tukšs saraksts ar nolūku: neviena tēmu lapa netiek būvēta izvietošanas
 * brīdī. Katra tiek uzbūvēta pirmajā apmeklējumā un tad glabājas kešā.
 *
 * Agrāk katrs izvietojums (arī katrs priekšskatījums) pārbūvēja visas
 * ~150 tēmu lapas — katra ir ISR ieraksts, un Vercel bezmaksas plānā to
 * ir 200 000 mēnesī. Lapas, ko neviens neatver, tagad neko nemaksā.
 */
export async function topicStaticParams(): Promise<{ locale: string; slug: string }[]> {
  return []
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
    /*
     * openGraph objekts lapā aizstāj izkārtojuma objektu pilnībā, un
     * līdz ar to pazuda arī bilde — kopīgojot tēmu lapu, priekšskatījums
     * bija tukšs. Liekam vietnes vispārējo bildi atpakaļ.
     */
    openGraph: {
      title,
      description,
      type: 'website',
      locale: ogLocale(locale),
      images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630 }],
    },
  }
}

function ChipList({ entries }: { entries: TopicEntry[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {entries.map((e) => (
        <li key={`${e.kind}-${e.slug}`}>
          <Link prefetch={false}
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

  const guide = topicGuide(kind, slug, locale)
  const faqLd = guide && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

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
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd ? [...jsonLd, faqLd] : jsonLd) }}
      />

      <nav aria-label={t('breadcrumb')} className="text-sm text-mist">
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">›</span>}
              {i === crumbs.length - 1 ? (
                <span className="text-cream">{c.name}</span>
              ) : (
                <Link prefetch={false} href={c.path} className="hover:text-cream">
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

      {/*
        Unikāls teksts un jautājumi svarīgākajām lapām — zem kartītēm,
        lai cilvēks vispirms redz cilvēkus, bet Google un AI rīki lapā
        atrod arī atbildi, ne tikai sarakstu.
      */}
      {guide && (
        <section className="mt-14 max-w-3xl">
          <h2 className="rule-gold font-display text-2xl">{guide.title}</h2>
          {guide.body.map((paragraph, i) => (
            <p key={i} className="mt-4 leading-relaxed text-mist">
              {paragraph}
            </p>
          ))}
          <dl className="mt-8 flex flex-col gap-5">
            {guide.faq.map(([q, a]) => (
              <div key={q}>
                <dt className="font-medium">{q}</dt>
                <dd className="mt-1.5 leading-relaxed text-mist">{a}</dd>
              </div>
            ))}
          </dl>
          {guide.posts && (
            <ul className="mt-8 flex flex-col gap-2 text-sm">
              {guide.posts.map(([postSlug, title]) => (
                <li key={postSlug}>
                  <Link
                    prefetch={false}
                    href={`/blog/${postSlug}`}
                    className="text-gold hover:underline"
                  >
                    {title} →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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
