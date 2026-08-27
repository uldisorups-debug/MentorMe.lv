import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { TypingHeadline } from '@/components/typing-headline'

export function HeroSection({
  coachCount,
  sphereCount,
}: {
  coachCount: number
  sphereCount: number
}) {
  const t = useTranslations('Hero')
  const rotating = t.raw('rotating') as string[]

  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl leading-[1.1] font-medium text-balance sm:text-6xl">
          {t('greeting')}
          <br />
          {/* Rinda ar rotējošo vārdu — min-h tur augstumu, lai teksts zemāk nelēkā */}
          <span className="mt-2 inline-flex min-h-[1.2em] items-center justify-center">
            <TypingHeadline words={rotating} />
          </span>
          <span className="sr-only">
            {t('greeting')} {rotating.join(' ')}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-mist text-balance sm:text-xl">
          {t('subline')}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton
            href="/#kouci"
            size="lg"
            className="h-12 w-full gap-2 px-6 text-base shadow-[0_0_40px_-12px_var(--gold)] sm:w-auto"
          >
            {t('ctaPrimary')}
            <ArrowRight className="size-4" />
          </LinkButton>
          <LinkButton
            href="/auth/login?next=%2Fdashboard%2Fprofile"
            size="lg"
            variant="outline"
            className="h-12 w-full px-6 text-base sm:w-auto"
          >
            {t('ctaSecondary')}
          </LinkButton>
        </div>

        <dl className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="sr-only">{t('statCoaches')}</dt>
            <dd className="font-display text-2xl text-gold">{coachCount}</dd>
            <span className="text-mist">{t('statCoaches')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="sr-only">{t('statFields')}</dt>
            <dd className="font-display text-2xl text-gold">{sphereCount}</dd>
            <span className="text-mist">{t('statFields')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="sr-only">{t('statPrice')}</dt>
            <dd className="font-display text-2xl text-gold">0 €</dd>
            <span className="text-mist">{t('statPrice')}</span>
          </div>
        </dl>
      </div>
    </section>
  )
}
