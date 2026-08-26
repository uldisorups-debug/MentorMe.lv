'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

/**
 * Jaunu rakstu izveido uzreiz kā melnrakstu un aizved uz redaktoru.
 * Tā nav vajadzīga atsevišķa "jauns" lapa ar tukšu formu.
 */
export function NewPostButton({ coachId }: { coachId: string }) {
  const t = useTranslations('PostEditor')
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function create() {
    setBusy(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: coachId,
        title: 'Raksta melnraksts',
        content: '',
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('Raksta izveide neizdevās:', error?.message)
      setBusy(false)
      return
    }
    router.push(`/dashboard/raksti/${data.id}`)
  }

  return (
    <Button className="h-11 gap-2" disabled={busy} onClick={create}>
      <Plus className="size-4" />
      {busy ? t('creating') : t('new')}
    </Button>
  )
}
