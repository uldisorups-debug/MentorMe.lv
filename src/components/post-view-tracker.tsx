'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Skaita raksta skatījumus. Pārlūkā, jo lapa ir statiska (ISR). */
export function PostViewTracker({ slug }: { slug: string }) {
  const counted = useRef(false)

  useEffect(() => {
    if (counted.current) return
    counted.current = true

    createClient()
      .rpc('increment_post_views', { post_slug: slug })
      .then(({ error }) => {
        if (error) console.error('Rakstu skatījumi:', error.message)
      })
  }, [slug])

  return null
}
