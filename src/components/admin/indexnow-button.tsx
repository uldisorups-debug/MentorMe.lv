'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Poga "paziņot visas lapas meklētājiem". Lietot pēc jauniem rakstiem,
 * kas ievietoti tieši datubāzē, vai pēc lielām izmaiņām tēmu lapās.
 * Bieži spiest nav jēgas: IndexNow lūdz nesūtīt nemainītas adreses
 * atkārtoti, un pārāk bieža sūtīšana var tikt ignorēta.
 */
export function IndexNowButton() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function send() {
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/indexnow', { method: 'POST' })
      const data = (await response.json()) as {
        ok: boolean
        sent?: number
        status?: number | null
      }
      if (data.ok) {
        setMessage(`Nosūtītas ${data.sent} adreses. IndexNow tās pieņēma.`)
      } else if (data.status) {
        setMessage(`IndexNow atbildēja ar kodu ${data.status}. Mēģini vēlāk.`)
      } else {
        setMessage('IndexNow neatbildēja vai nav tiesību. Mēģini vēlāk.')
      }
    } catch {
      setMessage('Neizdevās nosūtīt. Mēģini vēlāk.')
    }
    setBusy(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" onClick={send} disabled={busy}>
        {busy ? 'Sūta…' : 'Paziņot visas lapas meklētājiem'}
      </Button>
      {message && <p className="text-sm text-mist">{message}</p>}
    </div>
  )
}
