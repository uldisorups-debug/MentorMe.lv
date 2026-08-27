'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Bīstamas darbības prasa apstiprinājumu un iemeslu.
 *
 * Iemesls nav birokrātija: pēc mēneša tieši tas atbild uz jautājumu,
 * kāpēc kāds profils pazuda. Tas nonāk žurnālā.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  question,
  onConfirm,
  askReason = false,
  variant = 'ghost',
  className,
  children,
}: {
  label?: string
  confirmLabel: string
  question: string
  onConfirm: (reason: string | null) => Promise<void>
  askReason?: boolean
  variant?: 'ghost' | 'outline' | 'secondary'
  className?: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) {
    return (
      <Button
        variant={variant}
        size="sm"
        className={cn('h-9', className)}
        onClick={() => setOpen(true)}
      >
        {children ?? label}
      </Button>
    )
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-coral/30 bg-coral/5 p-3">
      <p className="w-full text-xs text-coral-soft">{question}</p>

      {askReason && (
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Iemesls (nonāk žurnālā)"
          className="h-9 min-w-48 flex-1 bg-ink"
        />
      )}

      <Button
        variant="outline"
        size="sm"
        className="h-9 border-coral/40 text-coral hover:bg-coral/10"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          await onConfirm(reason.trim() || null)
          setBusy(false)
          setOpen(false)
          setReason('')
        }}
      >
        {busy ? 'Izpilda...' : confirmLabel}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 text-mist"
        disabled={busy}
        onClick={() => {
          setOpen(false)
          setReason('')
        }}
      >
        Atcelt
      </Button>
    </div>
  )
}
