import { cn } from '@/lib/utils'

/** Vienota rinda visos administrācijas sarakstos. */
export function AdminRow({
  title,
  subtitle,
  badges,
  actions,
  danger,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  badges?: React.ReactNode
  actions?: React.ReactNode
  danger?: boolean
}) {
  return (
    <li
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-xl border p-4',
        danger ? 'border-coral/30 bg-coral/5' : 'border-hairline bg-surface'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{title}</span>
          {badges}
        </div>
        {subtitle && (
          <div className="mt-1 text-xs text-mist">{subtitle}</div>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </li>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-hairline px-6 py-12 text-center text-sm text-mist">
      {children}
    </p>
  )
}
