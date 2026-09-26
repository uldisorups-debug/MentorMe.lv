import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/link-button'

/**
 * Uzaicinājums tiem, kam pieder zināšanas.
 *
 * Piemēru rinda ir svarīgākā daļa: tā vienā skatienā pasaka, ka te
 * vietas ir friziera meistarklasei un vecmāmiņas zaptei tāpat kā
 * biznesa mentoram. Bez tās "Tev pieder zināšanas" cilvēks, kurš sevi
 * nesauc par kouču, var nolasīt kā "tas nav par mani".
 */
export function ForCoaches() {
  const t = useTranslations('ForCoaches')
  const examples = t.raw('examples') as string[]

  const points = [
    { title: t('point1Title'), body: t('point1Body') },
    { title: t('point2Title'), body: t('point2Body') },
    { title: t('point3Title'), body: t('point3Body') },
  ]

  return (
    <section id="kouciem" className="scroll-mt-16 border-t border-hairline px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
          <p className="font-mono text-[11px] tracking-[0.18em] text-mist uppercase">
            <span className="text-gold">(03)</span> {t('eyebrow')}
          </p>

          <div>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
              {t('title')}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist text-pretty">
              {t('lead')}
            </p>

            <p className="mt-10 font-mono text-[11px] tracking-[0.18em] text-mist uppercase">
              {t('examplesLabel')}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {examples.map((example) => (
                <li
                  key={example}
                  className="rounded-full border border-hairline px-4 py-1.5 font-display text-lg text-cream/90 italic"
                >
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ol className="mt-16 grid border-t border-hairline sm:grid-cols-3">
          {points.map((point, i) => (
            <li
              key={point.title}
              className="border-b border-hairline py-8 sm:border-b-0 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-0"
            >
              <span className="font-display text-5xl text-gold italic">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-lg font-medium">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{point.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-start lg:justify-end">
          <LinkButton
            href="/auth/login?next=%2Fdashboard%2Fprofile"
            size="lg"
            className="h-14 gap-2 rounded-full px-8 text-base"
          >
            {t('cta')}
            <ArrowRight className="size-4" />
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
