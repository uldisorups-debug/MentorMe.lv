'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Status =
  | { kind: 'loading' }
  | { kind: 'anonymous' }
  | { kind: 'own-profile' }
  | { kind: 'already-reviewed' }
  | { kind: 'ready'; userId: string }
  | { kind: 'done' }

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const t = useTranslations('Reviews')
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div
      role="radiogroup"
      aria-label={t('formRating')}
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={t('averageOf', { rating: star })}
          className="rounded p-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              'size-6 transition-colors',
              star <= active ? 'fill-gold text-gold' : 'text-mist/30'
            )}
          />
        </button>
      ))}
    </div>
  )
}

/**
 * Atsauksmes forma.
 *
 * Auth pārbaude notiek pārlūkā, nevis serverī — tā lapa paliek statiska
 * un ISR turpina strādāt. Neielogotais redz aicinājumu ienākt, un pēc
 * atgriešanās forma ir turpat, kur viņš to pameta.
 */
export function ReviewForm({
  coachId,
  coachUserId,
}: {
  coachId: string
  /** Kouča user_id — lai neļautu rakstīt atsauksmi pašam sev. */
  coachUserId: string | null
}) {
  const t = useTranslations('Reviews')
  const router = useRouter()
  const pathname = usePathname()

  const [status, setStatus] = useState<Status>({ kind: 'loading' })
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function resolveStatus() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (!user) {
        setStatus({ kind: 'anonymous' })
        return
      }

      if (coachUserId && user.id === coachUserId) {
        setStatus({ kind: 'own-profile' })
        return
      }

      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('coach_id', coachId)
        .eq('client_id', user.id)
        .maybeSingle()

      if (cancelled) return
      setStatus(
        existing ? { kind: 'already-reviewed' } : { kind: 'ready', userId: user.id }
      )
    }

    resolveStatus()
    return () => {
      cancelled = true
    }
  }, [coachId, coachUserId])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (status.kind !== 'ready' || rating === 0) return

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('reviews').insert({
      coach_id: coachId,
      client_id: status.userId,
      rating,
      body: body.trim() || null,
      is_anonymous: anonymous,
    })

    setSubmitting(false)

    if (insertError) {
      setError(t('errorGeneric'))
      console.error('Neizdevās saglabāt atsauksmi:', insertError.message)
      return
    }

    setStatus({ kind: 'done' })
    router.refresh()
  }

  if (status.kind === 'loading') {
    return <div className="mt-8 h-24 animate-pulse rounded-xl bg-surface" />
  }

  if (status.kind === 'done') {
    return (
      <p className="mt-8 rounded-xl border border-gold/30 bg-gold/10 px-5 py-4 text-sm text-gold-soft">
        {t('success')}
      </p>
    )
  }

  if (status.kind !== 'ready') {
    const message = {
      anonymous: t('loginPrompt'),
      'own-profile': t('ownProfile'),
      'already-reviewed': t('alreadyReviewed'),
    }[status.kind]

    return (
      <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-hairline bg-surface px-5 py-5">
        <p className="text-sm text-mist">{message}</p>
        {status.kind === 'anonymous' && (
          <LinkButton
            href={`/auth/login?next=${encodeURIComponent(pathname ?? '/')}`}
            variant="outline"
          >
            {t('loginCta')}
          </LinkButton>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 rounded-xl border border-hairline bg-surface px-5 py-5"
    >
      <h3 className="font-display text-lg">{t('formTitle')}</h3>

      <div className="mt-4">
        <span className="block text-sm font-medium">{t('formRating')}</span>
        <span className="mt-1 block text-xs text-mist">
          {t('formRatingHint')}
        </span>
        <div className="mt-2">
          <StarPicker value={rating} onChange={setRating} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="review-body" className="block text-sm font-medium">
          {t('formBody')}
        </label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t('formPlaceholder')}
          rows={4}
          maxLength={1500}
          className="mt-2 bg-ink"
        />
      </div>

      <div className="mt-5 rounded-lg border border-hairline bg-ink px-4 py-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(event) => setAnonymous(event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--gold)]"
          />
          <span>
            <span className="block text-sm font-medium">
              {t('anonymousToggle')}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-mist">
              {t('anonymousHint')}
            </span>
          </span>
        </label>
      </div>

      <p className="mt-3 text-xs text-mist">{t('permanentNote')}</p>

      {error && <p className="mt-3 text-sm text-coral">{error}</p>}

      <Button
        type="submit"
        disabled={rating === 0 || submitting}
        className="mt-5 h-10"
      >
        {submitting ? t('formSubmitting') : t('formSubmit')}
      </Button>
    </form>
  )
}
