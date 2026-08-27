import { getLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { HowItWorksContent } from '@/components/how-it-works-content'
import { LinkButton } from '@/components/link-button'
import { HOW_IT_WORKS } from '@/content/how-it-works'
import { routing } from '@/i18n/routing'

/** Sākumlapas sadaļa. Pilnais stāsts dzīvo /ka-tas-darbojas. */
export async function HowItWorks() {
  const locale = await getLocale()
  const c = HOW_IT_WORKS[locale] ?? HOW_IT_WORKS[routing.defaultLocale]

  return (
    <section
      id="ka-tas-darbojas"
      className="scroll-mt-16 border-t border-hairline px-6 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <p className="text-xs font-medium tracking-widest text-gold uppercase">
            {c.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl text-balance sm:text-4xl">
            {c.headline}
          </h2>
          <p className="mt-5 leading-relaxed text-mist">{c.lead}</p>
        </header>

        <div className="mt-12">
          <HowItWorksContent c={c} />
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/#kouci" className="h-12 gap-2 px-6 text-base">
            {c.ctaFind}
            <ArrowRight className="size-4" />
          </LinkButton>
          <LinkButton
            href="/auth/login?next=%2Fdashboard%2Fprofile"
            variant="outline"
            className="h-12 px-6 text-base"
          >
            {c.ctaAdd}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
