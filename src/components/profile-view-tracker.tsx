'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Skaita profila skatījumus caur RPC.
 *
 * Notiek pārlūkā, nevis serverī, jo lapa ir statiska (ISR) — servera
 * pusē tas nostrādātu tikai lapas pārbūves brīdī, ne katrā apmeklējumā.
 */
export function ProfileViewTracker({ slug }: { slug: string }) {
  const counted = useRef(false)

  useEffect(() => {
    // React Strict Mode dev režīmā palaiž efektu divreiz
    if (counted.current) return
    counted.current = true

    createClient()
      .rpc('increment_profile_views', { coach_slug: slug })
      .then(({ error }) => {
        if (error) console.error('Skatījumu skaitītājs:', error.message)
      })
  }, [slug])

  return null
}
