'use client'

import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EMPTY_FILTERS, type CoachFilters } from '@/lib/coaches'

type Option = { value: string; label: string }

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  const isActive = value !== 'all'

  return (
    <Select items={options} value={value} onValueChange={(next) => onChange(String(next))}>
      <SelectTrigger
        aria-label={label}
        className={
          isActive
            ? 'h-10 border-gold/50 bg-gold/10 text-cream'
            : 'h-10 bg-surface text-mist hover:text-cream'
        }
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function FilterBar({
  filters,
  onChange,
  categories,
  resultCount,
}: {
  filters: CoachFilters
  onChange: (filters: CoachFilters) => void
  categories: Option[]
  resultCount: number
}) {
  const t = useTranslations('Filters')

  const set = <K extends keyof CoachFilters>(key: K, value: CoachFilters[K]) =>
    onChange({ ...filters, [key]: value })

  const isDirty =
    filters.query !== '' ||
    filters.niche !== 'all' ||
    filters.certification !== 'all' ||
    filters.priceTier !== 'all' ||
    filters.language !== 'all'

  return (
    <div className="sticky top-16 z-30 -mx-6 border-y border-hairline bg-ink/80 px-6 py-3 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mist" />
          <Input
            type="search"
            aria-label={t('searchLabel')}
            placeholder={t('searchPlaceholder')}
            value={filters.query}
            onChange={(event) => set('query', event.target.value)}
            className="h-10 bg-surface pl-9"
          />
        </div>

        {/* Mobilajā horizontāls skrolls, lai četri filtri nesaspiežas */}
        <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterSelect
            label={t('field')}
            value={filters.niche}
            onChange={(value) => set('niche', value)}
            options={[{ value: 'all', label: t('fieldAll') }, ...categories]}
          />
          <FilterSelect
            label={t('certification')}
            value={filters.certification}
            onChange={(value) => set('certification', value)}
            options={[
              { value: 'all', label: t('certAll') },
              { value: 'mcc', label: t('certMcc') },
              { value: 'pcc', label: t('certPcc') },
              { value: 'acc', label: t('certAcc') },
              { value: 'metacoach', label: t('certMetacoach') },
              { value: 'other', label: t('certOther') },
              { value: 'none', label: t('certNone') },
            ]}
          />
          <FilterSelect
            label={t('price')}
            value={filters.priceTier}
            onChange={(value) => set('priceTier', value)}
            options={[
              { value: 'all', label: t('priceAll') },
              { value: 'free', label: t('priceFree') },
              { value: 'affordable', label: t('priceAffordable') },
              { value: 'mid', label: t('priceMid') },
              { value: 'premium', label: t('pricePremium') },
            ]}
          />
          <FilterSelect
            label={t('language')}
            value={filters.language}
            onChange={(value) => set('language', value)}
            options={[
              { value: 'all', label: t('langAll') },
              { value: 'lv', label: t('langLv') },
              { value: 'en', label: t('langEn') },
              { value: 'ru', label: t('langRu') },
            ]}
          />

          <span className="ml-auto flex shrink-0 items-center gap-2 pl-2">
            <span
              aria-live="polite"
              className="text-sm whitespace-nowrap text-mist"
            >
              {t('resultCount', { count: resultCount })}
            </span>
            {isDirty && (
              <Button
                variant="ghost"
                size="sm"
                className="text-mist"
                onClick={() => onChange(EMPTY_FILTERS)}
              >
                <X className="size-3.5" />
                {t('reset')}
              </Button>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
