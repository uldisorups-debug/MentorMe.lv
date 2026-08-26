'use client'

import { useMemo, useState } from 'react'
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
import { CERT_SPHERE, EMPTY_FILTERS, type CoachFilters } from '@/lib/coaches'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

export type FilterTaxonomy = {
  spheres: (Option & { icon: string | null })[]
  /** Visas grupas ar norādi, kurai sfērai pieder */
  groups: (Option & { sphere: string })[]
  regions: Option[]
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  className?: string
}) {
  const isActive = value !== 'all'

  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => onChange(String(next))}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          'h-10',
          isActive
            ? 'border-gold/50 bg-gold/10 text-cream'
            : 'bg-surface text-mist hover:text-cream',
          className
        )}
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

  const set = <K extends keyof CoachFilters>(key: K, value: CoachFilters[K]) =>
    onChange({ ...filters, [key]: value })

  /** Izvēloties sfēru, grupa jāatiestata — citādi paliktu neatbilstoša. */
  const setSphere = (sphere: string) =>
    onChange({ ...filters, sphere, niche: 'all' })

  // Grupu saraksts seko izvēlētajai sfērai
  const groupOptions = useMemo(() => {
    const inSphere =
      filters.sphere === 'all'
        ? taxonomy.groups
        : taxonomy.groups.filter((g) => g.sphere === filters.sphere)
    return [{ value: 'all', label: t('groupAll') }, ...inSphere]
  }, [filters.sphere, taxonomy.groups, t])

  // Sertifikācija ir jēdzīga tikai koučingā
  const showCert = filters.sphere === CERT_SPHERE

  const isDirty = Object.keys(EMPTY_FILTERS).some(
    (key) =>
      filters[key as keyof CoachFilters] !==
      EMPTY_FILTERS[key as keyof CoachFilters]
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
            onChange={(event) => set('query', event.target.value)}
            className="h-11 bg-surface pl-9"
          />
        </div>

        {/* Galvenā rinda: nozare, ko māca, vieta, kā notiek */}
        <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterSelect
            label={t('sphere')}
            value={filters.sphere}
            onChange={setSphere}
            options={[
              { value: 'all', label: t('sphereAll') },
              ...taxonomy.spheres.map((s) => ({
                value: s.value,
                label: s.icon ? `${s.icon} ${s.label}` : s.label,
              })),
            ]}
          />
          <FilterSelect
            label={t('group')}
            value={filters.niche}
            onChange={(value) => set('niche', value)}
            options={groupOptions}
          />
          <FilterSelect
            label={t('region')}
            value={filters.region}
            onChange={(value) => set('region', value)}
            options={[{ value: 'all', label: t('regionAll') }, ...taxonomy.regions]}
          />
          <FilterSelect
            label={t('format')}
            value={filters.format}
            onChange={(value) => set('format', value)}
            options={[
              { value: 'all', label: t('formatAll') },
              { value: 'remote', label: t('formatRemote') },
              { value: 'in_person', label: t('formatInPerson') },
              { value: 'hybrid', label: t('formatHybrid') },
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

        {/* Otrā rinda: retāk vajadzīgie */}
        {showMore && (
          <div className="-mx-6 flex flex-wrap items-center gap-2 border-t border-hairline px-6 pt-3">
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
                checked={filters.tourists}
                onChange={(event) => set('tourists', event.target.checked)}
                className="size-4 accent-[var(--gold)]"
              />
              {t('tourists')}
            </label>

            {filters.region !== 'all' && (
              <p className="w-full text-xs text-mist">{t('remoteNote')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
