import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { ABOUT } from '@/content/about'
import { routing } from '@/i18n/routing'

function content(locale: string) {
  return ABOUT[locale] ?? ABOUT[routing.defaultLocale]
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/par-mums'>): Promise<Metadata> {
  const { locale } = await params
  const c = content(locale)
  return {
    title: c.eyebrow,
    description: c.pull,
    alternates: { canonical: locale === routing.defaultLocale ? '/par-mums' : `/${locale}/par-mums` },
  }
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-2xl leading-snug text-balance sm:text-3xl">
      {children}
    </p>
  )
}

export default async function AboutPage({
  params,
}: PageProps<'/[locale]/par-mums'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const c = content(locale)

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs font-medium tracking-widest text-gold uppercase">
        {c.eyebrow}
      </p>
      <h1 className="mt-4 font-display text-4xl leading-[1.15] text-balance sm:text-5xl">
        {c.headline}
      </h1>

      <div className="mt-12 flex flex-col gap-6">
        {c.intro.map((paragraph, i) => (
          <p key={i} className="leading-relaxed text-mist">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-hairline bg-surface p-8">
        <Lead>{c.pull}</Lead>
      </div>

      <div className="mt-14">
        <h2 className="rule-gold font-display text-2xl">{c.forWhom}</h2>
        <ul className="mt-8 flex flex-col gap-8">
          {c.stories.map((story) => (
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

      <div className="mt-16 flex flex-col gap-6">
        <h2 className="rule-gold font-display text-2xl">{c.howTitle}</h2>
        {c.how.map((paragraph, i) => (
          <p key={i} className="leading-relaxed text-mist">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-coral/5 p-8">
        <Lead>{c.closing}</Lead>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton
            href="/auth/login?next=%2Fdashboard%2Fprofile"
            className="h-12 gap-2 px-6 text-base"
          >
            {c.ctaAdd}
            <ArrowRight className="size-4" />
          </LinkButton>
          <LinkButton href="/#kouci" variant="outline" className="h-12 px-6 text-base">
            {c.ctaFind}
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
