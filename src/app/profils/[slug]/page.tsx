import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import {
  BadgeCheck,
  CalendarCheck,
  Eye,
  Languages,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { CoachAvatar } from '@/components/coach-avatar'
import { ContactDialog } from '@/components/contact-dialog'
import { CultureMatch } from '@/components/culture-match'
import { GalleryGrid } from '@/components/gallery-grid'
import { LinkButton } from '@/components/link-button'
import { ProfileViewTracker } from '@/components/profile-view-tracker'
import { ReviewForm } from '@/components/review-form'
import { ReviewList } from '@/components/review-list'
import { StarRating } from '@/components/star-rating'
import { Badge } from '@/components/ui/badge'
import { certLabel } from '@/lib/coaches'
import { listCoachSlugs, loadCoachPage } from '@/lib/coach-profile'
import { createPublicClient } from '@/lib/supabase/public'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await listCoachSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/profils/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const page = await loadCoachPage(slug)
  const t = await getTranslations('Coach')

  if (!page) return { title: t('notFoundTitle') }

  const { coach } = page
  const tagline = coach.tagline ?? t('metaFallbackTagline')

  // Google nogriež virsrakstu ap 60 rakstzīmēm, un layout pieliek
  // vēl " — MentorMe.lv". Ja tagline ir gara, ņemam sertifikātu.
  const withTagline = t('metaTitle', { name: coach.full_name, tagline })
  const title =
    withTagline.length <= 46
      ? withTagline
      : t('metaTitle', {
          name: coach.full_name,
          tagline: certLabel(coach.certification) ?? t('metaFallbackTagline'),
        })

  const description = t('metaDescription', {
    name: coach.full_name,
    cert: certLabel(coach.certification) ?? t('metaFallbackTagline'),
  })

  return {
    title,
    description,
    alternates: { canonical: `/profils/${coach.slug}` },
    openGraph: { title, description, type: 'profile' },
  }
}

const FORMAT_KEYS = {
  remote: 'formatRemote',
  in_person: 'formatInPerson',
  hybrid: 'formatHybrid',
} as const

const LANGUAGE_LABELS: Record<string, string> = {
  lv: 'Latviešu',
  en: 'Angļu',
  ru: 'Krievu',
}

async function loadCategoryNames(): Promise<Record<string, string>> {
  const supabase = createPublicClient()
  const { data } = await supabase.from('categories').select('slug, name_lv')
  return Object.fromEntries((data ?? []).map((c) => [c.slug, c.name_lv]))
}

async function loadRegionName(slug: string | null): Promise<string | null> {
  if (!slug) return null
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('regions')
    .select('name_lv')
    .eq('slug', slug)
    .maybeSingle()
  return data?.name_lv ?? null
}

export default async function CoachProfilePage({
  params,
}: PageProps<'/profils/[slug]'>) {
  const { slug } = await params
  const [page, categoryNames] = await Promise.all([
    loadCoachPage(slug),
    loadCategoryNames(),
  ])

  if (!page) notFound()

  const regionName = await loadRegionName(page.coach.region_slug)

  const { coach, reviews } = page
  const t = await getTranslations('Coach')
  const tPrice = await getTranslations('Price')
  const tReviews = await getTranslations('Reviews')
  const tCoaches = await getTranslations('Coaches')

  const cert = certLabel(coach.certification)
  const priceText =
    coach.price_tier === 'free'
      ? tPrice('free')
      : coach.price_from && coach.price_to
        ? tPrice('range', { from: coach.price_from, to: coach.price_to })
        : coach.price_from
          ? tPrice('from', { from: coach.price_from })
          : tPrice(coach.price_tier)

  return (
    <>
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

          <GalleryGrid urls={coach.gallery_urls} coachName={coach.full_name} />

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

            <ReviewList reviews={reviews} canReport />
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
              {cert && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-mist">
                    <ShieldCheck className="size-3.5" />
                    {t('certification')}
                  </dt>
                  <dd className="mt-1">
                    {coach.cert_other_label ?? cert}
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

              {coach.years_experience !== null && (
                <div>
                  <dt className="text-xs text-mist">{t('experience')}</dt>
                  <dd className="mt-1">
                    {t('experienceValue', { years: coach.years_experience })}
                  </dd>
                </div>
              )}

              <div>
                <dt className="flex items-center gap-1.5 text-xs text-mist">
                  <MapPin className="size-3.5" />
                  {t('where')}
                </dt>
                <dd className="mt-1">
                  {t(FORMAT_KEYS[coach.teaching_format])}
                  {(regionName || coach.city) && (
                    <span className="mt-0.5 block text-xs text-mist">
                      {[coach.city, regionName].filter(Boolean).join(', ')}
                    </span>
                  )}
                </dd>
              </div>

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
            </dl>
          </div>
        </aside>
      </div>
    </>
  )
}
