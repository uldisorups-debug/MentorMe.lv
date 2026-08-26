import { useTranslations } from 'next-intl'

export function HowItWorks() {
  const t = useTranslations('HowItWorks')

  const steps = [
    { title: t('step1Title'), body: t('step1Body') },
    { title: t('step2Title'), body: t('step2Body') },
    { title: t('step3Title'), body: t('step3Body') },
  ]

  return (
    <section id="ka-tas-darbojas" className="scroll-mt-16 border-t border-hairline px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-xl">
          <h2 className="rule-gold font-display text-3xl sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-mist">{t('lead')}</p>
        </header>

        <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="relative pt-6">
              {/* Līnija virs katra soļa — pirmajam zelta, pārējiem klusa */}
              <span
                aria-hidden="true"
                className={
                  index === 0
                    ? 'absolute top-0 left-0 h-px w-full bg-gradient-to-r from-gold to-hairline'
                    : 'absolute top-0 left-0 h-px w-full bg-hairline'
                }
              />
              <span className="font-display text-5xl text-gold/25 tabular-nums">
                0{index + 1}
              </span>
              <h3 className="mt-3 font-display text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
