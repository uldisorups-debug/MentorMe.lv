import { defineRouting } from 'next-intl/routing'

/**
 * Trīs valodas ar latviešu kā noklusējumu.
 *
 * localePrefix 'as-needed' nozīmē, ka latviešu paliek uz "/" bez prefiksa —
 * mentorme.lv/uldis-orups, nevis mentorme.lv/lv/uldis-orups. Tā vecās
 * saites nesalūzt un galvenā valoda paliek īsākā adresē.
 *
 * localeDetection izslēgts ar nolūku. Pēc noklusējuma next-intl klausa
 * pārlūka Accept-Language galveni, un Latvijā ļoti daudziem tā ir angļu
 * — arī tad, kad cilvēks lasa latviski. Rezultātā mentorme.lv atvērās
 * angliski cilvēkam, kurš tur ienāca pēc latviešu meistara.
 *
 * Tagad valodu izvēlas cilvēks, ne viņa pārlūks: noklusējums ir
 * latviešu, un galvenē esošais slēdzis aizved uz /en vai /ru.
 */
export const routing = defineRouting({
  locales: ['lv', 'en', 'ru'],
  defaultLocale: 'lv',
  localePrefix: 'as-needed',
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  lv: 'Latviski',
  en: 'English',
  ru: 'Русский',
}

/** Kolonnas sufikss datubāzē: name_lv, name_en, name_ru */
export function nameColumn(locale: string): 'name_lv' | 'name_en' | 'name_ru' {
  return locale === 'en' ? 'name_en' : locale === 'ru' ? 'name_ru' : 'name_lv'
}

/**
 * Ceļš ar valodas prefiksu, kur tas vajadzīgs.
 *
 * Servera pusē lietojam šo kopā ar parasto next/navigation redirect,
 * nevis next-intl redirect: pēdējais TS pusē atrisinās uz klienta
 * variantu, kas neatgriež never, un tad TypeScript vairs nesaprot, ka
 * pēc redirect kods neturpinās.
 */
export function localePath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`
}

/**
 * hreflang saišu saraksts vienam ceļam, visām valodām plus x-default.
 *
 * path ir valodas prefiksa neatkarīgs ('/', '/uldis-orups', '/blog/x').
 * x-default rāda uz noklusējuma (latviešu) versiju — bez tā Google
 * nezina, kuru versiju rādīt meklētājam, kura valoda nesakrīt ne ar
 * vienu no trim.
 *
 * Katrai lapai, kas pati uzstāda metadata.alternates, šis jāsauc pašai —
 * Next.js to nemanto no izkārtojuma, kad lapa savu alternates uzstāda
 * klāt. Bez šī profilu un rakstu lapām hreflang nebija nemaz.
 */
export function alternateLanguages(path: string): Record<string, string> {
  const clean = path === '/' ? '' : path
  return {
    ...Object.fromEntries(
      routing.locales.map((l) => [l, l === routing.defaultLocale ? path : `/${l}${clean}`])
    ),
    'x-default': path,
  }
}

/**
 * canonical + hreflang vienā — metadata.alternates katrai publiskai lapai.
 *
 * Agrāk canonical stāvēja izkārtojumā ('/'), un katra lapa, kas savu
 * neuzlika (kontakti, privātums, noteikumi, sīkdatnes), to mantoja —
 * tātad teica Google "īstā versija ir sākumlapa". Search Console to
 * rāda kā "Alternate page with proper canonical tag", un lapa netiek
 * indeksēta. Tagad izkārtojums canonical neliek vispār, un katra lapa
 * to saņem no šejienes, norādot uz sevi pašu savā valodā.
 */
export function pageAlternates(locale: string, path: string) {
  const clean = path === '/' ? '' : path
  return {
    canonical:
      locale === routing.defaultLocale ? path : `/${locale}${clean}`,
    languages: alternateLanguages(path),
  }
}
