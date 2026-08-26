import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Iniciāļi, kamēr bildes nav. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

/**
 * Kouča bilde ar iniciāļu atkāpšanos.
 *
 * Viena vieta abām lietojuma vietām — kartītei un profila lapai — lai
 * neatkārtotos un lai bilde nepazustu vienā no tām, kā tas bija sākumā.
 */
export function CoachAvatar({
  name,
  url,
  px,
  className,
}: {
  name: string
  url: string | null
  /** Malas garums pikseļos — vajadzīgs arī Image sizes atribūtam */
  px: number
  className?: string
}) {
  const shared = cn(
    'relative shrink-0 overflow-hidden bg-gradient-to-br from-gold/25 to-coral/20',
    className
  )

  if (!url) {
    return (
      <span
        aria-hidden="true"
        className={cn(shared, 'grid place-items-center font-display text-gold')}
        style={{ width: px, height: px, fontSize: Math.round(px * 0.32) }}
      >
        {initials(name)}
      </span>
    )
  }

  return (
    <span className={shared} style={{ width: px, height: px }}>
      <Image
        src={url}
        alt={name}
        fill
        sizes={`${px}px`}
        className="object-cover"
      />
    </span>
  )
}
