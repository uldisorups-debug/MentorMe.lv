import { cn } from '@/lib/utils'

/** Lauka ietvars: virsraksts, paskaidrojums, kļūda. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {hint && <p className="-mt-1 text-xs leading-relaxed text-mist">{hint}</p>}
      {children}
      {error && <p className="text-xs text-coral">{error}</p>}
    </div>
  )
}

/** Sadaļas kaste ar virsrakstu. */
export function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-hairline bg-surface p-6">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  )
}
