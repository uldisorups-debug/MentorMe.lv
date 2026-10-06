import { createPublicClient } from '@/lib/supabase/public'

export type SiteCode = {
  head: string
  body: string
  needsConsent: boolean
}

export const EMPTY_SITE_CODE: SiteCode = { head: '', body: '', needsConsent: true }

/**
 * Administratora ielīmētais <head> un <body> kods (admin → Kods).
 *
 * Lasa izkārtojums, tātad tas nonāk katras lapas kešotajā versijā —
 * datubāze netiek aiztikta katrā apmeklējumā. Saglabājot kods
 * atsvaidzina visas lapas (revalidatePath('/', 'layout')).
 *
 * Kļūda nekad nesalauž lapu: bez koda lapa strādā tāpat, tikai bez
 * analītikas.
 */
export async function loadSiteCode(): Promise<SiteCode> {
  const { data, error } = await createPublicClient()
    .from('site_code')
    .select('head_html, body_html, needs_consent')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.error('Neizdevās ielādēt vietnes kodu:', error.message)
    return EMPTY_SITE_CODE
  }
  if (!data) return EMPTY_SITE_CODE

  return {
    head: data.head_html,
    body: data.body_html,
    needsConsent: data.needs_consent,
  }
}
