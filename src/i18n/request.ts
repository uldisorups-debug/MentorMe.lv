import { getRequestConfig } from 'next-intl/server'

/**
 * Pagaidām viena valoda bez URL prefiksa — latviešu dzīvo uz "/".
 *
 * Kad pievienosim en/ru, šeit ienāks locale noteikšana un
 * app/ koks pārceļas zem [locale]. Komponenšu kods nemainās —
 * useTranslations() / getTranslations() API paliek tas pats.
 */
export const DEFAULT_LOCALE = 'lv' as const

export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default,
}))
