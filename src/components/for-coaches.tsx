import { useTranslations } from 'next-intl'
import { ArrowRight, BadgeCheck, CalendarCheck, UserPlus } from 'lucide-react'
import { LinkButton } from '@/components/link-button'

export function ForCoaches() {
  const t = useTranslations('ForCoaches')

  const points = [
    { icon: UserPlus, title: t('point1Title'), body: t('point1Body') },
    { icon: BadgeCheck, title: t('point2Title'), body: t('point2Body') },
    { icon: CalendarCheck, title: t('point3Title'), body: t('point3Body') },
  ]

  return (
    <section id="kouciem" className="scroll-mt-16 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-hairline bg-surface p-8 sm:p-12">
          {/* Korallis kā sadaļas akcents — atšķir no zeltainās pārējās lapas */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-coral/15 blur-3xl"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-xs font-medium tracking-widest text-coral uppercase">
                {t('eyebrow')}
              </p>
              <h2 className="mt-3 font-display text-3xl text-balance sm:text-4xl">
                {t('title')}
              </h2>
              <p className="mt-4 leading-relaxed text-mist">{t('lead')}</p>

              <LinkButton
                href="/auth/login?next=%2Fdashboard%2Fprofile"
                size="lg"
                className="mt-8 h-12 gap-2 bg-coral px-6 text-base text-ink hover:bg-coral-soft"
              >
                {t('cta')}
                <ArrowRight className="size-4" />
              </LinkButton>
            </div>

            <ul className="flex flex-col gap-6">
              {points.map((point) => (
                <li key={point.title} className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-hairline bg-ink">
                    <point.icon className="size-5 text-gold" />
                  </span>
                  <div>
                    <h3 className="font-medium">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mist">
                      {point.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
