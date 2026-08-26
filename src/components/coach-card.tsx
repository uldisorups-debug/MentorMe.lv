import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { BadgeCheck, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/link-button'
import { certLabel, PRICE_TIER_STEPS, type CoachCardData } from '@/lib/coaches'
import { cn } from '@/lib/utils'

/** Iniciāļi avatāra vietā, kamēr bildes nav. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

function PriceTag({ coach }: { coach: CoachCardData }) {
  const t = useTranslations('Price')
  const steps = PRICE_TIER_STEPS[coach.price_tier]

  if (coach.price_tier === 'free') {
    return (
      <span className="text-sm font-medium text-gold">{t('free')}</span>
    )
  }

  const amount =
    coach.price_from && coach.price_to
      ? t('range', { from: coach.price_from, to: coach.price_to })
      : coach.price_from
        ? t('from', { from: coach.price_from })
        : null

  return (
    <span className="flex items-baseline gap-2 text-sm">
      {/* Trīs € simboli, aktīvie zeltā — lētāk lasās nekā skaitlis */}
      <span aria-hidden="true" className="tracking-tight">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={cn(step <= steps ? 'text-gold' : 'text-mist/30')}
          >
            €
          </span>
        ))}
      </span>
      {amount && <span className="text-mist">{amount}</span>}
    </span>
  )
}

function Rating({ coach }: { coach: CoachCardData }) {
  const t = useTranslations('Coaches')

  if (coach.avg_rating === null) {
    return (
      <span className="text-xs text-mist">
        {t('reviews', { count: 0 })}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-xs">
      <Star className="size-3.5 fill-gold text-gold" />
      <span className="font-medium text-cream">
        {coach.avg_rating.toFixed(1)}
      </span>
      <span className="text-mist">
        {t('reviews', { count: coach.review_count })}
      </span>
    </span>
  )
}

export function CoachCard({
  coach,
  nicheNames,
}: {
  coach: CoachCardData
  /** categories.slug -> nosaukums lietotāja valodā */
  nicheNames: Record<string, string>
}) {
  const t = useTranslations('Coaches')
  const cert = certLabel(coach.certification)
  const visibleNiches = coach.niches.slice(0, 2)
  const hiddenCount = coach.niches.length - visibleNiches.length

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl border border-hairline bg-surface p-5',
        'transition-all duration-200 hover:-translate-y-1 hover:border-gold/40',
        'hover:shadow-[0_16px_40px_-24px_rgb(0_0_0/0.9)] focus-within:border-gold/40'
      )}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold/25 to-coral/20 font-display text-lg text-gold"
        >
          {initials(coach.full_name)}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 font-display text-lg leading-tight">
            {/* Visa kartīte kļūst klikšķināma caur šo pseido-elementu */}
            <Link
              href={`/coach/${coach.slug}`}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
            >
              {coach.full_name}
            </Link>
            {coach.is_verified && (
              <BadgeCheck
                className="size-4 shrink-0 text-gold"
                aria-label={t('verified')}
              />
            )}
          </h3>

          {cert && (
            <p className="mt-1 text-xs font-medium tracking-wide text-mist uppercase">
              {cert}
              {coach.years_experience !== null && (
                <span className="ml-2 normal-case">
                  · {t('yearsExperience', { years: coach.years_experience })}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {coach.tagline && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-mist">
          {coach.tagline}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {visibleNiches.map((niche) => (
          <Badge key={niche} variant="outline" className="text-mist">
            {nicheNames[niche] ?? niche}
          </Badge>
        ))}
        {hiddenCount > 0 && (
          <Badge variant="ghost" className="text-mist">
            +{hiddenCount}
          </Badge>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
        <div className="flex flex-col gap-1">
          <PriceTag coach={coach} />
          <Rating coach={coach} />
        </div>

        {/* relative + z-10, lai poga stāv virs kartītes klikšķa laukuma */}
        <LinkButton
          href={`/coach/${coach.slug}`}
          variant="secondary"
          className="relative z-10 h-9"
        >
          {t('book')}
        </LinkButton>
      </div>
    </article>
  )
}
