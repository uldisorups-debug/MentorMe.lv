import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Zvaigznes ar pusgraduāciju caur pārklājumu — nevis noapaļošanu,
 * lai 4.6 un 4.9 vizuāli atšķiras.
 */
export function StarRating({
  value,
  size = 'sm',
  className,
}: {
  value: number
  size?: 'sm' | 'lg'
  className?: string
}) {
  const box = size === 'lg' ? 'size-5' : 'size-3.5'
  const filled = Math.max(0, Math.min(5, value))

  return (
    <span className={cn('relative inline-flex', className)} aria-hidden="true">
      <span className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={cn(box, 'text-mist/25')} />
        ))}
      </span>
      <span
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ width: `${(filled / 5) * 100}%` }}
      >
        <span className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(box, 'shrink-0 fill-gold text-gold')} />
          ))}
        </span>
      </span>
    </span>
  )
}
