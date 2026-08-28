'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/star-rating'
import { createClient } from '@/lib/supabase/client'
import type { ReviewWithAuthor } from '@/lib/coach-profile'

const PAGE_SIZE = 5

const dateFormatter = new Intl.DateTimeFormat('lv-LV', {
  year: 'numeric',
  month: 'long',
})

function ReportButton({ reviewId }: { reviewId: string }) {
  const t = useTranslations('Reviews')
  const [reported, setReported] = useState(false)

  async function report() {
    setReported(true) // Optimistiski — ziņotājam rezultāts nav svarīgs
    const supabase = createClient()
    const { error } = await supabase
      .from('review_reports')
      .insert({ review_id: reviewId })
    if (error) {
      console.error('Neizdevās nosūtīt ziņojumu:', error.message)
    }
  }

  if (reported) {
    return <span className="text-xs text-mist">{t('reported')}</span>
  }

  return (
    <Button
      variant="ghost"
      size="xs"
      className="text-mist hover:text-coral"
      onClick={report}
    >
      <Flag className="size-3" />
      {t('report')}
    </Button>
  )
}

export function ReviewList({ reviews }: { reviews: ReviewWithAuthor[] }) {
  const t = useTranslations('Reviews')
  const [shown, setShown] = useState(PAGE_SIZE)

  if (reviews.length === 0) {
    return (
      <p className="mt-6 rounded-xl border border-dashed border-hairline px-5 py-8 text-center text-sm text-mist">
        {t('empty')}
      </p>
    )
  }

  const visible = reviews.slice(0, shown)

  return (
    <div className="mt-6">
      <ul className="flex flex-col gap-4">
        {visible.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-hairline bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <StarRating value={review.rating} />
                <span className="sr-only">
                  {t('averageOf', { rating: review.rating })}
                </span>
                <p className="mt-2 text-sm font-medium">
                  {review.author_name ?? (
                    <span className="text-mist italic">
                      {t('anonymousAuthor')}
                    </span>
                  )}
                </p>
              </div>
              <time
                dateTime={review.created_at}
                className="shrink-0 text-xs text-mist"
              >
                {dateFormatter.format(new Date(review.created_at))}
              </time>
            </div>

            {review.body && (
              <p className="mt-3 text-sm leading-relaxed text-mist">
                {review.body}
              </p>
            )}

            <div className="mt-3 flex justify-end">
              <ReportButton reviewId={review.id} />
            </div>
          </li>
        ))}
      </ul>

      {shown < reviews.length && (
        <div className="mt-5 flex flex-col items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShown((current) => current + PAGE_SIZE)}
          >
            {t('showMore')}
          </Button>
          <span className="text-xs text-mist">
            {t('showingCount', { shown: visible.length, total: reviews.length })}
          </span>
        </div>
      )}
    </div>
  )
}
