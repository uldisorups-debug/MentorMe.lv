'use client'

import { openConsentSettings } from '@/lib/cookie-consent'

/**
 * Kājenes saite, kas atver sīkdatņu logu no jauna.
 *
 * Poga, ne saite: tā neved uz citu lapu, bet atver logu turpat. Izskatās
 * gan tāpat kā pārējās kājenes saites — cilvēkam nav svarīgi, ar kādu
 * tagu tas ir uzrakstīts.
 */
export function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className="text-left text-mist transition-colors hover:text-cream sm:text-right"
    >
      {label}
    </button>
  )
}
