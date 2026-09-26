'use client'

import { useTranslations } from 'next-intl'
import { ArrowUpRight } from 'lucide-react'
import type { FilterTaxonomy } from '@/components/filter-bar'
import { cn } from '@/lib/utils'

/** Nozare, kurai nav savas vietas rādītājā — tā ir atkritne, ne joma */
const HIDDEN_SPHERES = new Set(['cits'])

/**
 * No cik profiliem kopā rādām, cik cilvēku ir katrā nozarē.
 *
 * Kamēr profilu ir maz, skaitļi stāsta nepareizo stāstu: pusē nozaru
 * "vieta pirmajam", bet koučingā un biznesā pa septiņiem — tieši tas
 * "te tikai biznesa kouči" iespaids, ko šī sadaļa ir domāta izkliedēt.
 * Līdz tam rādām tēmu skaitu: tas parāda nozares plašumu un nekad
 * neizskatās tukšs.
 */
const PROFILE_COUNTS_FROM = 50

/**
 * Visas nozares uzreiz, kā grāmatas satura rādītājs.
 *
 * Agrāk nozares bija paslēptas izkrītošā izvēlnē, un pirmais, ko
 * cilvēks redzēja, bija kartītes — lielākoties biznesa jomā. Frizieris,
 * kurš pārdod meistarklases, paskatījās, nodomāja "te tikai biznesa
 * kouči" un aizgāja. Tagad pirms saraksta ir redzams viss, kas te var
 * būt, un katra nozare ir klikšķis, kas sarakstu uzreiz sašaurina.
 *
 * Telefonā divās kolonnās un bez tēmu piemēriem — vienā kolonnā
 * piecpadsmit nozares aizņēma trīs ekrānus, un līdz pašiem profiliem
 * neviens nenonāca.
 *
 * Skaitlis stūrī ir tēmu skaits, līdz direktorijā ir PROFILE_COUNTS_FROM
 * profilu, un pēc tam — profilu skaits nozarē.
 */
export function KnowledgeIndex({
  taxonomy,
  counts,
  total,
  active,
  onSelect,
}: {
  taxonomy: FilterTaxonomy
  /** sfēras slug -> profilu skaits */
  counts: Record<string, number>
  /** Profilu skaits visā direktorijā */
  total: number
  active: string
  onSelect: (sphere: string) => void
}) {
  const t = useTranslations('Index')

  const spheres = taxonomy.spheres.filter((s) => !HIDDEN_SPHERES.has(s.value))
  const topics = (sphere: string) => taxonomy.groups.filter((g) => g.sphere === sphere)
  const examples = (sphere: string) =>
    topics(sphere)
      .slice(0, 4)
      .map((g) => g.label)
      .join(' · ')
  const showProfileCounts = total >= PROFILE_COUNTS_FROM

  return (
    <section aria-labelledby="zinasanu-raditajs" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
          <p className="font-mono text-[11px] tracking-[0.18em] text-mist uppercase">
            <span className="text-gold">(01)</span> {t('eyebrow')}
          </p>
          <div>
            <h2
              id="zinasanu-raditajs"
              className="font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-6xl"
            >
              {t('title')}{' '}
              <em className="text-gold">{t('titleAccent')}</em>
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist text-pretty">
              {t('lead')}
            </p>
          </div>
        </div>

        <ol
          aria-label={t('label')}
          className="mt-14 grid grid-cols-2 border-t border-l border-hairline lg:grid-cols-3"
        >
          {spheres.map((sphere, i) => {
            const count = counts[sphere.value] ?? 0
            const isActive = active === sphere.value

            return (
              <li key={sphere.value} className="border-r border-b border-hairline">
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelect(isActive ? 'all' : sphere.value)}
                  className={cn(
                    'group flex h-full w-full flex-col gap-2 p-4 text-left transition-colors sm:gap-3 sm:p-6',
                    'hover:bg-surface focus-visible:bg-surface focus-visible:outline-none',
                    isActive && 'bg-gold/10'
                  )}
                >
                  <span className="flex flex-wrap items-center justify-between gap-x-2 font-mono text-[10px] tracking-[0.14em] uppercase sm:text-[11px]">
                    <span className="text-mist">{String(i + 1).padStart(2, '0')}</span>
                    {showProfileCounts ? (
                      <span className={count > 0 ? 'text-gold' : 'text-mist/70'}>
                        {t('count', { count })}
                      </span>
                    ) : (
                      <span className="text-mist/70">
                        {t('topics', { count: topics(sphere.value).length })}
                      </span>
                    )}
                  </span>

                  <span className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        'font-display text-lg leading-tight transition-colors sm:text-[1.7rem]',
                        'group-hover:text-gold group-hover:italic',
                        isActive && 'text-gold italic'
                      )}
                    >
                      {sphere.label}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-1 hidden size-5 shrink-0 text-mist sm:block transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold"
                    />
                  </span>

                  <span className="hidden text-sm leading-relaxed text-mist sm:block">
                    {examples(sphere.value)}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
