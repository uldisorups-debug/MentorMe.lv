'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Vairāku vērtību izvēle ar pogām, nevis dropdown — ātrāk uz telefona. */
export function ChipPicker({
  options,
  selected,
  onChange,
  max,
  label,
}: {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  max?: number
  label: string
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      if (max !== undefined && selected.length >= max) return
      onChange([...selected, value])
    }
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value)
        const atLimit =
          !isSelected && max !== undefined && selected.length >= max

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            disabled={atLimit}
            onClick={() => toggle(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
              'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              isSelected
                ? 'border-gold/50 bg-gold/15 text-cream'
                : 'border-hairline bg-ink text-mist hover:border-mist/40 hover:text-cream',
              atLimit && 'cursor-not-allowed opacity-40 hover:border-hairline'
            )}
          >
            {isSelected && <Check className="size-3.5 text-gold" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
