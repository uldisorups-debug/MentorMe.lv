import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { TypingHeadline } from '@/components/typing-headline'

/**
 * Apaļais zīmogs hero labajā pusē — teksts pa apli, lēni griežas.
 *
 * textLength izstiepj tekstu tieši pa apļa garumu, tāpēc tas sanāk
 * vienmērīgs jebkurā valodā, lai kā atšķirtos teikuma garums.
 * Tikai lieliem ekrāniem: telefonā tam nav vietas, un tur tas būtu
 * troksnis, ne akcents.
 */
function CircleBadge({ text }: { text: string }) {
  const r = 62
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-4 right-0 hidden size-44 lg:block"
    >
      <svg viewBox="0 0 176 176" className="animate-spin-slow size-full">
        <defs>
          <path
            id="badge-circle"
            d={`M 88,88 m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`}
          />
        </defs>
        <text className="fill-mist font-mono text-[11px] uppercase">
          <textPath href="#badge-circle" textLength={2 * Math.PI * r - 4} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-2xl text-gold">✦</span>
    </div>
  )
}

/**
 * Sākumlapas galva — kā žurnāla vāks, ne kā veidne.
 *
 * Agrāk viss bija centrēts: virsraksts, divas pogas, trīs skaitļi rindā.
 * Tieši tā izskatās katra otrā lapa, ko uzģenerē rīks, un cilvēks to
 * nolasa kā "vēl viena". Tagad teksts stāv pie kreisās malas, rotējošais
 * vārds ir lapas lielākais elements, un mazos datus nes mono burti.
 *
 * Rotējošie vārdi ir visi atslēgvārdi, ko cilvēki meklē: zināšanas,
 * mentors, koučs, privātskolotājs, kursi, meistarklases, retrīti,
 * pieredzes. Ekrānlasītājs un meklētājs tos saņem visus uzreiz caur
 * sr-only tekstu.
 */
export function HeroSection({
  coachCount,
  sphereCount,
}: {
  coachCount: number
  sphereCount: number
}) {
  const t = useTranslations('Hero')
  const rotating = t.raw('rotating') as string[]

  const stats = [
    { value: String(coachCount), label: t('statCoaches', { count: coachCount }) },
    { value: String(sphereCount), label: t('statFields', { count: sphereCount }) },
    { value: '0 €', label: t('statPrice') },
  ]

  return (
    <section className="relative px-6 pt-8 pb-14 sm:pt-12 sm:pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4 font-mono text-[11px] tracking-[0.18em] text-mist uppercase">
          <span>{t('kicker')}</span>
          <span className="hidden md:inline">{t('formats')}</span>
          <span aria-hidden="true" className="hidden whitespace-nowrap sm:inline">
            LV · EN · RU
          </span>
        </div>

        <div className="relative">
          <CircleBadge text={t('badge')} />
          <h1 className="mt-12 font-display sm:mt-16">
            <span className="block text-[clamp(1.75rem,4.2vw,3.5rem)] leading-tight text-cream/85">
              {t('greeting')}
            </span>
            {/*
              min-h tur rindas augstumu, lai teksts zemāk nelēkā, kad vārds
              tiek dzēsts. Izmērs rēķināts no platākā vārda ("мастер-классы?"
              ir ~7,25 em), lai tas telefonā ietilptu vienā rindā, bet uz lielā
              ekrāna neaizķertu apaļo zīmogu labajā pusē.
            */}
            <span className="mt-1 block min-h-[1.05em] text-[clamp(2rem,calc((100vw-3rem)/7.4),8rem)] leading-[1.05] tracking-[-0.03em] whitespace-nowrap italic">
              <TypingHeadline words={rotating} />
            </span>
            <span className="sr-only">{rotating.join(' ')}</span>
          </h1>
        </div>

        <div className="mt-10 grid gap-8 border-t border-hairline pt-8 lg:mt-14 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <p className="max-w-xl text-lg leading-relaxed text-mist text-pretty sm:text-xl">
            {t('subline')}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <LinkButton
              href="/#kouci"
              size="lg"
              className="h-12 w-full gap-2 rounded-full px-7 text-base sm:w-auto"
            >
              {t('ctaPrimary')}
              <ArrowRight className="size-4" />
            </LinkButton>
            <LinkButton
              href="/auth/login?next=%2Fdashboard%2Fprofile"
              size="lg"
              variant="outline"
              className="h-auto min-h-12 w-full rounded-full border-cream/25 bg-transparent px-7 py-2 text-base whitespace-normal hover:border-cream/60 hover:bg-transparent sm:w-auto"
            >
              {t('ctaSecondary')}
            </LinkButton>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-3 border-y border-hairline">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col-reverse py-5 ${i > 0 ? 'border-l border-hairline pl-4 sm:pl-8' : 'pr-4'}`}
            >
              <dt className="mt-1 font-mono text-[10px] tracking-[0.14em] text-mist uppercase sm:text-[11px]">
                {stat.label}
              </dt>
              <dd className="font-display text-3xl text-cream sm:text-5xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
