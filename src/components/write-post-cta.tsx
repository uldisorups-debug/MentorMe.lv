'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { PenLine } from 'lucide-react'
import { LinkButton } from '@/components/link-button'
import { createClient } from '@/lib/supabase/client'

/**
 * "Rakstīt rakstu" bloga lapā.
 *
 * Rādās tikai tam, kam ir kouča profils — pārējiem tā būtu poga uz
 * lapu, kurp viņi netiek. Pārbaude pārlūkā, lai /blog paliek statiska.
 */
export function WritePostCta() {
  const t = useTranslations('Blog')
  const [canWrite, setCanWrite] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data } = await supabase
        .from('coach_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cancelled) setCanWrite(Boolean(data))
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  if (!canWrite) return null

  return (
    <LinkButton href="/dashboard/raksti" className="h-11 gap-2">
      <PenLine className="size-4" />
      {t('writeOwn')}
    </LinkButton>
  )
}
