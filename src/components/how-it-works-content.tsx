import { Check, Clock, Search, Sparkles } from 'lucide-react'
import type { HowContent } from '@/content/how-it-works'

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

/**
 * Algoritma daļa bez virsraksta un CTA.
 *
 * Vienā vietā tāpēc, ka to rāda divās: sākumlapas sadaļā un lapā
 * /ka-tas-darbojas. Divi eksemplāri nozīmētu, ka labojums vienā vietā
 * klusi neaizsniedz otru.
 */
export function HowItWorksContent({ c }: { c: HowContent }) {
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
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
    </>
  )
}
