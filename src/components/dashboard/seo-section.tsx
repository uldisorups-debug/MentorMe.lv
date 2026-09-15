'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/** Google nogriež virsrakstu ap šo, aprakstu ap otro. */
const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 155

export type SeoDraft = {
  meta_title: string
  meta_description: string
}

function Counter({ value, limit }: { value: string; limit: number }) {
  const used = value.trim().length
  const over = used > limit

  return (
    <span
      className={
        over ? 'text-xs text-coral' : 'text-xs text-mist'
      }
    >
      {used} / {limit}
    </span>
  )
}

/**
 * Kā profils izskatīsies Google rezultātos.
 *
 * Galvenais te nav divi lauki, bet priekšskatījums zem tiem. Cilvēks,
 * kurš raksta "meta aprakstu", nezina, ko tas dara; cilvēks, kurš redz
 * savu ierakstu Google izskatā, saprot uzreiz un sāk to slīpēt.
 *
 * Atslēgvārdu lauka te nav ar nolūku. Google to neskatās kopš 2009. gada,
 * un lauks, kas neko nedara, māca cilvēku pildīt tukšumu.
 */
export function SeoSection({
  seo,
  onChange,
  fallbackTitle,
  fallbackDescription,
  slug,
}: {
  seo: SeoDraft
  onChange: (next: SeoDraft) => void
  /** Ko kods ģenerē, ja lauks palicis tukšs */
  fallbackTitle: string
  fallbackDescription: string
  slug: string
}) {
  const t = useTranslations('Editor')

  const set = <K extends keyof SeoDraft>(key: K, value: string) =>
    onChange({ ...seo, [key]: value })

  const shownTitle = seo.meta_title.trim() || fallbackTitle
  const shownDescription = seo.meta_description.trim() || fallbackDescription

  const cut = (text: string, limit: number) =>
    text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-mist">{t('seoLead')}</p>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-sm">{t('seoTitle')}</span>
          <Counter value={seo.meta_title} limit={TITLE_LIMIT} />
        </span>
        <Input
          value={seo.meta_title}
          onChange={(event) => set('meta_title', event.target.value)}
          placeholder={fallbackTitle}
          className="bg-ink"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-sm">{t('seoDescription')}</span>
          <Counter value={seo.meta_description} limit={DESCRIPTION_LIMIT} />
        </span>
        <Textarea
          rows={3}
          value={seo.meta_description}
          onChange={(event) => set('meta_description', event.target.value)}
          placeholder={fallbackDescription}
          className="bg-ink"
        />
      </label>

      {/* Priekšskatījums Google izskatā — tas te ir galvenais */}
      <div className="rounded-xl border border-hairline bg-ink p-5">
        <p className="mb-3 text-xs tracking-widest text-mist uppercase">
          {t('seoPreview')}
        </p>

        <p className="text-xs text-mist">mentorme.lv › profils › {slug}</p>
        <p className="mt-1 text-lg leading-snug text-[#8ab4f8]">
          {cut(shownTitle, TITLE_LIMIT)}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-mist">
          {cut(shownDescription, DESCRIPTION_LIMIT)}
        </p>
      </div>

      <p className="text-xs leading-relaxed text-mist">{t('seoHint')}</p>
    </div>
  )
}
