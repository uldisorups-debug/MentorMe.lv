import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/supabase/config'

/**
 * IndexNow — paziņo meklētājiem, ka lapa ir jauna vai mainījusies.
 *
 * Google jaunu lapu uz jauna domēna atrod dienās vai nedēļās, un
 * automātiska ceļa to paātrināt nav (Google Indexing API drīkst lietot
 * tikai darba sludinājumiem). Bing, Yandex, Seznam un Naver pieņem
 * IndexNow un lapu apmeklē minūtēs. Bing ir svarīgākais: no tā indeksa
 * strādā ChatGPT meklēšana, Copilot un DuckDuckGo. Yandex — krievvalodīgie.
 *
 * Atslēga nav noslēpums: protokols to prasa publiski pieejamu failā
 * /<atslēga>.txt, lai meklētājs pārliecinātos, ka ziņo vietnes īpašnieks.
 */
export const INDEXNOW_KEY = 'be8433cd719558ae75e8c4f39c3c1a90'

/** Visas valodu versijas vienam ceļam: /x, /en/x, /ru/x */
export function allLocaleUrls(path: string): string[] {
  const clean = path === '/' ? '' : path
  return routing.locales.map((locale) =>
    locale === routing.defaultLocale
      ? `${SITE_URL}${clean || '/'}`
      : `${SITE_URL}/${locale}${clean}`
  )
}

/**
 * Nosūta adreses IndexNow. Nekad nemet kļūdu: ja paziņojums neizdodas,
 * lapa tāpat tiks atrasta pa sitemap — tikai lēnāk. Kļūda te nedrīkst
 * salauzt profila saglabāšanu.
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  // Lokāli un priekšskatījumos nav ko ziņot — tās adreses nav publiskas
  if (!SITE_URL.startsWith('https://mentorme.lv') || urls.length === 0) return

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(5000),
    })

    // 200 un 202 abi nozīmē "pieņemts"
    if (!response.ok) {
      console.error('IndexNow atteica:', response.status, await response.text())
    }
  } catch (error) {
    console.error('IndexNow nav sasniedzams:', error)
  }
}
