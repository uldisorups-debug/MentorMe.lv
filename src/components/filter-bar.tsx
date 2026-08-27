'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CERT_SPHERE,
  EMPTY_FILTERS,
  filtersOnNewSearch,
  type BudgetMode,
  type CoachFilters,
} from '@/lib/coaches'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

export type FilterTaxonomy = {
  spheres: (Option & { icon: string | null })[]
  groups: (Option & { sphere: string })[]
  regions: Option[]
}

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
  // 'all' un 'none' abi nozīmē "nav izvēlēts" — poga tad nav izcelta
  const isActive = value !== 'all' && value !== 'none'

  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => onChange(String(next))}
    >
      {/*
        max-w un truncate uz izvēlnes pogas, nevis uz saraksta: garš
        nosaukums nedrīkst izstiept joslu, bet atvērtajā sarakstā tam
        jābūt redzamam pilnībā. Tāpēc SelectContent ir platāks.
      */}
      <SelectTrigger
        aria-label={label}
        className={cn(
          'h-10 max-w-52',
          isActive
            ? 'border-gold/50 bg-gold/10 text-cream'
            : 'bg-surface text-mist hover:text-cream'
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-96 min-w-64">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="whitespace-nowrap">{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function FilterBar({
  filters,
  onChange,
  taxonomy,
  resultCount,
}: {
  filters: CoachFilters
  onChange: (filters: CoachFilters) => void
  taxonomy: FilterTaxonomy
  resultCount: number
}) {
  const t = useTranslations('Filters')
  const [showMore, setShowMore] = useState(false)
  const [justSearched, setJustSearched] = useState(false)

  const set = <K extends keyof CoachFilters>(key: K, value: CoachFilters[K]) =>
    onChange({ ...filters, [key]: value })

  /**
   * Meklēšana ir jauna doma, ne esošās sašaurināšana. Sākot rakstīt,
   * pārējie filtri tiek notīrīti — citādi cilvēks meklē "kokle" un
   * neko neatrod, jo pirms piecām minūtēm bija uzlicis "Rīga".
   */
  function onSearch(value: string) {
    const wasEmpty = filters.query.trim() === ''
    const nowHas = value.trim() !== ''

    if (wasEmpty && nowHas) {
      onChange({ ...filtersOnNewSearch(value), sort: filters.sort })
      setJustSearched(true)
    } else {
      set('query', value)
      if (!nowHas) setJustSearched(false)
    }
  }

  const showCert = filters.sphere === CERT_SPHERE

  const isDirty = (Object.keys(EMPTY_FILTERS) as (keyof CoachFilters)[]).some(
    (key) => filters[key] !== EMPTY_FILTERS[key]
  )

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
            onChange={(event) => onSearch(event.target.value)}
            className="h-11 bg-surface pl-9"
          />
        </div>

        {justSearched && filters.query.trim() !== '' && (
          <p className="text-xs text-mist">{t('searchResets')}</p>
        )}

        <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterSelect
            label={t('sphere')}
            value={filters.sphere}
            onChange={(value) => set('sphere', value)}
            options={[
              { value: 'all', label: t('sphereAll') },
              ...taxonomy.spheres.map((s) => ({
                value: s.value,
                label: s.icon ? `${s.icon} ${s.label}` : s.label,
              })),
            ]}
          />
          <FilterSelect
            label={t('format')}
            value={filters.format}
            onChange={(value) => set('format', value)}
            options={[
              { value: 'all', label: t('formatAll') },
              { value: 'in_person', label: t('formatInPerson') },
              { value: 'remote', label: t('formatRemote') },
              { value: 'hybrid', label: t('formatHybrid') },
            ]}
          />
          <FilterSelect
            label={t('region')}
            value={filters.region}
            onChange={(value) => set('region', value)}
            options={[{ value: 'all', label: t('regionAll') }, ...taxonomy.regions]}
          />
          <FilterSelect
            label={t('budget')}
            value={filters.budget}
            onChange={(value) => set('budget', value as BudgetMode)}
            options={[
              { value: 'all', label: t('budgetAll') },
              { value: 'free', label: t('budgetFree') },
              { value: 'paid', label: t('budgetPaid') },
            ]}
          />
          <FilterSelect
            label={t('sort')}
            value={filters.sort}
            onChange={(value) => set('sort', value as CoachFilters['sort'])}
            options={[
              { value: 'none', label: t('sortNone') },
              { value: 'popular', label: t('sortPopular') },
              { value: 'rated', label: t('sortRated') },
              { value: 'newest', label: t('sortNewest') },
            ]}
          />

          <Button
            variant="ghost"
            size="sm"
            className={cn('shrink-0', showMore ? 'text-cream' : 'text-mist')}
            aria-expanded={showMore}
            onClick={() => setShowMore((current) => !current)}
          >
            <SlidersHorizontal className="size-3.5" />
            {showMore ? t('less') : t('more')}
          </Button>

          <span className="ml-auto flex shrink-0 items-center gap-2 pl-2">
            <span aria-live="polite" className="text-sm whitespace-nowrap text-mist">
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

        {showMore && (
          <div className="-mx-6 flex flex-wrap items-center gap-3 border-t border-hairline px-6 pt-3">
            {/* Cik cilvēks pats ir gatavs maksāt */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-mist">{t('budgetFrom')}</span>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label={`${t('budget')} ${t('budgetFrom')}`}
                value={filters.budgetFrom}
                onChange={(event) => set('budgetFrom', event.target.value)}
                className="h-10 w-20 bg-surface"
              />
              <span className="text-sm text-mist">{t('budgetTo')}</span>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label={`${t('budget')} ${t('budgetTo')}`}
                value={filters.budgetTo}
                onChange={(event) => set('budgetTo', event.target.value)}
                className="h-10 w-20 bg-surface"
              />
              <span className="text-sm whitespace-nowrap text-mist">
                {t('budgetCurrency')}
              </span>
            </div>

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

            {showCert && (
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
            )}

            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-2 text-sm text-mist">
              <input
                type="checkbox"
                checked={filters.masterclass}
                onChange={(event) => set('masterclass', event.target.checked)}
                className="size-4 accent-[var(--gold)]"
              />
              {t('masterclass')}
            </label>

            {(filters.budgetFrom || filters.budgetTo) && (
              <p className="w-full text-xs text-mist">{t('budgetHint')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
