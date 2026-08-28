/**
 * Sīkdatņu piekrišana.
 *
 * Google Analytics liek savas sīkdatnes un veido apmeklētāja
 * identifikatoru, tāpēc te nav izvēles: bez piekrišanas to ielādēt
 * nedrīkst. Šī ir tā vieta, kur piekrišana tiek glabāta.
 *
 * Izvēle glabājas pirmās puses sīkdatnē, ne localStorage: sīkdatni var
 * nolasīt arī serveris, tā ir redzama pārlūka iestatījumos, un cilvēks,
 * kurš savas sīkdatnes iztīra, ar to atsauc arī piekrišanu — tieši tā,
 * kā viņš to sagaida.
 *
 * Nepieciešamās sīkdatnes izvēlē nav ar nolūku. Bez tām lapa nestrādā,
 * un tāda izvēle būtu izlikšanās — VDAR tām piekrišanu neprasa.
 */

export const CONSENT_COOKIE = 'mentorme-consent'

/** Gads. Pēc tam jautājam vēlreiz — piekrišana nav mūžīga. */
const CONSENT_MAX_AGE = 365 * 24 * 60 * 60

export type Consent = {
  /** Anonīma apmeklējumu statistika */
  analytics: boolean
  /** Kad izvēle tika izdarīta — vajadzīgs, lai varētu pierādīt */
  decidedAt: string
}

export const CONSENT_ALL: Omit<Consent, 'decidedAt'> = { analytics: true }
export const CONSENT_NONE: Omit<Consent, 'decidedAt'> = { analytics: false }

/**
 * Neapstrādātā sīkdatnes vērtība.
 *
 * Atsevišķi no parsēšanas tāpēc, ka useSyncExternalStore prasa stabilu
 * momentuzņēmumu: virkne ir tā pati, objekts katrā izsaukumā būtu jauns,
 * un komponente grieztos aplī.
 */
export function readConsentCookie(): string | null {
  if (typeof document === 'undefined') return null
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
      ?.slice(CONSENT_COOKIE.length + 1) ?? null
  )
}

export function parseConsent(raw: string | null): Consent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>
    // Vecs vai sabojāts ieraksts — labāk pajautāt vēlreiz nekā uzminēt
    if (typeof parsed.analytics !== 'boolean') return null
    return { analytics: parsed.analytics, decidedAt: parsed.decidedAt ?? '' }
  } catch {
    return null
  }
}

export function readConsent(): Consent | null {
  return parseConsent(readConsentCookie())
}

export function writeConsent(choice: Omit<Consent, 'decidedAt'>): Consent {
  const consent: Consent = { ...choice, decidedAt: new Date().toISOString() }

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie =
    `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}` +
    `; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`

  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT))
  return consent
}

/** Sīkdatnes maiņa — lai komponente to pamana, nevis mēģina uzminēt. */
export const CONSENT_CHANGED_EVENT = 'mentorme:cookie-consent'

export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange)
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange)
}

/**
 * Vai kods jau darbojas pārlūkā.
 *
 * Serveris sīkdatni neredz, tāpēc pirmajā renderējumā izvēle nav zināma.
 * Bez šī sanāktu mirgoņa: logs parādītos un uzreiz pazustu.
 */
export const mountedStore = {
  subscribe: () => () => {},
  get: () => true,
  getServer: () => false,
}

/**
 * Izmet Google Analytics sīkdatnes, kad piekrišana tiek atsaukta.
 *
 * Bez šī _ga paliktu pārlūkā vēl divus gadus, un "izslēdzu statistiku"
 * nozīmētu tikai to, ka skaitītājs vairs nesūta datus. Sīkdatne, kas
 * paliek pēc atteikuma, ir tieši tas, ko cilvēks negribēja.
 */
export function clearAnalyticsCookies() {
  const host = window.location.hostname
  const domains = ['', `; Domain=${host}`, `; Domain=.${host}`]

  for (const row of document.cookie.split('; ')) {
    const name = row.split('=')[0]
    if (!name.startsWith('_ga')) continue
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain}`
    }
  }
}

/** Kājenes saite "Sīkdatņu iestatījumi" ar šo atver logu no jauna. */
export const CONSENT_REOPEN_EVENT = 'mentorme:cookie-settings'

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT))
}
