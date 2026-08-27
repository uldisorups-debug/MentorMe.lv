import { getLocale } from 'next-intl/server'
import { ArrowRight, Check, Clock, Search, Sparkles } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { HOW_IT_WORKS } from '@/content/how-it-works'
import { routing } from '@/i18n/routing'

function Steps({
  title,
  steps,
  note,
  icon: Icon,
  accent,
}: {
  title: string
  steps: [string, string][]
  note: string
  icon: typeof Search
  accent: 'gold' | 'coral'
}) {
  const ring = accent === 'gold' ? 'border-gold/30' : 'border-coral/30'
  const text = accent === 'gold' ? 'text-gold' : 'text-coral'

  return (
    <div className="flex flex-col rounded-2xl border border-hairline bg-surface p-6">
      <h3 className="flex items-center gap-2.5 font-display text-xl">
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl border ${ring} bg-ink`}>
          <Icon className={`size-4 ${text}`} />
        </span>
        {title}
      </h3>

      <ol className="mt-6 flex flex-1 flex-col gap-5">
        {steps.map(([stepTitle, stepBody], index) => (
          <li key={stepTitle} className="flex gap-4">
            <span className={`font-display text-lg tabular-nums ${text} opacity-50`}>
              {index + 1}
            </span>
            <span>
              <span className="block font-medium">{stepTitle}</span>
              <span className="mt-1 block text-sm leading-relaxed text-mist">
                {stepBody}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-6 border-t border-hairline pt-4 text-xs leading-relaxed text-mist">
        {note}
      </p>
    </div>
  )
}

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

        {/* Divi ceļi blakus — lapai ir divas puses, un abas jāredz uzreiz */}
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Steps
            title={c.seekerTitle}
            steps={c.seekerSteps}
            note={c.seekerNote}
            icon={Search}
            accent="gold"
          />
          <Steps
            title={c.ownerTitle}
            steps={c.ownerSteps}
            note={c.ownerNote}
            icon={Sparkles}
            accent="coral"
          />
        </div>

        {/* Sezonalitāte — tas, kāpēc šeit nav jāatgriežas */}
        <div className="mt-5 rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
          <h3 className="flex items-center gap-2.5 font-display text-xl">
            <Clock className="size-5 shrink-0 text-gold" />
            {c.waitTitle}
          </h3>
          <div className="mt-4 flex max-w-3xl flex-col gap-3">
            {c.waitBody.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-mist">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* Doma, ar kuru viss sākās */}
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-coral/5 p-6 sm:p-8">
            <p className="text-xs font-medium tracking-widest text-gold uppercase">
              {c.mentorTitle}
            </p>
            <p className="mt-4 font-display text-2xl leading-snug text-balance">
              {c.mentorBody}
            </p>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
            <h3 className="font-display text-xl">{c.freeTitle}</h3>
            <dl className="mt-4 flex flex-col">
              {c.freeBody.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-t border-hairline py-3 first:border-t-0 first:pt-0"
                >
                  <dt className="text-sm text-mist">{label}</dt>
                  <dd className="flex items-center gap-1.5 text-sm font-medium text-gold">
                    <Check className="size-3.5" />
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
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
