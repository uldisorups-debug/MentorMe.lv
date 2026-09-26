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
 * Visas nozares kvadrātiņos starp augšējo sadaļu un meklēšanu.
 *
 * Agrāk nozares bija paslēptas izkrītošā izvēlnē, un pirmais, ko
 * cilvēks redzēja, bija kartītes — lielākoties biznesa jomā. Frizieris,
 * kurš pārdod meistarklases, paskatījās, nodomāja "te tikai biznesa
 * kouči" un aizgāja. Tagad pirms saraksta redzams viss, kas te var būt,
 * un katra nozare ir klikšķis, kas sarakstu uzreiz sašaurina.
 *
 * Bez virsraksta un apraksta: kvadrāti runā paši par sevi. Telefonā
 * tie ir kompakti (ikona blakus nosaukumam, bez tēmu piemēriem), lai
 * meklēšana un profili nepazustu trīs ekrānus zemāk.
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
    <section aria-label={t('label')} className="px-6 pb-12 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
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
                    'flex h-full w-full items-center gap-3 rounded-2xl border border-hairline bg-surface p-3 text-left sm:items-start sm:p-4',
                    'transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40',
                    'focus-visible:border-gold/40 focus-visible:outline-none',
                    isActive && 'border-gold/50 bg-gold/10'
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-hairline bg-ink sm:size-10 sm:rounded-xl">
                    <Icon className="size-4 text-gold sm:size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[0.95rem] leading-tight sm:text-lg">
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
