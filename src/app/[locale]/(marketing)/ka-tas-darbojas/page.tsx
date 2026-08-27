import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { HowItWorksContent } from '@/components/how-it-works-content'
import { LinkButton } from '@/components/link-button'
import { ABOUT } from '@/content/about'
import { HOW_IT_WORKS } from '@/content/how-it-works'
import { routing } from '@/i18n/routing'

/**
 * Viena lapa ar abām daļām: vispirms kāpēc, tad kā.
 *
 * Cilvēks, kurš klikšķina "Kā tas darbojas", grib zināt mehāniku — bet
 * vispirms viņam jāsaprot, kāpēc šī lapa vispār pastāv. Tāpēc stāsts
 * ir augšā, algoritms zem tā.
 */

function about(locale: string) {
  return ABOUT[locale] ?? ABOUT[routing.defaultLocale]
}
function how(locale: string) {
  return HOW_IT_WORKS[locale] ?? HOW_IT_WORKS[routing.defaultLocale]
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/ka-tas-darbojas'>): Promise<Metadata> {
  const { locale } = await params
  const a = about(locale)
  const h = how(locale)
  const path = locale === routing.defaultLocale ? '/ka-tas-darbojas' : `/${locale}/ka-tas-darbojas`

  return {
    title: h.eyebrow,
    description: a.pull,
    alternates: { canonical: path },
  }
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-2xl leading-snug text-balance sm:text-3xl">
      {children}
    </p>
  )
}

export default async function HowItWorksPage({
  params,
}: PageProps<'/[locale]/ka-tas-darbojas'>) {
  const { locale } = await params
  setRequestLocale(locale)

  const a = about(locale)
  const h = how(locale)

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      {/* ---- Kāpēc ---- */}
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-widest text-gold uppercase">
          {a.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[1.15] text-balance sm:text-5xl">
          {a.headline}
        </h1>

        <div className="mt-10 flex flex-col gap-6">
          {a.intro.map((paragraph, i) => (
            <p key={i} className="leading-relaxed text-mist">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-hairline bg-surface p-8">
        <Lead>{a.pull}</Lead>
      </div>

      <div className="mt-14 max-w-2xl">
        <h2 className="rule-gold font-display text-2xl">{a.forWhom}</h2>
        <ul className="mt-8 flex flex-col gap-8">
          {a.stories.map((story) => (
            <li key={story.title} className="border-l-2 border-gold/30 pl-5">
              <h3 className="font-display text-lg text-cream">{story.title}</h3>
              <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-mist">
                <p>{story.body}</p>
                {story.emphasis && <p className="text-cream">{story.emphasis}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-14 max-w-2xl flex-col gap-6">
        <h2 className="rule-gold font-display text-2xl">{a.howTitle}</h2>
        <div className="mt-6 flex flex-col gap-6">
          {a.how.map((paragraph, i) => (
            <p key={i} className="leading-relaxed text-mist">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* ---- Kā ---- */}
      <div className="mt-20 border-t border-hairline pt-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-widest text-gold uppercase">
            {h.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl text-balance sm:text-4xl">
            {h.headline}
          </h2>
          <p className="mt-5 leading-relaxed text-mist">{h.lead}</p>
        </div>

        <div className="mt-12">
          <HowItWorksContent c={h} />
        </div>
      </div>

      {/* ---- Aicinājums ---- */}
      <div className="mt-16 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-coral/5 p-8">
        <Lead>{a.closing}</Lead>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton
            href="/auth/login?next=%2Fdashboard%2Fprofile"
            className="h-12 gap-2 px-6 text-base"
          >
            {a.ctaAdd}
            <ArrowRight className="size-4" />
          </LinkButton>
          <LinkButton href="/#kouci" variant="outline" className="h-12 px-6 text-base">
            {a.ctaFind}
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
