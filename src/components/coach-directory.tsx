'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CoachCard } from '@/components/coach-card'
import { FilterBar, type FilterTaxonomy } from '@/components/filter-bar'
import {
  EMPTY_FILTERS,
  filterCoaches,
  sortCoaches,
  type CoachCardData,
  type CoachFilters,
} from '@/lib/coaches'

export function CoachDirectory({
  coaches,
  taxonomy,
}: {
  coaches: CoachCardData[]
  taxonomy: FilterTaxonomy
}) {
  const t = useTranslations('Coaches')
  const [filters, setFilters] = useState<CoachFilters>(EMPTY_FILTERS)

  // grupas slug -> sfēras slug, lai filtrs pēc nozares zinātu, kas kur pieder
  const nicheToSphere = useMemo(
    () => Object.fromEntries(taxonomy.groups.map((g) => [g.value, g.sphere])),
    [taxonomy.groups]
  )

  const nicheNames = useMemo(
    () => Object.fromEntries(taxonomy.groups.map((g) => [g.value, g.label])),
    [taxonomy.groups]
  )

  const regionNames = useMemo(
    () => Object.fromEntries(taxonomy.regions.map((r) => [r.value, r.label])),
    [taxonomy.regions]
  )

  const visible = useMemo(
    () =>
      sortCoaches(
        filterCoaches(coaches, filters, nicheToSphere, nicheNames),
        filters.sort
      ),
    [coaches, filters, nicheToSphere, nicheNames]
  )

  return (
    <section id="kouci" className="scroll-mt-16 px-6">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        taxonomy={taxonomy}
        resultCount={visible.length}
      />

      <div className="mx-auto max-w-6xl py-12">
        <header className="mb-8">
          <h2 className="rule-gold font-display text-3xl sm:text-4xl">
            {t('sectionTitle')}
          </h2>
          <p className="mt-4 max-w-xl text-mist">{t('sectionLead')}</p>
        </header>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-hairline px-6 py-16 text-center text-mist">
            {coaches.length === 0 ? t('emptyAll') : t('empty')}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                nicheNames={nicheNames}
                regionNames={regionNames}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
