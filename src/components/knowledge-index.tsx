'use client'

import { useTranslations } from 'next-intl'
import {
  Briefcase,
  ChefHat,
  Compass,
  Dumbbell,
  Flower2,
  Globe,
  GraduationCap,
  Hammer,
  HardHat,
  HeartHandshake,
  Languages,
  Laptop,
  Music,
  Palette,
  Scissors,
  Sparkles,
  Sprout,
  type LucideIcon,
} from 'lucide-react'
import type { FilterTaxonomy } from '@/components/filter-bar'
import { cn } from '@/lib/utils'

/** Nozare, kurai nav savas vietas sarakstā — tā ir atkritne, ne joma */
const HIDDEN_SPHERES = new Set(['cits'])

/*
 * Ikonas tādā pašā stilā kā "Tev pieder zināšanas" sadaļā — zelta līnija
 * tumšā kvadrātā. Datubāzē nozarēm ir emocijzīmes, bet blakus pārējai
 * lapai tās izskatītos pēc cita dizaina.
 */
const ICONS: Record<string, LucideIcon> = {
  skola: GraduationCap,
  valodas: Languages,
  muzika: Music,
  amati: Hammer,
  ediens: ChefHat,
  skaistums: Scissors,
  sports: Dumbbell,
  maksla: Palette,
  tradicijas: Flower2,
  daba: Sprout,
  buve: HardHat,
  tehnologijas: Laptop,
  psihologija: HeartHandshake,
  koucings: Compass,
  nauda: Briefcase,
  pieredze: Globe,
}

/**
 * Visas nozares kvadrātiņos zem saraksta.
 *
 * Agrāk nozares bija paslēptas izkrītošā izvēlnē, un pirmais, ko
 * cilvēks redzēja, bija kartītes — lielākoties biznesa jomā. Frizieris,
 * kurš pārdod meistarklases, paskatījās, nodomāja "te tikai biznesa
 * kouči" un aizgāja. Tagad zem saraksta redzams viss, kas te var būt,
 * un katra nozare ir klikšķis, kas sarakstu virs tā sašaurina.
 *
 * Profilu skaitu nerādām: kamēr profilu ir maz, tas izceltu tukšās
 * nozares un pārāk izceltu koučingu.
 */
export function KnowledgeIndex({
  taxonomy,
  active,
  onSelect,
}: {
  taxonomy: FilterTaxonomy
  active: string
  onSelect: (sphere: string) => void
}) {
  const t = useTranslations('Index')

  const spheres = taxonomy.spheres.filter((s) => !HIDDEN_SPHERES.has(s.value))
  const examples = (sphere: string) =>
    taxonomy.groups
      .filter((g) => g.sphere === sphere)
      .slice(0, 3)
      .map((g) => g.label)
      .join(', ')

  if (spheres.length === 0) return null

  return (
    <section aria-labelledby="nozares" className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h2 id="nozares" className="rule-gold font-display text-3xl sm:text-4xl">
            {t('title')} <span className="text-gold">{t('titleAccent')}</span>
          </h2>
          <p className="mt-4 max-w-xl text-mist">{t('lead')}</p>
        </header>

        <ul aria-label={t('label')} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {spheres.map((sphere) => {
            const Icon = ICONS[sphere.value] ?? Sparkles
            const isActive = active === sphere.value

            return (
              <li key={sphere.value}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelect(isActive ? 'all' : sphere.value)}
                  className={cn(
                    'flex h-full w-full flex-col items-start gap-3 rounded-2xl border border-hairline bg-surface p-4 text-left sm:flex-row',
                    'transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40',
                    'focus-visible:border-gold/40 focus-visible:outline-none',
                    isActive && 'border-gold/50 bg-gold/10'
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-hairline bg-ink">
                    <Icon className="size-5 text-gold" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg leading-tight">
                      {sphere.label}
                    </span>
                    <span className="mt-1 line-clamp-2 hidden text-xs leading-relaxed text-mist sm:block">
                      {examples(sphere.value)}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
