'use client'

import { useState, useTransition } from 'react'
import { Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/dashboard/field'
import { inviteCoach } from '@/app/[locale]/admin/uzaicinajumi/actions'

type Sent = { name: string; email: string }

/**
 * Uzaicinājuma forma.
 *
 * Lauki ir tikai četri, un trīs no tiem nav obligāti. Tā ir apzināta
 * izvēle: pārējo — aprakstu, nozares, cenu, valodas — cilvēks par sevi
 * uzraksta pats un labāk, nekā to par viņu uzminēsim mēs. Mums jādabū
 * viņš iekšā, ne jāuzraksta viņa profils.
 */
export function InviteForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<Sent[]>([])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setError(null)

    startTransition(async () => {
      const result = await inviteCoach(data)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSent((before) => [{ name: result.name, email: result.email }, ...before])
      form.reset()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="E-pasts"
            htmlFor="email"
            hint="Uz šo adresi aiziet uzaicinājums."
          >
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="vards@piemers.lv"
              className="bg-ink"
            />
          </Field>

          <Field label="Vārds un uzvārds" htmlFor="full_name">
            <Input
              id="full_name"
              name="full_name"
              required
              minLength={2}
              maxLength={80}
              autoComplete="off"
              placeholder="Jānis Bērziņš"
              className="bg-ink"
            />
          </Field>

          <Field
            label="Ko māca"
            htmlFor="tagline"
            hint="Neobligāti. Viena rinda, ko viņš pēc tam var pārrakstīt."
          >
            <Input
              id="tagline"
              name="tagline"
              maxLength={120}
              autoComplete="off"
              placeholder="Māca spēlēt kokli"
              className="bg-ink"
            />
          </Field>

          <Field label="Pilsēta" htmlFor="city" hint="Neobligāti.">
            <Input
              id="city"
              name="city"
              maxLength={80}
              autoComplete="off"
              placeholder="Cēsis"
              className="bg-ink"
            />
          </Field>
        </div>

        {error && (
          <p className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral-soft">
            {error}
          </p>
        )}

        <div>
          <Button type="submit" disabled={pending} className="h-11 gap-2 px-6">
            <Send className="size-4" />
            {pending ? 'Sūta…' : 'Nosūtīt uzaicinājumu'}
          </Button>
        </div>
      </form>

      {sent.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sent.map((one) => (
            <li
              key={one.email}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-sm"
            >
              <Check className="size-4 shrink-0 text-gold" />
              <span>{one.name}</span>
              <span className="text-mist">— vēstule aizgāja uz {one.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
