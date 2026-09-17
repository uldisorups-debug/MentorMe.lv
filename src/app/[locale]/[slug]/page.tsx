import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  BadgeCheck,
  CalendarCheck,
  Compass,
  Eye,
  Languages,
  MapPin,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react'
import { CoachAvatar } from '@/components/coach-avatar'
import { ContactDialog } from '@/components/contact-dialog'
import { CultureMatch } from '@/components/culture-match'
import { LinkButton } from '@/components/link-button'
import { ProfileViewTracker } from '@/components/profile-view-tracker'
import { ReviewForm } from '@/components/review-form'
import { ReviewList } from '@/components/review-list'
import { StarRating } from '@/components/star-rating'
import { Badge } from '@/components/ui/badge'
import { qualificationKey } from '@/lib/coaches'
import { listCoachSlugs, loadCoachPage } from '@/lib/coach-profile'
import { loadGroupNames, loadRegionName, loadSphereNames } from '@/lib/taxonomy'
import { SITE_URL } from '@/lib/supabase/config'

export const revalidate = 60

export async function generateStaticParams() {
  const coaches = await listCoachSlugs()
  // Katrs slug reiz katrā valodā — citādi /en/... krīt uz dinamisko
  return routing.locales.flatMap((locale) =>
    coaches.map(({ slug }) => ({ locale, slug }))
  )
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const page = await loadCoachPage(slug)
  const t = await getTranslations('Coach')

  if (!page) return { title: t('notFoundTitle') }

  const { coach } = page
  const tagline = coach.tagline ?? t('metaFallbackTagline')
  const qualKeyForMeta = qualificationKey(coach.qualification)

  // Google nogriež virsrakstu ap 60 rakstzīmēm, un layout pieliek
  // vēl " — MentorMe.lv". Ja tagline ir gara, ņemam sertifikātu.
  const withTagline = t('metaTitle', { name: coach.full_name, tagline })
  const generatedTitle =
    withTagline.length <= 46
      ? withTagline
      : t('metaTitle', {
          name: coach.full_name,
          tagline: qualKeyForMeta ? t(qualKeyForMeta) : t('metaFallbackTagline'),
        })

  const generatedDescription = t('metaDescription', {
    name: coach.full_name,
    cert: qualKeyForMeta ? t(qualKeyForMeta) : t('metaFallbackTagline'),
  })

  /*
   * Ko meistars ierakstījis pats, tas iet pirmais. Cilvēks zina labāk
   * par mums, pēc kā viņu meklē — mūsu ģenerētais variants ir tikai
   * tas, kas paliek, ja viņš neko nav rakstījis.
   */
  const title = coach.meta_title?.trim() || generatedTitle
  const description = coach.meta_description?.trim() || generatedDescription

  return {
    title,
    description,
    alternates: { canonical: `/${coach.slug}` },
    openGraph: { title, description, type: 'profile' },
  }
}

const FORMAT_KEYS = {
  remote: 'formatRemote',
  in_person: 'formatInPerson',
  hybrid: 'formatHybrid',
} as const

/** Tādā secībā, kādā tie prasa arvien vairāk laika. */
const EXPERIENCE_KEYS = {
  experience: 'expExperience',
  masterclass: 'expMasterclass',
  course: 'expCourse',
  retreat: 'expRetreat',
} as const

const LANGUAGE_LABELS: Record<string, string> = {
  lv: 'Latviešu',
  en: 'Angļu',
  ru: 'Krievu',
}


export default async function CoachProfilePage({
  params,
}: PageProps<'/[locale]/[slug]'>) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const [page, categoryNames] = await Promise.all([
    loadCoachPage(slug),
    loadGroupNames(locale),
  ])

  if (!page) notFound()

  const [regionName, spheres] = await Promise.all([
    loadRegionName(page.coach.region_slug, locale),
    loadSphereNames(page.coach.niches, locale),
  ])

  const { coach, reviews } = page
  const t = await getTranslations('Coach')
  const tPrice = await getTranslations('Price')
  const tReviews = await getTranslations('Reviews')
  const tCoaches = await getTranslations('Coaches')

  const qualKey = qualificationKey(coach.qualification)
  const priceText =
    coach.price_tier === 'free'
      ? tPrice('free')
      : coach.price_from && coach.price_to
        ? tPrice('range', { from: coach.price_from, to: coach.price_to })
        : coach.price_from
          ? tPrice('from', { from: coach.price_from })
          : tPrice(coach.price_tier)

  /*
   * Strukturētie dati. Rakstiem tie bija, profiliem ne — un tieši profils
   * ir tas, ko šī vietne piedāvā. Bez tā Google redz tekstu ar bildi un
   * pats min, kas tur ir; ar to tas redz cilvēku, viņa amatu, vietu un
   * reitingu.
   *
   * Liekam tikai to, kas tiešām ir. Tukšs lauks shēmā ir sliktāk nekā
   * neviena lauka: tas ir apgalvojums bez seguma.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: coach.full_name,
      url: `${SITE_URL}/${coach.slug}`,
      ...(coach.tagline ? { jobTitle: coach.tagline } : {}),
      ...(coach.bio ? { description: coach.bio } : {}),
      ...(coach.avatar_url ? { image: coach.avatar_url } : {}),
      ...(spheres.length > 0
        ? { knowsAbout: spheres.map((sphere) => sphere.label) }
        : {}),
      ...(coach.session_languages.length > 0
        ? { knowsLanguage: coach.session_languages }
        : {}),
      ...(coach.city || regionName
        ? {
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'LV',
              ...(coach.city ? { addressLocality: coach.city } : {}),
              ...(regionName ? { addressRegion: regionName } : {}),
            },
          }
        : {}),
      ...(coach.avg_rating !== null && coach.review_count > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: coach.avg_rating,
              reviewCount: coach.review_count,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileViewTracker slug={coach.slug} />

      {/* ---------- Hero ---------- */}
      <section className="border-b border-hairline px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <LinkButton
            href="/#kouci"
            variant="ghost"
            size="sm"
            className="-ml-2 mb-6 text-mist hover:text-cream"
          >
            ← {t('backToList')}
          </LinkButton>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <CoachAvatar
              name={coach.full_name}
              url={coach.avatar_url}
              px={96}
              className="rounded-2xl"
            />

            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl sm:text-4xl">
                {coach.full_name}
                {coach.is_verified && (
                  <BadgeCheck
                    className="size-6 text-gold"
                    aria-label={tCoaches('verified')}
                  />
                )}
              </h1>

              {coach.tagline && (
                <p className="mt-2 text-lg text-mist text-balance">
                  {coach.tagline}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {coach.niches.map((niche) => (
                  <Badge key={niche} variant="outline" className="text-mist">
                    {categoryNames[niche] ?? niche}
                  </Badge>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {coach.avg_rating !== null && (
                  <span className="flex items-center gap-2">
                    <StarRating value={coach.avg_rating} />
                    <span className="font-medium">
                      {coach.avg_rating.toFixed(1)}
                    </span>
                    <span className="text-mist">
                      {tCoaches('reviews', { count: coach.review_count })}
                    </span>
                  </span>
                )}
                {coach.profile_views > 0 && (
                  <span className="flex items-center gap-1.5 text-mist">
                    <Eye className="size-3.5" />
                    {t('views', { count: coach.profile_views })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Saturs ---------- */}
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[1fr_20rem] lg:gap-14">
        <div className="flex flex-col gap-10">
          {coach.bio && (
            <section>
              <h2 className="font-display text-2xl">{t('about')}</h2>
              <div className="mt-4 flex flex-col gap-4 leading-relaxed text-mist">
                {coach.bio.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}


          <CultureMatch
            books={coach.books_top}
            movies={coach.movies_top}
            music={coach.music_top}
          />

          <section id="atsauksmes" className="border-t border-hairline pt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl">{tReviews('title')}</h2>
              {coach.avg_rating !== null && (
                <span className="text-sm text-mist">
                  {tReviews('averageOf', { rating: coach.avg_rating.toFixed(1) })}
                </span>
              )}
            </div>

            <ReviewList reviews={reviews} />
            <ReviewForm coachId={coach.id} coachUserId={coach.user_id} />
          </section>
        </div>

        {/* ---------- Sānu bloks ---------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-hairline bg-surface p-6">
            <p className="text-xs tracking-widest text-mist uppercase">
              {t('priceLabel')}
            </p>
            <p className="mt-1 font-display text-2xl text-gold">{priceText}</p>

            <div className="mt-5 flex flex-col gap-2">
              {/* Ziņa ir pamata darbība — tā ir vienmēr */}
              <ContactDialog coachId={coach.id} coachName={coach.full_name} />

              {/* Kalendārs tikai tiem, kas to pievienojuši */}
              {coach.calendly_url && (
                <LinkButton
                  href={coach.calendly_url}
                  variant="outline"
                  className="h-11 w-full gap-2 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CalendarCheck className="size-4" />
                  {t('bookCall')}
                </LinkButton>
              )}
            </div>

            <dl className="mt-6 flex flex-col gap-4 border-t border-hairline pt-5 text-sm">
              {qualKey && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-mist">
                    <ShieldCheck className="size-3.5" />
                    {t('qualification')}
                  </dt>
                  <dd className="mt-1">
                    {t(qualKey)}
                    {coach.cert_note && (
                      <span className="mt-0.5 block text-xs text-mist">
                        {coach.cert_note}
                      </span>
                    )}
                    <span
                      className={
                        coach.is_verified
                          ? 'mt-0.5 block text-xs text-gold'
                          : 'mt-0.5 block text-xs text-mist'
                      }
                    >
                      {coach.is_verified
                        ? t('certVerified')
                        : t('certUnverified')}
                    </span>
                  </dd>
                </div>
              )}

              {/* Nulle gadu nav pieredze — tāda rinda profilā tikai kaitē */}
              {coach.years_experience !== null && coach.years_experience > 0 && (
                <div>
                  <dt className="text-xs text-mist">{t('experience')}</dt>
                  <dd className="mt-1">
                    {t('experienceValue', { years: coach.years_experience })}
                  </dd>
                </div>
              )}

              {/*
                No šejienes uz leju — tieši tas, pēc kā cilvēku atlasa
                filtrā, un tajos pašos vārdos. Ja profilā to nav, meklētājs
                neredz, kāpēc viņš šo cilvēku atrada.
              */}
              {spheres.length > 0 && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-mist">
                    <Compass className="size-3.5" />
                    {t('sphere')}
                  </dt>
                  <dd className="mt-1">
                    {spheres
                      .map((s) => (s.icon ? `${s.icon} ${s.label}` : s.label))
                      .join(', ')}
                  </dd>
                </div>
              )}

              <div>
                <dt className="flex items-center gap-1.5 text-xs text-mist">
                  <Video className="size-3.5" />
                  {t('format')}
                </dt>
                <dd className="mt-1">{t(FORMAT_KEYS[coach.teaching_format])}</dd>
              </div>

              {(regionName || coach.city) && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-mist">
                    <MapPin className="size-3.5" />
                    {t('place')}
                  </dt>
                  <dd className="mt-1">
                    {[coach.city, regionName].filter(Boolean).join(', ')}
                  </dd>
                </div>
              )}

              <div>
                <dt className="flex items-center gap-1.5 text-xs text-mist">
                  <Languages className="size-3.5" />
                  {t('languages')}
                </dt>
                <dd className="mt-1">
                  {coach.session_languages
                    .map((code) => LANGUAGE_LABELS[code] ?? code)
                    .join(', ')}
                </dd>
              </div>

              {coach.experience_kinds.length > 0 && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-mist">
                    <Sparkles className="size-3.5" />
                    {t('experienceKind')}
                  </dt>
                  <dd className="mt-1">
                    {/* Secība no EXPERIENCE_KEYS, ne no masīva — citādi
                        divos profilos tie paši vārdi stāvētu citādi */}
                    {(
                      Object.keys(EXPERIENCE_KEYS) as (keyof typeof EXPERIENCE_KEYS)[]
                    )
                      .filter((kind) => coach.experience_kinds.includes(kind))
                      .map((kind) => t(EXPERIENCE_KEYS[kind]))
                      .join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </>
  )
}
