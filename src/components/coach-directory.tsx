'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CoachCard } from '@/components/coach-card'
import { FilterBar, type FilterTaxonomy } from '@/components/filter-bar'
import { KnowledgeIndex } from '@/components/knowledge-index'
import { LinkButton } from '@/components/link-button'
import {
  EMPTY_FILTERS,
  closestCoaches,
  filterCoaches,
  sortCoaches,
  suggestedSpheres,
  type CoachCardData,
  type CoachFilters,
} from '@/lib/coaches'
import { cn } from '@/lib/utils'

/*
 * Cik profilu rādīt uzreiz. Pārējie — pēc pogas "Rādīt vēl".
 *
 * Paslēptie kartītes paliek lapā (tikai neredzami), nevis netiek
 * renderēti vispār: tā Google joprojām redz saites uz visiem profiliem
 * no sākumlapas, arī uz trīsdesmit pirmo.
 */
const PAGE_SIZE = 30

export function CoachDirectory({
  coaches,
  taxonomy,
}: {
  coaches: CoachCardData[]
  taxonomy: FilterTaxonomy
}) {
  const t = useTranslations('Coaches')
  const [filters, setFilters] = useState<CoachFilters>(EMPTY_FILTERS)
  const [limit, setLimit] = useState(PAGE_SIZE)

  // Jauns filtrs — jauns saraksts, un tas sākas atkal no pirmajiem trīsdesmit
  function updateFilters(next: CoachFilters) {
    setFilters(next)
    setLimit(PAGE_SIZE)
  }

  // grupas slug -> sfēras slug, lai filtrs pēc nozares zinātu, kas kur pieder
  const nicheToSphere = useMemo(
    () => Object.fromEntries(taxonomy.groups.map((g) => [g.value, g.sphere])),
    [taxonomy.groups]
  )

  const nicheNames = useMemo(
    () => Object.fromEntries(taxonomy.groups.map((g) => [g.value, g.label])),
    [taxonomy.groups]
  )

  const sphereNames = useMemo(
    () => Object.fromEntries(taxonomy.spheres.map((s) => [s.value, s.label])),
    [taxonomy.spheres]
  )

  const regionNames = useMemo(
    () => Object.fromEntries(taxonomy.regions.map((r) => [r.value, r.label])),
    [taxonomy.regions]
  )

  const exact = useMemo(
    () =>
      sortCoaches(
        filterCoaches(coaches, filters, nicheToSphere, nicheNames, sphereNames),
        filters.sort
      ),
    [coaches, filters, nicheToSphere, nicheNames, sphereNames]
  )

  /*
   * Ja visiem meklētajiem vārdiem neatbilst neviens, rādām tos, kam
   * atbilst daļa — "kokles stundas Rīgā" labāk parāda visus Rīgā, nekā
   * tukšu lapu. Virs saraksta pasakām, ka šie ir tuvākie, ne precīzie.
   */
  const closest = useMemo(
    () =>
      exact.length > 0
        ? []
        : closestCoaches(coaches, filters, nicheToSphere, nicheNames, sphereNames),
    [exact.length, coaches, filters, nicheToSphere, nicheNames, sphereNames]
  )

  const list = exact.length > 0 ? exact : closest
  const isClosest = exact.length === 0 && closest.length > 0

  // Nozares, kurās kāds ir — tikai tās ir vērts ieteikt, kad neviens neatbilst
  const nonEmptySpheres = useMemo(
    () => new Set(coaches.flatMap((c) => c.niches.map((n) => nicheToSphere[n]))),
    [coaches, nicheToSphere]
  )

  const suggestions =
    list.length === 0 && filters.query.trim() !== ''
      ? suggestedSpheres(filters.query, taxonomy.groups, taxonomy.spheres, nonEmptySpheres)
      : []

  /*
   * Klikšķis uz nozares kvadrāta ir jauna doma, tāpat kā meklēšana:
   * citi filtri tiek notīrīti, un lapa aizved uz sarakstu, lai cilvēks
   * uzreiz redz, kas atrasts.
   */
  function selectSphere(sphere: string) {
    updateFilters({ ...EMPTY_FILTERS, sort: filters.sort, sphere })
    document.getElementById('kouci')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const remaining = list.length - limit

  return (
    <>
      <KnowledgeIndex taxonomy={taxonomy} active={filters.sphere} onSelect={selectSphere} />

      <section id="kouci" className="scroll-mt-16 px-6">
        <FilterBar
          filters={filters}
          onChange={updateFilters}
          taxonomy={taxonomy}
          resultCount={list.length}
        />

        <div className="mx-auto max-w-6xl py-12">
          <header className="mb-8">
            <h2 className="rule-gold font-display text-3xl sm:text-4xl">
              {t('sectionTitle')}
            </h2>
            <p className="mt-4 max-w-xl text-mist">{t('sectionLead')}</p>
          </header>

          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-hairline px-6 py-16 text-center text-mist">
              <p className="max-w-md">
                {coaches.length === 0
                  ? t('emptyAll')
                  : filters.query.trim() !== ''
                    ? t('noMatch', { query: filters.query.trim() })
                    : t('empty')}
              </p>

              {suggestions.length > 0 && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm">{t('suggestLabel')}</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((sphere) => (
                      <Button
                        key={sphere}
                        variant="outline"
                        onClick={() => selectSphere(sphere)}
                      >
                        {sphereNames[sphere]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {coaches.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="secondary" onClick={() => updateFilters(EMPTY_FILTERS)}>
                    {t('showAll')}
                  </Button>
                  <LinkButton href="/auth/login?next=%2Fdashboard%2Fprofile" variant="ghost">
                    {t('addOwn')}
                  </LinkButton>
                </div>
              )}
            </div>
          ) : (
            <>
              {isClosest && <p className="mb-6 text-sm text-mist">{t('closestNotice')}</p>}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((coach, i) => (
                  // grid, lai kartīte izstieptos visā rindas augstumā
                  <div key={coach.id} className={cn('grid', i >= limit && 'hidden')}>
                    <CoachCard
                      coach={coach}
                      nicheNames={nicheNames}
                      regionNames={regionNames}
                    />
                  </div>
                ))}
              </div>

              {remaining > 0 && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setLimit((current) => current + PAGE_SIZE)}
                  >
                    {t('showMore', { count: Math.min(remaining, PAGE_SIZE) })}
                  </Button>
                  <span className="text-xs text-mist">
                    {t('showingCount', { shown: limit, total: list.length })}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </section>

    </>
  )
}
