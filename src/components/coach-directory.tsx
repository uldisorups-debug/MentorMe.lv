'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CoachCard } from '@/components/coach-card'
import { FilterBar } from '@/components/filter-bar'
import {
  EMPTY_FILTERS,
  filterCoaches,
  type CoachCardData,
  type CoachFilters,
} from '@/lib/coaches'

export function CoachDirectory({
  coaches,
  categories,
  isDemo,
}: {
  coaches: CoachCardData[]
  categories: { value: string; label: string }[]
  /** true, kamēr datubāzē vēl nav publicētu kouču */
  isDemo: boolean
}) {
  const t = useTranslations('Coaches')
  const [filters, setFilters] = useState<CoachFilters>(EMPTY_FILTERS)

  const visible = useMemo(
    () => filterCoaches(coaches, filters),
    [coaches, filters]
  )

  const nicheNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.value, c.label])),
    [categories]
  )

  return (
    <section id="kouci" className="scroll-mt-16 px-6">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        resultCount={visible.length}
      />

      <div className="mx-auto max-w-6xl py-12">
        <header className="mb-8">
          <h2 className="rule-gold font-display text-3xl sm:text-4xl">
            {t('sectionTitle')}
          </h2>
          <p className="mt-4 max-w-xl text-mist">{t('sectionLead')}</p>

          {isDemo && (
            <p className="mt-4 rounded-lg border border-coral/30 bg-coral/10 px-4 py-2.5 text-sm text-coral-soft">
              {t('demoNotice')}
            </p>
          )}
        </header>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-hairline px-6 py-16 text-center text-mist">
            {t('empty')}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                nicheNames={nicheNames}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
