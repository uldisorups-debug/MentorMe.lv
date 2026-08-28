import { defineRouting } from 'next-intl/routing'

/**
 * Trīs valodas ar latviešu kā noklusējumu.
 *
 * localePrefix 'as-needed' nozīmē, ka latviešu paliek uz "/" bez prefiksa —
 * mentorme.lv/profils/uldis-orups, nevis mentorme.lv/lv/profils/...
 * Tā vecās saites nesalūzt un galvenā valoda paliek īsākā adresē.
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
