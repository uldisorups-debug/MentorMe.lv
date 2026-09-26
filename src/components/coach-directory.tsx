'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { CoachCard } from '@/components/coach-card'
import { FilterBar, type FilterTaxonomy } from '@/components/filter-bar'
import { KnowledgeIndex } from '@/components/knowledge-index'
import { LinkButton } from '@/components/link-button'
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

  // Cik profilu katrā nozarē — cilvēks skaitās vienreiz, arī ar četrām tēmām tajā pašā nozarē
  const sphereCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const coach of coaches) {
      const spheres = new Set(coach.niches.map((niche) => nicheToSphere[niche]))
      for (const sphere of spheres) {
        if (sphere) counts[sphere] = (counts[sphere] ?? 0) + 1
      }
    }
    return counts
  }, [coaches, nicheToSphere])

  /*
   * Klikšķis rādītājā ir jauna doma, tāpat kā meklēšana: citi filtri
   * tiek notīrīti, un lapa aizved uz sarakstu, lai cilvēks uzreiz redz,
   * kas atrasts.
   */
  function selectSphere(sphere: string) {
    setFilters({ ...EMPTY_FILTERS, sort: filters.sort, sphere })
    if (sphere !== 'all') {
      document.getElementById('kouci')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const visible = useMemo(
    () =>
      sortCoaches(
        filterCoaches(coaches, filters, nicheToSphere, nicheNames),
        filters.sort
      ),
    [coaches, filters, nicheToSphere, nicheNames]
  )

  return (
    <>
      <KnowledgeIndex
        taxonomy={taxonomy}
        counts={sphereCounts}
        active={filters.sphere}
        onSelect={selectSphere}
      />
      <section id="kouci" className="scroll-mt-16 px-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          taxonomy={taxonomy}
          resultCount={visible.length}
        />

        <div className="mx-auto max-w-6xl py-12">
          <header className="mb-10 grid gap-4 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
            <p className="font-mono text-[11px] tracking-[0.18em] text-mist uppercase">
              <span className="text-gold">(02)</span> {t('eyebrow')}
            </p>
            <div>
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
                {t('sectionTitle')}
              </h2>
              <p className="mt-4 max-w-2xl text-mist text-pretty">{t('sectionLead')}</p>
            </div>
          </header>

          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-hairline px-6 py-16 text-center text-mist">
              <p className="max-w-md">
                {coaches.length === 0
                  ? t('emptyAll')
                  : isOnlySphere(filters)
                    ? t('emptySphere')
                    : t('empty')}
              </p>
              {isOnlySphere(filters) && (
                <LinkButton
                  href="/auth/login?next=%2Fdashboard%2Fprofile"
                  variant="outline"
                  className="h-10 gap-2 rounded-full px-5"
                >
                  {t('emptySphereCta')}
                  <ArrowRight className="size-4" />
                </LinkButton>
              )}
            </div>
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
    </>
  )
}

/**
 * Vai vienīgais ieliktais filtrs ir nozare. Tad tukšs saraksts nozīmē
 * "šeit vēl neviena nav", nevis "tu sašaurināji par daudz" — un
 * pareizā atbilde ir uzaicinājums, ne padoms paplašināt meklēšanu.
 */
function isOnlySphere(filters: CoachFilters): boolean {
  if (filters.sphere === 'all') return false
  return (Object.keys(EMPTY_FILTERS) as (keyof CoachFilters)[]).every(
    (key) => key === 'sphere' || key === 'sort' || filters[key] === EMPTY_FILTERS[key]
  )
}
