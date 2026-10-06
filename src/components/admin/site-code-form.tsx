'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { saveSiteCode } from '@/app/[locale]/admin/kods/actions'

export function SiteCodeForm({
  initialHead,
  initialBody,
  initialNeedsConsent,
}: {
  initialHead: string
  initialBody: string
  initialNeedsConsent: boolean
}) {
  const [head, setHead] = useState(initialHead)
  const [body, setBody] = useState(initialBody)
  const [needsConsent, setNeedsConsent] = useState(initialNeedsConsent)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function save() {
    setBusy(true)
    setMessage(null)
    const result = await saveSiteCode({ head, body, needsConsent })
    setBusy(false)
    setMessage(
      result.ok
        ? { ok: true, text: 'Saglabāts. Kods jau darbojas visās lapās.' }
        : { ok: false, text: result.error }
    )
  }

  const field = 'min-h-48 font-mono text-xs leading-relaxed'

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Kods &lt;head&gt; daļā
        </span>
        <span className="text-xs text-mist">
          Šeit ielīmē Clarity, Google Analytics, Meta Pixel un verifikācijas
          &lt;meta&gt; tagus.
        </span>
        <Textarea
          value={head}
          onChange={(e) => setHead(e.target.value)}
          spellCheck={false}
          className={field}
          placeholder={'<script>…</script>'}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Kods &lt;body&gt; beigās
        </span>
        <span className="text-xs text-mist">
          Kods, ko rīks prasa likt pirms &lt;/body&gt; (piem., čata logrīki).
        </span>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          spellCheck={false}
          className={field}
          placeholder={'<script>…</script>'}
        />
      </label>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={needsConsent}
          onChange={(e) => setNeedsConsent(e.target.checked)}
          className="mt-0.5 size-4 accent-[var(--gold)]"
        />
        <span>
          Ielādēt tikai pēc sīkdatņu piekrišanas (statistika)
          <span className="mt-0.5 block text-xs text-mist">
            Ieteicams. Clarity, Google Analytics un Meta Pixel liek sīkdatnes,
            un VDAR prasa piekrišanu pirms to ielādes. Izslēdz tikai kodam,
            kas sīkdatnes neliek.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={save} disabled={busy} className="h-10 px-6">
          {busy ? 'Saglabā…' : 'Saglabāt'}
        </Button>
        {message && (
          <p className={message.ok ? 'text-sm text-gold' : 'text-sm text-coral'}>
            {message.text}
          </p>
        )}
      </div>

      <p className="text-xs text-mist">
        Uzmanību: šis kods izpildās katrā lapā katram apmeklētājam. Ielīmē tikai
        kodu no uzticama avota.
      </p>
    </div>
  )
}
