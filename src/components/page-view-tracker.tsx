'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Skaita apmeklējumus mūsu pašu datubāzē.
 *
 * Blakus Google Analytics, ne tā vietā. GA rāda tikai tos, kas
 * piekrituši sīkdatnēm; šis skaita visus, jo sīkdatnes neliek vispār —
 * apmeklētāju identificē serveris, un no viņa paliek pāri tikai
 * jaucējkods, kas pēc divām dienām pazūd.
 *
 * Tieši tāpēc šis nav aiz piekrišanas slēdža: piekrišanu prasa par
 * to, kas nonāk pārlūkā, un te nenonāk nekas.
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    // React Strict Mode dev režīmā palaiž efektu divreiz
    if (lastPath.current === pathname) return
    lastPath.current = pathname

    // Atsauce ir tikai pirmajai lapai; pārejot pa vietni, tā jau esam mēs
    const referrer = document.referrer || null

    createClient()
      .rpc('record_page_view', { page_path: pathname, referrer })
      .then(({ error }) => {
        if (error) console.error('Apmeklējumu skaitītājs:', error.message)
      })
  }, [pathname])

  return null
}
