'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logAdminAction } from '@/lib/admin'
import { slugify } from '@/lib/slugify'
import { createClient } from '@/lib/supabase/client'

type Admin = { adminId: string; adminName: string | null }

/**
 * Ieteiktās tēmas apstiprināšana: nosaukumu var pielabot, nozari
 * izvēlas administrators. Viss pārējais notiek datubāzes funkcijā
 * approve_topic_suggestion vienā transakcijā — tēma, statuss un
 * ieteicēja profils.
 */
export function TopicActions({
  id,
  text,
  spheres,
  admin,
}: {
  id: string
  text: string
  spheres: { value: string; label: string }[]
  admin: Admin
}) {
  const router = useRouter()
  const [name, setName] = useState(text.trim())
  const [sphere, setSphere] = useState('')
  const [busy, setBusy] = useState(false)

  const slug = slugify(name)

  async function refreshPublicPages() {
    try {
      await fetch('/api/revalidate-profile', { method: 'POST' })
    } catch (error) {
      console.error('Publisko lapu atsvaidzināšana:', error)
    }
  }

  async function approve() {
    if (!sphere || !slug) return
    setBusy(true)
    const { error } = await createClient().rpc('approve_topic_suggestion', {
      suggestion_id: id,
      topic_slug: slug,
      topic_name: name.trim(),
      sphere,
    })
    setBusy(false)
    if (error) return alert(error.message)

    await refreshPublicPages()
    await logAdminAction({
      ...admin, action: 'approve_topic', table: 'topic_suggestions',
      targetId: id, targetLabel: name.trim(),
    })
    router.refresh()
  }

  async function reject() {
    setBusy(true)
    const { error } = await createClient()
      .from('topic_suggestions')
      .update({ status: 'rejected', handled_at: new Date().toISOString() })
      .eq('id', id)
    setBusy(false)
    if (error) return alert(error.message)

    await logAdminAction({
      ...admin, action: 'reject_topic', table: 'topic_suggestions',
      targetId: id, targetLabel: text,
    })
    router.refresh()
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        value={name}
        maxLength={80}
        onChange={(event) => setName(event.target.value)}
        aria-label="Tēmas nosaukums"
        className="h-9 bg-ink sm:w-56"
      />
      {/* Vienkāršs select: iekšējs rīks, un tas strādā arī telefonā bez papildu koda */}
      <select
        value={sphere}
        onChange={(event) => setSphere(event.target.value)}
        aria-label="Nozare"
        className="h-9 rounded-lg border border-input bg-ink px-2 text-sm"
      >
        <option value="">Nozare…</option>
        {spheres.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        className="h-9 gap-1.5"
        disabled={busy || !sphere || !slug}
        onClick={approve}
      >
        <Check className="size-3.5" />
        Apstiprināt
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 gap-1.5 text-mist hover:text-coral"
        disabled={busy}
        onClick={reject}
      >
        <X className="size-3.5" />
        Noraidīt
      </Button>
    </div>
  )
}
